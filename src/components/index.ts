// Components index
// Re-export all components and provide window bindings

export * from './helpers';
export * from './PredictionsForm';
export * from './Participants';
export * from './ResultsForm';
export * from './AdminPanel';
export * from './AllPredictions';

import { getState } from '../state/store';
import { renderPredictionsForm, updateProgressBar } from './PredictionsForm';
import { renderParticipants, exposeParticipantFunctions } from './Participants';
import { renderResultsForm, exposeResultsFunctions } from './ResultsForm';
import { renderAdminControls, exposeAdminFunctions } from './AdminPanel';
import { renderAllPredictions } from './AllPredictions';

// Toggle state for collapsible sections
let gameStatusCollapsed = false;
let participantsCollapsed = true;
let testScoringCollapsed = true;
let recalculateScoresCollapsed = true;

/**
 * Toggle answers visibility in leaderboard.
 */
function toggleAnswers(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;

  const toggleBtn = element.previousElementSibling as HTMLElement;
  const toggleText = toggleBtn?.querySelector('.toggle-text');

  if (element.classList.contains('active')) {
    element.classList.remove('active');
    if (toggleText) toggleText.textContent = 'Show answers ▼';
  } else {
    element.classList.add('active');
    if (toggleText) toggleText.textContent = 'Hide answers ▲';
  }
}

/**
 * Toggle game status visibility.
 */
function toggleGameStatus(): void {
  const content = document.getElementById('gameStatusContent');
  const icon = document.getElementById('gameStatusToggleIcon');
  gameStatusCollapsed = !gameStatusCollapsed;

  if (content && icon) {
    content.style.display = gameStatusCollapsed ? 'none' : 'block';
    icon.textContent = gameStatusCollapsed ? '▶' : '▼';
  }
}

/**
 * Toggle participants visibility.
 */
function toggleParticipants(): void {
  const content = document.getElementById('participantsContent');
  const icon = document.getElementById('participantsToggleIcon');
  participantsCollapsed = !participantsCollapsed;

  if (content && icon) {
    content.style.display = participantsCollapsed ? 'none' : 'block';
    icon.textContent = participantsCollapsed ? '▶' : '▼';
    if (!participantsCollapsed) {
      renderParticipants();
    }
  }
}

/**
 * Toggle test scoring visibility.
 */
function toggleTestScoring(): void {
  const content = document.getElementById('testScoringContent');
  const icon = document.getElementById('testScoringToggleIcon');
  testScoringCollapsed = !testScoringCollapsed;

  if (content && icon) {
    content.style.display = testScoringCollapsed ? 'none' : 'block';
    icon.textContent = testScoringCollapsed ? '▶' : '▼';
  }
}

/**
 * Toggle recalculate scores visibility.
 */
function toggleRecalculateScores(): void {
  const content = document.getElementById('recalculateScoresContent');
  const icon = document.getElementById('recalculateScoresToggleIcon');
  recalculateScoresCollapsed = !recalculateScoresCollapsed;

  if (content && icon) {
    content.style.display = recalculateScoresCollapsed ? 'none' : 'block';
    icon.textContent = recalculateScoresCollapsed ? '▶' : '▼';
  }
}

/**
 * Render league name in header.
 */
function renderLeagueName(): void {
  const { currentLeague } = getState();

  const container = document.getElementById('leagueNameHeader');
  if (!container || !currentLeague) return;

  const nameSpan = container.querySelector('.league-name-header');
  if (nameSpan) {
    nameSpan.textContent = currentLeague.name;
    container.classList.remove('hidden');
  }
}

// Window type declarations
declare global {
  interface Window {
    // Toggle functions
    toggleAnswers: typeof toggleAnswers;
    toggleGameStatus: typeof toggleGameStatus;
    toggleParticipants: typeof toggleParticipants;
    toggleTestScoring: typeof toggleTestScoring;
    toggleRecalculateScores: typeof toggleRecalculateScores;

    // Render functions
    renderPredictionsForm: typeof renderPredictionsForm;
    renderParticipants: typeof renderParticipants;
    renderResultsForm: typeof renderResultsForm;
    renderAdminControls: typeof renderAdminControls;
    renderAllPredictions: typeof renderAllPredictions;
    renderLeagueName: typeof renderLeagueName;
    updateProgressBar: typeof updateProgressBar;
  }
}

/**
 * Expose all component functions to window for legacy HTML.
 */
export function exposeComponentsToWindow(): void {
  // Toggle functions
  window.toggleAnswers = toggleAnswers;
  window.toggleGameStatus = toggleGameStatus;
  window.toggleParticipants = toggleParticipants;
  window.toggleTestScoring = toggleTestScoring;
  window.toggleRecalculateScores = toggleRecalculateScores;

  // Render functions
  window.renderPredictionsForm = renderPredictionsForm;
  window.renderParticipants = renderParticipants;
  window.renderResultsForm = renderResultsForm;
  window.renderAdminControls = renderAdminControls;
  window.renderAllPredictions = renderAllPredictions;
  window.renderLeagueName = renderLeagueName;
  window.updateProgressBar = updateProgressBar;

  // Expose sub-module functions
  exposeParticipantFunctions();
  exposeResultsFunctions();
  exposeAdminFunctions();

  console.log('Components exposed to window');
}
