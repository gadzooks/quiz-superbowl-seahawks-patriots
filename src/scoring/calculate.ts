import type { Question } from '../types';

export interface ScoreResult {
  score: number;
  debug: string[];
}

/**
 * Calculate score for predictions against actual results.
 * Pure function - no side effects.
 */
export function calculateScore(
  predictions: Record<string, string | number> | null | undefined,
  actualResults: Record<string, string | number> | null | undefined,
  questions: Question[]
): number {
  if (!predictions || !actualResults) return 0;

  let score = 0;

  for (const q of questions) {
    // Skip tiebreaker - it has 0 points
    if (q.isTiebreaker) continue;

    const predicted = predictions[q.questionId];
    const actual = actualResults[q.questionId];

    // Only award points if BOTH prediction and actual result exist
    if (predicted === undefined || predicted === null || predicted === '') continue;
    if (actual === undefined || actual === null || actual === '') continue;

    let isCorrect = false;
    if (q.type === 'number') {
      isCorrect = parseInt(String(predicted)) === parseInt(String(actual));
    } else {
      // Both should be in slug format (lowercase with dashes)
      isCorrect = predicted === actual;
    }

    if (isCorrect) {
      score += q.points;
    }
  }

  return score;
}

/**
 * Calculate score with debug information.
 * Useful for admin/testing views.
 */
export function calculateScoreWithDebug(
  predictions: Record<string, string | number> | null | undefined,
  actualResults: Record<string, string | number> | null | undefined,
  questions: Question[]
): ScoreResult {
  if (!predictions || !actualResults) {
    return { score: 0, debug: ['No predictions or results'] };
  }

  let score = 0;
  const debug: string[] = [];

  for (const q of questions) {
    if (q.isTiebreaker) continue;

    const predicted = predictions[q.questionId];
    const actual = actualResults[q.questionId];

    if (predicted === undefined || predicted === null || predicted === '') {
      debug.push(`\u{2298} ${q.questionId}: no prediction set`);
      continue;
    }
    if (actual === undefined || actual === null || actual === '') {
      debug.push(`\u{2298} ${q.questionId}: no actual result set`);
      continue;
    }

    let isCorrect = false;
    if (q.type === 'number') {
      isCorrect = parseInt(String(predicted)) === parseInt(String(actual));
    } else {
      isCorrect = predicted === actual;
    }

    if (isCorrect) {
      score += q.points;
      debug.push(`\u{2713} ${q.questionId}: "${predicted}" === "${actual}" (+${q.points})`);
    } else {
      debug.push(`\u{2717} ${q.questionId}: "${predicted}" !== "${actual}"`);
    }
  }

  return { score, debug };
}

/**
 * Calculate tiebreak difference.
 * Returns absolute difference between predicted and actual total points.
 */
export function calculateTiebreakDiff(
  predictions: Record<string, string | number> | null | undefined,
  actualResults: Record<string, string | number> | null | undefined
): number {
  if (!predictions || !actualResults) return Infinity;

  const predicted = predictions['totalPoints'];
  const actual = actualResults['totalPoints'];

  if (predicted === undefined || predicted === null || predicted === '') return Infinity;
  if (actual === undefined || actual === null || actual === '') return Infinity;

  return Math.abs(parseInt(String(predicted)) - parseInt(String(actual)));
}
