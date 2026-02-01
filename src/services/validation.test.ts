import { describe, it, expect } from 'vitest';
import {
  validateTeamName,
  isTeamNameUnique,
  validateTeamNameFull,
  validateLeagueName,
  toLeagueSlug,
  validateAnswer,
  validatePredictions,
  arePredictionsComplete,
  getPredictionCompletion,
  parsePredictionsFromForm,
} from './validation';
import type { Question, Prediction } from '../types';

// ============ TEAM NAME VALIDATION ============

describe('validateTeamName', () => {
  it('accepts valid team name', () => {
    expect(validateTeamName('Hawks')).toEqual({ valid: true });
  });

  it('accepts team name at minimum length', () => {
    expect(validateTeamName('ABC')).toEqual({ valid: true });
  });

  it('accepts team name at maximum length', () => {
    expect(validateTeamName('A'.repeat(15))).toEqual({ valid: true });
  });

  it('rejects empty string', () => {
    const result = validateTeamName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Team name is required');
  });

  it('rejects whitespace-only string', () => {
    const result = validateTeamName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Team name is required');
  });

  it('rejects name shorter than minimum', () => {
    const result = validateTeamName('AB');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3 characters');
  });

  it('rejects name longer than maximum', () => {
    const result = validateTeamName('A'.repeat(16));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at most 15 characters');
  });

  it('trims whitespace before validation', () => {
    expect(validateTeamName('  Hawks  ')).toEqual({ valid: true });
  });
});

describe('isTeamNameUnique', () => {
  const existingPredictions: Pick<Prediction, 'teamName' | 'userId'>[] = [
    { teamName: 'Hawks', userId: 'user-1' },
    { teamName: 'Patriots', userId: 'user-2' },
  ];

  it('returns true for unique name', () => {
    expect(isTeamNameUnique('Eagles', existingPredictions)).toBe(true);
  });

  it('returns false for duplicate name', () => {
    expect(isTeamNameUnique('Hawks', existingPredictions)).toBe(false);
  });

  it('checks case-insensitively', () => {
    expect(isTeamNameUnique('HAWKS', existingPredictions)).toBe(false);
    expect(isTeamNameUnique('hawks', existingPredictions)).toBe(false);
    expect(isTeamNameUnique('HaWkS', existingPredictions)).toBe(false);
  });

  it('trims whitespace before comparison', () => {
    expect(isTeamNameUnique('  Hawks  ', existingPredictions)).toBe(false);
  });

  it('excludes specified user from check', () => {
    expect(isTeamNameUnique('Hawks', existingPredictions, 'user-1')).toBe(true);
  });

  it('still checks other users when excluding one', () => {
    expect(isTeamNameUnique('Patriots', existingPredictions, 'user-1')).toBe(false);
  });

  it('returns true for empty predictions array', () => {
    expect(isTeamNameUnique('Hawks', [])).toBe(true);
  });
});

describe('validateTeamNameFull', () => {
  const existingPredictions: Pick<Prediction, 'teamName' | 'userId'>[] = [
    { teamName: 'Hawks', userId: 'user-1' },
  ];

  it('validates basic rules first', () => {
    const result = validateTeamNameFull('AB', existingPredictions);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3');
  });

  it('checks uniqueness after basic validation', () => {
    const result = validateTeamNameFull('Hawks', existingPredictions);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('This team name is already taken');
  });

  it('returns valid for unique and valid name', () => {
    expect(validateTeamNameFull('Eagles', existingPredictions)).toEqual({ valid: true });
  });
});

// ============ LEAGUE NAME VALIDATION ============

describe('validateLeagueName', () => {
  it('accepts valid league name', () => {
    expect(validateLeagueName('My League')).toEqual({ valid: true });
  });

  it('rejects empty string', () => {
    const result = validateLeagueName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('League name is required');
  });

  it('rejects name shorter than 3 chars', () => {
    const result = validateLeagueName('AB');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3');
  });

  it('rejects name longer than 50 chars', () => {
    const result = validateLeagueName('A'.repeat(51));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at most 50');
  });
});

describe('toLeagueSlug', () => {
  it('converts to lowercase', () => {
    expect(toLeagueSlug('My League')).toBe('my-league');
  });

  it('replaces spaces with dashes', () => {
    expect(toLeagueSlug('Super Bowl Party')).toBe('super-bowl-party');
  });

  it('replaces multiple spaces with single dash', () => {
    expect(toLeagueSlug('My    League')).toBe('my-league');
  });

  it('removes special characters', () => {
    expect(toLeagueSlug("Bob's League!")).toBe('bob-s-league');
  });

  it('trims whitespace', () => {
    expect(toLeagueSlug('  My League  ')).toBe('my-league');
  });

  it('removes leading and trailing dashes', () => {
    expect(toLeagueSlug('--My League--')).toBe('my-league');
  });
});

// ============ PREDICTIONS VALIDATION ============

const sampleQuestions: Question[] = [
  { id: 'winner', label: 'Who wins?', type: 'radio', options: ['Seahawks', 'Patriots'], points: 5 },
  { id: 'totalTDs', label: 'Total TDs?', type: 'number', points: 5 },
  { id: 'overtime', label: 'Overtime?', type: 'radio', options: ['Yes', 'No'], points: 5 },
];

describe('validateAnswer', () => {
  const radioQuestion: Question = { id: 'winner', label: 'Who wins?', type: 'radio', options: ['Seahawks', 'Patriots'], points: 5 };
  const numberQuestion: Question = { id: 'totalTDs', label: 'Total TDs?', type: 'number', points: 5 };

  it('rejects undefined value', () => {
    const result = validateAnswer(radioQuestion, undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('This question is required');
  });

  it('rejects null value', () => {
    const result = validateAnswer(radioQuestion, null);
    expect(result.valid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = validateAnswer(radioQuestion, '');
    expect(result.valid).toBe(false);
  });

  it('accepts valid radio answer', () => {
    expect(validateAnswer(radioQuestion, 'seahawks')).toEqual({ valid: true });
  });

  it('accepts radio answer with different case', () => {
    expect(validateAnswer(radioQuestion, 'SEAHAWKS')).toEqual({ valid: true });
  });

  it('accepts radio answer with spaces converted to dashes', () => {
    const q: Question = { id: 'margin', label: 'Margin?', type: 'radio', options: ['1-7', '8-14'], points: 5 };
    expect(validateAnswer(q, '1-7')).toEqual({ valid: true });
  });

  it('rejects invalid radio option', () => {
    const result = validateAnswer(radioQuestion, 'eagles');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please select a valid option');
  });

  it('accepts valid number answer', () => {
    expect(validateAnswer(numberQuestion, '5')).toEqual({ valid: true });
  });

  it('accepts zero as valid number', () => {
    expect(validateAnswer(numberQuestion, '0')).toEqual({ valid: true });
  });

  it('rejects negative number', () => {
    const result = validateAnswer(numberQuestion, '-5');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Number cannot be negative');
  });

  it('rejects non-numeric string for number question', () => {
    const result = validateAnswer(numberQuestion, 'five');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });

  it('rejects unreasonably large numbers', () => {
    const result = validateAnswer(numberQuestion, '999');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('reasonable number');
  });
});

describe('validatePredictions', () => {
  it('returns valid when all questions answered correctly', () => {
    const predictions = {
      winner: 'seahawks',
      totalTDs: '5',
      overtime: 'yes',
    };
    const result = validatePredictions(sampleQuestions, predictions);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.answeredCount).toBe(3);
    expect(result.totalCount).toBe(3);
  });

  it('returns invalid when some questions unanswered', () => {
    const predictions = {
      winner: 'seahawks',
    };
    const result = validatePredictions(sampleQuestions, predictions);
    expect(result.valid).toBe(false);
    expect(result.answeredCount).toBe(1);
    expect(Object.keys(result.errors)).toContain('totalTDs');
    expect(Object.keys(result.errors)).toContain('overtime');
  });

  it('returns error messages for invalid answers', () => {
    const predictions = {
      winner: 'eagles', // invalid option
      totalTDs: 'five', // not a number
      overtime: 'yes',
    };
    const result = validatePredictions(sampleQuestions, predictions);
    expect(result.valid).toBe(false);
    expect(result.errors['winner']).toBe('Please select a valid option');
    expect(result.errors['totalTDs']).toBe('Please enter a valid number');
  });
});

describe('arePredictionsComplete', () => {
  it('returns true when all questions valid', () => {
    const predictions = {
      winner: 'seahawks',
      totalTDs: 5,
      overtime: 'yes',
    };
    expect(arePredictionsComplete(sampleQuestions, predictions)).toBe(true);
  });

  it('returns false when questions missing', () => {
    const predictions = {
      winner: 'seahawks',
    };
    expect(arePredictionsComplete(sampleQuestions, predictions)).toBe(false);
  });

  it('returns false when answer is invalid', () => {
    const predictions = {
      winner: 'eagles',
      totalTDs: 5,
      overtime: 'yes',
    };
    expect(arePredictionsComplete(sampleQuestions, predictions)).toBe(false);
  });
});

describe('getPredictionCompletion', () => {
  it('returns 100 for all complete', () => {
    const predictions = {
      winner: 'seahawks',
      totalTDs: 5,
      overtime: 'yes',
    };
    expect(getPredictionCompletion(sampleQuestions, predictions)).toBe(100);
  });

  it('returns 0 for none complete', () => {
    expect(getPredictionCompletion(sampleQuestions, {})).toBe(0);
  });

  it('returns 33 for 1 of 3 complete', () => {
    const predictions = { winner: 'seahawks' };
    expect(getPredictionCompletion(sampleQuestions, predictions)).toBe(33);
  });

  it('returns 67 for 2 of 3 complete', () => {
    const predictions = { winner: 'seahawks', totalTDs: 5 };
    expect(getPredictionCompletion(sampleQuestions, predictions)).toBe(67);
  });

  it('returns 100 for empty questions array', () => {
    expect(getPredictionCompletion([], {})).toBe(100);
  });
});

// ============ FORM DATA PARSING ============

describe('parsePredictionsFromForm', () => {
  it('parses radio values as lowercase slugs', () => {
    const formData = new FormData();
    formData.set('prediction-winner', 'Seahawks');

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.winner).toBe('seahawks');
  });

  it('parses number values as integers', () => {
    const formData = new FormData();
    formData.set('prediction-totalTDs', '5');

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.totalTDs).toBe(5);
  });

  it('skips empty values', () => {
    const formData = new FormData();
    formData.set('prediction-winner', 'Seahawks');
    formData.set('prediction-totalTDs', '');

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.winner).toBe('seahawks');
    expect(result.totalTDs).toBeUndefined();
  });

  it('skips missing values', () => {
    const formData = new FormData();
    formData.set('prediction-winner', 'Seahawks');
    // totalTDs not set

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.winner).toBe('seahawks');
    expect(result.totalTDs).toBeUndefined();
  });

  it('converts radio option spaces to dashes', () => {
    const formData = new FormData();
    formData.set('prediction-winner', 'Team One');

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.winner).toBe('team-one');
  });

  it('trims whitespace from values', () => {
    const formData = new FormData();
    formData.set('prediction-winner', '  Seahawks  ');
    formData.set('prediction-totalTDs', '  5  ');

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.winner).toBe('seahawks');
    expect(result.totalTDs).toBe(5);
  });

  it('ignores NaN values for number fields', () => {
    const formData = new FormData();
    formData.set('prediction-totalTDs', 'not a number');

    const result = parsePredictionsFromForm(formData, sampleQuestions);
    expect(result.totalTDs).toBeUndefined();
  });
});
