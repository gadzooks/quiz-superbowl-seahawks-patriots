// Predictions handlers
// Handle prediction form submission

import { savePrediction } from '../db/queries';
import {
  validatePredictions,
  parsePredictionsFromForm,
  getPredictionCompletion,
} from '../services/validation';
import { getState, setHasShownCompletionCelebration } from '../state/store';
import { showCompletionCelebration } from '../ui/celebration';
import { showToast } from '../ui/toast';

/**
 * Handle predictions form submission.
 * Validates and saves predictions to the database.
 */
export async function handlePredictionsSubmit(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const { currentLeague, currentUserId, allPredictions, questions } = getState();

  if (!currentLeague) {
    return { success: false, error: 'No league selected' };
  }

  if (!currentLeague.isOpen) {
    return { success: false, error: 'Submissions are closed' };
  }

  // Find existing prediction
  const existingPrediction = allPredictions.find((p) => p.userId === currentUserId);

  if (!existingPrediction) {
    return { success: false, error: 'Please enter your team name first' };
  }

  // Parse and validate predictions
  const predictions = parsePredictionsFromForm(formData, questions);
  const validation = validatePredictions(questions, predictions);

  // Allow partial saves, but track completion
  const wasComplete = existingPrediction.predictions
    ? getPredictionCompletion(questions, existingPrediction.predictions) === 100
    : false;

  try {
    await savePrediction({
      id: existingPrediction.id,
      leagueId: currentLeague.id,
      userId: currentUserId,
      teamName: existingPrediction.teamName,
      predictions,
      isManager: existingPrediction.isManager,
      actualResults: currentLeague.actualResults,
      questions,
    });

    // Check if just completed all predictions
    const isNowComplete = validation.answeredCount === validation.totalCount;
    const { hasShownCompletionCelebration } = getState();

    if (isNowComplete && !wasComplete && !hasShownCompletionCelebration) {
      // Trigger celebration
      showCompletionCelebration();
      setHasShownCompletionCelebration(true);
      // Persist celebration shown state
      localStorage.setItem(`completionCelebration-${currentLeague.id}`, 'true');
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving predictions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save predictions',
    };
  }
}

/**
 * Handle predictions form submission from DOM event.
 */
export async function handlePredictionsForm(e: Event): Promise<void> {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  const result = await handlePredictionsSubmit(formData);

  if (result.success) {
    showToast('Predictions saved!');
  } else if (result.error) {
    showToast(result.error);
  }
}

/**
 * Handle auto-save on input change.
 * Debounced to avoid too many saves.
 */
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

export function handlePredictionAutoSave(form: HTMLFormElement): void {
  // Cancel previous pending save
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Debounce: wait 500ms after last change before saving
  autoSaveTimeout = setTimeout(() => {
    void (async () => {
      const formData = new FormData(form);
      const result = await handlePredictionsSubmit(formData);

      if (result.success) {
        // Update progress bar
        updateProgressBar(form);
      }
    })();
  }, 500);
}

/**
 * Update the progress bar based on form completion.
 */
function updateProgressBar(form: HTMLFormElement): void {
  const { questions } = getState();
  const formData = new FormData(form);
  const predictions = parsePredictionsFromForm(formData, questions);
  const completion = getPredictionCompletion(questions, predictions);

  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressBarContainer');

  if (progressBar && progressContainer) {
    progressBar.style.width = `${completion}%`;
    progressContainer.classList.toggle('hidden', completion === 0);
  }
}

/**
 * Initialize auto-save listeners on a predictions form.
 */
export function initPredictionAutoSave(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll<HTMLInputElement>(
    'input[type="radio"], input[type="number"]'
  );

  inputs.forEach((input) => {
    input.addEventListener('change', () => handlePredictionAutoSave(form));
  });

  // Initialize progress bar
  updateProgressBar(form);
}
