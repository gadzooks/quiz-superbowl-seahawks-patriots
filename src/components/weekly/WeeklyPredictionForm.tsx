import { useState } from 'react';

import { savePrediction } from '../../db/queries';
import type { Question } from '../../types';

interface WeeklyPredictionFormProps {
  gameInstantId: string;
  leagueId: string;
  userId: string;
  teamName: string;
  questions: Question[];
  onSubmitted: () => void;
}

/**
 * Simple, submit-once weekly quiz answer form — deliberately simpler than
 * PredictionsForm (no autosave/draft-cache dance): weekly quizzes are one
 * short form, answered once, no benefit to that machinery here.
 */
export function WeeklyPredictionForm({
  gameInstantId,
  leagueId,
  userId,
  teamName,
  questions,
  onSubmitted,
}: WeeklyPredictionFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const unanswered = questions.filter((q) => {
      const v = answers[q.questionId];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
      return v === undefined || v === '';
    });
    if (unanswered.length > 0) {
      setError('Please answer every question before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await savePrediction({
        leagueId,
        userId,
        teamName,
        predictions: answers,
        gameInstantId,
        authUserId: userId,
      });
      onSubmitted();
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error('savePrediction (weekly) failed:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">This Week's Quiz</h2>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {questions.map((q, index) => {
          const answer = answers[q.questionId];
          return (
            <div key={q.id} className="question-card">
              <label>
                <span className="question-number">Question {index + 1}</span>
                <br />
                <span className="question-text">{q.label}</span>
                {q.isTiebreaker && <span className="question-tiebreaker-badge">Tiebreaker</span>}
              </label>

              {q.type === 'radio' && q.options && (
                <>
                  {q.options.map((option) => {
                    const value = option.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <label key={value} className="radio-option">
                        <input
                          type="radio"
                          name={`weekly-${q.questionId}`}
                          value={value}
                          checked={answer === value}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.questionId]: value }))
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
                  value={answer ?? ''}
                  onChange={(e) => {
                    const num = e.target.value === '' ? '' : Number(e.target.value);
                    setAnswers((prev) => ({ ...prev, [q.questionId]: num }));
                  }}
                />
              )}
            </div>
          );
        })}

        <button
          type="button"
          className="btn btn-primary btn-lg mt-4"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
}
