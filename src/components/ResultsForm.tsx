import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AUTO_SAVE } from '../constants/timing';
import { saveResults } from '../db/queries';
import type { League, Prediction, Question } from '../types';

import { pointsToFootballs } from './helpers';

interface ResultsFormProps {
  questions: Question[];
  league: League;
  predictions: Prediction[];
  showToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ResultsForm({ questions, league, predictions, showToast }: ResultsFormProps) {
  // Initialize local state from league.actualResults
  const [results, setResults] = useState<Record<string, string | number>>(() => {
    return league.actualResults ?? {};
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track pending results for flush on unmount
  const pendingResultsRef = useRef<Record<string, string | number> | null>(null);
  const leagueIdRef = useRef(league.id);
  const predictionsRef = useRef(predictions);
  const questionsRef = useRef(questions);
  // Track current results to avoid stale closure issues
  const resultsRef = useRef(results);

  // Keep refs in sync with state/props for use in callbacks and cleanup
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    leagueIdRef.current = league.id;
    predictionsRef.current = predictions;
    questionsRef.current = questions;
  }, [league.id, predictions, questions]);

  // Perform the actual save
  const performSave = useCallback(
    async (resultsToSave: Record<string, string | number>) => {
      try {
        await saveResults(league.id, resultsToSave, predictions, questions);
        pendingResultsRef.current = null;
        setSaveStatus('saved');

        // Clear saved status after delay
        setTimeout(() => {
          setSaveStatus('idle');
        }, AUTO_SAVE.SAVED_INDICATOR_DURATION);
      } catch (error) {
        console.error('Results auto-save error:', error);
        setSaveStatus('error');
        showToast('Error saving results', 'error');
      }
    },
    [league.id, predictions, questions, showToast]
  );

  // Debounced save function
  const debouncedSave = useCallback(
    (updatedResults: Record<string, string | number>) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Track pending results for flush on unmount
      pendingResultsRef.current = updatedResults;

      // Set saving status immediately
      setSaveStatus('saving');

      // Debounce the actual save
      saveTimeoutRef.current = setTimeout(() => {
        void performSave(updatedResults);
      }, AUTO_SAVE.RESULTS_INPUT_DELAY);
    },
    [performSave]
  );

  // Flush pending save on unmount (don't lose user's work!)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // If there are pending results, save them immediately
      if (pendingResultsRef.current) {
        void saveResults(
          leagueIdRef.current,
          pendingResultsRef.current,
          predictionsRef.current,
          questionsRef.current
        );
      }
    };
  }, []);

  // Handle radio button change
  // Uses ref to avoid stale closure when user quickly switches between inputs
  const handleRadioChange = useCallback(
    (questionId: string, value: string) => {
      const updatedResults = { ...resultsRef.current, [questionId]: value };
      resultsRef.current = updatedResults;
      setResults(updatedResults);
      debouncedSave(updatedResults);
    },
    [debouncedSave]
  );

  // Handle number input change
  // Uses ref to avoid stale closure when user quickly switches between inputs
  const handleNumberChange = useCallback(
    (questionId: string, value: string) => {
      const numValue = parseInt(value, 10);
      const finalValue = Number.isNaN(numValue) ? '' : numValue;
      const updatedResults = {
        ...resultsRef.current,
        [questionId]: finalValue,
      };
      resultsRef.current = updatedResults;
      setResults(updatedResults);
      debouncedSave(updatedResults);
    },
    [debouncedSave]
  );

  // Handle clear button click
  // Uses ref to avoid stale closure when user quickly switches between inputs
  const handleClear = useCallback(
    (questionId: string) => {
      const updatedResults = { ...resultsRef.current };
      delete updatedResults[questionId];
      resultsRef.current = updatedResults;
      setResults(updatedResults);
      debouncedSave(updatedResults);
      showToast('Result cleared', 'info');
    },
    [debouncedSave, showToast]
  );

  // Save status message
  const statusMessage = useMemo(() => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return '\u2713 Saved & scores updated';
      case 'error':
        return '\u2717 Error saving';
      default:
        return '';
    }
  }, [saveStatus]);

  const statusColor = useMemo(() => {
    switch (saveStatus) {
      case 'saving':
        return 'var(--color-text-muted)';
      case 'saved':
        return 'var(--color-primary)';
      case 'error':
        return 'var(--color-error)';
      default:
        return '';
    }
  }, [saveStatus]);

  return (
    <form id="resultsForm">
      {questions.map((q, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
        const hasValue = results[q.questionId] !== undefined && results[q.questionId] !== '';

        return (
          <div key={q.questionId} className="question-card results-question-card">
            <div className="results-question-header">
              <label>
                <span className="results-question-number">Question {index + 1}</span>
                <br />
                <span>{q.label}</span>
                <span className="results-points-badge">{pointsToFootballs(q.points)}</span>
              </label>
              {hasValue && (
                <button
                  type="button"
                  onClick={() => handleClear(q.questionId)}
                  className="results-clear-btn"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {q.type === 'radio' && q.options ? (
              <>
                {q.options.map((option) => {
                  const value = option.toLowerCase().replace(/\s+/g, '-');
                  const isChecked = results[q.questionId] === value;
                  const selectedClass = isChecked
                    ? 'results-radio-selected'
                    : 'results-radio-unselected';

                  return (
                    <label key={option} className={`radio-option ${selectedClass}`}>
                      <input
                        type="radio"
                        name={`result-${q.questionId}`}
                        value={value}
                        checked={isChecked}
                        onChange={() => handleRadioChange(q.questionId, value)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </>
            ) : (
              <input
                type="number"
                name={`result-${q.questionId}`}
                value={results[q.questionId] ?? ''}
                onChange={(e) => handleNumberChange(q.questionId, e.target.value)}
                min="0"
                placeholder="Enter number"
                className="results-number-input"
              />
            )}
          </div>
        );
      })}

      <div className="results-info-banner">
        <span className="results-info-icon">ℹ️</span>
        <span className="results-info-text">
          Results are saved automatically as you enter them.
        </span>
      </div>

      {statusMessage && (
        <div
          id="resultsAutoSaveStatus"
          style={{
            marginTop: 'var(--space-sm)',
            textAlign: 'center',
            fontSize: '15px',
            fontWeight: 600,
            color: statusColor,
          }}
        >
          {statusMessage}
        </div>
      )}
    </form>
  );
}
