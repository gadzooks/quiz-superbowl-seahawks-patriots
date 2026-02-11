// teamPicker.ts

// Team Picker UI - Shows on first visit to select favorite team

import { isGameReadOnly } from '../config/games';
import { getSavedTeamId } from '../theme/apply';

/**
 * Check if user needs to pick a team (first visit).
 * Skip if ?team= is in the URL (recovery/shared device link).
 * Skip for completed games (guests don't need to pick a team).
 */
export function needsTeamSelection(gameId?: string): boolean {
  // Skip team picker for completed games
  if (gameId && isGameReadOnly(gameId)) {
    return false;
  }

  if (getSavedTeamId() !== null) return false;
  if (new URLSearchParams(window.location.search).has('team')) return false;
  return true;
}
