import { describe, it, expect } from 'vitest';

import { createQuestions, getMaxScore, getTiebreakerQuestion } from './questions';
import type { Question } from './types';

describe('questions', () => {
  describe('createQuestions', () => {
    it('should create questions with provided team names', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include team names in winner question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const winnerQuestion = result.find((q) => q.questionId === 'winner');

      expect(winnerQuestion).toBeDefined();
      expect(winnerQuestion!.options).toEqual(['Chiefs', 'Eagles']);
    });

    it('should include team names in halftime leader question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const halftimeQuestion = result.find((q) => q.questionId === 'firstHalfLeader');

      expect(halftimeQuestion).toBeDefined();
      expect(halftimeQuestion!.options).toContain('Chiefs');
      expect(halftimeQuestion!.options).toContain('Eagles');
      expect(halftimeQuestion!.options).toContain('Tied');
    });

    it('should include tiebreaker question with 0 points', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const tiebreaker = result.find((q) => q.questionId === 'totalPoints');

      expect(tiebreaker).toBeDefined();
      expect(tiebreaker!.points).toBe(0);
      expect(tiebreaker!.type).toBe('number');
      expect(tiebreaker!.isTiebreaker).toBe(true);
    });

    it('should have unique question IDs', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const ids = result.map((q) => q.questionId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties for each question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);

      result.forEach((q) => {
        expect(q).toHaveProperty('questionId');
        expect(q).toHaveProperty('label');
        expect(q).toHaveProperty('type');
        expect(q).toHaveProperty('points');
        expect(q).toHaveProperty('sortOrder');
        expect(q).toHaveProperty('isTiebreaker');
        expect(typeof q.questionId).toBe('string');
        expect(typeof q.label).toBe('string');
        expect(['radio', 'number']).toContain(q.type);
        expect(typeof q.points).toBe('number');
        expect(typeof q.sortOrder).toBe('number');
        expect(typeof q.isTiebreaker).toBe('boolean');
      });
    });

    it('should have options for radio questions', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const radioQuestions = result.filter((q) => q.type === 'radio');

      radioQuestions.forEach((q) => {
        expect(q.options).toBeDefined();
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options!.length).toBeGreaterThan(0);
      });
    });

    it('should have sequential sortOrder values', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);

      result.forEach((q, index) => {
        expect(q.sortOrder).toBe(index);
      });
    });
  });

  describe('getMaxScore', () => {
    it('should calculate max score excluding tiebreaker', () => {
      const testQuestions: Question[] = [
        {
          id: '1',
          questionId: 'q1',
          label: 'Q1',
          type: 'radio',
          options: ['A', 'B'],
          points: 5,
          sortOrder: 0,
          isTiebreaker: false,
        },
        {
          id: '2',
          questionId: 'q2',
          label: 'Q2',
          type: 'radio',
          options: ['A', 'B'],
          points: 10,
          sortOrder: 1,
          isTiebreaker: false,
        },
        {
          id: '3',
          questionId: 'totalPoints',
          label: 'Tiebreaker',
          type: 'number',
          points: 0,
          sortOrder: 2,
          isTiebreaker: true,
        },
        {
          id: '4',
          questionId: 'q3',
          label: 'Q3',
          type: 'number',
          points: 5,
          sortOrder: 3,
          isTiebreaker: false,
        },
      ];

      const maxScore = getMaxScore(testQuestions);

      expect(maxScore).toBe(20); // 5 + 10 + 5, excluding tiebreaker
    });

    it('should return 0 for empty questions array', () => {
      const maxScore = getMaxScore([]);

      expect(maxScore).toBe(0);
    });

    it('should handle questions without tiebreaker', () => {
      const testQuestions: Question[] = [
        {
          id: '1',
          questionId: 'q1',
          label: 'Q1',
          type: 'radio',
          options: ['A', 'B'],
          points: 5,
          sortOrder: 0,
          isTiebreaker: false,
        },
        {
          id: '2',
          questionId: 'q2',
          label: 'Q2',
          type: 'radio',
          options: ['A', 'B'],
          points: 5,
          sortOrder: 1,
          isTiebreaker: false,
        },
      ];

      const maxScore = getMaxScore(testQuestions);

      expect(maxScore).toBe(10);
    });
  });

  describe('getTiebreakerQuestion', () => {
    it('should return tiebreaker question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const qs = createQuestions(teams);

      // Convert to Question type for getTiebreakerQuestion
      const questions: Question[] = qs.map((q, i) => ({
        id: String(i),
        ...q,
        type: q.type as 'radio' | 'number',
      }));

      const tiebreaker = getTiebreakerQuestion(questions);

      expect(tiebreaker).toBeDefined();
      expect(tiebreaker!.questionId).toBe('totalPoints');
      expect(tiebreaker!.points).toBe(0);
      expect(tiebreaker!.isTiebreaker).toBe(true);
    });

    it('should return undefined if no tiebreaker exists', () => {
      const testQuestions: Question[] = [
        {
          id: '1',
          questionId: 'q1',
          label: 'Q1',
          type: 'radio',
          options: ['A', 'B'],
          points: 5,
          sortOrder: 0,
          isTiebreaker: false,
        },
      ];

      const tiebreaker = getTiebreakerQuestion(testQuestions);

      expect(tiebreaker).toBeUndefined();
    });
  });
});
