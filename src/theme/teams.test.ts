import { describe, it, expect } from 'vitest';
import { TEAM_THEMES, getTeamOptions, getTeamTheme, DEFAULT_TEAM_ID } from './teams';
import { NEUTRAL_THEME_ID } from './neutral';

describe('teams', () => {
  describe('TEAM_THEMES', () => {
    it('should contain all 32 NFL teams plus neutral', () => {
      const teamCount = Object.keys(TEAM_THEMES).length;
      expect(teamCount).toBe(33); // 32 teams + neutral
    });

    it('should include neutral theme', () => {
      expect(TEAM_THEMES[NEUTRAL_THEME_ID]).toBeDefined();
      expect(TEAM_THEMES[NEUTRAL_THEME_ID].name).toBe('No Preference');
    });

    it('should have all required properties for each theme', () => {
      Object.entries(TEAM_THEMES).forEach(([id, theme]) => {
        expect(theme.name, `${id} should have name`).toBeDefined();
        expect(theme.primary, `${id} should have primary`).toBeDefined();
        expect(theme.secondary, `${id} should have secondary`).toBeDefined();
        expect(theme.background, `${id} should have background`).toBeDefined();
        expect(theme.backgroundAlt, `${id} should have backgroundAlt`).toBeDefined();
        expect(theme.text, `${id} should have text`).toBeDefined();
        expect(theme.textMuted, `${id} should have textMuted`).toBeDefined();
      });
    });

    it('should have valid hex colors', () => {
      const hexPattern = /^#[0-9a-fA-F]{6}$/;

      Object.entries(TEAM_THEMES).forEach(([id, theme]) => {
        expect(theme.primary, `${id}.primary should be valid hex`).toMatch(hexPattern);
        expect(theme.secondary, `${id}.secondary should be valid hex`).toMatch(hexPattern);
        expect(theme.background, `${id}.background should be valid hex`).toMatch(hexPattern);
        expect(theme.backgroundAlt, `${id}.backgroundAlt should be valid hex`).toMatch(hexPattern);
        expect(theme.text, `${id}.text should be valid hex`).toMatch(hexPattern);
        expect(theme.textMuted, `${id}.textMuted should be valid hex`).toMatch(hexPattern);
      });
    });

    it('should include specific teams', () => {
      expect(TEAM_THEMES.seahawks).toBeDefined();
      expect(TEAM_THEMES.patriots).toBeDefined();
      expect(TEAM_THEMES.chiefs).toBeDefined();
      expect(TEAM_THEMES.eagles).toBeDefined();
      expect(TEAM_THEMES['49ers']).toBeDefined();
    });
  });

  describe('getTeamOptions', () => {
    it('should return all teams including neutral', () => {
      const options = getTeamOptions();
      expect(options.length).toBe(33);
    });

    it('should return teams sorted by name', () => {
      const options = getTeamOptions();
      const names = options.map((o) => o.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
    });

    it('should return objects with id and name', () => {
      const options = getTeamOptions();
      options.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(typeof option.id).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });

    it('should include neutral option', () => {
      const options = getTeamOptions();
      const neutral = options.find((o) => o.id === NEUTRAL_THEME_ID);
      expect(neutral).toBeDefined();
      expect(neutral!.name).toBe('No Preference');
    });
  });

  describe('getTeamTheme', () => {
    it('should return theme for valid team ID', () => {
      const theme = getTeamTheme('seahawks');
      expect(theme).toBeDefined();
      expect(theme!.name).toBe('Seattle Seahawks');
    });

    it('should return theme for neutral ID', () => {
      const theme = getTeamTheme(NEUTRAL_THEME_ID);
      expect(theme).toBeDefined();
      expect(theme!.name).toBe('No Preference');
    });

    it('should be case-insensitive', () => {
      const theme1 = getTeamTheme('Seahawks');
      const theme2 = getTeamTheme('SEAHAWKS');
      const theme3 = getTeamTheme('seahawks');

      expect(theme1).toBeDefined();
      expect(theme2).toBeDefined();
      expect(theme3).toBeDefined();
      expect(theme1).toEqual(theme2);
      expect(theme2).toEqual(theme3);
    });

    it('should return undefined for invalid team ID', () => {
      const theme = getTeamTheme('invalid-team');
      expect(theme).toBeUndefined();
    });
  });

  describe('DEFAULT_TEAM_ID', () => {
    it('should be seahawks theme', () => {
      expect(DEFAULT_TEAM_ID).toBe('seahawks');
    });

    it('should be a valid theme ID', () => {
      const theme = getTeamTheme(DEFAULT_TEAM_ID);
      expect(theme).toBeDefined();
    });
  });
});
