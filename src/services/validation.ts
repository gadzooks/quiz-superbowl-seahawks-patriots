// Validation Service
// Pure functions for validating user input - easily testable without DOM

import type { Question, Prediction } from '../types';

// ============ TYPES ============

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface PredictionValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  answeredCount: number;
  totalCount: number;
}

// ============ TEAM NAME VALIDATION ============

const TEAM_NAME_MIN_LENGTH = 3;
const TEAM_NAME_MAX_LENGTH = 15;

/**
 * Validate a team name.
 * Rules:
 * - Must be 3-15 characters
 * - After trimming whitespace
 */
export function validateTeamName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Team name is required' };
  }

  if (trimmed.length < TEAM_NAME_MIN_LENGTH) {
    return { valid: false, error: `Team name must be at least ${TEAM_NAME_MIN_LENGTH} characters` };
  }

  if (trimmed.length > TEAM_NAME_MAX_LENGTH) {
    return { valid: false, error: `Team name must be at most ${TEAM_NAME_MAX_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Check if a team name is unique within a league.
 * Comparison is case-insensitive.
 *
 * @param name - The team name to check
 * @param existingPredictions - Array of existing predictions in the league
 * @param excludeUserId - Optional user ID to exclude (for editing own name)
 */
export function isTeamNameUnique(
  name: string,
  existingPredictions: Pick<Prediction, 'teamName' | 'userId'>[],
  excludeUserId?: string
): boolean {
  const normalizedName = name.trim().toLowerCase();

  return !existingPredictions.some((p) => {
    // Skip the excluded user (for editing own team name)
    if (excludeUserId && p.userId === excludeUserId) {
      return false;
    }
    return p.teamName.toLowerCase() === normalizedName;
  });
}

/**
 * Full team name validation including uniqueness check.
 */
export function validateTeamNameFull(
  name: string,
  existingPredictions: Pick<Prediction, 'teamName' | 'userId'>[],
  excludeUserId?: string
): ValidationResult {
  // First check basic validation
  const basicResult = validateTeamName(name);
  if (!basicResult.valid) {
    return basicResult;
  }

  // Then check uniqueness
  if (!isTeamNameUnique(name, existingPredictions, excludeUserId)) {
    return { valid: false, error: 'This team name is already taken' };
  }

  return { valid: true };
}

// ============ LEAGUE NAME VALIDATION ============

const LEAGUE_NAME_MIN_LENGTH = 3;
const LEAGUE_NAME_MAX_LENGTH = 50;

/**
 * Validate a league name.
 */
export function validateLeagueName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'League name is required' };
  }

  if (trimmed.length < LEAGUE_NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `League name must be at least ${LEAGUE_NAME_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > LEAGUE_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `League name must be at most ${LEAGUE_NAME_MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Convert a league name to a URL-friendly slug.
 */
export function toLeagueSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// ============ PREDICTIONS VALIDATION ============

/**
 * Validate a single prediction answer.
 *
 * @param question - The question being answered
 * @param value - The user's answer (string from form)
 */
export function validateAnswer(
  question: Question,
  value: string | undefined | null
): ValidationResult {
  // Treat undefined, null, or empty string as unanswered
  if (value === undefined || value === null || value === '') {
    return { valid: false, error: 'This question is required' };
  }

  const trimmed = String(value).trim();

  if (!trimmed) {
    return { valid: false, error: 'This question is required' };
  }

  if (question.type === 'number') {
    const num = parseInt(trimmed, 10);
    if (isNaN(num)) {
      return { valid: false, error: 'Please enter a valid number' };
    }
    if (num < 0) {
      return { valid: false, error: 'Number cannot be negative' };
    }
    // For reasonable football scores, max out at 200
    if (num > 200) {
      return { valid: false, error: 'Please enter a reasonable number' };
    }
  }

  if (question.type === 'radio' && question.options) {
    // Convert value to slug format for comparison
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
    const validOptions = question.options.map((opt) => opt.toLowerCase().replace(/\s+/g, '-'));
    if (!validOptions.includes(slug)) {
      return { valid: false, error: 'Please select a valid option' };
    }
  }

  return { valid: true };
}

/**
 * Validate all predictions for a set of questions.
 * Returns detailed information about what's valid/invalid.
 */
export function validatePredictions(
  questions: Question[],
  predictions: Record<string, string | number | undefined>
): PredictionValidationResult {
  const errors: Record<string, string> = {};
  let answeredCount = 0;

  for (const question of questions) {
    const value = predictions[question.questionId];
    const result = validateAnswer(question, value as string);

    if (result.valid) {
      answeredCount++;
    } else if (result.error) {
      errors[question.questionId] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    answeredCount,
    totalCount: questions.length,
  };
}

/**
 * Check if all predictions are complete.
 */
export function arePredictionsComplete(
  questions: Question[],
  predictions: Record<string, string | number | undefined>
): boolean {
  const result = validatePredictions(questions, predictions);
  return result.valid && result.answeredCount === result.totalCount;
}

/**
 * Get completion percentage for predictions.
 */
export function getPredictionCompletion(
  questions: Question[],
  predictions: Record<string, string | number | undefined>
): number {
  if (questions.length === 0) return 100;

  const result = validatePredictions(questions, predictions);
  return Math.round((result.answeredCount / result.totalCount) * 100);
}

// ============ FORM DATA PARSING ============

/**
 * Parse prediction values from a FormData object.
 * Converts form field values to the format expected by the database.
 */
export function parsePredictionsFromForm(
  formData: FormData,
  questions: Question[]
): Record<string, string | number> {
  const predictions: Record<string, string | number> = {};

  for (const question of questions) {
    const rawValue = formData.get(`prediction-${question.questionId}`);

    if (rawValue === null || rawValue === '') {
      continue;
    }

    const value = String(rawValue).trim();

    if (question.type === 'number') {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        predictions[question.questionId] = num;
      }
    } else {
      // Radio values are stored as lowercase slugs
      predictions[question.questionId] = value.toLowerCase().replace(/\s+/g, '-');
    }
  }

  return predictions;
}

/**
 * Parse results values from a FormData object.
 * Similar to predictions but uses result- prefix.
 */
export function parseResultsFromForm(
  formData: FormData,
  questions: Question[]
): Record<string, string | number> {
  const results: Record<string, string | number> = {};

  for (const question of questions) {
    const rawValue = formData.get(`result-${question.questionId}`);

    if (rawValue === null || rawValue === '') {
      continue;
    }

    const value = String(rawValue).trim();

    if (question.type === 'number') {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        results[question.questionId] = num;
      }
    } else {
      results[question.questionId] = value.toLowerCase().replace(/\s+/g, '-');
    }
  }

  return results;
}
