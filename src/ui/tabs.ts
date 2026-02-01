import type { TabType } from '../types';
import { getState, setCurrentTab, setHasUnviewedScoreUpdate } from '../state/store';
import { SoundManager } from '../sound/manager';

/**
 * Switch to a different tab (module approach with data attributes).
 */
export function switchTab(tab: TabType): void {
  const state = getState();

  // Don't switch if already on this tab
  if (state.currentTab === tab) return;

  // Play click sound
  SoundManager.playClick();

  // Update state
  setCurrentTab(tab);

  // Clear score notification if switching to scores tab
  if (tab === 'scores' && state.hasUnviewedScoreUpdate) {
    setHasUnviewedScoreUpdate(false);
  }

  // Trigger re-render
  renderTabs();
}

/**
 * Render the tab navigation (module approach).
 */
export function renderTabs(): void {
  const state = getState();
  const tabsContainer = document.getElementById('tabs');

  if (!tabsContainer) return;

  // Define available tabs based on user role
  const tabs: { id: TabType; label: string; showBadge?: boolean }[] = [
    { id: 'predictions', label: 'My Picks' },
    { id: 'scores', label: 'Leaderboard', showBadge: state.hasUnviewedScoreUpdate },
  ];

  // Add admin tabs if user has admin access
  if (state.isLeagueCreator || state.isManager) {
    tabs.push({ id: 'results', label: 'Results' });
    tabs.push({ id: 'admin', label: 'Admin' });
  }

  tabsContainer.innerHTML = tabs
    .map(
      (tab) => `
      <button
        class="tab ${state.currentTab === tab.id ? 'tab-active' : ''}"
        data-tab="${tab.id}"
      >
        ${tab.label}
        ${tab.showBadge ? '<span class="badge badge-primary badge-sm ml-1">!</span>' : ''}
      </button>
    `
    )
    .join('');

  // Add click handlers
  tabsContainer.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const tabId = (e.currentTarget as HTMLElement).dataset.tab as TabType;
      switchTab(tabId);
    });
  });

  // Show/hide tab content
  updateTabContent();
}

/**
 * Update which tab content is visible.
 */
function updateTabContent(): void {
  const state = getState();

  // Hide all tab content
  document.querySelectorAll('[data-tab-content]').forEach((el) => {
    el.classList.add('hidden');
  });

  // Show active tab content
  const activeContent = document.querySelector(`[data-tab-content="${state.currentTab}"]`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }
}

/**
 * Update the scores tab notification badge (module approach).
 */
export function updateScoresTabNotification(): void {
  const state = getState();
  const scoresTab = document.querySelector('[data-tab="scores"]');

  if (!scoresTab) return;

  const existingBadge = scoresTab.querySelector('.badge');

  if (state.hasUnviewedScoreUpdate && !existingBadge) {
    const badge = document.createElement('span');
    badge.className = 'badge badge-primary badge-sm ml-1';
    badge.textContent = '!';
    scoresTab.appendChild(badge);
  } else if (!state.hasUnviewedScoreUpdate && existingBadge) {
    existingBadge.remove();
  }
}

// ============================================================================
// INLINE COMPATIBILITY FUNCTIONS
// These preserve the exact behavior of the inline tab functions that use
// specific panel IDs and onclick handlers. Will be refactored later.
// ============================================================================

/**
 * Switch tabs (admin panel) - inline compatibility version.
 * Uses #adminPanel and specific section IDs.
 */
export function switchAdminTab(tab: string): void {
  // Handle removed 'participants' tab - redirect to admin
  if (tab === 'participants') tab = 'admin';

  // Update state
  setCurrentTab(tab as TabType);
  localStorage.setItem('currentTab', tab);

  // Remove active class from all admin tabs
  document.querySelectorAll('#adminPanel .tab').forEach((btn) => {
    btn.classList.remove('tab-active');
  });

  // Hide all sections
  document.getElementById('predictionsSection')?.classList.add('hidden');
  document.getElementById('leaderboardSection')?.classList.add('hidden');
  document.getElementById('resultsTab')?.classList.add('hidden');
  document.getElementById('adminTab')?.classList.add('hidden');

  if (tab === 'predictions') {
    document.querySelectorAll('#adminPanel .tab')[0]?.classList.add('tab-active');
    document.getElementById('predictionsSection')?.classList.remove('hidden');
  } else if (tab === 'scores') {
    document.querySelectorAll('#adminPanel .tab')[1]?.classList.add('tab-active');
    document.getElementById('leaderboardSection')?.classList.remove('hidden');
    // Call renderLeaderboard from window (exposed by ui/index.ts)
    (window as Window & { renderLeaderboard?: () => void }).renderLeaderboard?.();
    clearScoresNotificationInline();
  } else if (tab === 'results') {
    document.querySelectorAll('#adminPanel .tab')[2]?.classList.add('tab-active');
    document.getElementById('resultsTab')?.classList.remove('hidden');
    // Call renderResultsForm from window
    (window as Window & { renderResultsForm?: () => void }).renderResultsForm?.();
  } else if (tab === 'admin') {
    document.querySelectorAll('#adminPanel .tab')[3]?.classList.add('tab-active');
    document.getElementById('adminTab')?.classList.remove('hidden');
    // Call renderAdminControls from window
    (window as Window & { renderAdminControls?: () => void }).renderAdminControls?.();
  }
}

/**
 * Switch tabs (user panel) - inline compatibility version.
 * Uses #userPanel and specific section IDs.
 */
export function switchUserTab(tab: string): void {
  const state = getState();

  // Non-admins have predictions and scores tabs; managers also have results
  if (tab === 'results' && !state.isManager) {
    tab = 'predictions'; // Fallback if non-manager tries to access results
  }
  if (tab !== 'predictions' && tab !== 'scores' && tab !== 'results') {
    tab = 'predictions';
  }

  // Update state
  setCurrentTab(tab as TabType);
  localStorage.setItem('currentTab', tab);

  // Remove active class from all user tabs
  document.querySelectorAll('#userPanel .tab').forEach((btn) => {
    btn.classList.remove('tab-active');
  });

  // Hide all sections
  document.getElementById('predictionsSection')?.classList.add('hidden');
  document.getElementById('leaderboardSection')?.classList.add('hidden');
  document.getElementById('resultsTab')?.classList.add('hidden');

  if (tab === 'predictions') {
    document.querySelectorAll('#userPanel .tab')[0]?.classList.add('tab-active');
    document.getElementById('predictionsSection')?.classList.remove('hidden');
  } else if (tab === 'scores') {
    document.querySelectorAll('#userPanel .tab')[1]?.classList.add('tab-active');
    document.getElementById('leaderboardSection')?.classList.remove('hidden');
    (window as Window & { renderLeaderboard?: () => void }).renderLeaderboard?.();
    clearScoresNotificationInline();
  } else if (tab === 'results') {
    // Results tab is at index 2 for managers
    document.querySelectorAll('#userPanel .tab')[2]?.classList.add('tab-active');
    document.getElementById('resultsTab')?.classList.remove('hidden');
    (window as Window & { renderResultsForm?: () => void }).renderResultsForm?.();
  }
}

/**
 * Render user tabs dynamically based on manager status.
 */
export function renderUserTabs(): void {
  const state = getState();
  const tabsContainer = document.getElementById('userTabs');
  if (!tabsContainer) return;

  let html = `
    <a role="tab" id="userPredictionsTab" class="tab ${state.currentTab === 'predictions' ? 'tab-active' : ''}" onclick="switchUserTab('predictions')">My Predictions</a>
    <a role="tab" class="tab ${state.currentTab === 'scores' ? 'tab-active' : ''}" onclick="switchUserTab('scores')">Scores</a>
  `;

  if (state.isManager) {
    html += `<a role="tab" class="tab tab-results ${state.currentTab === 'results' ? 'tab-active' : ''}" onclick="switchUserTab('results')">Results</a>`;
  }

  tabsContainer.innerHTML = html;

  // Update My Predictions tab with team name
  const userTab = document.getElementById('userPredictionsTab');
  if (userTab && state.currentTeamName) {
    userTab.innerHTML = `Team ${state.currentTeamName}`;
  }
}

/**
 * Update Scores tab visual notification - inline compatibility version.
 * Uses onclick selector approach.
 */
export function updateScoresTabNotificationInline(): void {
  const state = getState();
  const adminScoresTab = document.querySelector('#adminPanel .tab[onclick*="scores"]');
  const userScoresTab = document.querySelector('#userPanel .tab[onclick*="scores"]');

  if (state.hasUnviewedScoreUpdate) {
    adminScoresTab?.classList.add('tab-scores-notify');
    userScoresTab?.classList.add('tab-scores-notify');
  } else {
    adminScoresTab?.classList.remove('tab-scores-notify');
    userScoresTab?.classList.remove('tab-scores-notify');
  }
}

/**
 * Clear notification when viewing scores - inline compatibility version.
 */
export function clearScoresNotificationInline(): void {
  setHasUnviewedScoreUpdate(false);
  updateScoresTabNotificationInline();
}
