// Results handlers
// Handle game results submission (admin/manager only)

import { getDb } from '../app/init';
import { saveResults, clearResults } from '../db/queries';
import { parseResultsFromForm } from '../services/validation';
import { getState } from '../state/store';
import { showToast } from '../ui/toast';

/**
 * Handle results form submission.
 * Saves results and recalculates all scores.
 */
export async function handleResultsSubmit(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const { currentLeague, allPredictions, questions } = getState();

  if (!currentLeague) {
    return { success: false, error: 'No league selected' };
  }

  // Parse results from form
  const results = parseResultsFromForm(formData, questions);

  try {
    await saveResults(currentLeague.id, results, allPredictions, questions);
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
  resultsAutoSaveTimeout = setTimeout(() => {
    void (async () => {
      const formData = new FormData(form);
      const result = await handleResultsSubmit(formData);

      if (result.success) {
        console.log('Results auto-saved');
      }
    })();
  }, 800);
}

/**
 * Initialize auto-save listeners on a results form.
 */
export function initResultsAutoSave(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll<HTMLInputElement>(
    'input[type="radio"], input[type="number"]'
  );

  inputs.forEach((input) => {
    input.addEventListener('change', () => void handleResultsAutoSave(form));
  });
}

/**
 * Clear a single result field.
 */
export async function clearResult(questionId: string): Promise<void> {
  const { currentLeague, allPredictions, questions } = getState();

  if (!currentLeague?.actualResults) {
    return;
  }

  // Get current results and remove this one
  const updatedResults = { ...currentLeague.actualResults };
  delete updatedResults[questionId];

  try {
    await saveResults(currentLeague.id, updatedResults, allPredictions, questions);
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

/**
 * Recalculate scores for all participants.
 */
export async function recalculateAllScores(): Promise<void> {
  const { currentLeague, allPredictions, questions } = getState();
  const statusDiv = document.getElementById('recalculateScoresStatus');
  const btn = document.getElementById('recalculateScoresBtn') as HTMLButtonElement | null;

  // Check if results exist
  if (!currentLeague?.actualResults || Object.keys(currentLeague.actualResults).length === 0) {
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="alert alert-warning"><span>⚠️ No results entered yet. Please enter actual results first.</span></div>';
    }
    return;
  }

  const db = getDb();
  if (!db) {
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="alert alert-error"><span>✗ Database not available</span></div>';
    }
    return;
  }

  try {
    // Disable button and show processing status
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Recalculating...';
    }
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="status-text-muted">Recalculating scores for all participants...</div>';
    }

    // Import calculateScore dynamically to avoid circular deps
    const { calculateScore } = await import('../scoring/calculate');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any[] = [];
    const actualResults = currentLeague.actualResults;

    // Recalculate scores for all predictions
    allPredictions.forEach((pred) => {
      if (pred.predictions) {
        const score = calculateScore(pred.predictions, actualResults, questions);
        const predTotalPoints = Number(pred.predictions?.totalPoints) || 0;
        const actualTotalPoints = Number(actualResults.totalPoints) || 0;
        const tiebreakDiff = Math.abs(predTotalPoints - actualTotalPoints);

        updates.push(
          db.tx.predictions[pred.id].update({
            score,
            tiebreakDiff,
          })
        );
      }
    });

    // Execute all updates
    await db.transact(updates);

    // Show success status
    if (statusDiv) {
      statusDiv.innerHTML = `<div class="alert alert-success"><span>✓ Successfully recalculated scores for ${updates.length} participant(s)</span></div>`;
    }

    // Update leaderboard immediately
    const { renderLeaderboard } = await import('../ui/leaderboard');
    renderLeaderboard();

    // Re-enable button
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Recalculate All Scores';
    }

    // Hide status after 3 seconds
    setTimeout(() => {
      if (statusDiv) statusDiv.innerHTML = '';
    }, 3000);
  } catch (error) {
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="alert alert-error"><span>✗ Error recalculating scores</span></div>';
    }
    console.error('Recalculate error:', error);

    // Re-enable button
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Recalculate All Scores';
    }
  }
}
