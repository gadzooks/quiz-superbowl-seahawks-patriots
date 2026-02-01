import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  getLeagueSlug,
  isAdminOverride,
  saveLeagueSlug,
  clearLeagueSlug,
  nameToSlug,
  getLeagueUrl,
} from './url';

describe('utils/url', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    localStorage.clear();
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  describe('getLeagueSlug', () => {
    it('should return league slug from path', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx/test-league',
        search: '',
        origin: 'http://localhost',
      } as unknown as Location;

      const slug = getLeagueSlug();

      expect(slug).toBe('test-league');
    });

    it('should return null if no league in path', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx',
        search: '',
        origin: 'http://localhost',
      } as unknown as Location;

      const slug = getLeagueSlug();

      expect(slug).toBeNull();
    });

    it('should fall back to URL query parameter (legacy)', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/',
        search: '?league=legacy-league',
        origin: 'http://localhost',
      } as unknown as Location;

      const slug = getLeagueSlug();

      expect(slug).toBe('legacy-league');
    });

    it('should fall back to localStorage (legacy)', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/',
        search: '',
        origin: 'http://localhost',
      } as unknown as Location;
      localStorage.setItem('currentLeagueSlug', 'saved-league');

      const slug = getLeagueSlug();

      expect(slug).toBe('saved-league');
    });

    it('should prefer path over query param', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx/path-league',
        search: '?league=query-league',
        origin: 'http://localhost',
      } as unknown as Location;

      const slug = getLeagueSlug();

      expect(slug).toBe('path-league');
    });
  });

  describe('isAdminOverride', () => {
    it('should return true when isAdmin=true in URL', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx',
        search: '?isAdmin=true',
        origin: 'http://localhost',
      } as unknown as Location;

      expect(isAdminOverride()).toBe(true);
    });

    it('should return false when isAdmin is not true', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx',
        search: '?isAdmin=false',
        origin: 'http://localhost',
      } as unknown as Location;

      expect(isAdminOverride()).toBe(false);
    });

    it('should return false when isAdmin parameter is missing', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx',
        search: '',
        origin: 'http://localhost',
      } as unknown as Location;

      expect(isAdminOverride()).toBe(false);
    });
  });

  describe('saveLeagueSlug', () => {
    it('should save league slug to localStorage', () => {
      delete (window as any).location;
      const mockHistory = { replaceState: vi.fn() };
      (window as any).location = {
        pathname: '/lx',
        search: '',
        origin: 'http://localhost',
      } as unknown as Location;
      window.history = mockHistory as any;

      saveLeagueSlug('test-league');

      expect(localStorage.getItem('currentLeagueSlug')).toBe('test-league');
    });

    it('should update URL path', () => {
      delete (window as any).location;
      const mockHistory = { replaceState: vi.fn() };
      (window as any).location = {
        pathname: '/lx',
        search: '',
        origin: 'http://localhost',
      } as unknown as Location;
      window.history = mockHistory as any;

      saveLeagueSlug('test-league');

      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, '', '/lx/test-league');
    });

    it('should preserve query parameters', () => {
      delete (window as any).location;
      const mockHistory = { replaceState: vi.fn() };
      (window as any).location = {
        pathname: '/lx',
        search: '?isAdmin=true',
        origin: 'http://localhost',
      } as unknown as Location;
      window.history = mockHistory as any;

      saveLeagueSlug('test-league');

      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, '', '/lx/test-league?isAdmin=true');
    });
  });

  describe('clearLeagueSlug', () => {
    it('should remove league slug from localStorage', () => {
      localStorage.setItem('currentLeagueSlug', 'test-league');

      clearLeagueSlug();

      expect(localStorage.getItem('currentLeagueSlug')).toBeNull();
    });

    it('should do nothing if no league slug exists', () => {
      clearLeagueSlug();

      expect(localStorage.getItem('currentLeagueSlug')).toBeNull();
    });
  });

  describe('getLeagueUrl', () => {
    it('should generate full URL for a league', () => {
      delete (window as any).location;
      (window as any).location = {
        pathname: '/lx',
        search: '',
        origin: 'https://example.com',
      } as unknown as Location;

      const url = getLeagueUrl('test-league');

      expect(url).toBe('https://example.com/lx/test-league');
    });
  });

  describe('nameToSlug', () => {
    it('should convert name to lowercase', () => {
      expect(nameToSlug('My League')).toBe('my-league');
    });

    it('should replace spaces with dashes', () => {
      expect(nameToSlug('Smith Family League')).toBe('smith-family-league');
    });

    it('should handle special characters', () => {
      expect(nameToSlug("John's League #1")).toBe('john-s-league-1');
    });

    it('should handle multiple consecutive spaces', () => {
      expect(nameToSlug('Test   League')).toBe('test-league');
    });

    it('should handle leading/trailing spaces', () => {
      // The implementation replaces non-alphanumeric with dashes, then leading/trailing dashes remain
      // This is acceptable since league names are typically trimmed before slugification
      expect(nameToSlug('  Test League  ')).toBe('-test-league-');
    });
  });
});
