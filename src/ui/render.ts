import { getState, subscribe } from '../state/store';
import { renderTabs } from './tabs';
import { renderLeaderboard } from './leaderboard';

/**
 * Main render function - called when state changes.
 * Orchestrates rendering of all UI components.
 */
export function render(): void {
  const state = getState();

  console.log('=== RENDER ===');
  console.log('State:', state);

  // Update UI based on current state
  if (state.currentLeague) {
    // Show main app content
    hideElement('loading');
    hideElement('leagueCreation');

    // Update league name in header
    const leagueNameEl = document.getElementById('leagueName');
    if (leagueNameEl) {
      leagueNameEl.textContent = state.currentLeague.name;
    }

    // Render tabs
    renderTabs();

    // Render tab-specific content based on current tab
    switch (state.currentTab) {
      case 'predictions':
        // Will be implemented: renderPredictionsForm()
        break;
      case 'scores':
        renderLeaderboard();
        break;
      case 'results':
        // Will be implemented: renderResultsForm()
        break;
      case 'admin':
        // Will be implemented: renderAdminPanel()
        break;
    }
  } else {
    // No league - show loading or creation form
    showElement('loading');
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
