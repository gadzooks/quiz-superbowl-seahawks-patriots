import { describe, it, expect } from 'vitest';

import {
  hexToRgb,
  darkenColor,
  lightenColor,
  calculateDerivedTokens,
  type ThemeTokens,
} from './tokens';

describe('tokens', () => {
  describe('hexToRgb', () => {
    it('should convert hex color to RGB string', () => {
      expect(hexToRgb('#ff0000')).toBe('255, 0, 0');
      expect(hexToRgb('#00ff00')).toBe('0, 255, 0');
      expect(hexToRgb('#0000ff')).toBe('0, 0, 255');
    });

    it('should handle hex without hash', () => {
      expect(hexToRgb('ff0000')).toBe('255, 0, 0');
    });

    it('should handle mixed case hex', () => {
      expect(hexToRgb('#FF00FF')).toBe('255, 0, 255');
      expect(hexToRgb('#aaBBcc')).toBe('170, 187, 204');
    });

    it('should convert theme colors correctly', () => {
      // Indigo (neutral theme primary)
      expect(hexToRgb('#6366f1')).toBe('99, 102, 241');
      // Seahawks green
      expect(hexToRgb('#33f200')).toBe('51, 242, 0');
    });
  });

  describe('darkenColor', () => {
    it('should darken color by percentage', () => {
      // Darken white by 50% -> should be gray (rounding may give 80 instead of 7f)
      const result = darkenColor('#ffffff', 50);
      expect(['#7f7f7f', '#808080']).toContain(result);
    });

    it('should return black when darkening by 100%', () => {
      expect(darkenColor('#ffffff', 100)).toBe('#000000');
    });

    it('should not change color when darkening by 0%', () => {
      expect(darkenColor('#aabbcc', 0)).toBe('#aabbcc');
    });

    it('should darken primary color for hover state', () => {
      const primary = '#6366f1';
      const darkened = darkenColor(primary, 15);
      // Should be darker than original
      expect(darkened).not.toBe(primary);
    });
  });

  describe('lightenColor', () => {
    it('should lighten color by percentage', () => {
      // Lighten black by 50% -> should be gray (rounding may give 80 instead of 7f)
      const result = lightenColor('#000000', 50);
      expect(['#7f7f7f', '#808080']).toContain(result);
    });

    it('should return white when lightening by 100%', () => {
      expect(lightenColor('#000000', 100)).toBe('#ffffff');
    });

    it('should not change color when lightening by 0%', () => {
      expect(lightenColor('#aabbcc', 0)).toBe('#aabbcc');
    });

    it('should lighten background for input background', () => {
      const background = '#0f172a';
      const lightened = lightenColor(background, 8);
      // Should be lighter than original
      expect(lightened).not.toBe(background);
    });
  });

  describe('calculateDerivedTokens', () => {
    const neutralThemeTokens: ThemeTokens = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#0f172a',
      backgroundAlt: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
    };

    it('should calculate inputBg from background', () => {
      const derived = calculateDerivedTokens(neutralThemeTokens);
      expect(derived.inputBg).toBeDefined();
      expect(derived.inputBg).not.toBe(neutralThemeTokens.background);
    });

    it('should calculate inputHover from background', () => {
      const derived = calculateDerivedTokens(neutralThemeTokens);
      expect(derived.inputHover).toBeDefined();
      expect(derived.inputHover).not.toBe(neutralThemeTokens.background);
    });

    it('should calculate primaryHover from primary', () => {
      const derived = calculateDerivedTokens(neutralThemeTokens);
      expect(derived.primaryHover).toBeDefined();
      expect(derived.primaryHover).not.toBe(neutralThemeTokens.primary);
    });

    it('should calculate primaryRgb from primary', () => {
      const derived = calculateDerivedTokens(neutralThemeTokens);
      expect(derived.primaryRgb).toBe('99, 102, 241');
    });

    it('should calculate surface from background', () => {
      const derived = calculateDerivedTokens(neutralThemeTokens);
      expect(derived.surface).toBeDefined();
    });

    it('should calculate border from background', () => {
      const derived = calculateDerivedTokens(neutralThemeTokens);
      expect(derived.border).toBeDefined();
    });

    it('should work with Seahawks theme', () => {
      const seahawksTokens: ThemeTokens = {
        primary: '#33f200',
        secondary: '#00203b',
        background: '#00203b',
        backgroundAlt: '#001a30',
        text: '#ffffff',
        textMuted: '#9da2a3',
      };

      const derived = calculateDerivedTokens(seahawksTokens);
      expect(derived.primaryRgb).toBe('51, 242, 0');
      expect(derived.primaryHover).toBeDefined();
    });
  });
});
