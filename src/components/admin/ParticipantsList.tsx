import { useState } from 'react';

import type { Prediction, Question } from '../../types';
import { countAnsweredQuestions, getCompletionPercentage } from '../helpers';

interface ParticipantsListProps {
  predictions: Prediction[];
  questions: Question[];
  isCreator: boolean;
  onCopyRecoveryLink: (userId: string, teamName: string) => void;
  onToggleManager: (predictionId: string, makeManager: boolean) => void;
  onDeleteClick: (predictionId: string, teamName: string) => void;
  onEditTeamName: (predictionId: string, teamName: string) => void;
}

/**
 * Collapsible list of participants showing completion status and admin controls
 * Displays progress circles, manager toggles, and recovery links
 */
export function ParticipantsList({
  predictions,
  questions,
  isCreator,
  onCopyRecoveryLink,
  onToggleManager,
  onDeleteClick,
  onEditTeamName,
}: ParticipantsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="admin-control-label">Participants ({predictions.length})</span>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              fontWeight: '400',
              marginTop: '2px',
            }}
          >
            {isExpanded ? 'Click to collapse' : 'Click to view details'}
          </span>
        </div>
        <span className="collapsible-icon">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div style={{ marginTop: '16px' }}>
          {predictions.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No participants yet!
            </div>
          ) : (
            predictions.map((pred) => {
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
                        onClick={() => onEditTeamName(pred.id, pred.teamName)}
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
                          onClick={() => void onCopyRecoveryLink(pred.userId, pred.teamName)}
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
                                  onClick={() => void onToggleManager(pred.id, false)}
                                  className={`manager-toggle-btn ${
                                    !participantIsManager
                                      ? 'manager-toggle-active'
                                      : 'manager-toggle-inactive'
                                  }`}
                                >
                                  No
                                </button>
                                <button
                                  onClick={() => void onToggleManager(pred.id, true)}
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
                              onClick={() => onDeleteClick(pred.id, pred.teamName)}
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
  );
}
