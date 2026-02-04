import { getState, subscribe } from '../state/store';

import { showLeagueNotFound } from './screens';

// Guard to prevent infinite render loops
let isRendering = false;

/**
 * Main render function - called when state changes.
 * Orchestrates rendering of all UI components.
 */
export function render(): void {
  // Prevent re-entry during rendering
  if (isRendering) {
    console.warn('Render called while already rendering - skipping to prevent infinite loop');
    return;
  }

  isRendering = true;

  try {
    renderInternal();
  } finally {
    isRendering = false;
  }
}

function renderInternal(): void {
  const state = getState();

  console.log('=== RENDER ===');
  console.log('State:', state);

  // Update UI based on current state
  if (state.currentLeague) {
    // League found - render main app
    hideElement('loading');
    hideElement('leagueCreation');
    hideElement('leagueNotFound');
    hideElement('teamNameEntry');

    // Get render functions from window (they're exposed by exposeComponentsToWindow)
    const win = window as Window & {
      renderLeagueName?: () => void;
      renderPredictionsForm?: () => void;
      renderParticipants?: () => void;
      renderAdminControls?: () => void;
      switchTab?: (tab: string) => void;
      switchUserTab?: (tab: string) => void;
    };

    // Render league name in header
    win.renderLeagueName?.();

    // Check if user has registered
    const userPrediction = state.allPredictions.find((p) => p.userId === state.currentUserId);

    if (!userPrediction) {
      // Show team name entry screen
      showElement('teamNameEntry');
      hideElement('leaderboardSection');

      // Set up form handler
      const form = document.getElementById('teamNameForm') as HTMLFormElement | null;
      if (form && !form.onsubmit) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const handleTeamNameForm = (
            window as Window & { handleTeamNameForm?: (e: Event) => void }
          ).handleTeamNameForm;
          if (handleTeamNameForm) {
            void handleTeamNameForm(e);
          }
        };
      }
    } else {
      // User is registered - show main content
      hideElement('teamNameEntry');

      // Show appropriate panel (admin or user)
      if (state.isLeagueCreator) {
        showElement('adminPanel');
        hideElement('userPanel');
        win.renderAdminControls?.();
      } else {
        hideElement('adminPanel');
        showElement('userPanel');
      }

      // Render content
      win.renderPredictionsForm?.();
      win.renderParticipants?.();

      // Show/hide sections based on current tab (without triggering state changes)
      hideElement('predictionsSection');
      hideElement('leaderboardSection');
      hideElement('resultsTab');
      hideElement('adminTab');

      switch (state.currentTab) {
        case 'predictions':
          showElement('predictionsSection');
          break;
        case 'scores':
          showElement('leaderboardSection');
          win.renderLeaderboard?.();
          break;
        case 'results':
          showElement('resultsTab');
          win.renderResultsForm?.();
          break;
        case 'admin':
          showElement('adminTab');
          win.renderAdminControls?.();
          break;
      }
    }
  } else {
    // No league - check if we expected one
    if (state.expectedLeagueSlug) {
      // We're waiting for a specific league but didn't find it
      hideElement('loading');
      hideElement('leagueCreation');
      showLeagueNotFound(state.expectedLeagueSlug);
    } else {
      // No league slug in URL - show creation form
      hideElement('loading');
      showElement('leagueCreation');
      hideElement('leagueNotFound');
    }
  }
}

/**
 * Initialize the render system.
 * Subscribes to state changes and triggers initial render.
 */
export function initRender(): void {
  // Subscribe to state changes
  subscribe(() => {
    render();
  });

  // Initial render
  render();
}

// Helper functions for showing/hiding elements
function showElement(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideElement(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
