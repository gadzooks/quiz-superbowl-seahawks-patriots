import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserId } from './user';

describe('utils/user', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getUserId', () => {
    it('should generate a new user ID if none exists', () => {
      const userId = getUserId();

      expect(userId).toMatch(/^user-[a-z0-9]+-\d+$/);
      expect(localStorage.getItem('userId')).toBe(userId);
    });

    it('should return existing user ID from localStorage', () => {
      const existingUserId = 'user-abc123-1234567890';
      localStorage.setItem('userId', existingUserId);

      const userId = getUserId();

      expect(userId).toBe(existingUserId);
    });

    it('should generate consistent format', () => {
      const userId1 = getUserId();
      localStorage.clear();
      const userId2 = getUserId();

      expect(userId1).toMatch(/^user-[a-z0-9]+-\d+$/);
      expect(userId2).toMatch(/^user-[a-z0-9]+-\d+$/);
      expect(userId1).not.toBe(userId2);
    });

    it('should persist across multiple calls', () => {
      const firstCall = getUserId();
      const secondCall = getUserId();
      const thirdCall = getUserId();

      expect(firstCall).toBe(secondCall);
      expect(secondCall).toBe(thirdCall);
    });
  });
});
