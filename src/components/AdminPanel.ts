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
    <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span style="color: #FFFFFF; font-weight: 600; font-size: 15px;">Submissions</span>
      <div style="display: flex; gap: 6px;">
        <label style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; ${currentLeague.isOpen ? 'background: #003320; border: 2px solid var(--color-primary); color: var(--color-primary);' : 'background: var(--color-input-bg); border: 2px solid var(--color-text-muted); color: var(--color-text-muted);'}">
          <input type="radio" name="submissions" value="open" ${currentLeague.isOpen ? 'checked' : ''} onchange="setSubmissions(true)" style="width: 16px; height: 16px; accent-color: var(--color-primary);">
          🔓 Open
        </label>
        <label style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; ${!currentLeague.isOpen ? 'background: #3d1a1a; border: 2px solid #ff6b6b; color: #ff6b6b;' : 'background: var(--color-input-bg); border: 2px solid var(--color-text-muted); color: var(--color-text-muted);'}">
          <input type="radio" name="submissions" value="closed" ${!currentLeague.isOpen ? 'checked' : ''} onchange="setSubmissions(false)" style="width: 16px; height: 16px; accent-color: #ff6b6b;">
          🔒 Closed
        </label>
      </div>
    </div>

    <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span style="color: #FFFFFF; font-weight: 600; font-size: 15px;">Show All Answers</span>
      <div style="display: flex; gap: 6px;">
        <label style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; ${!showPredictions ? 'background: #003320; border: 2px solid var(--color-primary); color: var(--color-primary);' : 'background: var(--color-input-bg); border: 2px solid var(--color-text-muted); color: var(--color-text-muted);'}">
          <input type="radio" name="showPredictions" value="hidden" ${!showPredictions ? 'checked' : ''} onchange="setShowPredictions(false)" style="width: 16px; height: 16px; accent-color: var(--color-primary);">
          🔒 Hidden
        </label>
        <label style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; ${showPredictions ? 'background: #3d1a1a; border: 2px solid #ff6b6b; color: #ff6b6b;' : 'background: var(--color-input-bg); border: 2px solid var(--color-text-muted); color: var(--color-text-muted);'}">
          <input type="radio" name="showPredictions" value="visible" ${showPredictions ? 'checked' : ''} onchange="setShowPredictions(true)" style="width: 16px; height: 16px; accent-color: #ff6b6b;">
          👁️ Visible
        </label>
      </div>
    </div>

    <div style="padding: 16px; background: var(--color-input-bg); border-radius: 8px;">
      <div style="color: #FFFFFF; font-weight: 600; margin-bottom: 12px;">Invite Others</div>
      <div style="display: flex; gap: 16px; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 8px;">Share link:</div>
          <a href="#" onclick="copyLeagueUrl(); return false;" style="color: var(--color-primary); font-size: 14px; text-decoration: underline; display: inline-block;">📋 Copy invite link</a>
          <div style="color: var(--color-text-muted); font-size: 12px; margin-top: 8px; word-break: break-all;">${shareUrl}</div>
        </div>
        <div style="background: white; padding: 8px; border-radius: 8px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}" alt="QR Code" style="display: block; width: 120px; height: 120px;">
        </div>
      </div>
    </div>

    <div style="margin-top: 16px; padding: 16px; background: var(--color-background-alt); border-left: 3px solid var(--color-primary); border-radius: 6px;">
      <div style="font-size: 13px; color: var(--color-text); margin-bottom: 8px; font-weight: 600;">
        ${commitMessage}
      </div>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 11px; color: var(--color-text-muted);">
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
