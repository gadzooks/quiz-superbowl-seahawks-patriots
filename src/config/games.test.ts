import { describe, it, expect } from 'vitest';

import {
  getGameConfig,
  isValidGameId,
  getAvailableGameIds,
  DEFAULT_GAME_ID,
  GAMES,
  getTeamIds,
  getSubmissionDeadline,
  isWeeklyGameId,
  isValidQuizDate,
  buildWeeklyGameId,
  getQuizDateFromGameId,
  getUpcomingQuizDate,
} from './games';

describe('config/games', () => {
  describe('GAMES registry', () => {
    it('should have at least one game configured', () => {
      expect(Object.keys(GAMES).length).toBeGreaterThan(0);
    });

    it('should have valid game configs', () => {
      Object.values(GAMES).forEach((game) => {
        expect(game).toHaveProperty('gameId');
        expect(game).toHaveProperty('displayName');
        expect(game).toHaveProperty('year');
        expect(game).toHaveProperty('teams');
        expect(Array.isArray(game.teams)).toBe(true);
        expect(game.teams?.length).toBe(2);
      });
    });

    it('should have lx game configured', () => {
      expect(GAMES.lx).toBeDefined();
      expect(GAMES.lx.gameId).toBe('lx');
      expect(GAMES.lx.displayName).toBe('Super Bowl LX');
      expect(GAMES.lx.year).toBe(2026);
      expect(GAMES.lx.teams).toEqual(['Seahawks', 'Patriots']);
      expect(GAMES.lx.kickoffTime).toBe('2026-02-08T15:30:00-08:00');
    });
  });

  describe('DEFAULT_GAME_ID', () => {
    it('should be set to lx', () => {
      expect(DEFAULT_GAME_ID).toBe('lx');
    });

    it('should exist in GAMES registry', () => {
      expect(GAMES[DEFAULT_GAME_ID]).toBeDefined();
    });
  });

  describe('getGameConfig', () => {
    it('should return config for valid game ID', () => {
      const config = getGameConfig('lx');

      expect(config).toBeDefined();
      expect(config?.gameId).toBe('lx');
    });

    it('should return undefined for invalid game ID', () => {
      const config = getGameConfig('invalid-game');

      expect(config).toBeUndefined();
    });

    it('should be case insensitive', () => {
      const config1 = getGameConfig('lx');
      const config2 = getGameConfig('LX');
      const config3 = getGameConfig('Lx');

      expect(config1).toEqual(config2);
      expect(config2).toEqual(config3);
    });

    it('should return complete game config', () => {
      const config = getGameConfig('lx');

      expect(config).toHaveProperty('gameId');
      expect(config).toHaveProperty('displayName');
      expect(config).toHaveProperty('year');
      expect(config).toHaveProperty('teams');
    });
  });

  describe('isValidGameId', () => {
    it('should return true for valid game ID', () => {
      expect(isValidGameId('lx')).toBe(true);
    });

    it('should return false for invalid game ID', () => {
      expect(isValidGameId('invalid')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidGameId('LX')).toBe(true);
      expect(isValidGameId('Lx')).toBe(true);
      expect(isValidGameId('lX')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidGameId('')).toBe(false);
    });
  });

  describe('getAvailableGameIds', () => {
    it('should return array of game IDs', () => {
      const ids = getAvailableGameIds();

      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
    });

    it('should include lx', () => {
      const ids = getAvailableGameIds();

      expect(ids).toContain('lx');
    });

    it('should match keys in GAMES registry', () => {
      const ids = getAvailableGameIds();
      const gameKeys = Object.keys(GAMES);

      expect(ids.sort()).toEqual(gameKeys.sort());
    });
  });

  describe('getTeamIds', () => {
    it('should derive team IDs by lowercasing team names', () => {
      const config = GAMES.lx;
      const teamIds = getTeamIds(config);

      expect(teamIds).toEqual(['seahawks', 'patriots']);
    });

    it('should return a tuple of two strings', () => {
      const config = GAMES.lx;
      const teamIds = getTeamIds(config);

      expect(teamIds).not.toBeNull();
      expect(Array.isArray(teamIds)).toBe(true);
      expect(teamIds!.length).toBe(2);
      expect(typeof teamIds![0]).toBe('string');
      expect(typeof teamIds![1]).toBe('string');
    });

    it('should return null when the config has no teams', () => {
      const config = {
        gameId: 'weekly-2026-08-26',
        eventType: 'weekly' as const,
        displayName: 'Weekly Quiz',
        year: 2026,
      };

      expect(getTeamIds(config)).toBeNull();
    });
  });

  describe('isValidQuizDate', () => {
    it('should accept a real calendar date', () => {
      expect(isValidQuizDate('2026-08-26')).toBe(true);
    });

    it('should reject a malformed string', () => {
      expect(isValidQuizDate('not-a-date')).toBe(false);
      expect(isValidQuizDate('2026-8-26')).toBe(false);
    });

    it('should reject a date that does not exist', () => {
      expect(isValidQuizDate('2026-02-30')).toBe(false);
    });
  });

  describe('buildWeeklyGameId / getQuizDateFromGameId', () => {
    it('should round-trip a quiz date through a weekly game ID', () => {
      const gameId = buildWeeklyGameId('2026-08-26');

      expect(gameId).toBe('weekly-2026-08-26');
      expect(getQuizDateFromGameId(gameId)).toBe('2026-08-26');
    });

    it('should return null for a non-weekly game ID', () => {
      expect(getQuizDateFromGameId('lx')).toBeNull();
    });
  });

  describe('isWeeklyGameId', () => {
    it('should return true for a valid weekly game ID', () => {
      expect(isWeeklyGameId('weekly-2026-08-26')).toBe(true);
    });

    it('should return false for a Super Bowl game ID', () => {
      expect(isWeeklyGameId('lx')).toBe(false);
    });

    it('should return false when the date portion is invalid', () => {
      expect(isWeeklyGameId('weekly-2026-02-30')).toBe(false);
    });
  });

  describe('isValidGameId - weekly', () => {
    it('should accept a well-formed weekly game ID', () => {
      expect(isValidGameId('weekly-2026-08-26')).toBe(true);
    });

    it('should reject a malformed weekly game ID', () => {
      expect(isValidGameId('weekly-not-a-date')).toBe(false);
    });
  });

  describe('getUpcomingQuizDate', () => {
    it('should return a Sunday', () => {
      // Wednesday 2026-08-19
      const wednesday = new Date(2026, 7, 19);
      const upcoming = getUpcomingQuizDate(wednesday);
      const [year, month, day] = upcoming.split('-').map(Number);

      expect(new Date(year, month - 1, day).getDay()).toBe(0);
    });

    it('should return today when today is already Sunday', () => {
      // Sunday 2026-08-23
      const sunday = new Date(2026, 7, 23);
      expect(getUpcomingQuizDate(sunday)).toBe('2026-08-23');
    });
  });

  describe('getGameConfig - weekly quizzes', () => {
    it('should synthesize a config for a valid weekly game ID', () => {
      const config = getGameConfig('weekly-2026-08-26');

      expect(config).toBeDefined();
      expect(config?.eventType).toBe('weekly');
      expect(config?.quizDate).toBe('2026-08-26');
      expect(config?.teams).toBeUndefined();
    });

    it('should return undefined for an invalid weekly game ID', () => {
      expect(getGameConfig('weekly-not-a-date')).toBeUndefined();
    });

    it('should mark a past quiz date as completed', () => {
      const config = getGameConfig('weekly-2020-01-05');
      expect(config?.status).toBe('completed');
    });

    it('should mark a far-future quiz date as upcoming', () => {
      const config = getGameConfig('weekly-2099-01-04');
      expect(config?.status).toBe('upcoming');
    });
  });

  describe('getSubmissionDeadline', () => {
    it('should return a Date 20 minutes before kickoff', () => {
      const config = GAMES.lx;
      const deadline = getSubmissionDeadline(config);

      expect(deadline).toBeInstanceOf(Date);
      const kickoff = new Date(config.kickoffTime!);
      expect(deadline!.getTime()).toBe(kickoff.getTime() - 20 * 60 * 1000);
    });

    it('should return null when no kickoffTime is set', () => {
      const config = {
        gameId: 'test',
        eventType: 'superbowl' as const,
        displayName: 'Test',
        year: 2027,
        teams: ['A', 'B'] as [string, string],
      };
      const deadline = getSubmissionDeadline(config);

      expect(deadline).toBeNull();
    });
  });
});
