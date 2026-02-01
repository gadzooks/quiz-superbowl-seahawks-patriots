// League handlers
// Handle league creation and management

import { validateLeagueName, toLeagueSlug } from '../services/validation';
import {
  createLeague,
  leagueExists,
  updateLeagueStatus,
  updateShowAllPredictions,
} from '../db/queries';
import { getState } from '../state/store';
import { getCurrentGameId } from '../utils/game';
import { showToast } from '../ui/toast';

/**
 * Handle league creation form submission.
 * Returns the created league slug or null if creation failed.
 */
export async function handleLeagueCreation(
  leagueName: string
): Promise<{ success: boolean; slug?: string; error?: string }> {
  // Validate league name
  const validation = validateLeagueName(leagueName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const slug = toLeagueSlug(leagueName);
  const gameId = getCurrentGameId();
  const { currentUserId } = getState();

  // Check if league already exists
  const exists = await leagueExists(gameId, slug);
  if (exists) {
    return {
      success: false,
      error: 'A league with this name already exists. Please choose a different name.',
    };
  }

  try {
    await createLeague({
      gameId,
      name: leagueName.trim(),
      slug,
      creatorId: currentUserId,
    });

    return { success: true, slug };
  } catch (error) {
    console.error('Error creating league:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create league',
    };
  }
}

/**
 * Handle form submission for league creation.
 * This wraps handleLeagueCreation with form handling logic.
 */
export async function handleLeagueForm(e: Event): Promise<void> {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const input = form.querySelector<HTMLInputElement>('#leagueName');

  if (!input) {
    console.error('League name input not found');
    return;
  }

  const leagueName = input.value.trim();
  const result = await handleLeagueCreation(leagueName);

  if (result.success && result.slug) {
    // Update URL and reload
    const newUrl = `${window.location.pathname}?league=${result.slug}`;
    window.history.pushState({}, '', newUrl);
    window.location.reload();
  } else if (result.error) {
    alert(result.error);
  }
}

/**
 * Toggle league submissions open/closed.
 * Returns true if the operation was successful.
 */
export async function setSubmissions(isOpen: boolean): Promise<boolean> {
  const { currentLeague } = getState();

  if (!currentLeague) {
    console.error('No current league');
    return false;
  }

  // Already in this state
  if (currentLeague.isOpen === isOpen) {
    return true;
  }

  // Confirm the action
  const message = isOpen
    ? '🔓 Open Submissions?\n\nUsers will be able to submit and edit their predictions again.\n\nAre you sure you want to continue?'
    : '⚠️ Close Submissions?\n\nUsers will no longer be able to submit or edit their predictions.\n\nAre you sure you want to continue?';

  if (!confirm(message)) {
    return false;
  }

  try {
    await updateLeagueStatus(currentLeague.id, isOpen);
    return true;
  } catch (error) {
    console.error('Error updating submissions status:', error);
    showToast('Error updating submissions status');
    return false;
  }
}

/**
 * Toggle show all predictions setting.
 * Returns true if the operation was successful.
 */
export async function setShowPredictions(show: boolean): Promise<boolean> {
  const { currentLeague } = getState();

  if (!currentLeague) {
    console.error('No current league');
    return false;
  }

  const currentValue = currentLeague.showAllPredictions === true;

  // Already in this state
  if (currentValue === show) {
    return true;
  }

  // Confirm the action
  const message = show
    ? "⚠️ Show All Answers?\n\nAll users will be able to see everyone's predictions and answers!\n\nThis is typically done after submissions are closed.\n\nAre you sure you want to continue?"
    : '🔒 Hide All Answers?\n\nUsers will no longer be able to see the predictions table or individual answers.\n\nAre you sure you want to continue?';

  if (!confirm(message)) {
    return false;
  }

  try {
    await updateShowAllPredictions(currentLeague.id, show);
    return true;
  } catch (error) {
    console.error('Error updating show predictions:', error);
    showToast('Error updating predictions visibility');
    return false;
  }
}

/**
 * Copy league URL to clipboard.
 */
export async function copyLeagueUrl(): Promise<void> {
  const { currentLeague } = getState();

  if (!currentLeague) {
    showToast('No league to share');
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}?league=${currentLeague.slug}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!');
  } catch (error) {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Link copied to clipboard!');
  }
}
