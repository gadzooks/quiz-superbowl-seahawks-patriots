import { useState } from 'react';

import {
  updateLeagueStatus,
  updateShowAllPredictions,
  toggleManager as toggleManagerQuery,
  deletePrediction as deletePredictionQuery,
  recalculateAllScores,
} from '../../db/queries';
import type { League, Prediction, Question } from '../../types';
import { getLeagueUrl } from '../../utils/url';
import { sortPredictionsForParticipants } from '../helpers';

import { BuildInfo } from './BuildInfo';
import { DeleteTeamModal } from './DeleteTeamModal';
import { ParticipantsList } from './ParticipantsList';
import { RecalculateSection } from './RecalculateSection';
import { ShareSection } from './ShareSection';
import { ShowAnswersControl } from './ShowAnswersControl';
import { SubmissionControls } from './SubmissionControls';

interface AdminPanelProps {
  league: League;
  predictions: Prediction[];
  questions: Question[];
  isCreator: boolean;
  showToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
  onOpenTeamNameModal: (predictionId: string, teamName: string) => void;
}

/**
 * Admin panel for league management
 * Provides controls for submissions, visibility, participants, and scoring
 */
export function AdminPanel({
  league,
  predictions,
  questions,
  isCreator,
  showToast,
  onOpenTeamNameModal,
}: AdminPanelProps) {
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const shareUrl = getLeagueUrl(league.slug);
  const appId = import.meta.env.VITE_INSTANTDB_APP_ID || '';

  // Sort predictions for display
  const sortedPredictions = sortPredictionsForParticipants(predictions, questions);

  // Handler: Toggle submissions open/closed
  const handleSubmissionsToggle = async (isOpen: boolean) => {
    try {
      await updateLeagueStatus(league.id, isOpen);
      showToast(`Submissions ${isOpen ? 'opened' : 'closed'}!`);
    } catch (error) {
      console.error('Error updating league status:', error);
      showToast('Error updating submissions status', 'error');
    }
  };

  // Handler: Toggle answer visibility
  const handleShowAnswersToggle = async (show: boolean) => {
    try {
      await updateShowAllPredictions(league.id, show);
      showToast(`Answers ${show ? 'visible' : 'hidden'}!`);
    } catch (error) {
      console.error('Error updating show predictions:', error);
      showToast('Error updating answer visibility', 'error');
    }
  };

  // Handler: Copy invite link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Invite link copied!');
    } catch {
      prompt('Copy this invite link:', shareUrl);
    }
  };

  // Handler: Copy recovery link for specific user
  const handleCopyRecoveryLink = (userId: string, teamName: string) => {
    const recoveryUrl = `${shareUrl}?user=${userId}`;
    void (async () => {
      try {
        await navigator.clipboard.writeText(recoveryUrl);
        showToast(`Recovery link copied for ${teamName}!`);
      } catch {
        prompt(`Copy this recovery link for ${teamName}:`, recoveryUrl);
      }
    })();
  };

  // Handler: Toggle manager status
  const handleToggleManager = (predictionId: string, makeManager: boolean) => {
    void (async () => {
      try {
        await toggleManagerQuery(predictionId, makeManager);
        const pred = predictions.find((p) => p.id === predictionId);
        const teamName = pred?.teamName || 'Team';
        showToast(
          makeManager ? `${teamName} is now a manager!` : `${teamName} is no longer a manager.`
        );
      } catch (error) {
        console.error('Error toggling manager status:', error);
        showToast('Error updating manager status', 'error');
      }
    })();
  };

  // Handler: Initiate delete flow
  const handleDeleteClick = (predictionId: string, teamName: string) => {
    setPendingDelete({ id: predictionId, name: teamName });
  };

  // Handler: Confirm delete
  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;

    try {
      await deletePredictionQuery(pendingDelete.id);
      showToast(`${pendingDelete.name} has been deleted`);
      setPendingDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      showToast('Error deleting team', 'error');
    }
  };

  // Handler: Recalculate all scores
  const handleRecalculate = async () => {
    if (!league.actualResults || Object.keys(league.actualResults).length === 0) {
      showToast('No actual results entered yet', 'warning');
      throw new Error('No results available');
    }

    await recalculateAllScores(predictions, league.actualResults, questions);
    showToast('All scores recalculated!', 'success');
  };

  return (
    <div>
      {/* Submission Controls */}
      <SubmissionControls
        isOpen={league.isOpen}
        onToggle={(isOpen) => void handleSubmissionsToggle(isOpen)}
      />

      {/* Show Answers Control */}
      <ShowAnswersControl
        showAllPredictions={league.showAllPredictions}
        onToggle={(show) => void handleShowAnswersToggle(show)}
      />

      {/* Participants List */}
      <ParticipantsList
        predictions={sortedPredictions}
        questions={questions}
        isCreator={isCreator}
        onCopyRecoveryLink={handleCopyRecoveryLink}
        onToggleManager={handleToggleManager}
        onDeleteClick={handleDeleteClick}
        onEditTeamName={onOpenTeamNameModal}
      />

      {/* Share Section */}
      <ShareSection shareUrl={shareUrl} onCopyLink={() => void handleCopyLink()} />

      {/* Recalculate Section */}
      <RecalculateSection
        onRecalculate={handleRecalculate}
        hasResults={Boolean(league.actualResults && Object.keys(league.actualResults).length > 0)}
      />

      {/* Build Info */}
      <BuildInfo appId={appId} />

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <DeleteTeamModal
          teamName={pendingDelete.name}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
