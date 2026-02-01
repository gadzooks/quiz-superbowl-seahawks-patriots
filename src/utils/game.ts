// Game utility functions for path-based routing and game configuration
//
// URL structure:
//   /:gameId              - Game home (create/join league)
//   /:gameId/:leagueSlug  - Specific league within a game
//
// Examples:
//   /lx                   - Super Bowl LX home
//   /lx/smith-family      - Smith Family league in Super Bowl LX

import { getGameConfig, isValidGameId, DEFAULT_GAME_ID, type GameConfig } from '../config/games';

/**
 * Parse game ID and league slug from the URL path.
 *
 * Returns { gameId, leagueSlug } where leagueSlug may be null.
 */
export function parseUrlPath(pathname: string = window.location.pathname): {
  gameId: string;
  leagueSlug: string | null;
} {
  // Remove leading/trailing slashes and split
  const parts = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean);

  // No path segments - use default game
  if (parts.length === 0) {
    return { gameId: DEFAULT_GAME_ID, leagueSlug: null };
  }

  // First segment should be game ID
  const potentialGameId = parts[0].toLowerCase();

  if (isValidGameId(potentialGameId)) {
    return {
      gameId: potentialGameId,
      leagueSlug: parts[1] || null,
    };
  }

  // First segment isn't a valid game ID
  // Could be a legacy URL with just league slug, or invalid path
  // Fall back to default game, treat first segment as league slug
  return {
    gameId: DEFAULT_GAME_ID,
    leagueSlug: parts[0] || null,
  };
}

/**
 * Get the current game ID from URL.
 */
export function getCurrentGameId(): string {
  return parseUrlPath().gameId;
}

/**
 * Get the current league slug from URL.
 */
export function getCurrentLeagueSlug(): string | null {
  return parseUrlPath().leagueSlug;
}

/**
 * Get the current game configuration based on URL path.
 */
export function getCurrentGameConfig(): GameConfig {
  const gameId = getCurrentGameId();
  const config = getGameConfig(gameId);

  if (!config) {
    const defaultConfig = getGameConfig(DEFAULT_GAME_ID);
    if (!defaultConfig) {
      throw new Error(`Default game config not found for: ${DEFAULT_GAME_ID}`);
    }
    return defaultConfig;
  }

  return config;
}

/**
 * Build a URL path for a game, optionally with a league.
 */
export function buildGamePath(gameId: string, leagueSlug?: string): string {
  if (leagueSlug) {
    return `/${gameId}/${leagueSlug}`;
  }
  return `/${gameId}`;
}

/**
 * Build a full URL for a game/league.
 */
export function buildGameUrl(gameId: string, leagueSlug?: string): string {
  const path = buildGamePath(gameId, leagueSlug);
  return `${window.location.origin}${path}`;
}

/**
 * Navigate to a game/league path without full page reload.
 */
export function navigateToGame(gameId: string, leagueSlug?: string): void {
  const path = buildGamePath(gameId, leagueSlug);
  window.history.pushState({}, '', path);
}

/**
 * Update the URL to include the league slug (after league is created/joined).
 */
export function updateUrlWithLeague(leagueSlug: string): void {
  const { gameId } = parseUrlPath();
  const path = buildGamePath(gameId, leagueSlug);
  window.history.replaceState({}, '', path);
}
