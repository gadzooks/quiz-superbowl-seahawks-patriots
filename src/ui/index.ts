// UI index
// Re-export all UI modules and provide window bindings

export * from './toast';
export * from './celebration';
export * from './tabs';
export * from './leaderboard';
export * from './render';
export * from './teamPicker';

import { showToast } from './toast';
import {
  showIntroOverlay,
  showCompletionCelebration,
  triggerConfetti,
  triggerWinnerCelebration,
  resetWinnerCelebration,
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

  console.log('UI functions exposed to window');
}
