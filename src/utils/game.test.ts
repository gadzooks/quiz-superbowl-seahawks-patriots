import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  parseUrlPath,
  getCurrentGameId,
  getCurrentLeagueSlug,
  getCurrentGameConfig,
  buildGamePath,
  buildGameUrl,
  buildWeeklyPath,
  buildWeeklyUrl,
} from './game';

describe('utils/game', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    (window as any).location = originalLocation;
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
      (window as any).location = { pathname: '/lx' } as unknown as Location;

      const gameId = getCurrentGameId();

      expect(gameId).toBe('lx');
    });

    it('should return default game ID for root path', () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/' } as unknown as Location;

      const gameId = getCurrentGameId();

      expect(gameId).toBe('lx');
    });
  });

  describe('getCurrentLeagueSlug', () => {
    it('should get league slug from current URL', () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/lx/smith-family' } as unknown as Location;

      const slug = getCurrentLeagueSlug();

      expect(slug).toBe('smith-family');
    });

    it('should return null when no league in URL', () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/lx' } as unknown as Location;

      const slug = getCurrentLeagueSlug();

      expect(slug).toBeNull();
    });
  });

  describe('getCurrentGameConfig', () => {
    it('should return game configuration object', () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/lx' } as unknown as Location;

      const config = getCurrentGameConfig();

      expect(config).toBeDefined();
      expect(config.gameId).toBe('lx');
      expect(config.displayName).toBe('Super Bowl LX');
      expect(config.year).toBe(2026);
      expect(config.teams).toEqual(['Seahawks', 'Patriots']);
    });

    it('should have valid teams array', () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/lx' } as unknown as Location;

      const config = getCurrentGameConfig();

      expect(Array.isArray(config.teams)).toBe(true);
      expect(config.teams?.length).toBe(2);
      expect(config.teams?.[0]).toBeTruthy();
      expect(config.teams?.[1]).toBeTruthy();
    });

    it('should return default config for invalid game ID', () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/invalid-game' } as unknown as Location;

      const config = getCurrentGameConfig();

      expect(config.gameId).toBe('lx');
    });
  });

  describe('buildGamePath', () => {
    it('should build path with game ID only', () => {
      const path = buildGamePath('lx');

      expect(path).toBe('/superbowl/lx');
    });

    it('should build path with game ID and league slug', () => {
      const path = buildGamePath('lx', 'smith-family');

      expect(path).toBe('/superbowl/lx/smith-family');
    });

    it('should handle undefined league slug', () => {
      const path = buildGamePath('lx', undefined);

      expect(path).toBe('/superbowl/lx');
    });
  });

  describe('parseUrlPath - weekly routes', () => {
    it('should parse league slug and quiz date from a weekly path', () => {
      const result = parseUrlPath('/weekly/smith-family/2026-08-26');

      expect(result.eventType).toBe('weekly');
      expect(result.gameId).toBe('weekly-2026-08-26');
      expect(result.leagueSlug).toBe('smith-family');
      expect(result.quizDate).toBe('2026-08-26');
    });

    it('should return null gameId and quizDate when no date is given', () => {
      const result = parseUrlPath('/weekly/smith-family');

      expect(result.eventType).toBe('weekly');
      expect(result.gameId).toBeNull();
      expect(result.leagueSlug).toBe('smith-family');
      expect(result.quizDate).toBeNull();
    });

    it('should return null quizDate for an invalid date segment', () => {
      const result = parseUrlPath('/weekly/smith-family/not-a-date');

      expect(result.eventType).toBe('weekly');
      expect(result.gameId).toBeNull();
      expect(result.quizDate).toBeNull();
    });

    it('should handle the bare /weekly path', () => {
      const result = parseUrlPath('/weekly');

      expect(result.eventType).toBe('weekly');
      expect(result.leagueSlug).toBeNull();
      expect(result.quizDate).toBeNull();
    });

    it('should lowercase the league slug', () => {
      const result = parseUrlPath('/weekly/Smith-Family/2026-08-26');

      expect(result.leagueSlug).toBe('smith-family');
    });
  });

  describe('buildWeeklyPath', () => {
    it('should build a path with league slug only', () => {
      expect(buildWeeklyPath('smith-family')).toBe('/weekly/smith-family');
    });

    it('should build a path with league slug and quiz date', () => {
      expect(buildWeeklyPath('smith-family', '2026-08-26')).toBe('/weekly/smith-family/2026-08-26');
    });
  });

  describe('buildWeeklyUrl', () => {
    it('should build a full URL with league slug and quiz date', () => {
      delete (window as any).location;
      (window as any).location = { origin: 'https://example.com' } as unknown as Location;

      const url = buildWeeklyUrl('smith-family', '2026-08-26');

      expect(url).toBe('https://example.com/weekly/smith-family/2026-08-26');
    });
  });

  describe('buildGameUrl', () => {
    it('should build full URL with game ID', () => {
      delete (window as any).location;
      (window as any).location = { origin: 'https://example.com' } as unknown as Location;

      const url = buildGameUrl('lx');

      expect(url).toBe('https://example.com/superbowl/lx');
    });

    it('should build full URL with game ID and league slug', () => {
      delete (window as any).location;
      (window as any).location = { origin: 'https://example.com' } as unknown as Location;

      const url = buildGameUrl('lx', 'smith-family');

      expect(url).toBe('https://example.com/superbowl/lx/smith-family');
    });
  });
});
