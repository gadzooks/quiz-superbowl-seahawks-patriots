// Results handlers
// Handle game results submission (admin/manager only)

import { parseResultsFromForm } from '../services/validation';
import { saveResults, clearResults } from '../db/queries';
import { getState } from '../state/store';
import { getCurrentGameConfig } from '../utils/game';
import { getQuestionsForGame } from '../questions';
import { showToast } from '../ui/toast';

/**
 * Handle results form submission.
 * Saves results and recalculates all scores.
 */
export async function handleResultsSubmit(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const { currentLeague, allPredictions } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  if (!currentLeague) {
    return { success: false, error: 'No league selected' };
  }

  // Parse results from form
  const results = parseResultsFromForm(formData, questions);

  try {
    await saveResults(currentLeague.id, results, allPredictions);
    return { success: true };
  } catch (error) {
    console.error('Error saving results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save results',
    };
  }
}

/**
 * Handle results form submission from DOM event.
 */
export async function handleResultsForm(e: Event): Promise<void> {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  const result = await handleResultsSubmit(formData);

  if (result.success) {
    showToast('Results saved and scores calculated!');
  } else if (result.error) {
    showToast(result.error);
  }
}

/**
 * Handle auto-save on results input change.
 * Similar to prediction auto-save but for results.
 */
let resultsAutoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

export async function handleResultsAutoSave(form: HTMLFormElement): Promise<void> {
  // Cancel previous pending save
  if (resultsAutoSaveTimeout) {
    clearTimeout(resultsAutoSaveTimeout);
  }

  // Debounce: wait 800ms after last change before saving
  resultsAutoSaveTimeout = setTimeout(async () => {
    const formData = new FormData(form);
    const result = await handleResultsSubmit(formData);

    if (result.success) {
      console.log('Results auto-saved');
    }
  }, 800);
}

/**
 * Initialize auto-save listeners on a results form.
 */
export function initResultsAutoSave(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="number"]');

  inputs.forEach(input => {
    input.addEventListener('change', () => handleResultsAutoSave(form));
  });
}

/**
 * Clear a single result field.
 */
export async function clearResult(questionId: string): Promise<void> {
  const { currentLeague, allPredictions } = getState();

  if (!currentLeague?.actualResults) {
    return;
  }

  // Get current results and remove this one
  const updatedResults = { ...currentLeague.actualResults };
  delete updatedResults[questionId];

  try {
    await saveResults(currentLeague.id, updatedResults, allPredictions);
    showToast('Result cleared');
  } catch (error) {
    console.error('Error clearing result:', error);
    showToast('Error clearing result');
  }
}

/**
 * Clear all results.
 */
export async function handleClearAllResults(): Promise<boolean> {
  const { currentLeague, allPredictions } = getState();

  if (!currentLeague) {
    showToast('No league selected');
    return false;
  }

  const confirmMessage =
    '⚠️ Clear All Results?\n\nThis will remove all entered results and reset all scores to 0.\n\nThis cannot be undone.';

  if (!confirm(confirmMessage)) {
    return false;
  }

  try {
    await clearResults(currentLeague.id, allPredictions);
    showToast('All results cleared');
    return true;
  } catch (error) {
    console.error('Error clearing results:', error);
    showToast('Error clearing results');
    return false;
  }
}
