import { useState } from 'react';

import {
  updateLeagueStatus,
  updateShowAllPredictions,
  toggleManager as toggleManagerQuery,
  deletePrediction as deletePredictionQuery,
  recalculateAllScores,
} from '../db/queries';
import type { League, Prediction, Question } from '../types';
import { getLeagueUrl } from '../utils/url';

import {
  countAnsweredQuestions,
  getCompletionPercentage,
  sortPredictionsForParticipants,
} from './helpers';

declare const __GIT_COMMIT__: string;
declare const __GIT_COMMIT_MESSAGE__: string;

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

export function AdminPanel({
  league,
  predictions,
  questions,
  isCreator,
  showToast,
  onOpenTeamNameModal,
}: AdminPanelProps) {
  const [participantsExpanded, setParticipantsExpanded] = useState(false);
  const [recalcExpanded, setRecalcExpanded] = useState(false);
  const [recalcStatus, setRecalcStatus] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const shareUrl = getLeagueUrl(league.slug);
  const appId = import.meta.env.VITE_INSTANTDB_APP_ID || '';
  const gitCommit = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'dev';
  const commitMessage =
    typeof __GIT_COMMIT_MESSAGE__ !== 'undefined' ? __GIT_COMMIT_MESSAGE__ : 'dev';

  const handleSubmissionsToggle = async (isOpen: boolean) => {
    const action = isOpen ? 'open' : 'close';
    const confirmed = confirm(`Are you sure you want to ${action} submissions?`);
    if (!confirmed) return;

    try {
      await updateLeagueStatus(league.id, isOpen);
      showToast(`Submissions ${isOpen ? 'opened' : 'closed'}!`);
    } catch (error) {
      console.error('Error updating league status:', error);
      showToast('Error updating submissions status', 'error');
    }
  };

  const handleShowAnswersToggle = async (show: boolean) => {
    const action = show ? 'show' : 'hide';
    const confirmed = confirm(`Are you sure you want to ${action} all answers?`);
    if (!confirmed) return;

    try {
      await updateShowAllPredictions(league.id, show);
      showToast(`Answers ${show ? 'visible' : 'hidden'}!`);
    } catch (error) {
      console.error('Error updating show predictions:', error);
      showToast('Error updating answer visibility', 'error');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Invite link copied!');
    } catch {
      prompt('Copy this invite link:', shareUrl);
    }
  };

  const handleCopyRecoveryLink = async (userId: string, teamName: string) => {
    const recoveryUrl = `${shareUrl}?user=${userId}`;
    try {
      await navigator.clipboard.writeText(recoveryUrl);
      showToast(`Recovery link copied for ${teamName}!`);
    } catch {
      prompt(`Copy this recovery link for ${teamName}:`, recoveryUrl);
    }
  };

  const handleToggleManager = async (predictionId: string, makeManager: boolean) => {
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
  };

  const handleDeleteClick = (predictionId: string, teamName: string) => {
    setPendingDelete({ id: predictionId, name: teamName });
  };

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

  const handleRecalculate = async () => {
    if (!league.actualResults || Object.keys(league.actualResults).length === 0) {
      showToast('No actual results entered yet', 'warning');
      return;
    }

    setRecalcStatus('Recalculating scores...');
    try {
      await recalculateAllScores(predictions, league.actualResults, questions);
      setRecalcStatus('Scores recalculated successfully!');
      showToast('All scores recalculated!', 'success');
      setTimeout(() => setRecalcStatus(''), 3000);
    } catch (error) {
      console.error('Error recalculating scores:', error);
      setRecalcStatus('Error recalculating scores');
      showToast('Error recalculating scores', 'error');
    }
  };

  const sortedPredictions = sortPredictionsForParticipants(predictions, questions);

  return (
    <div>
      {/* Game Status */}
      <div className="admin-control-row">
        <span className="admin-control-label">Submissions</span>
        <div className="admin-toggle-group">
          <label
            className={`admin-toggle-option ${
              league.isOpen ? 'admin-toggle-active-open' : 'admin-toggle-inactive'
            }`}
          >
            <input
              type="radio"
              name="submissions"
              value="open"
              checked={league.isOpen}
              onChange={() => void handleSubmissionsToggle(true)}
            />
            🔓 Open
          </label>
          <label
            className={`admin-toggle-option ${
              !league.isOpen ? 'admin-toggle-active-closed' : 'admin-toggle-inactive'
            }`}
          >
            <input
              type="radio"
              name="submissions"
              value="closed"
              checked={!league.isOpen}
              onChange={() => void handleSubmissionsToggle(false)}
            />
            🔒 Closed
          </label>
        </div>
      </div>

      <div className="admin-control-row">
        <span className="admin-control-label">Show Answers</span>
        <div className="admin-toggle-group">
          <label
            className={`admin-toggle-option ${
              !league.showAllPredictions ? 'admin-toggle-active-open' : 'admin-toggle-inactive'
            }`}
          >
            <input
              type="radio"
              name="showPredictions"
              value="hidden"
              checked={!league.showAllPredictions}
              onChange={() => void handleShowAnswersToggle(false)}
            />
            🔒 Hidden
          </label>
          <label
            className={`admin-toggle-option ${
              league.showAllPredictions ? 'admin-toggle-active-closed' : 'admin-toggle-inactive'
            }`}
          >
            <input
              type="radio"
              name="showPredictions"
              value="visible"
              checked={league.showAllPredictions}
              onChange={() => void handleShowAnswersToggle(true)}
            />
            👁️ Visible
          </label>
        </div>
      </div>

      {/* Participants List */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => setParticipantsExpanded(!participantsExpanded)}
          className="collapsible-toggle"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            cursor: 'pointer',
          }}
        >
          <span className="admin-control-label">Participants ({predictions.length})</span>
          <span className="collapsible-icon">{participantsExpanded ? '▼' : '▶'}</span>
        </button>

        {participantsExpanded && (
          <div style={{ marginTop: '16px' }}>
            {sortedPredictions.length === 0 ? (
              <div
                style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}
              >
                No participants yet!
              </div>
            ) : (
              sortedPredictions.map((pred) => {
                const answeredCount = countAnsweredQuestions(pred.predictions, questions);
                const totalQuestions = questions.length;
                const percentage = getCompletionPercentage(pred.predictions, questions);
                const isComplete = answeredCount === totalQuestions;
                const participantIsManager = pred.isManager === true;

                return (
                  <div
                    key={pred.id}
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      padding: '16px',
                      marginBottom: '12px',
                      borderRadius: '8px',
                      border: isComplete
                        ? '2px solid var(--color-success)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3
                          onClick={() => onOpenTeamNameModal(pred.id, pred.teamName)}
                          style={{
                            fontWeight: 'bold',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {pred.teamName}
                          <span className="team-name-edit-btn">Edit</span>
                        </h3>
                        <p
                          style={{
                            fontSize: '14px',
                            color: 'var(--color-text-muted)',
                            marginTop: '4px',
                          }}
                        >
                          {answeredCount} of {totalQuestions} questions answered
                        </p>
                        <div style={{ marginTop: '12px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              marginBottom: '4px',
                            }}
                          >
                            <span>{percentage}%</span>
                            <span>{isComplete ? 'Complete!' : 'In progress'}</span>
                          </div>
                          <progress
                            style={{
                              width: '100%',
                              height: '8px',
                              accentColor: 'var(--color-primary)',
                            }}
                            value={percentage}
                            max={100}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            marginTop: '12px',
                          }}
                        >
                          <button
                            onClick={() => void handleCopyRecoveryLink(pred.userId, pred.teamName)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontSize: '14px',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            📋 Copy recovery link
                          </button>
                          {isCreator && (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="admin-share-url" style={{ marginTop: 0 }}>
                                  Manager?
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    onClick={() => void handleToggleManager(pred.id, false)}
                                    className={`manager-toggle-btn ${
                                      !participantIsManager
                                        ? 'manager-toggle-active'
                                        : 'manager-toggle-inactive'
                                    }`}
                                  >
                                    No
                                  </button>
                                  <button
                                    onClick={() => void handleToggleManager(pred.id, true)}
                                    className={`manager-toggle-btn ${
                                      participantIsManager
                                        ? 'manager-toggle-active-yes'
                                        : 'manager-toggle-inactive'
                                    }`}
                                  >
                                    👑 Yes
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClick(pred.id, pred.teamName)}
                                className="delete-team-btn"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ marginLeft: '16px' }}>
                        {isComplete ? (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-success)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              color: 'var(--color-background)',
                            }}
                          >
                            ✓
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              border: '4px solid var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: 'var(--color-primary)',
                              background: `conic-gradient(var(--color-primary) ${percentage * 3.6}deg, rgba(255, 255, 255, 0.1) 0deg)`,
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: 'var(--color-background)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Share Section */}
      <div className="admin-share-section" style={{ marginTop: '24px' }}>
        <div className="admin-share-title">Invite Others</div>
        <div className="admin-share-content">
          <div style={{ flex: 1 }}>
            <div className="admin-share-link-label">Share link:</div>
            <button
              onClick={() => void handleCopyLink()}
              className="admin-share-link"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              📋 Copy invite link
            </button>
            <div className="admin-share-url">{shareUrl}</div>
          </div>
          <div className="admin-qr-container">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}`}
              alt="QR Code"
              className="admin-qr-image"
            />
          </div>
        </div>
      </div>

      {/* Recalculate Scores */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => setRecalcExpanded(!recalcExpanded)}
          className="collapsible-toggle"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            cursor: 'pointer',
          }}
        >
          <span className="admin-control-label">Recalculate Scores</span>
          <span className="collapsible-icon">{recalcExpanded ? '▼' : '▶'}</span>
        </button>

        {recalcExpanded && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: '8px',
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Recalculate all participant scores based on the current actual results. This is useful
              if you've updated the results or scoring logic.
            </p>
            <button
              onClick={() => void handleRecalculate()}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-background)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Recalculate All Scores
            </button>
            {recalcStatus && (
              <div className="status-text-muted" style={{ marginTop: '12px' }}>
                {recalcStatus}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Build Info */}
      <div className="admin-build-info">
        <div className="admin-build-message">{commitMessage}</div>
        <div className="admin-build-details">
          <span>
            Commit: <code>{gitCommit}</code>
          </span>
          <span>
            DB: <code>...{appId.slice(-5)}</code>
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setPendingDelete(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-background)',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              Delete Team
            </h3>
            <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{pendingDelete.name}</strong>? This cannot be
              undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPendingDelete(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteConfirm()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-background)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
