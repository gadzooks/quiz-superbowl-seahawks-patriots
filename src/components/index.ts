// Components index
// Re-export all components and provide window bindings

export * from './helpers';
export * from './PredictionsForm';
export * from './Participants';
export * from './ResultsForm';
export * from './AdminPanel';
export * from './AllPredictions';

import { getState } from '../state/store';

import { renderAdminControls, exposeAdminFunctions } from './AdminPanel';
import { renderAllPredictions } from './AllPredictions';
import { renderParticipants, exposeParticipantFunctions } from './Participants';
import { renderPredictionsForm, updateProgressBar } from './PredictionsForm';
import { renderResultsForm, exposeResultsFunctions } from './ResultsForm';

// Toggle state for collapsible sections
let gameStatusCollapsed = false;
let participantsCollapsed = true;
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
    content.classList.toggle('hidden', gameStatusCollapsed);
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
    content.classList.toggle('hidden', participantsCollapsed);
    icon.textContent = participantsCollapsed ? '▶' : '▼';
    if (!participantsCollapsed) {
      renderParticipants();
    }
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
    content.classList.toggle('hidden', recalculateScoresCollapsed);
    icon.textContent = recalculateScoresCollapsed ? '▶' : '▼';
  }
}

/**
 * Render league name and team name in header.
 */
function renderLeagueName(): void {
  const { currentLeague, currentTeamName } = getState();

  const container = document.getElementById('leagueNameHeader');
  if (!container || !currentLeague) return;

  // Set team name if available
  const teamNameSpan = document.getElementById('teamNameDisplay');
  if (teamNameSpan) {
    if (currentTeamName) {
      teamNameSpan.textContent = currentTeamName;
      teamNameSpan.style.display = 'inline';
    } else {
      teamNameSpan.style.display = 'none';
    }
  }

  // Set league name
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
