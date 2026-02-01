import { describe, it, expect } from 'vitest';
import { getTeamBackground } from './backgrounds';

describe('backgrounds', () => {
  describe('getTeamBackground', () => {
    it('should return SVG pattern for Seahawks with "12" motif', () => {
      const result = getTeamBackground('seahawks', '#69BE28', '#002244');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('12'); // The "12" text should be in the SVG
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for Cowboys with star motif', () => {
      const result = getTeamBackground('cowboys', '#003594', '#002244');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('polygon'); // Star is made with polygon
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for Patriots with tricorn motif', () => {
      const result = getTeamBackground('patriots', '#002244', '#0a1929');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('path');
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for Packers with "G" motif', () => {
      const result = getTeamBackground('packers', '#203731', '#1a1a1a');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('%3EG%3C'); // The "G" text (URL-encoded)
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for Saints with fleur-de-lis motif', () => {
      const result = getTeamBackground('saints', '#D3BC8D', '#101820');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('path');
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for Chargers with lightning bolt', () => {
      const result = getTeamBackground('chargers', '#0080C6', '#002244');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('polygon'); // Lightning bolt is a polygon
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for 49ers with "49" motif', () => {
      const result = getTeamBackground('fortyniners', '#AA0000', '#1a1a1a');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('49'); // The "49" text
      expect(result).toContain('linear-gradient');
    });

    it('should return SVG pattern for Bengals with tiger stripes', () => {
      const result = getTeamBackground('bengals', '#FB4F14', '#000000');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('line'); // Stripes are lines
      expect(result).toContain('linear-gradient');
    });

    it('should return gradient only for neutral theme', () => {
      const result = getTeamBackground('neutral', '#6366f1', '#0f172a');

      expect(result).not.toContain('data:image/svg+xml');
      expect(result).toContain('linear-gradient');
    });

    it('should return gradient only for unknown teams', () => {
      const result = getTeamBackground('unknown-team', '#ffffff', '#000000');

      expect(result).not.toContain('data:image/svg+xml');
      expect(result).toContain('linear-gradient');
    });

    it('should use team colors in the background', () => {
      const backgroundColor = '#002244';
      const primaryColor = '#69BE28';
      const result = getTeamBackground('seahawks', primaryColor, backgroundColor);

      expect(result).toContain(backgroundColor);
      // Primary color is URL-encoded in the SVG data URL
      expect(result).toContain(encodeURIComponent(primaryColor));
    });

    it('should have patterns for all 32 NFL teams', () => {
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
        'fortyniners',
        'rams',
        'seahawks',
      ];

      for (const team of teams) {
        const result = getTeamBackground(team, '#ffffff', '#000000');
        expect(result).toContain('data:image/svg+xml');
      }
    });
  });
});
