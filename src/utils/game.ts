// Game utility functions for path-based routing and game configuration
//
// URL structure:
//   /superbowl/:gameId              - Game home (create/join league)
//   /superbowl/:gameId/:leagueSlug  - Specific league within a game
//   /weekly/:leagueSlug             - Weekly quiz league home
//   /weekly/:leagueSlug/:quizDate   - A specific week's quiz for a league
//
// Examples:
//   /superbowl/lx                   - Super Bowl LX home
//   /superbowl/lx/smith-family      - Smith Family league in Super Bowl LX
//   /weekly/smith-family/2026-08-26 - Smith Family quiz for the week of Aug 26

import {
  getGameConfig,
  isValidGameId,
  isValidQuizDate,
  buildWeeklyGameId,
  DEFAULT_GAME_ID,
  type EventType,
  type GameConfig,
} from '../config/games';

/**
 * Base path for the Super Bowl product (set in vite.config.ts)
 */
const BASE_PATH = '/superbowl';

/**
 * Path prefix for the weekly quiz product.
 */
const WEEKLY_PATH = '/weekly';

export interface ParsedRoute {
  eventType: EventType;
  /** Game ID; null only for weekly routes with no quiz date in the URL */
  gameId: string | null;
  leagueSlug: string | null;
  /** YYYY-MM-DD quiz date for weekly routes */
  quizDate: string | null;
}

/**
 * Parse the event type, game ID, league slug, and quiz date from the URL path.
 */
export function parseUrlPath(pathname: string = window.location.pathname): ParsedRoute {
  // Weekly product: /weekly/:leagueSlug/:quizDate?
  if (pathname === WEEKLY_PATH || pathname.startsWith(`${WEEKLY_PATH}/`)) {
    const parts = pathname
      .slice(WEEKLY_PATH.length)
      .replace(/^\/|\/$/g, '')
      .split('/')
      .filter(Boolean);

    const leagueSlug = parts[0]?.toLowerCase() || null;
    const quizDate = parts[1] && isValidQuizDate(parts[1]) ? parts[1] : null;

    return {
      eventType: 'weekly',
      gameId: quizDate ? buildWeeklyGameId(quizDate) : null,
      leagueSlug,
      quizDate,
    };
  }

  // Super Bowl product: /superbowl/:gameId/:leagueSlug?
  let path = pathname;
  if (path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length);
  }

  // Remove leading/trailing slashes and split
  const parts = path
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean);

  // No path segments - use default game
  if (parts.length === 0) {
    return { eventType: 'superbowl', gameId: DEFAULT_GAME_ID, leagueSlug: null, quizDate: null };
  }

  // First segment should be game ID
  const potentialGameId = parts[0].toLowerCase();

  if (isValidGameId(potentialGameId)) {
    return {
      eventType: 'superbowl',
      gameId: potentialGameId,
      leagueSlug: parts[1] || null,
      quizDate: null,
    };
  }

  // First segment isn't a valid game ID
  // Could be a legacy URL with just league slug, or invalid path
  // Fall back to default game, treat first segment as league slug
  return {
    eventType: 'superbowl',
    gameId: DEFAULT_GAME_ID,
    leagueSlug: parts[0] || null,
    quizDate: null,
  };
}

/**
 * Get the current game ID from URL.
 * Falls back to the default game when the URL has no game (e.g., a weekly
 * route without a quiz date).
 */
export function getCurrentGameId(): string {
  return parseUrlPath().gameId ?? DEFAULT_GAME_ID;
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
 * Includes the base path (/superbowl).
 */
export function buildGamePath(gameId: string, leagueSlug?: string): string {
  if (leagueSlug) {
    return `${BASE_PATH}/${gameId}/${leagueSlug}`;
  }
  return `${BASE_PATH}/${gameId}`;
}

/**
 * Build a full URL for a game/league.
 */
export function buildGameUrl(gameId: string, leagueSlug?: string): string {
  const path = buildGamePath(gameId, leagueSlug);
  return `${window.location.origin}${path}`;
}

/**
 * Build a URL path for a weekly quiz league, optionally for a specific week.
 * URL shape: /weekly/:leagueSlug/:quizDate
 */
export function buildWeeklyPath(leagueSlug: string, quizDate?: string): string {
  if (quizDate) {
    return `${WEEKLY_PATH}/${leagueSlug}/${quizDate}`;
  }
  return `${WEEKLY_PATH}/${leagueSlug}`;
}

/**
 * Build a full URL for a weekly quiz league/week.
 */
export function buildWeeklyUrl(leagueSlug: string, quizDate?: string): string {
  return `${window.location.origin}${buildWeeklyPath(leagueSlug, quizDate)}`;
}
