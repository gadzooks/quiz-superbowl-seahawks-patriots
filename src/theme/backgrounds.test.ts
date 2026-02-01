import { describe, it, expect } from 'vitest';
import { getTeamBackground, LOGO_SIZE } from './backgrounds';

describe('backgrounds', () => {
  describe('getTeamBackground', () => {
    it('should return logo URL for Seahawks', () => {
      const result = getTeamBackground('seahawks', '#69BE28', '#002244');

      expect(result).toContain('url(');
      expect(result).toContain('espncdn.com');
      expect(result).toContain('sea.png');
      expect(result).toContain('linear-gradient');
    });

    it('should return logo URL for Cowboys', () => {
      const result = getTeamBackground('cowboys', '#003594', '#002244');

      expect(result).toContain('url(');
      expect(result).toContain('dal.png');
    });

    it('should return logo URL for Patriots', () => {
      const result = getTeamBackground('patriots', '#002244', '#0a1929');

      expect(result).toContain('url(');
      expect(result).toContain('ne.png');
    });

    it('should return NFL shield for neutral theme', () => {
      const result = getTeamBackground('neutral', '#6366f1', '#0f172a');

      expect(result).toContain('url(');
      expect(result).toContain('nfl.png');
      expect(result).toContain('linear-gradient');
    });

    it('should return NFL shield for unknown teams', () => {
      const result = getTeamBackground('unknown-team', '#ffffff', '#000000');

      expect(result).toContain('url(');
      expect(result).toContain('nfl.png');
    });

    it('should include background color in gradient overlay', () => {
      const backgroundColor = '#002244';
      const result = getTeamBackground('seahawks', '#69BE28', backgroundColor);

      expect(result).toContain(backgroundColor);
    });

    it('should work for all 32 NFL teams', () => {
      const teams = [
        // AFC East
        'bills',
        'dolphins',
        'jets',
        'patriots',
        // AFC North
        'ravens',
        'bengals',
        'browns',
        'steelers',
        // AFC South
        'texans',
        'colts',
        'jaguars',
        'titans',
        // AFC West
        'broncos',
        'chiefs',
        'raiders',
        'chargers',
        // NFC East
        'cowboys',
        'giants',
        'eagles',
        'commanders',
        // NFC North
        'bears',
        'lions',
        'packers',
        'vikings',
        // NFC South
        'falcons',
        'panthers',
        'saints',
        'buccaneers',
        // NFC West
        'cardinals',
        '49ers',
        'rams',
        'seahawks',
      ];

      for (const team of teams) {
        const result = getTeamBackground(team, '#ffffff', '#000000');
        expect(result).toContain('url(');
        expect(result).toContain('espncdn.com');
      }
    });
  });

  describe('constants', () => {
    it('should export LOGO_SIZE', () => {
      expect(LOGO_SIZE).toBe(120);
    });
  });
});
