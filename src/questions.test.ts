import { describe, it, expect } from 'vitest';

import { getGameConfig } from './config/games';
import {
  createQuestions,
  getQuestionsForGame,
  getMaxScore,
  getTiebreakerQuestion,
  questions,
} from './questions';
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
      const winnerQuestion = result.find((q) => q.id === 'winner');

      expect(winnerQuestion).toBeDefined();
      expect(winnerQuestion!.options).toEqual(['Chiefs', 'Eagles']);
    });

    it('should include team names in halftime leader question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const halftimeQuestion = result.find((q) => q.id === 'firstHalfLeader');

      expect(halftimeQuestion).toBeDefined();
      expect(halftimeQuestion!.options).toContain('Chiefs');
      expect(halftimeQuestion!.options).toContain('Eagles');
      expect(halftimeQuestion!.options).toContain('Tied');
    });

    it('should include tiebreaker question with 0 points', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const tiebreaker = result.find((q) => q.id === 'totalPoints');

      expect(tiebreaker).toBeDefined();
      expect(tiebreaker!.points).toBe(0);
      expect(tiebreaker!.type).toBe('number');
    });

    it('should have unique question IDs', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);
      const ids = result.map((q) => q.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties for each question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const result = createQuestions(teams);

      result.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('label');
        expect(q).toHaveProperty('type');
        expect(q).toHaveProperty('points');
        expect(typeof q.id).toBe('string');
        expect(typeof q.label).toBe('string');
        expect(['radio', 'number']).toContain(q.type);
        expect(typeof q.points).toBe('number');
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
  });

  describe('getQuestionsForGame', () => {
    it('should return questions for a valid game config', () => {
      const config = getGameConfig('lx');
      expect(config).toBeDefined();

      const result = getQuestionsForGame(config!);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use teams from game config', () => {
      const config = getGameConfig('lx');
      const result = getQuestionsForGame(config!);
      const winnerQuestion = result.find((q) => q.id === 'winner');

      expect(winnerQuestion!.options).toEqual(['Seahawks', 'Patriots']);
    });
  });

  describe('getMaxScore', () => {
    it('should calculate max score excluding tiebreaker', () => {
      const testQuestions: Question[] = [
        { id: 'q1', label: 'Q1', type: 'radio', options: ['A', 'B'], points: 5 },
        { id: 'q2', label: 'Q2', type: 'radio', options: ['A', 'B'], points: 10 },
        { id: 'totalPoints', label: 'Tiebreaker', type: 'number', points: 0 },
        { id: 'q3', label: 'Q3', type: 'number', points: 5 },
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
        { id: 'q1', label: 'Q1', type: 'radio', options: ['A', 'B'], points: 5 },
        { id: 'q2', label: 'Q2', type: 'radio', options: ['A', 'B'], points: 5 },
      ];

      const maxScore = getMaxScore(testQuestions);

      expect(maxScore).toBe(10);
    });
  });

  describe('getTiebreakerQuestion', () => {
    it('should return tiebreaker question', () => {
      const teams: [string, string] = ['Chiefs', 'Eagles'];
      const qs = createQuestions(teams);

      const tiebreaker = getTiebreakerQuestion(qs);

      expect(tiebreaker).toBeDefined();
      expect(tiebreaker!.id).toBe('totalPoints');
      expect(tiebreaker!.points).toBe(0);
    });

    it('should return undefined if no tiebreaker exists', () => {
      const testQuestions: Question[] = [
        { id: 'q1', label: 'Q1', type: 'radio', options: ['A', 'B'], points: 5 },
      ];

      const tiebreaker = getTiebreakerQuestion(testQuestions);

      expect(tiebreaker).toBeUndefined();
    });
  });

  describe('default questions export', () => {
    it('should export default questions array', () => {
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have Seahawks vs Patriots by default', () => {
      const winnerQuestion = questions.find((q) => q.id === 'winner');

      expect(winnerQuestion).toBeDefined();
      expect(winnerQuestion!.options).toContain('Seahawks');
      expect(winnerQuestion!.options).toContain('Patriots');
    });
  });
});
