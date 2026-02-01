/**
 * Screen management functions.
 * TODO: Refactor to use state-based rendering instead of direct DOM manipulation
 */

import { setExpectedLeagueSlug } from '../state/store';

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
  hideElement('leagueNotFound');
  showElement('leagueCreation');

  // Set up form handler
  const form = document.getElementById('leagueForm') as HTMLFormElement | null;
  if (form) {
    // Handler will be set by the caller or use the existing one
  }

  // Clear expected slug so we don't show not found again
  setExpectedLeagueSlug(null);

  // Clear URL parameter
  window.history.replaceState({}, '', window.location.pathname);
}

/**
 * Clear stored league and reload to show creation/join options.
 */
export function clearLeagueAndReload(): void {
  localStorage.removeItem('currentLeagueSlug');
  setExpectedLeagueSlug(null);

  // Clear URL and reload
  window.history.replaceState({}, '', window.location.pathname);
  window.location.reload();
}

// Helper functions
function showElement(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideElement(id: string): void {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
