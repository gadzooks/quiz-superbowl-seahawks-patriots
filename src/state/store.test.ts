import { describe, it, expect, beforeEach } from 'vitest';

import type { League, Prediction } from '../types';

import {
  getState,
  updateState,
  setCurrentUserId,
  setCurrentLeague,
  setAllPredictions,
  setIsLeagueCreator,
  setCurrentTeamName,
  setIsManager,
  setHasShownCompletionCelebration,
  setPreviousActualResults,
  setHasUnviewedScoreUpdate,
  setExpectedLeagueSlug,
  setCurrentGame,
  setQuestions,
} from './store';

describe('state/store', () => {
  beforeEach(() => {
    // Reset state before each test
    updateState({
      currentUserId: '',
      currentLeague: null,
      currentGame: null,
      questions: [],
      allPredictions: [],
      isLeagueCreator: false,
      currentTeamName: '',
      isManager: false,
      currentTab: 'predictions',
      hasShownCompletionCelebration: false,
      previousActualResults: null,
      hasUnviewedScoreUpdate: false,
      expectedLeagueSlug: null,
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const state = getState();

      expect(state).toBeDefined();
      expect(state).toHaveProperty('currentUserId');
      expect(state).toHaveProperty('currentLeague');
      expect(state).toHaveProperty('allPredictions');
      expect(state).toHaveProperty('currentGame');
      expect(state).toHaveProperty('questions');
    });

    it('should return initial state values', () => {
      const state = getState();

      expect(state.currentUserId).toBe('');
      expect(state.currentLeague).toBeNull();
      expect(state.currentGame).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.allPredictions).toEqual([]);
      expect(state.isLeagueCreator).toBe(false);
      expect(state.currentTab).toBe('predictions');
    });
  });

  describe('updateState', () => {
    it('should update multiple properties at once', () => {
      updateState({
        currentUserId: 'user-123',
        currentTeamName: 'Test Team',
        isLeagueCreator: true,
      });

      const state = getState();
      expect(state.currentUserId).toBe('user-123');
      expect(state.currentTeamName).toBe('Test Team');
      expect(state.isLeagueCreator).toBe(true);
    });

    it('should merge with existing state', () => {
      updateState({ currentUserId: 'user-123' });
      updateState({ currentTeamName: 'Test Team' });

      const state = getState();
      expect(state.currentUserId).toBe('user-123');
      expect(state.currentTeamName).toBe('Test Team');
    });
  });

  describe('setCurrentUserId', () => {
    it('should set user ID', () => {
      setCurrentUserId('user-456');

      const state = getState();
      expect(state.currentUserId).toBe('user-456');
    });
  });

  describe('setCurrentLeague', () => {
    it('should set league', () => {
      const league: League = {
        id: 'league-1',
        slug: 'test-league',
        name: 'Test League',
        creatorId: 'user-123',
        isOpen: true,
        createdAt: Date.now(),
        actualResults: null,
        showAllPredictions: false,
      };

      setCurrentLeague(league);

      const state = getState();
      expect(state.currentLeague).toEqual(league);
    });

    it('should allow setting to null', () => {
      const league: League = {
        id: 'league-1',
        slug: 'test-league',
        name: 'Test League',
        creatorId: 'user-123',
        isOpen: true,
        createdAt: Date.now(),
        actualResults: null,
        showAllPredictions: false,
      };

      setCurrentLeague(league);
      setCurrentLeague(null);

      const state = getState();
      expect(state.currentLeague).toBeNull();
    });
  });

  describe('setCurrentGame', () => {
    it('should set game', () => {
      const game = {
        id: 'game-1',
        gameId: 'lx',
        displayName: 'Super Bowl LX',
        year: 2026,
        team1: 'Seahawks',
        team2: 'Patriots',
      };

      setCurrentGame(game);

      const state = getState();
      expect(state.currentGame).toEqual(game);
    });
  });

  describe('setQuestions', () => {
    it('should set questions', () => {
      const questions = [
        {
          id: '1',
          questionId: 'winner',
          label: 'Who wins?',
          type: 'radio' as const,
          options: ['Seahawks', 'Patriots'],
          points: 6,
          sortOrder: 0,
          isTiebreaker: false,
        },
      ];

      setQuestions(questions);

      const state = getState();
      expect(state.questions).toEqual(questions);
      expect(state.questions.length).toBe(1);
    });
  });

  describe('setAllPredictions', () => {
    it('should set predictions array', () => {
      const predictions: Prediction[] = [
        {
          id: 'pred-1',
          userId: 'user-123',
          teamName: 'Team 1',
          predictions: { winner: 'seahawks' },
          submittedAt: Date.now(),
          score: 0,
          tiebreakDiff: 0,
          isManager: false,
        },
      ];

      setAllPredictions(predictions);

      const state = getState();
      expect(state.allPredictions).toEqual(predictions);
      expect(state.allPredictions.length).toBe(1);
    });

    it('should accept empty array', () => {
      setAllPredictions([]);

      const state = getState();
      expect(state.allPredictions).toEqual([]);
    });
  });

  describe('setIsLeagueCreator', () => {
    it('should set league creator flag', () => {
      setIsLeagueCreator(true);

      const state = getState();
      expect(state.isLeagueCreator).toBe(true);
    });

    it('should allow setting to false', () => {
      setIsLeagueCreator(true);
      setIsLeagueCreator(false);

      const state = getState();
      expect(state.isLeagueCreator).toBe(false);
    });
  });

  describe('setCurrentTeamName', () => {
    it('should set team name', () => {
      setCurrentTeamName('My Team');

      const state = getState();
      expect(state.currentTeamName).toBe('My Team');
    });

    it('should allow empty string', () => {
      setCurrentTeamName('My Team');
      setCurrentTeamName('');

      const state = getState();
      expect(state.currentTeamName).toBe('');
    });
  });

  describe('setIsManager', () => {
    it('should set manager flag', () => {
      setIsManager(true);

      const state = getState();
      expect(state.isManager).toBe(true);
    });
  });

  describe('setHasShownCompletionCelebration', () => {
    it('should set completion celebration flag', () => {
      setHasShownCompletionCelebration(true);

      const state = getState();
      expect(state.hasShownCompletionCelebration).toBe(true);
    });
  });

  describe('setPreviousActualResults', () => {
    it('should set previous results', () => {
      const results = { winner: 'seahawks', totalTDs: 5 };

      setPreviousActualResults(results);

      const state = getState();
      expect(state.previousActualResults).toEqual(results);
    });

    it('should allow null', () => {
      setPreviousActualResults({ winner: 'seahawks' });
      setPreviousActualResults(null);

      const state = getState();
      expect(state.previousActualResults).toBeNull();
    });
  });

  describe('setHasUnviewedScoreUpdate', () => {
    it('should set unviewed score update flag', () => {
      setHasUnviewedScoreUpdate(true);

      const state = getState();
      expect(state.hasUnviewedScoreUpdate).toBe(true);
    });
  });

  describe('setExpectedLeagueSlug', () => {
    it('should set expected league slug', () => {
      setExpectedLeagueSlug('expected-league');

      const state = getState();
      expect(state.expectedLeagueSlug).toBe('expected-league');
    });

    it('should allow null', () => {
      setExpectedLeagueSlug('expected-league');
      setExpectedLeagueSlug(null);

      const state = getState();
      expect(state.expectedLeagueSlug).toBeNull();
    });
  });

  describe('state immutability', () => {
    it('should return state snapshot', () => {
      const state1 = getState();
      const state2 = getState();

      // They should have the same values
      expect(state1).toEqual(state2);
    });

    it('should preserve previous state when updating', () => {
      setCurrentUserId('user-123');
      const state1 = getState();

      setCurrentTeamName('Team Name');
      const state2 = getState();

      // Original state snapshot should be unchanged
      expect(state1.currentUserId).toBe('user-123');
      expect(state1.currentTeamName).toBe('');

      // New state should have both
      expect(state2.currentUserId).toBe('user-123');
      expect(state2.currentTeamName).toBe('Team Name');
    });
  });
});
