import type { Prediction, Question } from '../../types';
import { isAnswerCorrect, formatSlugForDisplay } from '../helpers';

interface WeeklyQuizResultsProps {
  questions: Question[];
  userPrediction: Prediction;
  actualResults: Record<string, string | number> | null | undefined;
  leaguePredictions: Prediction[];
}

/**
 * Read-only view once a user has submitted (or the quiz's window has
 * closed): their answers, per-question correctness once graded, and this
 * quiz's mini-leaderboard.
 */
export function WeeklyQuizResults({
  questions,
  userPrediction,
  actualResults,
  leaguePredictions,
}: WeeklyQuizResultsProps) {
  const hasResults = actualResults && Object.keys(actualResults).length > 0;
  const sorted = [...leaguePredictions].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary">
            Your Answers {hasResults && `— Score: ${userPrediction.score}`}
          </h2>

          {questions.map((q, index) => {
            const answer = userPrediction.predictions[q.questionId];
            const correctAnswer = actualResults?.[q.questionId];
            const hasCorrectAnswer = correctAnswer !== undefined && correctAnswer !== '';
            const correct = hasCorrectAnswer && isAnswerCorrect(q, answer, correctAnswer);

            return (
              <div key={q.id} className="question-card">
                <label>
                  <span className="question-number">Question {index + 1}</span>
                  <br />
                  <span className="question-text">{q.label}</span>
                </label>
                <p>
                  Your answer:{' '}
                  <strong>
                    {q.type === 'radio' ? (
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
                      formatSlugForDisplay(String(answer ?? '-'))
                    ) : (
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
                      <>{answer ?? '-'}</>
                    )}
                  </strong>
                </p>
                {hasCorrectAnswer && (
                  <div className={`correct-answer-indicator ${correct ? 'correct' : 'incorrect'}`}>
                    <span className="indicator-icon">{correct ? '✓' : '✗'}</span>
                    <span>
                      {correct
                        ? 'Correct!'
                        : `Correct answer: ${q.type === 'radio' ? formatSlugForDisplay(String(correctAnswer)) : correctAnswer}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg text-primary">This Week's Standings</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id} className={p.id === userPrediction.id ? 'font-bold' : ''}>
                    <td>{p.teamName}</td>
                    <td>{p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
