// teamPicker.ts

// Team Picker UI - Shows on first visit to select favorite team

import { getSavedTeamId } from '../theme/apply';

/**
 * Check if user needs to pick a team (first visit).
 * Skip if ?team= is in the URL (recovery/shared device link).
 */
export function needsTeamSelection(): boolean {
  if (getSavedTeamId() !== null) return false;
  if (new URLSearchParams(window.location.search).has('team')) return false;
  return true;
}
