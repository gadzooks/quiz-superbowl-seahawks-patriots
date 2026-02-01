import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderAllPredictions, hideAllPredictions } from './AllPredictions';
import { updateState } from '../state/store';
import type { League, Prediction } from '../types';

// Mock dependencies
vi.mock('../utils/game', () => ({
  getCurrentGameConfig: () => ({ id: 'lx', name: 'Super Bowl LX' }),
}));

vi.mock('../questions', () => ({
  getQuestionsForGame: () => [
    { id: 'q1', label: 'Question 1', type: 'radio', points: 10, options: ['A', 'B'] },
    { id: 'q2', label: 'Question 2', type: 'number', points: 5 },
  ],
}));

describe('components/AllPredictions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="allPredictionsSection">
        <div id="allPredictionsTable"></div>
      </div>
    `;
  });

  describe('renderAllPredictions', () => {
    it('should hide section when no teams have predictions', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: true,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league, allPredictions: [] });

      renderAllPredictions();

      const section = document.getElementById('allPredictionsSection');
      expect(section?.classList.contains('hidden')).toBe(true);
    });

    it('should not render if elements are missing', () => {
      document.body.innerHTML = '';
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: true,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league, allPredictions: [] });

      renderAllPredictions();

      expect(document.body.innerHTML).toBe('');
    });

    it('should render table with predictions', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: true,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team A',
          predictions: { q1: 'a', q2: 10 },
          score: 0,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions });

      renderAllPredictions();

      const table = document.querySelector('table');
      expect(table).toBeDefined();
      expect(table?.innerHTML).toContain('Team A');
      expect(table?.innerHTML).toContain('Question 1');
      expect(table?.innerHTML).toContain('Question 2');
    });

    it('should show correct answers when results are entered', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: false,
        showAllPredictions: true,
        actualResults: { q1: 'a', q2: 10 },
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team A',
          predictions: { q1: 'a', q2: 10 },
          score: 15,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions });

      renderAllPredictions();

      const table = document.querySelector('table');
      expect(table?.innerHTML).toContain('✓ ACTUAL');
    });

    it('should highlight correct answers with green background', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: false,
        showAllPredictions: true,
        actualResults: { q1: 'a', q2: 10 },
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team A',
          predictions: { q1: 'a', q2: 10 },
          score: 15,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions });

      renderAllPredictions();

      const tableHtml = document.getElementById('allPredictionsTable')?.innerHTML || '';
      expect(tableHtml).toContain('#003320'); // Correct answer background color
    });

    it('should show dash for unanswered questions', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: true,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team A',
          predictions: { q1: 'a' },
          score: 0,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions });

      renderAllPredictions();

      const table = document.querySelector('table');
      expect(table?.innerHTML).toContain('>-<');
    });

    it('should show both teams even if one has empty predictions object', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: true,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team A',
          predictions: { q1: 'a' },
          score: 0,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
        {
          id: 'p2',
          userId: 'u2',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team B',
          predictions: {},
          score: 0,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions });

      renderAllPredictions();

      const table = document.querySelector('table');
      expect(table?.innerHTML).toContain('Team A');
      expect(table?.innerHTML).toContain('Team B');
    });

    it('should show scores in table', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: false,
        showAllPredictions: true,
        actualResults: { q1: 'a', q2: 10 },
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: 'Team A',
          predictions: { q1: 'a', q2: 10 },
          score: 15,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions });

      renderAllPredictions();

      const table = document.querySelector('table');
      expect(table?.innerHTML).toContain('>15<');
    });
  });

  describe('hideAllPredictions', () => {
    it('should add hidden class to section', () => {
      hideAllPredictions();

      const section = document.getElementById('allPredictionsSection');
      expect(section?.classList.contains('hidden')).toBe(true);
    });

    it('should handle missing section gracefully', () => {
      document.body.innerHTML = '';

      expect(() => hideAllPredictions()).not.toThrow();
    });
  });
});
