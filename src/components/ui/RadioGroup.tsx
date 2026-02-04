import { memo } from 'react';

interface RadioGroupProps {
  name: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showCorrectAnswer?: boolean;
}

/**
 * Radio button group component
 * Handles option rendering with optional correct/incorrect styling
 * Memoized to prevent unnecessary re-renders
 */
export const RadioGroup = memo(function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled = false,
  correctAnswer,
  showCorrectAnswer = false,
}: RadioGroupProps) {
  return (
    <>
      {options.map((option) => {
        const optionValue = option.toLowerCase().replace(/\s+/g, '-');
        const isChecked = value === optionValue;
        const isCorrect = correctAnswer === optionValue;

        // Apply styling when showing correct answers
        let answerClass = '';
        if (showCorrectAnswer && correctAnswer && isChecked) {
          answerClass = isCorrect ? 'user-answer-correct' : 'user-answer-incorrect';
        }

        // For results form - highlight selected option
        if (!showCorrectAnswer && isChecked) {
          answerClass = 'results-radio-selected';
        } else if (!showCorrectAnswer && !isChecked && value !== undefined) {
          answerClass = 'results-radio-unselected';
        }

        return (
          <label key={optionValue} className={`radio-option ${answerClass}`.trim()}>
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={isChecked}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
            />
            <span>{option}</span>
          </label>
        );
      })}
    </>
  );
});
