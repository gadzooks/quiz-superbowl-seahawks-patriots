import type { ReactNode } from 'react';

interface QuestionCardProps {
  number: number;
  label: string;
  points: number;
  children: ReactNode;
  savedIndicator?: ReactNode;
}

/**
 * Card wrapper for question display
 * Shows question number, label, points badge, and saved indicator
 */
export function QuestionCard({
  number,
  label,
  points,
  children,
  savedIndicator,
}: QuestionCardProps) {
  return (
    <div className="question-card">
      <label>
        <span className="question-number">Question {number}</span>
        <br />
        <span className="question-text">{label}</span>
        {points > 0 ? (
          <span className="question-points-badge">{points} pts</span>
        ) : (
          <span className="question-tiebreaker-badge">Tiebreaker</span>
        )}
        {savedIndicator}
      </label>
      {children}
    </div>
  );
}
