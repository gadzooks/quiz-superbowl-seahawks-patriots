// Admin Panel Component
// Renders admin controls and settings

import { getState } from '../state/store';
import { getLeagueUrl } from '../utils/url';

/**
 * Render the admin controls panel.
 */
export function renderAdminControls(): void {
  const { currentLeague } = getState();
  const statusDiv = document.getElementById('gameStatus');

  if (!statusDiv || !currentLeague) return;

  const showPredictions = currentLeague.showAllPredictions === true;
  const shareUrl = getLeagueUrl(currentLeague.slug);

  // Get git commit, commit message, and app ID from window (set by Vite)
  const gitCommit = (window as Window & { VITE_GIT_COMMIT?: string }).VITE_GIT_COMMIT || 'dev';
  const commitMessage =
    (window as Window & { VITE_GIT_COMMIT_MESSAGE?: string }).VITE_GIT_COMMIT_MESSAGE || 'dev';
  const appId = (window as Window & { VITE_APP_ID?: string }).VITE_APP_ID || '';

  statusDiv.innerHTML = `
    <div class="admin-control-row">
      <span class="admin-control-label">Submissions</span>
      <div class="admin-toggle-group">
        <label class="admin-toggle-option ${currentLeague.isOpen ? 'admin-toggle-active-open' : 'admin-toggle-inactive'}">
          <input type="radio" name="submissions" value="open" ${currentLeague.isOpen ? 'checked' : ''} onchange="setSubmissions(true)">
          🔓 Open
        </label>
        <label class="admin-toggle-option ${!currentLeague.isOpen ? 'admin-toggle-active-closed' : 'admin-toggle-inactive'}">
          <input type="radio" name="submissions" value="closed" ${!currentLeague.isOpen ? 'checked' : ''} onchange="setSubmissions(false)">
          🔒 Closed
        </label>
      </div>
    </div>

    <div class="admin-control-row">
      <span class="admin-control-label">Show All Answers</span>
      <div class="admin-toggle-group">
        <label class="admin-toggle-option ${!showPredictions ? 'admin-toggle-active-open' : 'admin-toggle-inactive'}">
          <input type="radio" name="showPredictions" value="hidden" ${!showPredictions ? 'checked' : ''} onchange="setShowPredictions(false)">
          🔒 Hidden
        </label>
        <label class="admin-toggle-option ${showPredictions ? 'admin-toggle-active-closed' : 'admin-toggle-inactive'}">
          <input type="radio" name="showPredictions" value="visible" ${showPredictions ? 'checked' : ''} onchange="setShowPredictions(true)">
          👁️ Visible
        </label>
      </div>
    </div>

    <div class="admin-share-section">
      <div class="admin-share-title">Invite Others</div>
      <div class="admin-share-content">
        <div style="flex: 1;">
          <div class="admin-share-link-label">Share link:</div>
          <a href="#" onclick="copyLeagueUrl(); return false;" class="admin-share-link">📋 Copy invite link</a>
          <div class="admin-share-url">${shareUrl}</div>
        </div>
        <div class="admin-qr-container">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}" alt="QR Code" class="admin-qr-image">
        </div>
      </div>
    </div>

    <div class="admin-build-info">
      <div class="admin-build-message">
        ${commitMessage}
      </div>
      <div class="admin-build-details">
        <span>Commit: <code>${gitCommit}</code></span>
        <span>DB: <code>...${appId.slice(-5)}</code></span>
      </div>
    </div>
  `;
}

/**
 * Expose admin functions to window.
 * Note: setSubmissions, setShowPredictions, and copyLeagueUrl are already
 * exposed via handlers/index.ts, so we just need to ensure they're available
 * for the inline onclick handlers in the rendered HTML.
 */
export function exposeAdminFunctions(): void {
  // These are already exposed by exposeHandlersToWindow() in handlers/index.ts
  // This function exists for symmetry with other component modules
  console.log('Admin functions available via handlers');
}
