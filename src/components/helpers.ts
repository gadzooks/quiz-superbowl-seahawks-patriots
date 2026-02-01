// Component helper functions

import type { Question, Prediction } from '../types';

/**
 * Count the number of answered questions in a predictions object.
 */
export function countAnsweredQuestions(
  predictions: Record<string, string | number> | undefined | null,
  questions: Question[]
): number {
  if (!predictions) return 0;

  let count = 0;
  for (const q of questions) {
    const value = predictions[q.id];
    if (value !== undefined && value !== null && value !== '') {
      count++;
    }
  }
  return count;
}

/**
 * Format a slug value back to a readable display format.
 * e.g., "8-14" stays as "8-14", "seahawks" becomes "Seahawks"
 */
export function formatSlugForDisplay(slug: string): string {
  if (!slug) return '-';
  // Check if it's a range like "8-14" - leave as is
  if (/^\d+-\d+$/.test(slug)) return slug;
  // Otherwise capitalize each word
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Check if a user's answer is correct.
 */
export function isAnswerCorrect(
  question: Question,
  userAnswer: string | number | undefined,
  correctAnswer: string | number | undefined
): boolean {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') return false;
  if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') return false;

  if (question.type === 'number') {
    return parseInt(String(userAnswer)) === parseInt(String(correctAnswer));
  }
  return userAnswer === correctAnswer;
}

/**
 * Get completion percentage for a prediction.
 */
export function getCompletionPercentage(
  predictions: Record<string, string | number> | undefined | null,
  questions: Question[]
): number {
  if (questions.length === 0) return 100;
  const answered = countAnsweredQuestions(predictions, questions);
  return Math.round((answered / questions.length) * 100);
}

/**
 * Sort predictions for leaderboard display.
 * Sort by score (desc), then tiebreak diff (asc), then team name (alphabetic).
 */
export function sortPredictionsForLeaderboard(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.tiebreakDiff !== b.tiebreakDiff) return a.tiebreakDiff - b.tiebreakDiff;
    return a.teamName.localeCompare(b.teamName);
  });
}

/**
 * Sort predictions for participants list.
 * Sort by answered count (desc), then team name (alphabetic).
 */
export function sortPredictionsForParticipants(
  predictions: Prediction[],
  questions: Question[]
): Prediction[] {
  return [...predictions].sort((a, b) => {
    const aAnswered = countAnsweredQuestions(a.predictions, questions);
    const bAnswered = countAnsweredQuestions(b.predictions, questions);
    if (bAnswered !== aAnswered) return bAnswered - aAnswered;
    return a.teamName.localeCompare(b.teamName);
  });
}

/**
 * Escape HTML to prevent XSS.
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escape a string for use in onclick handlers.
 */
export function escapeForJs(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
