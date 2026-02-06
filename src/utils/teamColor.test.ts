import { describe, expect, it } from 'vitest';

import { getUserColor } from './teamColor';

describe('getUserColor', () => {
  it('should return a valid hex color', () => {
    const color = getUserColor('user-123');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should return the same color for the same userId', () => {
    const userId = 'user-abc-def';
    const color1 = getUserColor(userId);
    const color2 = getUserColor(userId);
    expect(color1).toBe(color2);
  });

  it('should return different colors for different userIds', () => {
    const color1 = getUserColor('user-1');
    const color2 = getUserColor('user-2');
    const color3 = getUserColor('user-3');

    // While it's possible (but unlikely) that two different users get the same color,
    // three different users should have at least 2 different colors
    const uniqueColors = new Set([color1, color2, color3]);
    expect(uniqueColors.size).toBeGreaterThan(1);
  });

  it('should handle empty string', () => {
    const color = getUserColor('');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should handle long userIds', () => {
    const longUserId = 'a'.repeat(1000);
    const color = getUserColor(longUserId);
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should handle special characters in userId', () => {
    const color = getUserColor('user-!@#$%^&*()');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
