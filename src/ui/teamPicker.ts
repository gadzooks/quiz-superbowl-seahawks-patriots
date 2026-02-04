// teamPicker.ts

// Team Picker UI - Shows on first visit to select favorite team

import { getSavedTeamId } from '../theme/apply';

/**
 * Check if user needs to pick a team (first visit).
 */
export function needsTeamSelection(): boolean {
  return getSavedTeamId() === null;
}
