import { useEffect, useRef, useState } from 'react';

import { useAppContext } from '../context/AppContext';
import type { Question, League, Prediction } from '../types';

import {
  sortPredictionsForLeaderboard,
  countAnsweredQuestions,
  formatSlugForDisplay,
  isAnswerCorrect,
} from './helpers';

interface LeaderboardProps {
  predictions: Prediction[];
  league: League;
  questions: Question[];
  currentUserId: string;
  onWinnerCelebration: () => void;
  onNonWinnerCelebration: (position: number) => void;
}

export function Leaderboard({
  predictions,
  league,
  questions,
  currentUserId,
  onWinnerCelebration,
  onNonWinnerCelebration,
}: LeaderboardProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const {
    hasTriggeredWinnerCelebration,
    setHasTriggeredWinnerCelebration,
    hasTriggeredNonWinnerCelebration,
    setHasTriggeredNonWinnerCelebration,
  } = useAppContext();

  // Track previous completion state
  const previouslyCompleteRef = useRef(false);

  // Filter predictions that have data
  const teamsWithPredictions = predictions.filter((p) => p.predictions);

  // Sort predictions
  const sorted = sortPredictionsForLeaderboard(teamsWithPredictions);

  // Check if any scores have been calculated
  const hasScores = league.actualResults && Object.keys(league.actualResults).length > 0;

  // Count answered questions
  const answeredCount = countAnsweredQuestions(league.actualResults, questions);
  const totalQuestions = questions.length;
  const allQuestionsAnswered = answeredCount === totalQuestions;

  // Trigger celebration only when results transition from incomplete to complete
  useEffect(() => {
    const wasIncomplete = !previouslyCompleteRef.current;
    const isNowComplete = allQuestionsAnswered && sorted.length > 0;

    // Only trigger on transition from incomplete to complete
    if (!wasIncomplete || !isNowComplete) {
      previouslyCompleteRef.current = allQuestionsAnswered;
      return;
    }

    const currentUserPrediction = sorted.find((p) => p.userId === currentUserId);
    const userPosition = currentUserPrediction ? sorted.indexOf(currentUserPrediction) : -1;

    // Only celebrate for top 3 positions
    if (userPosition < 0 || userPosition > 2) {
      previouslyCompleteRef.current = allQuestionsAnswered;
      return;
    }

    // Small delay to let the DOM update
    const timer = setTimeout(() => {
      if (userPosition === 0 && !hasTriggeredWinnerCelebration) {
        setHasTriggeredWinnerCelebration(true);
        onWinnerCelebration();
      } else if ((userPosition === 1 || userPosition === 2) && !hasTriggeredNonWinnerCelebration) {
        setHasTriggeredNonWinnerCelebration(true);
        onNonWinnerCelebration(userPosition + 1);
      }
    }, 300);

    previouslyCompleteRef.current = allQuestionsAnswered;
    return () => clearTimeout(timer);
  }, [
    allQuestionsAnswered,
    currentUserId,
    hasTriggeredWinnerCelebration,
    hasTriggeredNonWinnerCelebration,
    setHasTriggeredWinnerCelebration,
    setHasTriggeredNonWinnerCelebration,
    onWinnerCelebration,
    onNonWinnerCelebration,
  ]);

  const toggleAnswers = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (teamsWithPredictions.length === 0) {
    return (
      <div className="alert">
        <span>No predictions yet!</span>
      </div>
    );
  }

  return (
    <div>
      {answeredCount < totalQuestions && (
        <div className="alert alert-info mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            {answeredCount} out of {totalQuestions} answers checked.
          </span>
        </div>
      )}

      {sorted.map((pred, index) => {
        const isFirst = index === 0 && pred.score > 0 && hasScores;
        const isSecond = index === 1 && pred.score > 0 && hasScores;
        const isThird = index === 2 && pred.score > 0 && hasScores;
        const canShowAnswers = !league.isOpen && league.showAllPredictions === true;
        const isExpanded = expandedIds.has(pred.id);

        let placeClass = '';
        let placeEmoji = null;

        if (isFirst) {
          placeClass = 'place-gold';
          placeEmoji = <span className="trophy-bounce leaderboard-trophy">🏆</span>;
        } else if (isSecond) {
          placeClass = 'place-silver';
          placeEmoji = <span className="leaderboard-medal">🥈</span>;
        } else if (isThird) {
          placeClass = 'place-bronze';
          placeEmoji = <span className="leaderboard-medal">🥉</span>;
        }

        return (
          <div key={pred.id} className={`card bg-base-200 ${placeClass}`}>
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {placeEmoji}
                    <span className={`badge badge-lg ${isFirst ? 'badge-primary' : 'badge-ghost'}`}>
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold">{pred.teamName}</h3>
                  </div>
                  {pred.tiebreakDiff > 0 && hasScores && (
                    <div className="text-xs text-base-content/60 mt-1">
                      Tiebreaker diff: {pred.tiebreakDiff}
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-primary">{hasScores ? pred.score : 0}</div>
              </div>

              {canShowAnswers && (
                <>
                  <button
                    className="btn btn-ghost btn-sm mt-2"
                    onClick={() => toggleAnswers(pred.id)}
                  >
                    <span className="toggle-text">
                      {isExpanded ? 'Hide answers ▲' : 'Show answers ▼'}
                    </span>
                  </button>
                  <div className={`collapsible-answers ${isExpanded ? 'active' : ''}`}>
                    <AnswerDetails
                      prediction={pred}
                      questions={questions}
                      actualResults={league.actualResults}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AnswerDetailsProps {
  prediction: Prediction;
  questions: Question[];
  actualResults: Record<string, string | number> | null | undefined;
}

function AnswerDetails({ prediction, questions, actualResults }: AnswerDetailsProps) {
  if (!prediction.predictions) {
    return <div className="answer-detail-empty">No predictions submitted</div>;
  }

  return (
    <>
      {questions.map((q) => {
        const userAnswer = prediction.predictions?.[q.questionId];
        const correctAnswer = actualResults?.[q.questionId];

        // Format the answer for display
        let displayAnswer: string | number | undefined = userAnswer;
        if (q.type === 'radio' && userAnswer && typeof userAnswer === 'string') {
          displayAnswer = formatSlugForDisplay(userAnswer);
        }

        // Determine if answer is correct and set class
        let statusIcon = '';
        let answerClass = 'answer-neutral';

        if (correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '') {
          if (isAnswerCorrect(q, userAnswer, correctAnswer)) {
            answerClass = 'answer-correct';
            statusIcon = '✓';
          } else {
            answerClass = 'answer-incorrect';
            statusIcon = '✗';
          }
        }

        return (
          <div key={q.questionId} className={`answer-detail-item ${answerClass}`}>
            <span className="answer-detail-label">{q.label}</span>
            <span className="answer-detail-value">
              {displayAnswer || '-'}
              {statusIcon && <strong className="answer-status-icon"> {statusIcon}</strong>}
            </span>
          </div>
        );
      })}
    </>
  );
}
