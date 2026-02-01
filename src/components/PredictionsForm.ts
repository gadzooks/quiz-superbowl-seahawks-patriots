// Predictions Form Component
// Renders the user's prediction form

import { getQuestionsForGame } from '../questions';
import { getState } from '../state/store';
import { getCurrentGameConfig } from '../utils/game';

import { isAnswerCorrect, formatSlugForDisplay, countAnsweredQuestions } from './helpers';

/**
 * Render the predictions form.
 */
export function renderPredictionsForm(): void {
  const { currentLeague, currentUserId, allPredictions } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  const predictionsSection = document.getElementById('predictionsSection');
  const statusDiv = document.getElementById('submissionsStatus');
  const form = document.getElementById('predictionsForm') as HTMLFormElement | null;

  if (!predictionsSection || !form || !currentLeague) return;

  predictionsSection.classList.remove('hidden');

  // Show status only when closed
  if (statusDiv) {
    if (currentLeague.isOpen) {
      statusDiv.innerHTML = '';
    } else {
      statusDiv.innerHTML = `
        <div class="closed-banner">
          🔒 Submissions Closed - Your predictions are locked in!
        </div>
      `;
    }
  }

  // Add/remove readonly class
  if (!currentLeague.isOpen) {
    predictionsSection.classList.add('submissions-closed');
  } else {
    predictionsSection.classList.remove('submissions-closed');
  }

  // Get existing predictions
  const userPrediction = allPredictions.find((p) => p.userId === currentUserId);

  // Check if results exist for showing correct answers
  const hasResults =
    currentLeague.actualResults && Object.keys(currentLeague.actualResults).length > 0;
  const showCorrectAnswers = !currentLeague.isOpen && hasResults;

  let html = '';

  questions.forEach((q, index) => {
    const userAnswer = userPrediction?.predictions?.[q.id];
    const correctAnswer = currentLeague.actualResults?.[q.id];
    const hasCorrectAnswer =
      correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '';

    const isCorrect = hasCorrectAnswer && isAnswerCorrect(q, userAnswer, correctAnswer);

    html += `<div class="question-card">`;
    html += `<label>
      <span style="color: var(--color-primary); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Question ${index + 1}</span><br>
      <span style="color: var(--color-text);">${q.label}</span>
      ${
        q.points > 0
          ? `<span style="display: inline-block; background: var(--color-primary); color: var(--color-background); padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 700; margin-left: 10px;">${q.points} pts</span>`
          : '<span style="display: inline-block; background: var(--color-text-muted); color: var(--color-background); padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-left: 10px;">Tiebreaker</span>'
      }
    </label>`;

    if (q.type === 'radio' && q.options) {
      q.options.forEach((option) => {
        const value = option.toLowerCase().replace(/\s+/g, '-');
        const checked = userAnswer === value ? 'checked' : '';
        // Apply correct/incorrect styling when showing results
        let answerClass = '';
        if (showCorrectAnswers && hasCorrectAnswer && checked) {
          answerClass = isCorrect ? 'user-answer-correct' : 'user-answer-incorrect';
        }
        html += `
          <label class="radio-option ${answerClass}">
            <input type="radio" name="prediction-${q.id}" value="${value}" ${checked} ${!currentLeague.isOpen ? 'disabled' : ''}>
            <span>${option}</span>
          </label>
        `;
      });
    } else {
      const value = userAnswer || '';
      // Apply correct/incorrect styling for number inputs
      let inputClass = '';
      if (showCorrectAnswers && hasCorrectAnswer && value !== '') {
        inputClass = isCorrect ? 'user-answer-correct' : 'user-answer-incorrect';
      }
      html += `<input type="number" name="prediction-${q.id}" value="${value}" min="0" ${!currentLeague.isOpen ? 'disabled' : ''} placeholder="Enter number" class="${inputClass}">`;
    }

    // Show correct answer indicator when submissions are closed and results exist
    if (showCorrectAnswers && hasCorrectAnswer) {
      const displayCorrectAnswer = formatSlugForDisplay(String(correctAnswer));
      const indicatorClass = isCorrect ? 'correct' : 'incorrect';
      const indicatorIcon = isCorrect ? '✓' : '✗';
      const indicatorText = isCorrect ? 'Correct!' : `Correct answer: ${displayCorrectAnswer}`;

      html += `
        <div class="correct-answer-indicator ${indicatorClass}">
          <span class="indicator-icon">${indicatorIcon}</span>
          <span>${indicatorText}</span>
        </div>
      `;
    }

    html += `</div>`;
  });

  if (currentLeague.isOpen) {
    html += `<div class="alert alert-info mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Your answers are saved automatically as you select them.</span>
    </div>`;
  }

  form.innerHTML = html;

  // Add auto-save event listeners
  if (currentLeague.isOpen) {
    attachAutoSaveListeners(form);
  }

  // Update progress bar
  updateProgressBar();
}

/**
 * Attach auto-save listeners to form inputs.
 */
function attachAutoSaveListeners(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll<HTMLInputElement>(
    'input[type="radio"], input[type="number"]'
  );
  inputs.forEach((input) => {
    input.addEventListener('change', () => void handleAutoSave());
  });
}

/**
 * Handle auto-save on input change.
 */
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

async function handleAutoSave(): Promise<void> {
  const { currentLeague, currentUserId, allPredictions } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  // Always update progress bar on change
  updateProgressBar();

  if (!currentLeague?.isOpen) return;

  // Show saving status
  const statusDiv = document.getElementById('autoSaveStatus');
  if (statusDiv) {
    statusDiv.textContent = 'Saving...';
    statusDiv.style.color = 'var(--color-text-muted)';
  }

  // Debounce to avoid too many saves
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

  autoSaveTimeout = setTimeout(() => {
    void (async () => {
      const form = document.getElementById('predictionsForm') as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);
      const predictions: Record<string, string | number> = {};

      questions.forEach((q) => {
        const value = formData.get(`prediction-${q.id}`);
        if (value !== null && value !== '') {
          if (q.type === 'number') {
            predictions[q.id] = parseInt(String(value)) || 0;
          } else {
            predictions[q.id] = String(value);
          }
        }
      });

      // Find user's prediction
      const userPrediction = allPredictions.find((p) => p.userId === currentUserId);

      if (userPrediction) {
        try {
          // Import db dynamically to avoid circular dependency
          const { savePrediction } = await import('../db/queries');
          const { getCurrentGameId } = await import('../utils/game');

          await savePrediction({
            id: userPrediction.id,
            gameId: getCurrentGameId(),
            leagueId: currentLeague.id,
            userId: currentUserId,
            teamName: userPrediction.teamName,
            predictions,
            isManager: userPrediction.isManager,
            actualResults: currentLeague.actualResults,
          });

          // Show saved status
          if (statusDiv) {
            statusDiv.textContent = '✓ Saved';
            statusDiv.style.color = 'var(--color-primary)';
            setTimeout(() => {
              statusDiv.textContent = '';
            }, 2000);
          }

          // Update participants list for immediate visual feedback
          const { renderParticipants } = await import('./Participants');
          renderParticipants();

          // Check for completion celebration
          const answeredCount = Object.keys(predictions).length;
          const { hasShownCompletionCelebration } = getState();

          if (answeredCount === questions.length && !hasShownCompletionCelebration) {
            const { setHasShownCompletionCelebration } = await import('../state/store');
            const { showCompletionCelebration } = await import('../ui/celebration');

            setHasShownCompletionCelebration(true);
            localStorage.setItem(`completionCelebration-${currentLeague.id}`, 'true');
            showCompletionCelebration();
          }
        } catch (error) {
          if (statusDiv) {
            statusDiv.textContent = '✗ Error saving';
            statusDiv.style.color = '#dc2626';
          }
          console.error('Auto-save error:', error);
        }
      }
    })();
  }, 500);
}

/**
 * Update the progress bar in the header.
 */
export function updateProgressBar(): void {
  const { currentUserId, allPredictions } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  const userPrediction = allPredictions.find((p) => p.userId === currentUserId);
  const answered = countAnsweredQuestions(userPrediction?.predictions, questions);
  const percentage = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressBarContainer');

  if (progressBar && progressContainer) {
    progressBar.style.width = `${percentage}%`;
    progressContainer.classList.toggle('hidden', percentage === 0);
  }
}
