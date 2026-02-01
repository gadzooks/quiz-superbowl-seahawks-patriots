import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseUrlPath,
  getCurrentGameId,
  getCurrentLeagueSlug,
  getCurrentGameConfig,
  buildGamePath,
  buildGameUrl,
} from './game';

describe('utils/game', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('parseUrlPath', () => {
    it('should parse game ID from path', () => {
      const result = parseUrlPath('/lx');

      expect(result.gameId).toBe('lx');
      expect(result.leagueSlug).toBeNull();
    });

    it('should parse game ID and league slug from path', () => {
      const result = parseUrlPath('/lx/smith-family');

      expect(result.gameId).toBe('lx');
      expect(result.leagueSlug).toBe('smith-family');
    });

    it('should return default game ID for empty path', () => {
      const result = parseUrlPath('/');

      expect(result.gameId).toBe('lx');
      expect(result.leagueSlug).toBeNull();
    });

    it('should handle invalid game ID by using default', () => {
      const result = parseUrlPath('/invalid-game');

      expect(result.gameId).toBe('lx');
      expect(result.leagueSlug).toBe('invalid-game');
    });

    it('should handle trailing slashes', () => {
      const result = parseUrlPath('/lx/smith-family/');

      expect(result.gameId).toBe('lx');
      expect(result.leagueSlug).toBe('smith-family');
    });

    it('should be case insensitive for game IDs', () => {
      const result = parseUrlPath('/LX/test-league');

      expect(result.gameId).toBe('lx');
      expect(result.leagueSlug).toBe('test-league');
    });
  });

  describe('getCurrentGameId', () => {
    it('should get game ID from current URL', () => {
      delete (window as any).location;
      window.location = { pathname: '/lx' } as Location;

      const gameId = getCurrentGameId();

      expect(gameId).toBe('lx');
    });

    it('should return default game ID for root path', () => {
      delete (window as any).location;
      window.location = { pathname: '/' } as Location;

      const gameId = getCurrentGameId();

      expect(gameId).toBe('lx');
    });
  });

  describe('getCurrentLeagueSlug', () => {
    it('should get league slug from current URL', () => {
      delete (window as any).location;
      window.location = { pathname: '/lx/smith-family' } as Location;

      const slug = getCurrentLeagueSlug();

      expect(slug).toBe('smith-family');
    });

    it('should return null when no league in URL', () => {
      delete (window as any).location;
      window.location = { pathname: '/lx' } as Location;

      const slug = getCurrentLeagueSlug();

      expect(slug).toBeNull();
    });
  });

  describe('getCurrentGameConfig', () => {
    it('should return game configuration object', () => {
      delete (window as any).location;
      window.location = { pathname: '/lx' } as Location;

      const config = getCurrentGameConfig();

      expect(config).toBeDefined();
      expect(config.gameId).toBe('lx');
      expect(config.displayName).toBe('Super Bowl LX');
      expect(config.year).toBe(2026);
      expect(config.teams).toEqual(['Seahawks', 'Patriots']);
    });

    it('should have valid teams array', () => {
      delete (window as any).location;
      window.location = { pathname: '/lx' } as Location;

      const config = getCurrentGameConfig();

      expect(Array.isArray(config.teams)).toBe(true);
      expect(config.teams.length).toBe(2);
      expect(config.teams[0]).toBeTruthy();
      expect(config.teams[1]).toBeTruthy();
    });

    it('should return default config for invalid game ID', () => {
      delete (window as any).location;
      window.location = { pathname: '/invalid-game' } as Location;

      const config = getCurrentGameConfig();

      expect(config.gameId).toBe('lx');
    });
  });

  describe('buildGamePath', () => {
    it('should build path with game ID only', () => {
      const path = buildGamePath('lx');

      expect(path).toBe('/lx');
    });

    it('should build path with game ID and league slug', () => {
      const path = buildGamePath('lx', 'smith-family');

      expect(path).toBe('/lx/smith-family');
    });

    it('should handle undefined league slug', () => {
      const path = buildGamePath('lx', undefined);

      expect(path).toBe('/lx');
    });
  });

  describe('buildGameUrl', () => {
    it('should build full URL with game ID', () => {
      delete (window as any).location;
      window.location = { origin: 'https://example.com' } as Location;

      const url = buildGameUrl('lx');

      expect(url).toBe('https://example.com/lx');
    });

    it('should build full URL with game ID and league slug', () => {
      delete (window as any).location;
      window.location = { origin: 'https://example.com' } as Location;

      const url = buildGameUrl('lx', 'smith-family');

      expect(url).toBe('https://example.com/lx/smith-family');
    });
  });
});
