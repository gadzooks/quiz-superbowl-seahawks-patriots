// LeagueView.tsx

import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { savePrediction } from '../db/queries';
import { useLeagueData } from '../hooks/useLeagueData';
import { isAdminOverride } from '../utils/url';

import { AdminPanel } from './AdminPanel';
import { AllPredictionsTable } from './AllPredictionsTable';
import { useConfetti } from './Celebration';
import { Header } from './Header';
import { countAnsweredQuestions } from './helpers';
import { IntroOverlay } from './IntroPage';
import { Leaderboard } from './Leaderboard';
import { LeagueNotFound } from './LeagueNotFound';
import { PredictionsForm } from './PredictionsForm';
import { ResultsForm } from './ResultsForm';
import { ScrollProgress } from './ScrollProgress';
import { Tabs } from './Tabs';
import { TeamNameEntry } from './TeamNameEntry';
import { TeamNameModal } from './TeamNameModal';
import { UnsavedChangesBar } from './UnsavedChangesBar';

interface LeagueViewProps {
  gameId: string;
  leagueSlug: string;
}

export function LeagueView({ gameId, leagueSlug }: LeagueViewProps) {
  const { showToast } = useToast();
  const {
    currentUserId,
    currentTab,
    setCurrentTab,
    currentTeamId,
    hasShownCompletionCelebration,
    setHasShownCompletionCelebration,
    hasUnviewedScoreUpdate,
    setHasUnviewedScoreUpdate,
  } = useAppContext();

  const { game, league, predictions, questions, isLoading, error } = useLeagueData(
    gameId,
    leagueSlug
  );

  const [showIntro, setShowIntro] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Team name modal state
  const [teamNameModalOpen, setTeamNameModalOpen] = useState(false);
  const [editingPredictionId, setEditingPredictionId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // Track previous results for unviewed score detection
  const prevResultsRef = useRef<string | null>(null);

  const { showCompletionCelebration, triggerWinnerCelebration, triggerNonWinnerCelebration } =
    useConfetti();

  // Once we've loaded successfully, never let transient isLoading/error states
  // unmount the form (which resets all local state and causes data loss)
  const hasLoadedRef = useRef(false);
  if (!isLoading && !error && league) {
    hasLoadedRef.current = true;
  }

  // Derived state — cache the prediction so it doesn't flicker to undefined
  // during InstantDB real-time updates (which would unmount PredictionsForm)
  const livePrediction = predictions.find((p) => p.userId === currentUserId);
  const cachedPredictionRef = useRef(livePrediction);
  if (livePrediction) {
    cachedPredictionRef.current = livePrediction;
  }
  const currentUserPrediction = livePrediction ?? cachedPredictionRef.current;

  // Cache formData in the parent so it survives PredictionsForm unmount/remount
  const formDataCacheRef = useRef<Record<string, string | number> | null>(null);
  const lastExplicitSaveRef = useRef<string | null>(null);
  const skipUnmountSaveRef = useRef(false);

  // Unsaved changes bar state (persists across tab switches)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [formResetKey, setFormResetKey] = useState(0);

  // Initialize lastExplicitSaveRef to DB state on first load — stable baseline
  // for unsaved detection. Only runs once (null check prevents overwrites from
  // InstantDB real-time updates or background unmount saves).
  if (lastExplicitSaveRef.current === null && currentUserPrediction) {
    lastExplicitSaveRef.current = JSON.stringify(currentUserPrediction.predictions);
  }

  const isCreator = league?.creatorId === currentUserId || isAdminOverride();
  const isManager = currentUserPrediction?.isManager ?? false;
  const hasAdminAccess = isCreator || isManager;
  const teamName = currentUserPrediction?.teamName ?? '';

  // Detect result changes for unviewed score badge
  useEffect(() => {
    if (!league) return;

    const currentResultsStr = league.actualResults ? JSON.stringify(league.actualResults) : null;

    if (
      prevResultsRef.current !== null &&
      currentResultsStr !== prevResultsRef.current &&
      currentTab !== 'scores' &&
      currentResultsStr !== null
    ) {
      setHasUnviewedScoreUpdate(true);
    }

    prevResultsRef.current = currentResultsStr;
  }, [league, currentTab, setHasUnviewedScoreUpdate]);

  // Clear score notification when switching to scores tab
  useEffect(() => {
    if (currentTab === 'scores' && hasUnviewedScoreUpdate) {
      setHasUnviewedScoreUpdate(false);
    }
  }, [currentTab, hasUnviewedScoreUpdate, setHasUnviewedScoreUpdate]);

  const handleTabChange = useCallback(
    (tab: typeof currentTab) => {
      setCurrentTab(tab);
    },
    [setCurrentTab]
  );

  const handleUnsavedChangesUpdate = useCallback((hasUnsaved: boolean) => {
    setHasUnsavedChanges(hasUnsaved);
  }, []);

  const handleProgressUpdate = useCallback((percentage: number) => {
    setProgressPercentage(percentage);
  }, []);

  const handleCompletionCelebration = useCallback(() => {
    if (!hasShownCompletionCelebration) {
      setHasShownCompletionCelebration(true);
      showCompletionCelebration();
    }
  }, [hasShownCompletionCelebration, setHasShownCompletionCelebration, showCompletionCelebration]);

  const handleSave = useCallback(() => {
    if (!currentUserPrediction || !league?.isOpen || !formDataCacheRef.current) return;

    setSaveStatus('saving');
    const dataToSave = { ...formDataCacheRef.current };

    savePrediction({
      id: currentUserPrediction.id,
      leagueId: league.id,
      userId: currentUserId,
      teamName: currentUserPrediction.teamName,
      predictions: dataToSave,
      isManager: currentUserPrediction.isManager,
      actualResults: league.actualResults,
      questions,
    }).then(
      () => {
        const snapshot = JSON.stringify(dataToSave);
        lastExplicitSaveRef.current = snapshot;
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);

        const answeredCount = countAnsweredQuestions(dataToSave, questions);
        if (answeredCount === questions.length) {
          handleCompletionCelebration();
        }
      },
      () => {
        setSaveStatus('idle');
        showToast('Failed to save — please try again', 'error');
      }
    );
  }, [
    currentUserPrediction,
    league,
    currentUserId,
    questions,
    showToast,
    handleCompletionCelebration,
  ]);

  const handleCancel = useCallback(() => {
    let savedData: Record<string, string | number>;
    if (lastExplicitSaveRef.current) {
      // eslint-disable-next-line no-restricted-syntax -- roundtrip of our own JSON.stringify
      savedData = JSON.parse(lastExplicitSaveRef.current) as Record<string, string | number>;
    } else {
      savedData = currentUserPrediction?.predictions ?? {};
    }
    formDataCacheRef.current = savedData;
    lastExplicitSaveRef.current = JSON.stringify(savedData);
    setHasUnsavedChanges(false);
    // Force PredictionsForm remount to reset internal state; skip unmount save
    skipUnmountSaveRef.current = true;
    setFormResetKey((k) => k + 1);
    setTimeout(() => {
      skipUnmountSaveRef.current = false;
    }, 0);
    showToast('Changes discarded', 'info');
  }, [currentUserPrediction, showToast]);

  const handleTeamRegistered = useCallback(
    (newTeamName: string) => {
      setShowIntro(true);
      showToast(`Welcome, ${newTeamName}!`, 'success');
    },
    [showToast]
  );

  const handleOpenTeamNameModal = useCallback((predictionId: string, name: string) => {
    setEditingPredictionId(predictionId);
    setEditingTeamName(name);
    setTeamNameModalOpen(true);
  }, []);

  // Loading state — only on first load, not during transient InstantDB re-queries
  if (isLoading && !hasLoadedRef.current) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Error state — only on first load, not during transient connection blips
  if (error && !hasLoadedRef.current) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-error">Error</h2>
          <p className="text-base-content/80">Failed to load league data.</p>
        </div>
      </div>
    );
  }

  // League not found
  if (!league) {
    return <LeagueNotFound slug={leagueSlug} gameId={gameId} />;
  }

  // User not registered — show team name entry
  if (!currentUserPrediction) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <TeamNameEntry
          league={league}
          userId={currentUserId}
          showToast={showToast}
          onRegistered={handleTeamRegistered}
        />
      </div>
    );
  }

  // Show intro overlay after registration
  if (showIntro) {
    return <IntroOverlay teamName={teamName} onComplete={() => setShowIntro(false)} />;
  }

  // Compute progress from user prediction
  const userAnswered = countAnsweredQuestions(currentUserPrediction.predictions, questions);
  const computedProgress =
    questions.length > 0 ? Math.round((userAnswered / questions.length) * 100) : 0;

  return (
    <>
      <Header
        game={game}
        league={league}
        teamName={teamName}
        currentTeamId={currentTeamId}
        progressPercentage={progressPercentage || computedProgress}
        currentTab={currentTab}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* Animated progress bar that appears on scroll */}
      <ScrollProgress
        progressPercentage={progressPercentage || computedProgress}
        style="football"
      />

      <div className="container mx-auto p-4 max-w-lg">
        <Tabs
          currentTab={currentTab}
          onTabChange={handleTabChange}
          hasAdminAccess={hasAdminAccess}
          isCreator={isCreator}
          hasUnviewedScoreUpdate={hasUnviewedScoreUpdate}
          teamName={teamName}
        />

        {/* Predictions tab */}
        {currentTab === 'predictions' && (
          <PredictionsForm
            key={formResetKey}
            questions={questions}
            userPrediction={currentUserPrediction}
            league={league}
            userId={currentUserId}
            onProgressUpdate={handleProgressUpdate}
            formDataCacheRef={formDataCacheRef}
            lastExplicitSaveRef={lastExplicitSaveRef}
            onUnsavedChangesUpdate={handleUnsavedChangesUpdate}
            skipUnmountSaveRef={skipUnmountSaveRef}
          />
        )}

        {/* Scores tab */}
        {currentTab === 'scores' && (
          <>
            <Leaderboard
              predictions={predictions}
              league={league}
              questions={questions}
              currentUserId={currentUserId}
              onWinnerCelebration={triggerWinnerCelebration}
              onNonWinnerCelebration={triggerNonWinnerCelebration}
            />

            {!league.isOpen && league.showAllPredictions && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">All Predictions</h3>
                <AllPredictionsTable
                  predictions={predictions}
                  questions={questions}
                  actualResults={league.actualResults}
                />
              </div>
            )}
          </>
        )}

        {/* Results tab (admin only) */}
        {currentTab === 'results' && hasAdminAccess && (
          <ResultsForm
            questions={questions}
            league={league}
            predictions={predictions}
            showToast={showToast}
          />
        )}

        {/* Admin tab (creator only) */}
        {currentTab === 'admin' && isCreator && (
          <AdminPanel
            league={league}
            predictions={predictions}
            questions={questions}
            isCreator={isCreator}
            showToast={showToast}
            onOpenTeamNameModal={handleOpenTeamNameModal}
          />
        )}
      </div>

      {/* Floating save/cancel bar — visible on any tab when there are unsaved changes */}
      {league.isOpen && (hasUnsavedChanges || saveStatus !== 'idle') && (
        <UnsavedChangesBar saveStatus={saveStatus} onSave={handleSave} onCancel={handleCancel} />
      )}

      {/* Team Name Modal */}
      <TeamNameModal
        isOpen={teamNameModalOpen}
        onClose={() => {
          setTeamNameModalOpen(false);
        }}
        predictionId={editingPredictionId}
        currentName={editingTeamName}
        allPredictions={predictions}
        currentUserId={currentUserId}
        showToast={showToast}
      />
    </>
  );
}
