import { describe, it, expect } from 'vitest';
import { calculateScore, calculateScoreWithDebug, calculateTiebreakDiff } from './calculate';

describe('calculateScore', () => {
  it('returns 0 for null predictions', () => {
    expect(calculateScore(null, { winner: 'seahawks' })).toBe(0);
  });

  it('returns 0 for null results', () => {
    expect(calculateScore({ winner: 'seahawks' }, null)).toBe(0);
  });

  it('returns 0 for undefined predictions', () => {
    expect(calculateScore(undefined, { winner: 'seahawks' })).toBe(0);
  });

  it('awards points for correct radio answer', () => {
    const predictions = { winner: 'seahawks' };
    const results = { winner: 'seahawks' };
    expect(calculateScore(predictions, results)).toBe(5);
  });

  it('awards no points for incorrect radio answer', () => {
    const predictions = { winner: 'seahawks' };
    const results = { winner: 'patriots' };
    expect(calculateScore(predictions, results)).toBe(0);
  });

  it('awards points for correct number answer', () => {
    const predictions = { totalTDs: 5 };
    const results = { totalTDs: 5 };
    expect(calculateScore(predictions, results)).toBe(5);
  });

  it('awards no points for incorrect number answer', () => {
    const predictions = { totalTDs: 5 };
    const results = { totalTDs: 6 };
    expect(calculateScore(predictions, results)).toBe(0);
  });

  it('handles string numbers correctly', () => {
    const predictions = { totalTDs: '5' };
    const results = { totalTDs: 5 };
    expect(calculateScore(predictions, results)).toBe(5);
  });

  it('skips questions with empty predictions', () => {
    const predictions = { winner: '' };
    const results = { winner: 'seahawks' };
    expect(calculateScore(predictions, results)).toBe(0);
  });

  it('skips questions with empty results', () => {
    const predictions = { winner: 'seahawks' };
    const results = { winner: '' };
    expect(calculateScore(predictions, results)).toBe(0);
  });

  it('calculates correct total score for multiple questions', () => {
    const predictions = {
      winner: 'seahawks',
      totalTDs: 4,
      overtime: 'no',
      winningMargin: '8-14',
      totalFieldGoals: 3,
      firstHalfLeader: 'seahawks',
    };
    const results = {
      winner: 'seahawks',    // correct: +5
      totalTDs: 4,           // correct: +5
      overtime: 'yes',       // wrong: 0
      winningMargin: '8-14', // correct: +5
      totalFieldGoals: 2,    // wrong: 0
      firstHalfLeader: 'tied', // wrong: 0
    };
    expect(calculateScore(predictions, results)).toBe(15);
  });

  it('ignores tiebreaker question (totalPoints)', () => {
    const predictions = { totalPoints: 45 };
    const results = { totalPoints: 45 };
    // tiebreaker has 0 points
    expect(calculateScore(predictions, results)).toBe(0);
  });

  it('returns max score (30) when all answers correct', () => {
    const predictions = {
      winner: 'seahawks',
      totalTDs: 4,
      overtime: 'no',
      winningMargin: '8-14',
      totalFieldGoals: 3,
      firstHalfLeader: 'seahawks',
    };
    const results = { ...predictions };
    expect(calculateScore(predictions, results)).toBe(30);
  });
});

describe('calculateScoreWithDebug', () => {
  it('returns debug info for each question', () => {
    const predictions = { winner: 'seahawks', totalTDs: 5 };
    const results = { winner: 'seahawks', totalTDs: 4 };
    const result = calculateScoreWithDebug(predictions, results);

    expect(result.score).toBe(5);
    expect(result.debug.length).toBeGreaterThan(0);
    expect(result.debug.some(d => d.includes('✓'))).toBe(true);
    expect(result.debug.some(d => d.includes('✗'))).toBe(true);
  });

  it('includes debug for missing predictions', () => {
    const predictions = {};
    const results = { winner: 'seahawks' };
    const result = calculateScoreWithDebug(predictions, results);

    expect(result.debug.some(d => d.includes('no prediction'))).toBe(true);
  });
});

describe('calculateTiebreakDiff', () => {
  it('returns Infinity for null predictions', () => {
    expect(calculateTiebreakDiff(null, { totalPoints: 45 })).toBe(Infinity);
  });

  it('returns Infinity for null results', () => {
    expect(calculateTiebreakDiff({ totalPoints: 45 }, null)).toBe(Infinity);
  });

  it('returns 0 for exact match', () => {
    expect(calculateTiebreakDiff({ totalPoints: 45 }, { totalPoints: 45 })).toBe(0);
  });

  it('returns absolute difference', () => {
    expect(calculateTiebreakDiff({ totalPoints: 40 }, { totalPoints: 45 })).toBe(5);
    expect(calculateTiebreakDiff({ totalPoints: 50 }, { totalPoints: 45 })).toBe(5);
  });

  it('handles string numbers', () => {
    expect(calculateTiebreakDiff({ totalPoints: '45' }, { totalPoints: 45 })).toBe(0);
  });

  it('returns Infinity for missing tiebreaker prediction', () => {
    expect(calculateTiebreakDiff({}, { totalPoints: 45 })).toBe(Infinity);
  });

  it('returns Infinity for empty tiebreaker prediction', () => {
    expect(calculateTiebreakDiff({ totalPoints: '' }, { totalPoints: 45 })).toBe(Infinity);
  });
});
