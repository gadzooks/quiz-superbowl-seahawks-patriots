import { type MutableRefObject, useState, useEffect, useRef, useCallback, memo } from 'react';

import { savePrediction } from '../db/queries';
import type { Question, Prediction, League } from '../types';

import { isAnswerCorrect, formatSlugForDisplay, countAnsweredQuestions } from './helpers';

interface PredictionsFormProps {
  questions: Question[];
  userPrediction: Prediction | undefined;
  league: League;
  userId: string;
  onProgressUpdate: (percentage: number) => void;
  /** Parent-owned ref that caches formData across unmount/remount cycles */
  formDataCacheRef: MutableRefObject<Record<string, string | number> | null>;
  /** Parent-owned ref tracking last explicit save snapshot (survives remounts) */
  lastExplicitSaveRef: MutableRefObject<string | null>;
  /** Reports unsaved state to parent for the floating save bar */
  onUnsavedChangesUpdate: (hasUnsaved: boolean) => void;
  /** Parent sets true before cancel-triggered remount to skip unmount save */
  skipUnmountSaveRef: MutableRefObject<boolean>;
}

export const PredictionsForm = memo(function PredictionsForm({
  questions,
  userPrediction,
  league,
  userId,
  onProgressUpdate,
  formDataCacheRef,
  lastExplicitSaveRef,
  onUnsavedChangesUpdate,
  skipUnmountSaveRef,
}: PredictionsFormProps) {
  // Form state — local only, not driven by InstantDB after initial load
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  // Refs for save logic
  const formDataRef = useRef<Record<string, string | number>>({});
  // Use parent's explicit save snapshot if available (survives tab switches),
  // otherwise fall back to DB state on first mount
  const lastSavedDataRef = useRef<string>(
    lastExplicitSaveRef.current ?? JSON.stringify(userPrediction?.predictions ?? {})
  );

  // Stable refs for callbacks (avoids re-render cascades from unstable props)
  const leagueRef = useRef(league);
  const userPredictionRef = useRef(userPrediction);
  const questionsRef = useRef(questions);
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const onUnsavedChangesUpdateRef = useRef(onUnsavedChangesUpdate);

  // Initialize form data: prefer parent cache (survives remounts), then InstantDB data
  useEffect(() => {
    if (formDataCacheRef.current) {
      setFormData(formDataCacheRef.current);
      formDataRef.current = formDataCacheRef.current;
      return;
    }
    if (userPrediction?.predictions) {
      setFormData(userPrediction.predictions);
      formDataRef.current = userPrediction.predictions;
      formDataCacheRef.current = userPrediction.predictions;
    }
  }, []);

  // Keep refs in sync with latest props
  useEffect(() => {
    leagueRef.current = league;
    userPredictionRef.current = userPrediction;
    questionsRef.current = questions;
    onProgressUpdateRef.current = onProgressUpdate;
    onUnsavedChangesUpdateRef.current = onUnsavedChangesUpdate;
  }, [league, userPrediction, questions, onProgressUpdate, onUnsavedChangesUpdate]);

  // Update progress bar and report unsaved state whenever formData changes
  useEffect(() => {
    const answered = countAnsweredQuestions(formData, questionsRef.current);
    const total = questionsRef.current.length;
    onProgressUpdateRef.current(total > 0 ? Math.round((answered / total) * 100) : 0);

    // Sync lastSavedDataRef from parent (captures external saves from LeagueView)
    if (lastExplicitSaveRef.current) {
      lastSavedDataRef.current = lastExplicitSaveRef.current;
    }
    const unsaved = JSON.stringify(formData) !== lastSavedDataRef.current;
    onUnsavedChangesUpdateRef.current(unsaved);
  }, [formData]);

  // Save pending changes on unmount (skip if cancel triggered the remount)
  useEffect(() => {
    return () => {
      if (skipUnmountSaveRef.current) return;
      const data = formDataRef.current;
      const currentPrediction = userPredictionRef.current;
      const currentLeague = leagueRef.current;
      if (currentPrediction && currentLeague.isOpen && Object.keys(data).length > 0) {
        void savePrediction({
          id: currentPrediction.id,
          leagueId: currentLeague.id,
          userId,
          teamName: currentPrediction.teamName,
          predictions: data,
          isManager: currentPrediction.isManager,
          actualResults: currentLeague.actualResults,
          questions: questionsRef.current,
        });
      }
    };
  }, [userId]);

  // Local-only change handler — no auto-save, just update state
  const handleChange = useCallback(
    (questionId: string, value: string | number) => {
      setFormData((prev) => {
        const next = { ...prev, [questionId]: value };
        formDataRef.current = next;
        formDataCacheRef.current = next; // persist across remounts
        return next;
      });
    },
    [formDataCacheRef]
  );

  const handleRadioChange = useCallback(
    (questionId: string, value: string) => {
      handleChange(questionId, value);
    },
    [handleChange]
  );

  const handleNumberChange = useCallback(
    (questionId: string, value: string) => {
      if (value === '') {
        handleChange(questionId, '');
        return;
      }
      const parsed = parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        handleChange(questionId, parsed);
      }
    },
    [handleChange]
  );

  // Derived display state
  const hasResults = league.actualResults && Object.keys(league.actualResults).length > 0;
  const showCorrectAnswers = !league.isOpen && hasResults;

  return (
    <section id="predictionsSection" className={!league.isOpen ? 'submissions-closed' : ''}>
      {!league.isOpen && (
        <div className="closed-banner">Submissions Closed - Your predictions are locked in!</div>
      )}

      {league.isOpen && (
        <div className="alert alert-info" style={{ marginTop: '24px' }}>
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
            />
          </svg>
          <span>Make your picks, then tap Save at the bottom.</span>
        </div>
      )}

      <form id="predictionsForm" onSubmit={(e) => e.preventDefault()}>
        {questions.map((q, index) => {
          const userAnswer = formData[q.questionId];
          const correctAnswer = league.actualResults?.[q.questionId];
          const hasCorrectAnswer = correctAnswer !== undefined && correctAnswer !== '';
          const isCorrect = hasCorrectAnswer && isAnswerCorrect(q, userAnswer, correctAnswer);

          return (
            <div key={q.id} className="question-card">
              <label>
                <span className="question-number">Question {index + 1}</span>
                <br />
                <span className="question-text">{q.label}</span>
                {q.points > 0 ? (
                  <span className="question-points-badge">{q.points} pts</span>
                ) : (
                  <span className="question-tiebreaker-badge">Tiebreaker</span>
                )}
              </label>

              {q.type === 'radio' && q.options && (
                <>
                  {q.options.map((option) => {
                    const value = option.toLowerCase().replace(/\s+/g, '-');
                    const checked = userAnswer === value;

                    let answerClass = '';
                    if (showCorrectAnswers && hasCorrectAnswer && checked) {
                      answerClass = isCorrect ? 'user-answer-correct' : 'user-answer-incorrect';
                    }

                    return (
                      <label key={value} className={`radio-option ${answerClass}`}>
                        <input
                          type="radio"
                          name={`prediction-${q.questionId}`}
                          value={value}
                          checked={checked}
                          disabled={!league.isOpen}
                          onChange={(e) => handleRadioChange(q.questionId, e.target.value)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </>
              )}

              {q.type === 'number' && (
                <input
                  type="number"
                  name={`prediction-${q.questionId}`}
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
                  value={userAnswer ?? ''}
                  min="0"
                  disabled={!league.isOpen}
                  placeholder="Enter number"
                  className={
                    showCorrectAnswers && hasCorrectAnswer && userAnswer !== ''
                      ? isCorrect
                        ? 'user-answer-correct'
                        : 'user-answer-incorrect'
                      : ''
                  }
                  onChange={(e) => handleNumberChange(q.questionId, e.target.value)}
                />
              )}

              {showCorrectAnswers && hasCorrectAnswer && (
                <div className={`correct-answer-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <span className="indicator-icon">{isCorrect ? '\u2713' : '\u2717'}</span>
                  <span>
                    {isCorrect
                      ? 'Correct!'
                      : `Correct answer: ${formatSlugForDisplay(String(correctAnswer))}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </form>
    </section>
  );
});
