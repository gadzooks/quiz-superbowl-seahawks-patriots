import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useLeagueData } from '../hooks/useLeagueData';
import { logger } from '../utils/logger';
import { isAdminOverride } from '../utils/url';

import { AdminPanel } from './AdminPanel';
import { AllPredictionsTable } from './AllPredictionsTable';
import { useConfetti, IntroOverlay } from './Celebration';
import { Header } from './Header';
import { countAnsweredQuestions } from './helpers';
import { Leaderboard } from './Leaderboard';
import { LeagueNotFound } from './LeagueNotFound';
import { PredictionsForm } from './PredictionsForm';
import { ResultsForm } from './ResultsForm';
import { Tabs } from './Tabs';
import { TeamNameEntry } from './TeamNameEntry';
import { TeamNameModal } from './TeamNameModal';

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

  // Derived state
  const currentUserPrediction = predictions.find((p) => p.userId === currentUserId);
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

  const handleProgressUpdate = useCallback((percentage: number) => {
    setProgressPercentage(percentage);
  }, []);

  const handleCompletionCelebration = useCallback(() => {
    logger.debug('[LeagueView] handleCompletionCelebration called', {
      hasShownCompletionCelebration,
      willShow: !hasShownCompletionCelebration,
    });

    if (!hasShownCompletionCelebration) {
      logger.debug('[LeagueView] Showing completion celebration!');
      setHasShownCompletionCelebration(true);
      showCompletionCelebration();
    } else {
      logger.debug('[LeagueView] Celebration already shown, skipping');
    }
  }, [hasShownCompletionCelebration, setHasShownCompletionCelebration, showCompletionCelebration]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Error state
  if (error) {
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
        onReplayIntro={() => setShowIntro(true)}
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
            questions={questions}
            userPrediction={currentUserPrediction}
            league={league}
            userId={currentUserId}
            showToast={showToast}
            onProgressUpdate={handleProgressUpdate}
            onCompletionCelebration={handleCompletionCelebration}
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
