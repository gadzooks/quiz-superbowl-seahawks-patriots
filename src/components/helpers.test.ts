import { describe, it, expect, beforeEach } from 'vitest';

import type { Question, Prediction } from '../types';

import {
  countAnsweredQuestions,
  formatSlugForDisplay,
  isAnswerCorrect,
  getCompletionPercentage,
  sortPredictionsForLeaderboard,
  sortPredictionsForParticipants,
  escapeHtml,
  escapeForJs,
} from './helpers';

describe('components/helpers', () => {
  describe('countAnsweredQuestions', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        questionId: 'q1',
        label: 'Question 1',
        type: 'radio',
        points: 10,
        options: ['A', 'B'],
        sortOrder: 0,
        isTiebreaker: false,
      },
      {
        id: 'q2',
        questionId: 'q2',
        label: 'Question 2',
        type: 'number',
        points: 5,
        sortOrder: 1,
        isTiebreaker: false,
      },
      {
        id: 'q3',
        questionId: 'q3',
        label: 'Question 3',
        type: 'radio',
        points: 10,
        options: ['X', 'Y'],
        sortOrder: 2,
        isTiebreaker: false,
      },
    ];

    it('should count answered questions correctly', () => {
      const predictions = { q1: 'a', q2: 42, q3: 'x' };
      expect(countAnsweredQuestions(predictions, questions)).toBe(3);
    });

    it('should not count empty string answers', () => {
      const predictions = { q1: 'a', q2: '', q3: 'x' };
      expect(countAnsweredQuestions(predictions, questions)).toBe(2);
    });

    it('should not count null or undefined answers', () => {
      const predictions: Record<string, string | number> = { q1: 'a' };
      expect(countAnsweredQuestions(predictions, questions)).toBe(1);
    });

    it('should return 0 for undefined predictions', () => {
      expect(countAnsweredQuestions(undefined, questions)).toBe(0);
    });

    it('should return 0 for null predictions', () => {
      expect(countAnsweredQuestions(null, questions)).toBe(0);
    });

    it('should return 0 for empty predictions object', () => {
      expect(countAnsweredQuestions({}, questions)).toBe(0);
    });

    it('should count zero as a valid answer', () => {
      const predictions = { q1: 'a', q2: 0, q3: 'x' };
      expect(countAnsweredQuestions(predictions, questions)).toBe(3);
    });
  });

  describe('formatSlugForDisplay', () => {
    it('should format simple slug correctly', () => {
      expect(formatSlugForDisplay('seahawks')).toBe('Seahawks');
    });

    it('should format multi-word slug correctly', () => {
      expect(formatSlugForDisplay('new-england-patriots')).toBe('New England Patriots');
    });

    it('should keep number ranges as is', () => {
      expect(formatSlugForDisplay('8-14')).toBe('8-14');
      expect(formatSlugForDisplay('10-20')).toBe('10-20');
    });

    it('should return dash for empty string', () => {
      expect(formatSlugForDisplay('')).toBe('-');
    });

    it('should capitalize first letter of each word', () => {
      expect(formatSlugForDisplay('super-bowl-champions')).toBe('Super Bowl Champions');
    });

    it('should handle single character words', () => {
      expect(formatSlugForDisplay('a-b-c')).toBe('A B C');
    });
  });

  describe('isAnswerCorrect', () => {
    it('should return true for correct radio answer', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        options: ['A', 'B'],
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, 'a', 'a')).toBe(true);
    });

    it('should return false for incorrect radio answer', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        options: ['A', 'B'],
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, 'a', 'b')).toBe(false);
    });

    it('should return true for correct number answer', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'number',
        points: 10,
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, 42, 42)).toBe(true);
      expect(isAnswerCorrect(question, '42', 42)).toBe(true);
      expect(isAnswerCorrect(question, 42, '42')).toBe(true);
    });

    it('should return false for incorrect number answer', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'number',
        points: 10,
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, 42, 24)).toBe(false);
    });

    it('should return false for undefined user answer', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, undefined, 'a')).toBe(false);
    });

    it('should return false for undefined correct answer', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, 'a', undefined)).toBe(false);
    });

    it('should return false for empty string answers', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, '', 'a')).toBe(false);
      expect(isAnswerCorrect(question, 'a', '')).toBe(false);
    });

    it('should return false for null answers', () => {
      const question: Question = {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        sortOrder: 0,
        isTiebreaker: false,
      };
      expect(isAnswerCorrect(question, null as unknown as string, 'a')).toBe(false);
      expect(isAnswerCorrect(question, 'a', null as unknown as string)).toBe(false);
    });
  });

  describe('getCompletionPercentage', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        options: ['A', 'B'],
        sortOrder: 0,
        isTiebreaker: false,
      },
      {
        id: 'q2',
        questionId: 'q2',
        label: 'Q2',
        type: 'number',
        points: 5,
        sortOrder: 1,
        isTiebreaker: false,
      },
      {
        id: 'q3',
        questionId: 'q3',
        label: 'Q3',
        type: 'radio',
        points: 10,
        options: ['X', 'Y'],
        sortOrder: 2,
        isTiebreaker: false,
      },
      {
        id: 'q4',
        questionId: 'q4',
        label: 'Q4',
        type: 'number',
        points: 5,
        sortOrder: 3,
        isTiebreaker: false,
      },
    ];

    it('should return 100% for all answered', () => {
      const predictions = { q1: 'a', q2: 42, q3: 'x', q4: 10 };
      expect(getCompletionPercentage(predictions, questions)).toBe(100);
    });

    it('should return 50% for half answered', () => {
      const predictions = { q1: 'a', q2: 42 };
      expect(getCompletionPercentage(predictions, questions)).toBe(50);
    });

    it('should return 0% for none answered', () => {
      expect(getCompletionPercentage({}, questions)).toBe(0);
      expect(getCompletionPercentage(null, questions)).toBe(0);
      expect(getCompletionPercentage(undefined, questions)).toBe(0);
    });

    it('should return 100% for empty questions array', () => {
      expect(getCompletionPercentage({ q1: 'a' }, [])).toBe(100);
    });

    it('should round percentage correctly', () => {
      const threeQuestions = questions.slice(0, 3);
      const predictions = { q1: 'a' };
      // 1/3 = 33.333... should round to 33
      expect(getCompletionPercentage(predictions, threeQuestions)).toBe(33);
    });
  });

  describe('sortPredictionsForLeaderboard', () => {
    const basePredictions: Prediction[] = [
      {
        id: 'p1',
        userId: 'u1',
        teamName: 'Team A',
        predictions: {},
        score: 50,
        tiebreakDiff: 10,
        isManager: false,
        submittedAt: Date.now(),
      },
      {
        id: 'p2',
        userId: 'u2',
        teamName: 'Team B',
        predictions: {},
        score: 70,
        tiebreakDiff: 5,
        isManager: false,
        submittedAt: Date.now(),
      },
      {
        id: 'p3',
        userId: 'u3',
        teamName: 'Team C',
        predictions: {},
        score: 70,
        tiebreakDiff: 3,
        isManager: false,
        submittedAt: Date.now(),
      },
    ];

    it('should sort by score descending', () => {
      const sorted = sortPredictionsForLeaderboard(basePredictions);
      expect(sorted[0].teamName).toBe('Team C');
      expect(sorted[1].teamName).toBe('Team B');
      expect(sorted[2].teamName).toBe('Team A');
    });

    it('should use tiebreak diff for same scores', () => {
      const predictions = [
        { ...basePredictions[1], score: 70, tiebreakDiff: 5 },
        { ...basePredictions[2], score: 70, tiebreakDiff: 3 },
      ];
      const sorted = sortPredictionsForLeaderboard(predictions);
      expect(sorted[0].tiebreakDiff).toBe(3);
      expect(sorted[1].tiebreakDiff).toBe(5);
    });

    it('should use team name alphabetically for same score and tiebreak', () => {
      const predictions = [
        { ...basePredictions[0], teamName: 'Zebras', score: 70, tiebreakDiff: 5 },
        { ...basePredictions[1], teamName: 'Aardvarks', score: 70, tiebreakDiff: 5 },
      ];
      const sorted = sortPredictionsForLeaderboard(predictions);
      expect(sorted[0].teamName).toBe('Aardvarks');
      expect(sorted[1].teamName).toBe('Zebras');
    });

    it('should not mutate original array', () => {
      const original = [...basePredictions];
      sortPredictionsForLeaderboard(basePredictions);
      expect(basePredictions).toEqual(original);
    });
  });

  describe('sortPredictionsForParticipants', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        questionId: 'q1',
        label: 'Q1',
        type: 'radio',
        points: 10,
        options: ['A', 'B'],
        sortOrder: 0,
        isTiebreaker: false,
      },
      {
        id: 'q2',
        questionId: 'q2',
        label: 'Q2',
        type: 'number',
        points: 5,
        sortOrder: 1,
        isTiebreaker: false,
      },
    ];

    const predictions: Prediction[] = [
      {
        id: 'p1',
        userId: 'u1',
        teamName: 'Team Z',
        predictions: { q1: 'a' },
        score: 0,
        tiebreakDiff: 0,
        isManager: false,
        submittedAt: Date.now(),
      },
      {
        id: 'p2',
        userId: 'u2',
        teamName: 'Team A',
        predictions: { q1: 'a', q2: 42 },
        score: 0,
        tiebreakDiff: 0,
        isManager: false,
        submittedAt: Date.now(),
      },
      {
        id: 'p3',
        userId: 'u3',
        teamName: 'Team B',
        predictions: { q1: 'a', q2: 42 },
        score: 0,
        tiebreakDiff: 0,
        isManager: false,
        submittedAt: Date.now(),
      },
    ];

    it('should sort by answered count descending', () => {
      const sorted = sortPredictionsForParticipants(predictions, questions);
      expect(sorted[0].teamName).toBe('Team A');
      expect(sorted[1].teamName).toBe('Team B');
      expect(sorted[2].teamName).toBe('Team Z');
    });

    it('should use team name alphabetically for same answered count', () => {
      const sorted = sortPredictionsForParticipants(predictions, questions);
      const topTwo = sorted.slice(0, 2);
      expect(topTwo[0].teamName).toBe('Team A');
      expect(topTwo[1].teamName).toBe('Team B');
    });

    it('should not mutate original array', () => {
      const original = [...predictions];
      sortPredictionsForParticipants(predictions, questions);
      expect(predictions).toEqual(original);
    });

    it('should handle empty predictions', () => {
      const sorted = sortPredictionsForParticipants([], questions);
      expect(sorted).toEqual([]);
    });
  });

  describe('escapeHtml', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should escape HTML tags', () => {
      const result = escapeHtml('<script>alert("xss")</script>');
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should escape quotes', () => {
      const result = escapeHtml('Hello "world"');
      expect(result).toBe('Hello "world"');
    });

    it('should escape ampersands', () => {
      const result = escapeHtml('Tom & Jerry');
      expect(result).toBe('Tom &amp; Jerry');
    });

    it('should handle empty string', () => {
      const result = escapeHtml('');
      expect(result).toBe('');
    });

    it('should handle plain text', () => {
      const result = escapeHtml('Hello World');
      expect(result).toBe('Hello World');
    });

    it('should escape multiple special characters', () => {
      const result = escapeHtml('<div>"Test" & <span>\'more\'</span></div>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });
  });

  describe('escapeForJs', () => {
    it('should escape single quotes', () => {
      const result = escapeForJs("It's working");
      expect(result).toBe("It\\'s working");
    });

    it('should escape double quotes', () => {
      const result = escapeForJs('He said "hello"');
      expect(result).toBe('He said \\"hello\\"');
    });

    it('should escape both single and double quotes', () => {
      const result = escapeForJs(`It's a "test"`);
      expect(result).toBe(`It\\'s a \\"test\\"`);
    });

    it('should handle empty string', () => {
      const result = escapeForJs('');
      expect(result).toBe('');
    });

    it('should handle plain text', () => {
      const result = escapeForJs('Hello World');
      expect(result).toBe('Hello World');
    });

    it('should handle multiple quotes', () => {
      const result = escapeForJs(`"'test'" and "'more'"`);
      expect(result).toContain('\\');
    });
  });
});
