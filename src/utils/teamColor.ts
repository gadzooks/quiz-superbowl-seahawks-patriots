/**
 * Utility for assigning team colors to users in the All Predictions table.
 * Uses deterministic hashing to ensure consistent colors per user.
 */

import { TEAM_THEMES } from '../theme/teams';

/**
 * Get all available team primary colors (excluding neutral theme).
 */
const TEAM_COLORS = Object.values(TEAM_THEMES)
  .filter((theme) => theme.name !== 'Neutral')
  .map((theme) => theme.primary);

/**
 * Simple hash function to convert a string to a number.
 * Uses djb2 algorithm for consistent hashing.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Get a consistent color for a userId.
 * Same userId always returns the same color.
 */
export function getUserColor(userId: string): string {
  const hash = hashString(userId);
  const index = hash % TEAM_COLORS.length;
  return TEAM_COLORS[index];
}
