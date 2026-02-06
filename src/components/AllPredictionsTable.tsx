import type { Prediction, Question } from '../types';
import { getUserColor } from '../utils/teamColor';

import { isAnswerCorrect } from './helpers';

interface AllPredictionsTableProps {
  predictions: Prediction[];
  questions: Question[];
  actualResults: Record<string, string | number> | null;
}

/**
 * Format a slug answer for display.
 * e.g., "seattle-seahawks" -> "Seattle Seahawks"
 * Numeric ranges like "8-14" are left as-is.
 */
function formatAnswer(value: string | number): string {
  const strValue = String(value);

  // Check if it's a numeric range (e.g., "8-14")
  if (/^\d+-\d+$/.test(strValue)) {
    return strValue;
  }

  return strValue
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AllPredictionsTable({
  predictions,
  questions,
  actualResults,
}: AllPredictionsTableProps) {
  if (predictions.length === 0) {
    return (
      <div className="text-center text-base-content/60 py-4">No predictions submitted yet</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead className="all-predictions-thead-sticky">
          <tr>
            <th className="text-base-content sticky left-0 z-20 bg-base-200">Team</th>
            {questions.map((question) => (
              <th key={question.id} className="text-base-content">
                {question.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {predictions.map((prediction, idx) => {
            const teamColor = getUserColor(prediction.userId);
            return (
              <tr key={prediction.id}>
                <td
                  className={`font-semibold sticky left-0 z-10 ${
                    idx % 2 === 0 ? 'bg-base-200' : 'bg-base-100'
                  }`}
                  style={{ color: teamColor }}
                >
                  {prediction.teamName}
                </td>
                {questions.map((question) => {
                  const answer = prediction.predictions[question.questionId];
                  const hasResults = actualResults !== null;
                  const correct =
                    hasResults &&
                    isAnswerCorrect(question, answer, actualResults[question.questionId]);

                  let cellClass = 'text-base-content';
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist at runtime
                  if (hasResults && answer !== undefined && answer !== '') {
                    cellClass = correct ? 'answer-correct' : 'answer-incorrect';
                  }

                  return (
                    <td key={question.id} className={cellClass}>
                      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist */}
                      {answer !== undefined && answer !== '' ? formatAnswer(answer) : '\u2014'}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Correct answers row */}
          {actualResults && Object.keys(actualResults).length > 0 && (
            <tr className="border-t-2 border-primary bg-base-300">
              <td className="font-bold text-primary sticky left-0 z-10 bg-base-300">Answers</td>
              {questions.map((question) => {
                const correctAnswer = actualResults[question.questionId];
                return (
                  <td key={question.id} className="font-bold text-primary">
                    {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- key may not exist */}
                    {correctAnswer !== undefined && correctAnswer !== ''
                      ? formatAnswer(correctAnswer)
                      : '\u2014'}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
