import type { Question } from '../../types';
import { formatSlugForDisplay, isAnswerCorrect } from '../helpers';

interface NumberQuestionProps {
  question: Question;
  value?: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  correctAnswer?: string | number;
  showCorrectAnswer?: boolean;
  className?: string;
}

/**
 * Number input question component
 * Displays numeric input with optional correct answer indicator
 */
export function NumberQuestion({
  question,
  value,
  onChange,
  onBlur,
  disabled = false,
  correctAnswer,
  showCorrectAnswer = false,
  className = '',
}: NumberQuestionProps) {
  const hasCorrectAnswer =
    correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '';
  const userAnswerIsCorrect =
    hasCorrectAnswer &&
    value !== '' &&
    value !== undefined &&
    isAnswerCorrect(question, value, correctAnswer);

  // Build class name for input
  let inputClassName = className;
  if (showCorrectAnswer && hasCorrectAnswer && value !== '') {
    inputClassName = userAnswerIsCorrect ? 'user-answer-correct' : 'user-answer-incorrect';
  }

  return (
    <>
      <input
        type="number"
        name={`question-${question.questionId}`}
        value={value === undefined ? '' : value}
        min="0"
        disabled={disabled}
        placeholder="Enter number"
        className={inputClassName}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />

      {/* Correct answer indicator */}
      {showCorrectAnswer && hasCorrectAnswer && (
        <div
          className={`correct-answer-indicator ${userAnswerIsCorrect ? 'correct' : 'incorrect'}`}
        >
          <span className="indicator-icon">{userAnswerIsCorrect ? '\u2713' : '\u2717'}</span>
          <span>
            {userAnswerIsCorrect
              ? 'Correct!'
              : `Correct answer: ${formatSlugForDisplay(String(correctAnswer))}`}
          </span>
        </div>
      )}
    </>
  );
}
