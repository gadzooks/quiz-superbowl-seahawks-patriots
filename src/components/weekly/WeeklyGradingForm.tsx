import { useState } from 'react';

import { saveQuizResults } from '../../db/queries';
import type { Prediction, Question } from '../../types';

interface WeeklyGradingFormProps {
  gameInstantId: string;
  questions: Question[];
  predictions: Prediction[];
  onGraded: () => void;
}

/**
 * Admin-only: enter the actual results for a past quiz. Recalculates every
 * submitted prediction's score in this league for that quiz.
 */
export function WeeklyGradingForm({
  gameInstantId,
  questions,
  predictions,
  onGraded,
}: WeeklyGradingFormProps) {
  const [results, setResults] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const gradable = questions.filter((q) => !q.isTiebreaker);
    const missing = gradable.filter((q) => {
      const v = results[q.questionId];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
      return v === undefined || v === '';
    });
    if (missing.length > 0) {
      setError('Please enter a result for every question.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveQuizResults(gameInstantId, results, predictions, questions);
      onGraded();
    } catch (err) {
      setError('Failed to save results. Please try again.');
      console.error('saveQuizResults failed:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200 border-2 border-primary">
      <div className="card-body">
        <h2 className="card-title text-lg text-primary">Grade This Quiz</h2>
        <p className="text-sm text-base-content/70">
          Enter the actual results — every submitted prediction's score updates automatically.
        </p>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {questions
          .filter((q) => !q.isTiebreaker)
          .map((q) => {
            const value = results[q.questionId];
            return (
              <div key={q.id} className="question-card">
                <label>
                  <span className="question-text">{q.label}</span>
                </label>

                {q.type === 'radio' && q.options && (
                  <>
                    {q.options.map((option) => {
                      const optionValue = option.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <label key={optionValue} className="radio-option">
                          <input
                            type="radio"
                            name={`grade-${q.questionId}`}
                            value={optionValue}
                            checked={value === optionValue}
                            onChange={() =>
                              setResults((prev) => ({ ...prev, [q.questionId]: optionValue }))
                            }
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
                    className="input input-bordered w-full"
                    min={0}
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
                    value={value ?? ''}
                    onChange={(e) => {
                      const num = e.target.value === '' ? '' : Number(e.target.value);
                      setResults((prev) => ({ ...prev, [q.questionId]: num }));
                    }}
                  />
                )}
              </div>
            );
          })}

        <button
          type="button"
          className="btn btn-primary mt-4"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? 'Saving...' : 'Save Results & Grade'}
        </button>
      </div>
    </div>
  );
}
