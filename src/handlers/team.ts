// Team handlers
// Handle team name creation — pure functions with explicit parameters

import { validateTeamName } from '../services/validation';

/**
 * Create a new team (prediction entry) for a user in a league.
 * Returns success status and any error message.
 */
export async function handleTeamNameSubmit(
  teamName: string
): Promise<{ success: boolean; error?: string }> {
  // Validate team name
  const validation = validateTeamName(teamName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Note: leagueId and userId are set by the calling component via savePrediction.
  // This handler is a thin wrapper for basic validation.
  // The full save with league context happens in the component.
  return { success: true };
}
