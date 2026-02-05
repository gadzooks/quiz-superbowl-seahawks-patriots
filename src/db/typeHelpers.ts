import type { Game, League, Prediction, Question } from '../types';

/**
 * Type guards and parsers for InstantDB query results
 * Provides runtime validation without additional dependencies
 *
 * Note: These parsers validate required fields then cast to the target type.
 * The cast is safe because we've verified the shape matches.
 */
/* eslint-disable no-restricted-syntax */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Parse Game from InstantDB result
 * Returns null if data is invalid
 */
export function parseGame(raw: unknown): Game | null {
  if (!isObject(raw)) return null;

  // Check required fields
  if (typeof raw.id !== 'string') return null;
  if (typeof raw.gameId !== 'string') return null;
  if (typeof raw.displayName !== 'string') return null;
  if (typeof raw.year !== 'number') return null;

  return raw as unknown as Game;
}

/**
 * Parse League from InstantDB result
 * Returns null if data is invalid
 */
export function parseLeague(raw: unknown): League | null {
  if (!isObject(raw)) return null;

  // Check required fields
  if (typeof raw.id !== 'string') return null;
  // Note: gameId is stored as a relationship, not a field
  if (typeof raw.slug !== 'string') return null;
  if (typeof raw.creatorId !== 'string') return null;
  if (typeof raw.isOpen !== 'boolean') return null;

  return raw as unknown as League;
}

/**
 * Parse Question from InstantDB result
 * Returns null if data is invalid
 */
export function parseQuestion(raw: unknown): Question | null {
  if (!isObject(raw)) return null;

  // Check required fields
  if (typeof raw.id !== 'string') return null;
  if (typeof raw.questionId !== 'string') return null;
  if (typeof raw.label !== 'string') return null;
  if (typeof raw.type !== 'string') return null;
  if (typeof raw.points !== 'number') return null;
  if (typeof raw.sortOrder !== 'number') return null;

  return raw as unknown as Question;
}

/**
 * Parse Prediction from InstantDB result
 * Returns null if data is invalid
 */
export function parsePrediction(raw: unknown): Prediction | null {
  if (!isObject(raw)) return null;

  // Check required fields
  if (typeof raw.id !== 'string') return null;
  // Note: leagueId is stored as a relationship, not a field
  if (typeof raw.userId !== 'string') return null;
  if (typeof raw.teamName !== 'string') return null;

  return raw as unknown as Prediction;
}

/**
 * Parse array of Questions with validation
 */
export function parseQuestions(raw: unknown): Question[] {
  if (!isArray(raw)) return [];
  return raw.map(parseQuestion).filter((q): q is Question => q !== null);
}

/**
 * Parse array of Predictions with validation
 */
export function parsePredictions(raw: unknown): Prediction[] {
  if (!isArray(raw)) return [];
  return raw.map(parsePrediction).filter((p): p is Prediction => p !== null);
}
