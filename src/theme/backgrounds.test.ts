import { describe, it, expect } from 'vitest';
import { getTeamBackground } from './backgrounds';

describe('backgrounds', () => {
  describe('getTeamBackground', () => {
    it('should return SVG pattern for Seahawks', () => {
      const result = getTeamBackground('seahawks', '#69BE28', '#002244');

      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('12'); // The "12" text should be in the SVG
      expect(result).toContain('linear-gradient');
    });

    it('should return gradient only for non-Seahawks teams', () => {
      const result = getTeamBackground('patriots', '#002244', '#0a1929');

      expect(result).not.toContain('data:image/svg+xml');
      expect(result).toContain('linear-gradient');
    });

    it('should return gradient only for neutral theme', () => {
      const result = getTeamBackground('neutral', '#6366f1', '#0f172a');

      expect(result).not.toContain('data:image/svg+xml');
      expect(result).toContain('linear-gradient');
    });

    it('should use team colors in the gradient', () => {
      const backgroundColor = '#002244';
      const result = getTeamBackground('broncos', '#FB4F14', backgroundColor);

      expect(result).toContain(backgroundColor);
    });
  });
});
