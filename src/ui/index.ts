// UI index
// Re-export all UI modules and provide window bindings

export * from './toast';
export * from './celebration';
export * from './tabs';
export * from './leaderboard';
export * from './render';
export * from './teamPicker';
export * from './screens';
export * from './teamNameModal';

import { showToast } from './toast';
import {
  showIntroOverlay,
  showCompletionCelebration,
  triggerConfetti,
  triggerWinnerCelebration,
  resetWinnerCelebration,
  replayIntro,
} from './celebration';
import {
  renderTabs,
  updateScoresTabNotification,
  switchAdminTab,
  switchUserTab,
  renderUserTabs,
  updateScoresTabNotificationInline,
  clearScoresNotificationInline,
} from './tabs';
import { renderLeaderboard, sortLeaderboard, renderAnswerDetails } from './leaderboard';
import { showLeagueNotFound, showLeagueCreation, clearLeagueAndReload } from './screens';
import { updateTeamNameCharCount } from './teamNameModal';

// Type declarations for window extensions
declare global {
  interface Window {
    // Toast
    showToast: typeof showToast;

    // Celebration
    showIntroOverlay: typeof showIntroOverlay;
    showCompletionCelebration: typeof showCompletionCelebration;
    triggerConfetti: typeof triggerConfetti;
    triggerWinnerCelebration: typeof triggerWinnerCelebration;
    resetWinnerCelebration: typeof resetWinnerCelebration;
    replayIntro: typeof replayIntro;

    // Tabs (module approach)
    // switchTab: typeof switchTab; // Conflicts with inline, using switchAdminTab
    renderTabs: typeof renderTabs;
    updateScoresTabNotification: typeof updateScoresTabNotification;

    // Tabs (inline compatibility)
    switchTab: typeof switchAdminTab; // Admin panel tab switching
    switchUserTab: typeof switchUserTab; // User panel tab switching
    renderUserTabs: typeof renderUserTabs;
    clearScoresNotification: typeof clearScoresNotificationInline;

    // Leaderboard
    renderLeaderboard: typeof renderLeaderboard;
    sortLeaderboard: typeof sortLeaderboard;
    renderAnswerDetails: typeof renderAnswerDetails;

    // Screens
    showLeagueNotFound: typeof showLeagueNotFound;
    showLeagueCreation: typeof showLeagueCreation;
    clearLeagueAndReload: typeof clearLeagueAndReload;

    // Team name modal (note: openTeamNameModal and closeTeamNameModal declared in handlers/index.ts)
    updateTeamNameCharCount: typeof updateTeamNameCharCount;
  }
}

/**
 * Expose UI functions to window for use in inline HTML onclick handlers.
 * This bridges the gap during migration from inline JS to modules.
 */
export function exposeUIToWindow(): void {
  // Toast
  window.showToast = showToast;

  // Celebration
  window.showIntroOverlay = showIntroOverlay;
  window.showCompletionCelebration = showCompletionCelebration;
  window.triggerConfetti = triggerConfetti;
  window.triggerWinnerCelebration = triggerWinnerCelebration;
  window.resetWinnerCelebration = resetWinnerCelebration;
  window.replayIntro = replayIntro;

  // Tabs - expose inline compatibility versions for existing HTML
  window.switchTab = switchAdminTab; // Admin panel uses switchTab()
  window.switchUserTab = switchUserTab; // User panel uses switchUserTab()
  window.renderUserTabs = renderUserTabs;
  window.renderTabs = renderTabs;
  window.updateScoresTabNotification = updateScoresTabNotificationInline;
  window.clearScoresNotification = clearScoresNotificationInline;

  // Leaderboard
  window.renderLeaderboard = renderLeaderboard;
  window.sortLeaderboard = sortLeaderboard;
  window.renderAnswerDetails = renderAnswerDetails;

  // Screens
  window.showLeagueNotFound = showLeagueNotFound;
  window.showLeagueCreation = showLeagueCreation;
  window.clearLeagueAndReload = clearLeagueAndReload;

  // Team name modal (openTeamNameModal and closeTeamNameModal exposed by handlers/index.ts)
  window.updateTeamNameCharCount = updateTeamNameCharCount;

  console.log('UI functions exposed to window');
}
