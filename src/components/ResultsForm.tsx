import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AUTO_SAVE } from '../constants/timing';
import { saveResults } from '../db/queries';
import type { League, Prediction, Question } from '../types';

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
  const lastLoadedLeagueIdRef = useRef<string | null>(null);

  // Only sync from external data on initial load or when switching to a different league
  // This prevents race conditions where real-time updates overwrite local edits
  useEffect(() => {
    if (lastLoadedLeagueIdRef.current !== league.id) {
      setResults(league.actualResults ?? {});
      lastLoadedLeagueIdRef.current = league.id;
    }
  }, [league.id, league.actualResults]);

  // Debounced save function
  const debouncedSave = useCallback(
    (updatedResults: Record<string, string | number>) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set saving status immediately
      setSaveStatus('saving');

      // Debounce the actual save
      saveTimeoutRef.current = setTimeout(() => {
        void (async () => {
          try {
            await saveResults(league.id, updatedResults, predictions, questions);
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
        })();
      }, AUTO_SAVE.RESULTS_INPUT_DELAY);
    },
    [league.id, predictions, questions, showToast]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle radio button change
  const handleRadioChange = useCallback(
    (questionId: string, value: string) => {
      const updatedResults = { ...results, [questionId]: value };
      setResults(updatedResults);
      debouncedSave(updatedResults);
    },
    [results, debouncedSave]
  );

  // Handle number input change
  const handleNumberChange = useCallback(
    (questionId: string, value: string) => {
      const numValue = parseInt(value, 10);
      const finalValue = Number.isNaN(numValue) ? '' : numValue;
      const updatedResults = {
        ...results,
        [questionId]: finalValue,
      };
      setResults(updatedResults);
      debouncedSave(updatedResults);
    },
    [results, debouncedSave]
  );

  // Handle clear button click
  const handleClear = useCallback(
    (questionId: string) => {
      const updatedResults = { ...results };
      delete updatedResults[questionId];
      setResults(updatedResults);
      debouncedSave(updatedResults);
      showToast('Result cleared', 'info');
    },
    [results, debouncedSave, showToast]
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
                <span className="results-points-badge">{q.points} pts</span>
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
