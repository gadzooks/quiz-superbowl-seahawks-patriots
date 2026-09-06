import { useState } from 'react';

import { formatQuizDate, buildWeeklyGameId } from '../../config/games';
import { createWeeklyQuiz } from '../../db/queries';

interface DraftQuestion {
  label: string;
  type: 'radio' | 'number';
  options: string; // comma-separated, radio only
  points: number;
  isTiebreaker: boolean;
}

function emptyQuestion(): DraftQuestion {
  return { label: '', type: 'radio', options: '', points: 1, isTiebreaker: false };
}

interface WeeklyQuizAuthorFormProps {
  quizDate: string;
  onCreated: () => void;
}

/**
 * Admin-only quiz authoring form — replaces the old file-per-game seeding
 * script (data/games/<id>-questions.ts) for weekly quizzes. Writes directly
 * to the questions table (instant.perms.ts gates this on isAnyLeagueAdmin).
 */
export function WeeklyQuizAuthorForm({ quizDate, onCreated }: WeeklyQuizAuthorFormProps) {
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);

    const trimmed = questions.filter((q) => q.label.trim());
    if (trimmed.length === 0) {
      setError('Add at least one question.');
      return;
    }
    for (const q of trimmed) {
      if (q.type === 'radio' && q.options.split(',').filter((o) => o.trim()).length < 2) {
        setError(`"${q.label}" needs at least two comma-separated options.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createWeeklyQuiz({
        gameId: buildWeeklyGameId(quizDate),
        quizDate,
        displayName: `Weekly Quiz · ${formatQuizDate(quizDate)}`,
        year: Number(quizDate.slice(0, 4)),
        questions: trimmed.map((q, i) => ({
          questionId: `q${i + 1}`,
          label: q.label.trim(),
          type: q.type,
          options:
            q.type === 'radio'
              ? q.options
                  .split(',')
                  .map((o) => o.trim())
                  .filter(Boolean)
              : undefined,
          points: q.isTiebreaker ? 0 : q.points,
          isTiebreaker: q.isTiebreaker,
        })),
      });
      onCreated();
    } catch (err) {
      setError('Failed to create the quiz. Please try again.');
      console.error('createWeeklyQuiz failed:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">
          Create the {formatQuizDate(quizDate)} Quiz
        </h2>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-2">
          {questions.map((q, i) => (
            <div key={i} className="border border-base-300 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Question {i + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => removeQuestion(i)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Question text"
                value={q.label}
                onChange={(e) => updateQuestion(i, { label: e.target.value })}
              />

              <div className="flex gap-2 items-center">
                <select
                  className="select select-bordered"
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(i, {
                      type: e.target.value === 'number' ? 'number' : 'radio',
                    })
                  }
                >
                  <option value="radio">Multiple choice</option>
                  <option value="number">Number</option>
                </select>

                {!q.isTiebreaker && (
                  <input
                    type="number"
                    className="input input-bordered w-24"
                    min={0}
                    value={q.points}
                    onChange={(e) => updateQuestion(i, { points: Number(e.target.value) })}
                    aria-label="Points"
                  />
                )}

                <label className="label cursor-pointer gap-2">
                  <span className="label-text">Tiebreaker</span>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={q.isTiebreaker}
                    onChange={(e) => updateQuestion(i, { isTiebreaker: e.target.checked })}
                  />
                </label>
              </div>

              {q.type === 'radio' && (
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Options, comma-separated (e.g. Seahawks, Patriots)"
                  value={q.options}
                  onChange={(e) => updateQuestion(i, { options: e.target.value })}
                />
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
          >
            + Add Question
          </button>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
