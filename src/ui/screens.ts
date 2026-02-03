/**
 * Screen management functions.
 * TODO: Refactor to use state-based rendering instead of direct DOM manipulation
 */

import { setExpectedLeagueSlug } from '../state/store';
import { getCurrentGameId, buildGamePath } from '../utils/game';

/**
 * Show league not found screen.
 */
export function showLeagueNotFound(slug: string): void {
  const notFoundEl = document.getElementById('leagueNotFound');
  const notFoundSlugEl = document.getElementById('notFoundSlug');

  if (notFoundEl) {
    notFoundEl.classList.remove('hidden');
  }
  if (notFoundSlugEl) {
    notFoundSlugEl.textContent = `League slug: "${slug}"`;
  }

  // Hide other screens
  hideElement('loading');
  hideElement('leagueCreation');
  hideElement('teamNameEntry');
  hideElement('adminPanel');
  hideElement('userPanel');
}

/**
 * Show the league creation form from the not found screen.
 */
export function showLeagueCreation(): void {
  // Clear expected slug so we don't show not found again
  setExpectedLeagueSlug(null);

  // Clear localStorage
  localStorage.removeItem('currentLeagueSlug');

  // Clear URL to game home (e.g., /superbowl/lx/) and reload
  // Reload is necessary to tear down the old league subscriptions
  const gameId = getCurrentGameId();
  const path = buildGamePath(gameId);
  window.history.replaceState({}, '', path);
  window.location.reload();
}

/**
 * Clear stored league and reload to show creation/join options.
 */
export function clearLeagueAndReload(): void {
  localStorage.removeItem('currentLeagueSlug');
  setExpectedLeagueSlug(null);

  // Clear URL to game home and reload
  const gameId = getCurrentGameId();
  const path = buildGamePath(gameId);
  window.history.replaceState({}, '', path);
  window.location.reload();
}

// Helper functions
function hideElement(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
