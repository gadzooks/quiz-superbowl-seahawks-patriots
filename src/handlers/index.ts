// Handlers index
// Re-export all handlers and provide window bindings for legacy code

export * from './league';
export * from './team';
export * from './predictions';
export * from './results';

import {
  handleLeagueForm,
  setSubmissions,
  setShowPredictions,
  copyLeagueUrl,
} from './league';

import {
  handleTeamNameForm,
  handleTeamNameEditForm,
  handleDeleteTeam,
  handleToggleManager,
} from './team';

import {
  handlePredictionsForm,
  initPredictionAutoSave,
} from './predictions';

import {
  handleResultsForm,
  initResultsAutoSave,
  clearResult,
  handleClearAllResults,
  recalculateAllScores,
} from './results';

// Type declaration for window extensions
declare global {
  interface Window {
    // League handlers
    handleLeagueForm: typeof handleLeagueForm;
    setSubmissions: typeof setSubmissions;
    setShowPredictions: typeof setShowPredictions;
    copyLeagueUrl: typeof copyLeagueUrl;

    // Team handlers
    handleTeamNameForm: typeof handleTeamNameForm;
    handleTeamNameEditForm: typeof handleTeamNameEditForm;
    handleDeleteTeam: typeof handleDeleteTeam;
    handleToggleManager: typeof handleToggleManager;
    openTeamNameModal: (predictionId?: string, teamName?: string) => void;
    closeTeamNameModal: () => void;

    // Prediction handlers
    handlePredictionsForm: typeof handlePredictionsForm;
    initPredictionAutoSave: typeof initPredictionAutoSave;

    // Results handlers
    handleResultsForm: typeof handleResultsForm;
    initResultsAutoSave: typeof initResultsAutoSave;
    clearResult: typeof clearResult;
    handleClearAllResults: typeof handleClearAllResults;
    recalculateAllScores: typeof recalculateAllScores;
  }
}

/**
 * Expose handlers to window for use in inline HTML onclick handlers.
 * This bridges the gap during migration from inline JS to modules.
 */
export function exposeHandlersToWindow(): void {
  // League handlers
  window.handleLeagueForm = handleLeagueForm;
  window.setSubmissions = setSubmissions;
  window.setShowPredictions = setShowPredictions;
  window.copyLeagueUrl = copyLeagueUrl;

  // Team handlers
  window.handleTeamNameForm = handleTeamNameForm;
  window.handleTeamNameEditForm = handleTeamNameEditForm;
  window.handleDeleteTeam = handleDeleteTeam;
  window.handleToggleManager = handleToggleManager;

  // Team name modal helpers
  window.openTeamNameModal = (predictionId?: string, teamName?: string) => {
    const modal = document.getElementById('teamNameModal') as HTMLDialogElement;
    const input = document.getElementById('teamNameEditInput') as HTMLInputElement;
    const title = document.getElementById('teamNameModalTitle');
    const form = document.getElementById('teamNameEditForm') as HTMLFormElement;

    if (!modal || !input) return;

    // Store prediction ID for later
    form.dataset.predictionId = predictionId || '';

    if (predictionId && teamName) {
      input.value = teamName;
      if (title) title.textContent = `Edit Team: ${teamName}`;
    } else {
      // Import dynamically to avoid circular dependency
      import('../state/store').then(({ getState }) => {
        const { currentTeamName } = getState();
        input.value = currentTeamName || '';
        if (title) title.textContent = 'Edit Team Name';
      });
    }

    // Setup form handler
    form.onsubmit = (e) => handleTeamNameEditForm(e, form.dataset.predictionId || null);

    modal.showModal();
  };

  window.closeTeamNameModal = () => {
    const modal = document.getElementById('teamNameModal') as HTMLDialogElement;
    modal?.close();
  };

  // Prediction handlers
  window.handlePredictionsForm = handlePredictionsForm;
  window.initPredictionAutoSave = initPredictionAutoSave;

  // Results handlers
  window.handleResultsForm = handleResultsForm;
  window.initResultsAutoSave = initResultsAutoSave;
  window.clearResult = clearResult;
  window.handleClearAllResults = handleClearAllResults;
  window.recalculateAllScores = recalculateAllScores;

  console.log('Handlers exposed to window');
}
