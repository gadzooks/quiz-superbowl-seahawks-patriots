import { describe, it, expect, vi, beforeEach } from 'vitest';

import { seedGame, leagueExists, createLeague } from '../db/queries';
import { getCurrentGameId, getCurrentGameConfig } from '../utils/game';
import { getUserId } from '../utils/user';

import { handleLeagueCreation } from './league';

// Mock dependencies
vi.mock('../db/queries');
vi.mock('../utils/game');
vi.mock('../utils/user');

describe('handleLeagueCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(getUserId).mockReturnValue('user-123');
    vi.mocked(getCurrentGameId).mockReturnValue('lx');
    vi.mocked(getCurrentGameConfig).mockReturnValue({
      gameId: 'lx',
      displayName: 'Super Bowl LX',
      year: 2026,
      teams: ['seahawks', 'patriots'],
    });
  });

  describe('successful league creation', () => {
    it('should create league and return slug', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(false);
      vi.mocked(createLeague).mockResolvedValue('league-id-123');

      const result = await handleLeagueCreation('Good Vibes');

      expect(result).toEqual({
        success: true,
        slug: 'good-vibes',
      });
    });

    it('should trim whitespace from league name', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(false);
      vi.mocked(createLeague).mockResolvedValue('league-id-123');

      await handleLeagueCreation('  Good Vibes  ');

      expect(createLeague).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Good Vibes',
          slug: 'good-vibes',
        })
      );
    });

    it('should seed game before creating league', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(false);
      vi.mocked(createLeague).mockResolvedValue('league-id-123');

      await handleLeagueCreation('Good Vibes');

      expect(seedGame).toHaveBeenCalledWith({
        gameId: 'lx',
        displayName: 'Super Bowl LX',
        year: 2026,
        team1: 'seahawks',
        team2: 'patriots',
      });
    });

    it('should pass game instant ID to createLeague', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id-456');
      vi.mocked(leagueExists).mockResolvedValue(false);
      vi.mocked(createLeague).mockResolvedValue('league-id-123');

      await handleLeagueCreation('Good Vibes');

      expect(createLeague).toHaveBeenCalledWith(
        expect.objectContaining({
          gameInstantId: 'game-instant-id-456',
        })
      );
    });
  });

  describe('validation errors', () => {
    it('should reject empty league name', async () => {
      const result = await handleLeagueCreation('');

      expect(result).toEqual({
        success: false,
        error: 'League name is required',
      });
      expect(createLeague).not.toHaveBeenCalled();
    });

    it('should reject league name with only whitespace', async () => {
      const result = await handleLeagueCreation('   ');

      expect(result).toEqual({
        success: false,
        error: 'League name is required',
      });
      expect(createLeague).not.toHaveBeenCalled();
    });

    it('should reject league name that is too long', async () => {
      const longName = 'a'.repeat(51);
      const result = await handleLeagueCreation(longName);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at most 50');
      expect(createLeague).not.toHaveBeenCalled();
    });
  });

  describe('duplicate league handling', () => {
    it('should return error if league already exists', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(true);

      const result = await handleLeagueCreation('Good Vibes');

      expect(result).toEqual({
        success: false,
        error: 'A league with this name already exists. Please choose a different name.',
      });
      expect(createLeague).not.toHaveBeenCalled();
    });

    it('should check for existing league with correct gameId and slug', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(true);

      await handleLeagueCreation('Good Vibes');

      expect(leagueExists).toHaveBeenCalledWith('lx', 'good-vibes');
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(false);
      vi.mocked(createLeague).mockRejectedValue(new Error('Database connection failed'));

      const result = await handleLeagueCreation('Good Vibes');

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(seedGame).mockResolvedValue('game-instant-id');
      vi.mocked(leagueExists).mockResolvedValue(false);
      vi.mocked(createLeague).mockRejectedValue('Something went wrong');

      const result = await handleLeagueCreation('Good Vibes');

      expect(result).toEqual({
        success: false,
        error: 'Failed to create league',
      });
    });

    it('should return error if game config is missing', async () => {
      vi.mocked(getCurrentGameConfig).mockReturnValue(null as never);

      const result = await handleLeagueCreation('Good Vibes');

      expect(result).toEqual({
        success: false,
        error: 'Game not configured',
      });
      expect(createLeague).not.toHaveBeenCalled();
    });
  });
});
