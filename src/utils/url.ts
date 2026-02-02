/**
 * URL utilities for the Super Bowl Prediction app.
 *
 * URL structure:
 *   /:gameId              - Game home (create/join league)
 *   /:gameId/:leagueSlug  - Specific league within a game
 *
 * Query parameters:
 *   ?isAdmin=true         - Grant admin access
 */

import { parseUrlPath, buildGamePath, getCurrentGameId } from './game';

/**
 * Get URL parameters as an object.
 */
export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Get the league slug from URL path.
 * Falls back to localStorage if not in URL (for backward compatibility).
 */
export function getLeagueSlug(): string | null {
  const { leagueSlug } = parseUrlPath();

  if (leagueSlug) {
    return leagueSlug;
  }

  // Legacy: check URL param
  const params = getUrlParams();
  const legacySlug = params.get('league');
  if (legacySlug) {
    return legacySlug;
  }

  // Legacy: check localStorage
  return localStorage.getItem('currentLeagueSlug');
}

/**
 * Check if admin mode is enabled via URL param.
 */
export function isAdminOverride(): boolean {
  return getUrlParams().get('isAdmin') === 'true';
}

/**
 * Save the current league slug to localStorage and update URL.
 * Call this only after confirming the league exists in the database.
 */
export function saveLeagueSlug(slug: string): void {
  localStorage.setItem('currentLeagueSlug', slug);

  // Update URL to path-based format (without reload)
  const { leagueSlug } = parseUrlPath();
  if (!leagueSlug || leagueSlug !== slug) {
    const gameId = getCurrentGameId();
    const newPath = buildGamePath(gameId, slug);

    // Preserve query params (like isAdmin)
    const queryString = window.location.search;
    window.history.replaceState({}, '', newPath + queryString);
  }
}

/**
 * Clear the saved league slug from localStorage.
 */
export function clearLeagueSlug(): void {
  localStorage.removeItem('currentLeagueSlug');
}

/**
 * Generate a full URL for a league.
 */
export function getLeagueUrl(slug: string): string {
  const gameId = getCurrentGameId();
  const path = buildGamePath(gameId, slug);
  return `${window.location.origin}${path}`;
}

/**
 * Convert a league name to a URL-friendly slug.
 */
export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
