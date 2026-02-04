import { useState, useEffect, useRef, useCallback } from 'react';

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
}

export function PredictionsForm({
  questions,
  userPrediction,
  league,
  userId,
  showToast,
  onProgressUpdate,
  onCompletionCelebration,
}: PredictionsFormProps) {
  // Form state - controlled inputs
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [savedQuestionId, setSavedQuestionId] = useState<string | null>(null);

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangedQuestionIdRef = useRef<string | null>(null);
  const formDataRef = useRef<Record<string, string | number>>({});
  const previousAnswerCountRef = useRef<number>(0);

  // Initialize form data from userPrediction
  useEffect(() => {
    if (userPrediction?.predictions) {
      setFormData(userPrediction.predictions);
      formDataRef.current = userPrediction.predictions;
      // Initialize previous count to prevent false triggers on first render
      previousAnswerCountRef.current = countAnsweredQuestions(
        userPrediction.predictions,
        questions
      );
    }
  }, [userPrediction, questions]);

  // Keep ref in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Update progress bar whenever formData changes
  useEffect(() => {
    const answered = countAnsweredQuestions(formData, questions);
    const percentage = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;
    onProgressUpdate(percentage);
  }, [formData, questions, onProgressUpdate]);

  // Clear saved indicator after 2 seconds
  useEffect(() => {
    if (savedQuestionId) {
      const timer = setTimeout(() => {
        setSavedQuestionId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [savedQuestionId]);

  // Auto-save handler
  const performSave = useCallback(async () => {
    if (!league.isOpen || !userPrediction) return;

    // Use ref to get current form data (avoid stale closure)
    const currentFormData = formDataRef.current;

    try {
      await savePrediction({
        id: userPrediction.id,
        leagueId: league.id,
        userId: userId,
        teamName: userPrediction.teamName,
        predictions: currentFormData,
        isManager: userPrediction.isManager,
        actualResults: league.actualResults,
        questions,
      });

      // Show saved indicator for the last changed question
      if (lastChangedQuestionIdRef.current) {
        setSavedQuestionId(lastChangedQuestionIdRef.current);
      }

      // Check for completion celebration after every successful save
      const answeredCount = countAnsweredQuestions(currentFormData, questions);
      const wasIncomplete = previousAnswerCountRef.current < questions.length;
      const isNowComplete = answeredCount === questions.length;

      if (wasIncomplete && isNowComplete) {
        onCompletionCelebration();
      }

      // Always update the count after each save
      previousAnswerCountRef.current = answeredCount;
    } catch (error) {
      console.error('Auto-save error:', error);
      showToast('Failed to save prediction', 'error');
    }
  }, [
    league.isOpen,
    league.id,
    league.actualResults,
    userPrediction,
    userId,
    questions,
    onCompletionCelebration,
    showToast,
  ]);

  // Handle input change with debouncing for number inputs
  const handleChange = useCallback(
    (questionId: string, value: string | number, immediate = false) => {
      lastChangedQuestionIdRef.current = questionId;

      setFormData((prev) => ({
        ...prev,
        [questionId]: value,
      }));

      // Clear pending timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Save with delay (2.5s for typing, immediate for radio/blur)
      const delay = immediate ? 0 : 2500;
      autoSaveTimeoutRef.current = setTimeout(() => {
        void performSave();
      }, delay);
    },
    [performSave]
  );

  // Handle radio button change (immediate save)
  const handleRadioChange = useCallback(
    (questionId: string, value: string) => {
      handleChange(questionId, value, true);
    },
    [handleChange]
  );

  // Handle number input change (debounced save)
  const handleNumberChange = useCallback(
    (questionId: string, value: string) => {
      const numValue = value === '' ? '' : parseInt(value) || 0;
      handleChange(questionId, numValue, false);
    },
    [handleChange]
  );

  // Handle number input blur (immediate save)
  const handleNumberBlur = useCallback(
    (_questionId: string) => {
      // Trigger immediate save on blur
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      void performSave();
    },
    [performSave]
  );

  // Check if results exist for showing correct answers
  const hasResults = league.actualResults && Object.keys(league.actualResults).length > 0;
  const showCorrectAnswers = !league.isOpen && hasResults;

  return (
    <section id="predictionsSection" className={!league.isOpen ? 'submissions-closed' : ''}>
      {/* Closed banner */}
      {!league.isOpen && (
        <div className="closed-banner">🔒 Submissions Closed - Your predictions are locked in!</div>
      )}

      {/* Info alert when open */}
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
          <span>Your answers are saved automatically as you select them.</span>
        </div>
      )}

      {/* Questions */}
      <form id="predictionsForm">
        {questions.map((q, index) => {
          const userAnswer = formData[q.questionId];
          const correctAnswer = league.actualResults?.[q.questionId];
          const hasCorrectAnswer =
            correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '';

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
                {/* Saved indicator */}
                {savedQuestionId === q.questionId && (
                  <span
                    className="saved-indicator"
                    style={{
                      color: 'var(--color-primary)',
                      fontSize: '0.875rem',
                      marginLeft: '8px',
                      opacity: 1,
                      transition: 'opacity 0.3s ease-out',
                    }}
                  >
                    ✓ Saved
                  </span>
                )}
              </label>

              {/* Radio options */}
              {q.type === 'radio' && q.options && (
                <>
                  {q.options.map((option) => {
                    const value = option.toLowerCase().replace(/\s+/g, '-');
                    const checked = userAnswer === value;

                    // Apply correct/incorrect styling when showing results
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

              {/* Number input */}
              {q.type === 'number' && (
                <input
                  type="number"
                  name={`prediction-${q.questionId}`}
                  value={userAnswer === undefined ? '' : userAnswer}
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
                  onBlur={() => handleNumberBlur(q.questionId)}
                />
              )}

              {/* Correct answer indicator */}
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
}
