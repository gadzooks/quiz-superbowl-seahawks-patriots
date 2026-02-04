// PredictionsForm.ts

// Predictions Form Component
// Renders the user's prediction form

import { getState } from '../state/store';

import { isAnswerCorrect, formatSlugForDisplay, countAnsweredQuestions } from './helpers';

/**
 * Render the predictions form.
 */
export function renderPredictionsForm(): void {
  const { currentLeague, currentUserId, allPredictions, questions } = getState();

  console.log('renderPredictionsForm called, questions count:', questions.length);

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

  if (currentLeague.isOpen) {
    html += `<div class="alert alert-info mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Your answers are saved automatically as you select them.</span>
    </div>`;
  }

  questions.forEach((q, index) => {
    const userAnswer = userPrediction?.predictions?.[q.questionId];
    const correctAnswer = currentLeague.actualResults?.[q.questionId];
    const hasCorrectAnswer =
      correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '';

    const isCorrect = hasCorrectAnswer && isAnswerCorrect(q, userAnswer, correctAnswer);

    html += `<div class="question-card">`;
    html += `<label>
      <span class="question-number">Question ${index + 1}</span><br>
      <span class="question-text">${q.label}</span>
      ${
        q.points > 0
          ? `<span class="question-points-badge">${q.points} pts</span>`
          : '<span class="question-tiebreaker-badge">Tiebreaker</span>'
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
            <input type="radio" name="prediction-${q.questionId}" value="${value}" ${checked} ${!currentLeague.isOpen ? 'disabled' : ''}>
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
      html += `<input type="number" name="prediction-${q.questionId}" value="${value}" min="0" ${!currentLeague.isOpen ? 'disabled' : ''} placeholder="Enter number" class="${inputClass}">`;
    }

    // Show correct answer indicator when submissions are closed and results exist
    if (showCorrectAnswers && hasCorrectAnswer) {
      const displayCorrectAnswer = formatSlugForDisplay(String(correctAnswer));
      const indicatorClass = isCorrect ? 'correct' : 'incorrect';
      const indicatorIcon = isCorrect ? '\u2713' : '\u2717';
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
  // Radio buttons use 'change' event (fires on click)
  const radioInputs = form.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  radioInputs.forEach((input) => {
    input.addEventListener('change', () => {
      // Extract questionId from input name (e.g., "prediction-mvp" -> "mvp")
      const questionId = input.name.replace('prediction-', '');
      void handleAutoSave(questionId);
    });
  });

  // Number inputs use 'input' event (fires on every keystroke, debounced in handleAutoSave)
  const numberInputs = form.querySelectorAll<HTMLInputElement>('input[type="number"]');
  numberInputs.forEach((input) => {
    input.addEventListener('input', () => {
      // Extract questionId from input name
      const questionId = input.name.replace('prediction-', '');
      void handleAutoSave(questionId);
    });
  });
}

/**
 * Handle auto-save on input change.
 */
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let lastChangedQuestionId: string | null = null;

async function handleAutoSave(questionId?: string): Promise<void> {
  const { currentLeague, currentUserId, allPredictions, questions } = getState();

  // Track which question was changed
  if (questionId) {
    lastChangedQuestionId = questionId;
  }

  // Always update progress bar on change
  updateProgressBar();

  if (!currentLeague?.isOpen) return;

  // Debounce to avoid too many saves
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

  autoSaveTimeout = setTimeout(() => {
    void (async () => {
      const form = document.getElementById('predictionsForm') as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);
      const predictions: Record<string, string | number> = {};

      questions.forEach((q) => {
        const value = formData.get(`prediction-${q.questionId}`);
        if (value !== null && value !== '') {
          if (q.type === 'number') {
            predictions[q.questionId] = parseInt(String(value)) || 0;
          } else {
            predictions[q.questionId] = String(value);
          }
        }
      });

      // Find user's prediction
      const userPrediction = allPredictions.find((p) => p.userId === currentUserId);

      if (userPrediction) {
        try {
          // Import db dynamically to avoid circular dependency
          const { savePrediction } = await import('../db/queries');

          await savePrediction({
            id: userPrediction.id,
            leagueId: currentLeague.id,
            userId: currentUserId,
            teamName: userPrediction.teamName,
            predictions,
            isManager: userPrediction.isManager,
            actualResults: currentLeague.actualResults,
            questions,
          });

          // Show saved indicator next to the question that was changed
          if (lastChangedQuestionId) {
            showSavedIndicator(lastChangedQuestionId);
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
          console.error('Auto-save error:', error);
        }
      }
    })();
  }, 1200);
}

/**
 * Update the progress bar in the header.
 */
export function updateProgressBar(): void {
  const { currentUserId, allPredictions, questions } = getState();

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

/**
 * Show a small saved indicator next to a specific question.
 */
function showSavedIndicator(questionId: string): void {
  // Find the input element for this question
  const input = document.querySelector(`[name="prediction-${questionId}"]`) as HTMLElement | null;
  if (!input) return;

  // Find the parent question card
  const questionCard = input.closest('.question-card') as HTMLElement | null;
  if (!questionCard) return;

  // Remove any existing saved indicator
  const existing = questionCard.querySelector('.saved-indicator');
  if (existing) existing.remove();

  // Create and add saved indicator
  const indicator = document.createElement('span');
  indicator.className = 'saved-indicator';
  indicator.innerHTML = '✓ Saved';
  indicator.style.cssText = `
    color: var(--color-primary);
    font-size: 0.875rem;
    margin-left: 8px;
    opacity: 1;
    transition: opacity 0.3s ease-out;
  `;

  // Add to the label element
  const label = questionCard.querySelector('label');
  if (label) {
    label.appendChild(indicator);

    // Fade out and remove after 2 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }, 2000);
  }
}
