// Game configuration for multi-year Super Bowl support
// Each Super Bowl (LX, LXI, etc.) has its own configuration

export interface GameConfig {
  gameId: string; // e.g., "lx", "lxi" - used in URLs and database
  displayName: string; // e.g., "Super Bowl LX" - shown in UI
  year: number; // e.g., 2026
  teams: [string, string]; // Display names e.g., ["Seahawks", "Patriots"]
  kickoffTime?: string; // ISO 8601 string for game kickoff (e.g., '2026-02-08T15:30:00-08:00')
}

/** Minutes before kickoff that submissions auto-close */
const SUBMISSION_CLOSE_MINUTES = 20;

/**
 * Get the submission deadline for a game (20 minutes before kickoff).
 * Returns null if no kickoff time is configured.
 */
export function getSubmissionDeadline(config: GameConfig): Date | null {
  if (!config.kickoffTime) return null;
  const kickoff = new Date(config.kickoffTime);
  return new Date(kickoff.getTime() - SUBMISSION_CLOSE_MINUTES * 60 * 1000);
}

/**
 * Get team theme IDs from a game config.
 * Derives IDs by lowercasing team names.
 */
export function getTeamIds(config: GameConfig): [string, string] {
  return [config.teams[0].toLowerCase(), config.teams[1].toLowerCase()];
}

/**
 * Registry of all Super Bowl games.
 * Add new entries here for each year.
 */
export const GAMES: Record<string, GameConfig> = {
  lx: {
    gameId: 'lx',
    displayName: 'Super Bowl LX',
    year: 2026,
    teams: ['Seahawks', 'Patriots'],
    kickoffTime: '2026-02-08T15:30:00-08:00',
  },
  // Future games can be added here:
  // lxi: {
  //   gameId: 'lxi',
  //   displayName: 'Super Bowl LXI',
  //   year: 2027,
  //   teams: ['TBD', 'TBD'],
  // },
};

/**
 * Default game ID when none can be determined from URL.
 */
export const DEFAULT_GAME_ID = 'lx';

/**
 * Get a game configuration by ID.
 * Returns undefined if the game doesn't exist.
 */
export function getGameConfig(gameId: string): GameConfig | undefined {
  return GAMES[gameId.toLowerCase()];
}

/**
 * Check if a game ID is valid.
 */
export function isValidGameId(gameId: string): boolean {
  return gameId.toLowerCase() in GAMES;
}

/**
 * Get all available game IDs.
 */
export function getAvailableGameIds(): string[] {
  return Object.keys(GAMES);
}
