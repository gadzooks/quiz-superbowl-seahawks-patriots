/**
 * Team name modal functions.
 * Handles the modal dialog for editing team names.
 */

import { db } from '../db/client';
import { getState } from '../state/store';

import { showToast } from './toast';

// Track which prediction is being edited (for admin editing)
let editingPredictionId: string | null = null;
let editingPredictionName: string | null = null;

/**
 * Open team name edit modal.
 * Admin can edit any team by passing predictionId.
 */
export function openTeamNameModal(
  predictionId: string | null = null,
  teamName: string | null = null
): void {
  const modal = document.getElementById('teamNameModal') as HTMLDialogElement | null;
  const input = document.getElementById('teamNameEditInput') as HTMLInputElement | null;
  const title = document.getElementById('teamNameModalTitle');

  if (!modal || !input) return;

  // If predictionId provided (admin editing another user), store it
  if (predictionId && teamName) {
    editingPredictionId = predictionId;
    editingPredictionName = teamName;
    input.value = teamName;
    if (title) title.textContent = `Edit Team: ${teamName}`;
  } else {
    // Editing own team name
    editingPredictionId = null;
    editingPredictionName = null;
    const { currentTeamName } = getState();
    input.value = currentTeamName || '';
    if (title) title.textContent = 'Edit Team Name';
  }

  updateTeamNameCharCount();

  // Set up form submit handler
  const form = document.getElementById('teamNameEditForm');
  if (form) {
    form.onsubmit = handleTeamNameChange;
  }

  modal.showModal();
}

/**
 * Close team name edit modal.
 */
export function closeTeamNameModal(): void {
  const modal = document.getElementById('teamNameModal') as HTMLDialogElement | null;
  if (modal) {
    modal.close();
  }
  // Reset editing state
  editingPredictionId = null;
  editingPredictionName = null;
}

/**
 * Update character count display.
 */
export function updateTeamNameCharCount(): void {
  const input = document.getElementById('teamNameEditInput') as HTMLInputElement | null;
  const countDiv = document.getElementById('teamNameCharCount');

  if (!input || !countDiv) return;

  const length = input.value.length;
  countDiv.textContent = `${length}/15 characters (min 3)`;

  // Update styling based on validity
  countDiv.classList.remove('char-count-valid', 'char-count-warning', 'char-count-error');

  if (length < 3) {
    countDiv.classList.add('char-count-error');
  } else if (length > 12) {
    countDiv.classList.add('char-count-warning');
  } else {
    countDiv.classList.add('char-count-valid');
  }
}

/**
 * Handle team name change submission.
 */
async function handleTeamNameChange(e: Event): Promise<void> {
  e.preventDefault();

  const input = document.getElementById('teamNameEditInput') as HTMLInputElement | null;
  if (!input) return;

  const newName = input.value.trim();
  const { currentTeamName, allPredictions, currentUserId } = getState();

  // Validate length
  if (newName.length < 3 || newName.length > 15) {
    showToast('Team name must be 3-15 characters');
    return;
  }

  // Determine if we're editing own team or another user's (admin)
  const isAdminEdit = editingPredictionId !== null;
  const oldName = isAdminEdit ? editingPredictionName : currentTeamName;

  // Check if same as current name
  if (oldName && newName.toLowerCase() === oldName.toLowerCase()) {
    closeTeamNameModal();
    return;
  }

  // Check if team name already exists (case-insensitive, excluding the team being edited)
  const excludeId = isAdminEdit
    ? editingPredictionId
    : allPredictions.find((p) => p.userId === currentUserId)?.id;

  const teamNameExists = allPredictions.some(
    (p) => p.id !== excludeId && p.teamName.toLowerCase() === newName.toLowerCase()
  );

  if (teamNameExists) {
    showToast('This team name is already taken');
    return;
  }

  // Get the prediction to update
  let predictionToUpdate;
  if (isAdminEdit) {
    predictionToUpdate = allPredictions.find((p) => p.id === editingPredictionId);
  } else {
    predictionToUpdate = allPredictions.find((p) => p.userId === currentUserId);
  }

  if (!predictionToUpdate) {
    showToast('Error: Could not find team');
    return;
  }

  try {
    await db.transact([
      db.tx.predictions[predictionToUpdate.id].update({
        teamName: newName,
      }),
    ]);

    // Tab labels are static "Questions" - no need to update dynamically

    closeTeamNameModal();
    showToast('Team name updated!');
  } catch (error) {
    console.error('Error updating team name:', error);
    showToast('Error updating team name');
  }
}

/**
 * Get current editing state (for external use if needed).
 */
export function getEditingState(): { predictionId: string | null; predictionName: string | null } {
  return {
    predictionId: editingPredictionId,
    predictionName: editingPredictionName,
  };
}
