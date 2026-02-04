import type { Question } from '../../types';
import { formatSlugForDisplay } from '../helpers';
import { RadioGroup } from '../ui/RadioGroup';

interface RadioQuestionProps {
  question: Question;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  correctAnswer?: string | number;
  showCorrectAnswer?: boolean;
}

/**
 * Radio button question component
 * Displays multiple choice options with optional correct answer indicator
 */
export function RadioQuestion({
  question,
  value,
  onChange,
  disabled = false,
  correctAnswer,
  showCorrectAnswer = false,
}: RadioQuestionProps) {
  if (!question.options) return null;

  const hasCorrectAnswer =
    correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '';
  const userAnswerIsCorrect = hasCorrectAnswer && value && correctAnswer === value;

  return (
    <>
      <RadioGroup
        name={`question-${question.questionId}`}
        options={question.options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        correctAnswer={correctAnswer ? String(correctAnswer) : undefined}
        showCorrectAnswer={showCorrectAnswer && hasCorrectAnswer}
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
