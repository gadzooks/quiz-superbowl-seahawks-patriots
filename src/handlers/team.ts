// Team handlers
// Handle team name creation and editing

import { validateTeamNameFull } from '../services/validation';
import { savePrediction, updateTeamName, deletePrediction, toggleManager } from '../db/queries';
import { getState, setCurrentTeamName } from '../state/store';
import { getCurrentGameId } from '../utils/game';
import { showToast } from '../ui/toast';

/**
 * Create a new team (prediction entry) for the current user.
 * Returns success status and any error message.
 */
export async function handleTeamNameSubmit(
  teamName: string
): Promise<{ success: boolean; error?: string }> {
  const { currentLeague, currentUserId, allPredictions } = getState();
  const gameId = getCurrentGameId();

  if (!currentLeague) {
    return { success: false, error: 'No league selected' };
  }

  // Validate team name
  const validation = validateTeamNameFull(teamName, allPredictions);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    await savePrediction({
      gameId,
      leagueId: currentLeague.id,
      userId: currentUserId,
      teamName: teamName.trim(),
      predictions: {},
      isManager: false,
    });

    setCurrentTeamName(teamName.trim());
    return { success: true };
  } catch (error) {
    console.error('Error creating team:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create team',
    };
  }
}

/**
 * Handle team name form submission.
 */
export async function handleTeamNameForm(
  e: Event
): Promise<{ success: boolean; teamName?: string }> {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const input = form.querySelector<HTMLInputElement>('#teamNameInput');

  if (!input) {
    console.error('Team name input not found');
    return { success: false };
  }

  const teamName = input.value.trim();
  const result = await handleTeamNameSubmit(teamName);

  if (result.success) {
    return { success: true, teamName };
  } else if (result.error) {
    alert(result.error);
  }

  return { success: false };
}

/**
 * Change an existing team name.
 * Can be used by the team owner or an admin.
 *
 * @param predictionId - ID of the prediction to update (if admin editing another user)
 * @param newName - The new team name
 * @param isAdminEdit - Whether this is an admin editing another user's team
 */
export async function handleTeamNameChange(
  predictionId: string | null,
  newName: string,
  isAdminEdit: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const { currentUserId, allPredictions, currentTeamName } = getState();

  // Find the prediction to update
  let prediction;
  let oldName: string;

  if (predictionId && isAdminEdit) {
    prediction = allPredictions.find((p) => p.id === predictionId);
    oldName = prediction?.teamName || '';
  } else {
    prediction = allPredictions.find((p) => p.userId === currentUserId);
    oldName = currentTeamName;
  }

  if (!prediction) {
    return { success: false, error: 'Could not find team' };
  }

  // Check if name is the same (case-insensitive)
  if (newName.trim().toLowerCase() === oldName.toLowerCase()) {
    return { success: true }; // No change needed
  }

  // Validate new name
  const validation = validateTeamNameFull(
    newName,
    allPredictions,
    prediction.userId // Exclude this user from uniqueness check
  );

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    await updateTeamName(prediction.id, newName.trim());

    // Update local state if editing own team
    if (!isAdminEdit) {
      setCurrentTeamName(newName.trim());
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating team name:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update team name',
    };
  }
}

/**
 * Handle team name edit form submission from modal.
 */
export async function handleTeamNameEditForm(
  e: Event,
  predictionId: string | null = null
): Promise<void> {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const input = form.querySelector<HTMLInputElement>('#teamNameEditInput');

  if (!input) {
    console.error('Team name edit input not found');
    return;
  }

  const newName = input.value.trim();
  const isAdminEdit = predictionId !== null;
  const result = await handleTeamNameChange(predictionId, newName, isAdminEdit);

  if (result.success) {
    // Close modal
    const modal = document.getElementById('teamNameModal') as HTMLDialogElement;
    modal?.close();
    showToast('Team name updated!');
  } else if (result.error) {
    showToast(result.error);
  }
}

/**
 * Delete a team (prediction).
 * Admin only - with confirmation.
 */
export async function handleDeleteTeam(predictionId: string, teamName: string): Promise<boolean> {
  const confirmMessage = `⚠️ Delete "${teamName}"?\n\nThis will permanently remove this team and all their predictions.\n\nThis cannot be undone.`;

  if (!confirm(confirmMessage)) {
    return false;
  }

  try {
    await deletePrediction(predictionId);
    showToast(`Deleted team "${teamName}"`);
    return true;
  } catch (error) {
    console.error('Error deleting team:', error);
    showToast('Error deleting team');
    return false;
  }
}

/**
 * Toggle manager status for a team.
 * Admin only.
 */
export async function handleToggleManager(
  predictionId: string,
  currentIsManager: boolean
): Promise<boolean> {
  const newStatus = !currentIsManager;
  const action = newStatus ? 'grant manager access to' : 'remove manager access from';

  const prediction = getState().allPredictions.find((p) => p.id === predictionId);
  const teamName = prediction?.teamName || 'this team';

  const confirmMessage = `${newStatus ? '👑' : '🔒'} ${action.charAt(0).toUpperCase() + action.slice(1)} "${teamName}"?\n\nManagers can enter game results but cannot modify other admin settings.`;

  if (!confirm(confirmMessage)) {
    return false;
  }

  try {
    await toggleManager(predictionId, newStatus);
    showToast(`${newStatus ? 'Added' : 'Removed'} manager access for "${teamName}"`);
    return true;
  } catch (error) {
    console.error('Error toggling manager status:', error);
    showToast('Error updating manager status');
    return false;
  }
}
