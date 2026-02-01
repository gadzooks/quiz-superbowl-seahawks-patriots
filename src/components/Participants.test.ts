import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderParticipants,
  copyParticipantLink,
  exposeParticipantFunctions,
} from './Participants';
import { updateState, resetState } from '../state/store';
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

vi.mock('../ui/toast', () => ({
  showToast: vi.fn(),
}));

describe('components/Participants', () => {
  beforeEach(() => {
    resetState();
    document.body.innerHTML = '<div id="participantsList"></div>';
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  describe('renderParticipants', () => {
    it('should show "no participants" message when empty', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league, allPredictions: [], isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('No participants yet!');
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
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league, allPredictions: [], isLeagueCreator: false });

      renderParticipants();

      expect(document.body.innerHTML).toBe('');
    });

    it('should render participants list', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('Team A');
      expect(participantsDiv?.innerHTML).toContain('2 of 2 questions answered');
    });

    it('should show completion percentage', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('50%');
      expect(participantsDiv?.innerHTML).toContain('1 of 2 questions answered');
    });

    it('should show complete badge when all questions answered', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('Complete!');
      expect(participantsDiv?.innerHTML).toContain('badge-success');
    });

    it('should show manager badge for managers', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
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
          isManager: true,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('👑 Manager');
    });

    it('should show manager toggle for league creators', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u2',
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: true });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('Manager?');
      expect(participantsDiv?.innerHTML).toContain('toggleManager');
    });

    it('should show delete button for league creators', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u2',
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: true });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('🗑️ Delete');
      expect(participantsDiv?.innerHTML).toContain('openDeleteModal');
    });

    it('should show recovery link button', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      expect(participantsDiv?.innerHTML).toContain('📋 Copy recovery link');
      expect(participantsDiv?.innerHTML).toContain('copyParticipantLink');
    });

    it('should sort by completion then alphabetically', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
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
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      const html = participantsDiv?.innerHTML || '';
      const teamAIndex = html.indexOf('Team A');
      const teamZIndex = html.indexOf('Team Z');
      expect(teamAIndex).toBeLessThan(teamZIndex);
    });

    it('should escape team names for onclick handlers', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      const predictions: Prediction[] = [
        {
          id: 'p1',
          userId: 'u1',
          gameId: 'lx',
          leagueId: 'l1',
          teamName: "Team's Name",
          predictions: { q1: 'a' },
          score: 0,
          tiebreakDiff: 0,
          isManager: false,
          submittedAt: Date.now(),
        },
      ];
      updateState({ currentLeague: league, allPredictions: predictions, isLeagueCreator: false });

      renderParticipants();

      const participantsDiv = document.getElementById('participantsList');
      // Should escape quotes for onclick handlers
      expect(participantsDiv?.innerHTML).toContain("\\'");
    });
  });

  describe('copyParticipantLink', () => {
    it('should copy recovery link to clipboard', async () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      });

      // Mock window location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
          pathname: '/',
        },
        writable: true,
      });

      await copyParticipantLink('u123', 'Team A');

      expect(mockWriteText).toHaveBeenCalledWith(
        'http://localhost:3000/?league=test-league&user=u123'
      );
    });

    it('should not copy if no current league', async () => {
      updateState({ currentLeague: null });

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      });

      await copyParticipantLink('u123', 'Team A');

      expect(mockWriteText).not.toHaveBeenCalled();
    });
  });

  describe('exposeParticipantFunctions', () => {
    it('should expose copyParticipantLink to window', () => {
      exposeParticipantFunctions();

      expect(window.copyParticipantLink).toBeDefined();
      expect(typeof window.copyParticipantLink).toBe('function');
    });

    it('should expose openDeleteModal to window', () => {
      exposeParticipantFunctions();

      expect(window.openDeleteModal).toBeDefined();
      expect(typeof window.openDeleteModal).toBe('function');
    });

    it('should expose closeDeleteModal to window', () => {
      exposeParticipantFunctions();

      expect(window.closeDeleteModal).toBeDefined();
      expect(typeof window.closeDeleteModal).toBe('function');
    });

    it('should expose confirmDeleteTeam to window', () => {
      exposeParticipantFunctions();

      expect(window.confirmDeleteTeam).toBeDefined();
      expect(typeof window.confirmDeleteTeam).toBe('function');
    });

    it('should expose toggleManager to window', () => {
      exposeParticipantFunctions();

      expect(window.toggleManager).toBeDefined();
      expect(typeof window.toggleManager).toBe('function');
    });
  });
});
