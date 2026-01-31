import type { TabType } from '../types';
import { getState, setCurrentTab, setHasUnviewedScoreUpdate } from '../state/store';
import { SoundManager } from '../sound/manager';

/**
 * Switch to a different tab.
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
 * Render the tab navigation.
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
 * Update the scores tab notification badge.
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
