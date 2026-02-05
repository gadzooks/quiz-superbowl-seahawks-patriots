// League handlers
// Handle league creation and management

import { createLeague, leagueExists, seedGame } from '../db/queries';
import { validateLeagueName, toLeagueSlug } from '../services/validation';
import { getCurrentGameId, getCurrentGameConfig } from '../utils/game';
import { getUserId } from '../utils/user';

/**
 * Handle league creation form submission.
 * Returns the created league slug or null if creation failed.
 */
export async function handleLeagueCreation(
  leagueName: string
): Promise<{ success: boolean; slug?: string; error?: string }> {
  // Validate league name
  const validation = validateLeagueName(leagueName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const slug = toLeagueSlug(leagueName);
  const gameId = getCurrentGameId();
  const currentUserId = getUserId();
  const gameConfig = getCurrentGameConfig();

  // Ensure game exists in DB (seeds if needed)
  // Note: Questions must be manually seeded via scripts/seed-game.ts before creating leagues
  const gameInstantId = await seedGame({
    gameId: gameConfig.gameId,
    displayName: gameConfig.displayName,
    year: gameConfig.year,
    team1: gameConfig.teams[0],
    team2: gameConfig.teams[1],
  });

  // Check if league already exists
  const exists = await leagueExists(gameId, slug);
  if (exists) {
    return {
      success: false,
      error: 'A league with this name already exists. Please choose a different name.',
    };
  }

  try {
    await createLeague({
      gameInstantId,
      name: leagueName.trim(),
      slug,
      creatorId: currentUserId,
    });

    return { success: true, slug };
  } catch (error) {
    console.error('Error creating league:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create league',
    };
  }
}
