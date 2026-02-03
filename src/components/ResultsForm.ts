// Results Form Component
// Renders the admin results entry form

import { saveResults } from '../db/queries';
import { getQuestionsForGame } from '../questions';
import { getState } from '../state/store';
import { showToast } from '../ui/toast';
import { getCurrentGameConfig } from '../utils/game';

/**
 * Render the results form for entering actual game results.
 */
export function renderResultsForm(): void {
  const { currentLeague } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  const form = document.getElementById('resultsForm') as HTMLFormElement | null;
  if (!form || !currentLeague) return;

  let html = '';

  questions.forEach((q, index) => {
    const hasValue =
      currentLeague.actualResults?.[q.id] !== undefined &&
      currentLeague.actualResults?.[q.id] !== null &&
      currentLeague.actualResults?.[q.id] !== '';

    html += `<div class="question-card results-question-card">`;
    html += `<div class="results-question-header">
      <label>
        <span class="results-question-number">Question ${index + 1}</span><br>
        <span>${q.label}</span>
        <span class="results-points-badge">${q.points} pts</span>
      </label>
      ${hasValue ? `<button type="button" onclick="clearResult('${q.id}')" class="results-clear-btn">✕ Clear</button>` : ''}
    </div>`;

    if (q.type === 'radio' && q.options) {
      q.options.forEach((option) => {
        const value = option.toLowerCase().replace(/\s+/g, '-');
        const checked = currentLeague.actualResults?.[q.id] === value ? 'checked' : '';
        const selectedClass = checked ? 'results-radio-selected' : 'results-radio-unselected';
        html += `
          <label class="radio-option ${selectedClass}">
            <input type="radio" name="result-${q.id}" value="${value}" ${checked}>
            <span>${option}</span>
          </label>
        `;
      });
    } else {
      const value = currentLeague.actualResults?.[q.id] ?? '';
      html += `<input type="number" name="result-${q.id}" value="${value}" min="0" placeholder="Enter number" class="results-number-input">`;
    }

    html += `</div>`;
  });

  html += `
    <div class="results-info-banner">
      <span class="results-info-icon">ℹ️</span>
      <span class="results-info-text">Results are saved automatically as you enter them.</span>
    </div>
  `;

  form.innerHTML = html;

  // Add auto-save event listeners
  attachResultsAutoSaveListeners(form);
}

/**
 * Attach auto-save listeners to results form inputs.
 */
function attachResultsAutoSaveListeners(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll<HTMLInputElement>(
    'input[type="radio"], input[type="number"]'
  );
  inputs.forEach((input) => {
    input.addEventListener('change', () => void handleResultsAutoSave());
  });
}

/**
 * Handle auto-save on results input change.
 */
let resultsAutoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

async function handleResultsAutoSave(): Promise<void> {
  const { currentLeague, allPredictions } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  // Show saving status
  const statusDiv = document.getElementById('resultsAutoSaveStatus');
  if (statusDiv) {
    statusDiv.textContent = 'Saving...';
    statusDiv.style.color = 'var(--color-text-muted)';
  }

  // Debounce
  if (resultsAutoSaveTimeout) clearTimeout(resultsAutoSaveTimeout);

  resultsAutoSaveTimeout = setTimeout(() => {
    void (async () => {
      const form = document.getElementById('resultsForm') as HTMLFormElement;
      if (!form || !currentLeague) return;

      const formData = new FormData(form);
      const actualResults: Record<string, string | number> = {};

      questions.forEach((q) => {
        const value = formData.get(`result-${q.id}`);
        if (value !== null && value !== '') {
          if (q.type === 'number') {
            actualResults[q.id] = parseInt(String(value)) || 0;
          } else {
            actualResults[q.id] = String(value);
          }
        }
      });

      try {
        await saveResults(currentLeague.id, actualResults, allPredictions);

        if (statusDiv) {
          statusDiv.textContent = '✓ Saved & scores updated';
          statusDiv.style.color = 'var(--color-primary)';
          setTimeout(() => {
            statusDiv.textContent = '';
          }, 2000);
        }

        // Update leaderboard
        const { renderLeaderboard } = await import('../ui/leaderboard');
        renderLeaderboard();
      } catch (error) {
        if (statusDiv) {
          statusDiv.textContent = '✗ Error saving';
          statusDiv.style.color = 'var(--color-error)';
        }
        console.error('Results auto-save error:', error);
      }
    })();
  }, 500);
}

/**
 * Clear a specific result field.
 */
export async function clearResult(questionId: string): Promise<void> {
  const { currentLeague, allPredictions } = getState();

  if (!currentLeague?.actualResults) return;

  // Get current results and remove this one
  const updatedResults = { ...currentLeague.actualResults };
  delete updatedResults[questionId];

  try {
    await saveResults(currentLeague.id, updatedResults, allPredictions);

    const statusDiv = document.getElementById('resultsAutoSaveStatus');
    if (statusDiv) {
      statusDiv.textContent = '✓ Result cleared and scores updated';
      statusDiv.style.color = 'var(--color-primary)';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    }

    // Re-render
    renderResultsForm();

    const { renderLeaderboard } = await import('../ui/leaderboard');
    renderLeaderboard();
  } catch (error) {
    console.error('Error clearing result:', error);
    showToast('Error clearing result');
  }
}

/**
 * Recalculate all scores.
 */
export async function recalculateAllScores(): Promise<void> {
  const { currentLeague, allPredictions } = getState();
  const statusDiv = document.getElementById('recalculateScoresStatus');
  const btn = document.getElementById('recalculateScoresBtn') as HTMLButtonElement;

  if (!currentLeague?.actualResults || Object.keys(currentLeague.actualResults).length === 0) {
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="alert alert-warning"><span>⚠️ No results entered yet. Please enter actual results first.</span></div>';
    }
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Recalculating...';
    }
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="status-text-muted">Recalculating scores for all participants...</div>';
    }

    const { recalculateAllScores: recalculate } = await import('../db/queries');
    const count = await recalculate(allPredictions, currentLeague.actualResults);

    if (statusDiv) {
      statusDiv.innerHTML = `<div class="alert alert-success"><span>✓ Successfully recalculated scores for ${count} participant(s)</span></div>`;
    }

    const { renderLeaderboard } = await import('../ui/leaderboard');
    renderLeaderboard();

    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Recalculate All Scores';
    }

    setTimeout(() => {
      if (statusDiv) statusDiv.innerHTML = '';
    }, 3000);
  } catch (error) {
    if (statusDiv) {
      statusDiv.innerHTML =
        '<div class="alert alert-error"><span>✗ Error recalculating scores</span></div>';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Recalculate All Scores';
    }
    console.error('Recalculate error:', error);
  }
}

// Expose to window
declare global {
  interface Window {
    clearResult: typeof clearResult;
    recalculateAllScores: typeof recalculateAllScores;
  }
}

export function exposeResultsFunctions(): void {
  window.clearResult = clearResult;
  window.recalculateAllScores = recalculateAllScores;
}
