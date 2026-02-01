import { describe, it, expect } from 'vitest';
import { getGameConfig, isValidGameId, getAvailableGameIds, DEFAULT_GAME_ID, GAMES } from './games';

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
        expect(game.teams.length).toBe(2);
      });
    });

    it('should have lx game configured', () => {
      expect(GAMES.lx).toBeDefined();
      expect(GAMES.lx.gameId).toBe('lx');
      expect(GAMES.lx.displayName).toBe('Super Bowl LX');
      expect(GAMES.lx.year).toBe(2026);
      expect(GAMES.lx.teams).toEqual(['Seahawks', 'Patriots']);
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
});
