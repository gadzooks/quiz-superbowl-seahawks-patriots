import { type MutableRefObject, useState, useEffect, useRef, useCallback, memo } from 'react';

import { savePrediction } from '../db/queries';
import type { Question, Prediction, League } from '../types';

import { isAnswerCorrect, formatSlugForDisplay, countAnsweredQuestions } from './helpers';

interface PredictionsFormProps {
  questions: Question[];
  userPrediction: Prediction | undefined;
  league: League;
  userId: string;
  showToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
  onProgressUpdate: (percentage: number) => void;
  onCompletionCelebration: () => void;
  /** Parent-owned ref that caches formData across unmount/remount cycles */
  formDataCacheRef: MutableRefObject<Record<string, string | number> | null>;
}

export const PredictionsForm = memo(function PredictionsForm({
  questions,
  userPrediction,
  league,
  userId,
  showToast,
  onProgressUpdate,
  onCompletionCelebration,
  formDataCacheRef,
}: PredictionsFormProps) {
  // Form state — local only, not driven by InstantDB after initial load
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Refs for save logic
  const formDataRef = useRef<Record<string, string | number>>({});
  const lastSavedDataRef = useRef<string>(JSON.stringify(userPrediction?.predictions ?? {}));

  // Stable refs for callbacks (avoids re-render cascades from unstable props)
  const leagueRef = useRef(league);
  const userPredictionRef = useRef(userPrediction);
  const questionsRef = useRef(questions);
  const onCompletionCelebrationRef = useRef(onCompletionCelebration);
  const onProgressUpdateRef = useRef(onProgressUpdate);

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
    onCompletionCelebrationRef.current = onCompletionCelebration;
    onProgressUpdateRef.current = onProgressUpdate;
  }, [league, userPrediction, questions, onCompletionCelebration, onProgressUpdate]);

  // Manual save handler
  const handleSave = useCallback(() => {
    const currentLeague = leagueRef.current;
    const currentPrediction = userPredictionRef.current;

    if (!currentLeague.isOpen || !currentPrediction) return;

    setSaveStatus('saving');
    const dataToSave = { ...formDataRef.current };

    savePrediction({
      id: currentPrediction.id,
      leagueId: currentLeague.id,
      userId,
      teamName: currentPrediction.teamName,
      predictions: dataToSave,
      isManager: currentPrediction.isManager,
      actualResults: currentLeague.actualResults,
      questions: questionsRef.current,
    }).then(
      () => {
        lastSavedDataRef.current = JSON.stringify(dataToSave);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);

        // Trigger completion celebration if all questions answered
        // (parent guards against showing more than once via hasShownCompletionCelebration)
        const answeredCount = countAnsweredQuestions(dataToSave, questionsRef.current);
        if (answeredCount === questionsRef.current.length) {
          onCompletionCelebrationRef.current();
        }
      },
      () => {
        setSaveStatus('idle');
        showToast('Failed to save — please try again', 'error');
      }
    );
  }, [userId, showToast]);

  // Update progress bar whenever formData changes
  useEffect(() => {
    const answered = countAnsweredQuestions(formData, questionsRef.current);
    const total = questionsRef.current.length;
    onProgressUpdateRef.current(total > 0 ? Math.round((answered / total) * 100) : 0);
  }, [formData]);

  // Save pending changes on unmount (only if we have real data)
  useEffect(() => {
    return () => {
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
      setSaveStatus('idle');
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

  // Detect unsaved changes by comparing current formData to last saved snapshot
  const hasUnsavedChanges = JSON.stringify(formData) !== lastSavedDataRef.current;

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

      {league.isOpen && (hasUnsavedChanges || saveStatus !== 'idle') && (
        <div className="save-button-container">
          <button
            type="button"
            className={`btn btn-lg save-predictions-btn ${
              saveStatus === 'saved' ? 'save-btn-saved' : 'btn-primary save-btn-unsaved'
            }`}
            disabled={saveStatus === 'saving'}
            onClick={handleSave}
          >
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
                ? '\u2705 Saved!'
                : '\u26A0\uFE0F Save Predictions'}
          </button>
        </div>
      )}
    </section>
  );
});
