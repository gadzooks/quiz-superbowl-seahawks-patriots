// Super Bowl Prediction Game - Entry Point
// This module initializes the app and orchestrates all components

// Import all CSS styles
import './styles/index.css';

import { SoundManager } from './sound/manager';
import { getUserId } from './utils/user';
import { getLeagueSlug, isAdminOverride, saveLeagueSlug, clearLeagueSlug } from './utils/url';
import { getCurrentGameId, getCurrentGameConfig } from './utils/game';
import { initTheme } from './theme';
import { needsTeamSelection, showTeamPicker } from './ui/teamPicker';
import { subscribeToLeague } from './db/queries';
import {
  setCurrentUserId,
  setCurrentLeague,
  setAllPredictions,
  setHasUnviewedScoreUpdate,
  setExpectedLeagueSlug,
  getState,
  updateState,
  exposeStoreToWindow,
} from './state/store';
import { initRender } from './ui/render';
import { updateScoresTabNotification } from './ui/tabs';
import { exposeHandlersToWindow } from './handlers';
import { exposeComponentsToWindow } from './components';
import type { League, Prediction } from './types';

console.log('Vite + TypeScript app loading...');

// Expose the app ID globally for the legacy inline script
// This allows incremental migration without running both build systems
const APP_ID = import.meta.env.VITE_INSTANTDB_APP_ID || '';
(window as typeof window & { VITE_APP_ID?: string }).VITE_APP_ID = APP_ID;
console.log('InstantDB App ID available:', APP_ID ? `${APP_ID.substring(0, 8)}...` : 'NOT SET');

// Expose git commit for admin panel
declare const __GIT_COMMIT__: string;
(window as typeof window & { VITE_GIT_COMMIT?: string }).VITE_GIT_COMMIT = __GIT_COMMIT__;
console.log('Git commit:', __GIT_COMMIT__);

// Expose game config globally for legacy code
const gameConfig = getCurrentGameConfig();
const gameId = getCurrentGameId();

// Extend window type for game config
declare global {
  interface Window {
    VITE_APP_ID?: string;
    VITE_GIT_COMMIT?: string;
    GAME_ID: string;
    GAME_CONFIG: typeof gameConfig;
    USER_TEAM_ID: string;
  }
}

window.GAME_ID = gameId;
window.GAME_CONFIG = gameConfig;
console.log('Game ID:', gameId);
console.log('Game Config:', gameConfig);

// Promise that resolves when app initialization (including team picker) is complete
let appReadyResolve: () => void;
const appReadyPromise = new Promise<void>((resolve) => {
  appReadyResolve = resolve;
});

// Expose waitForAppReady for legacy code
declare global {
  interface Window {
    waitForAppReady: () => Promise<void>;
  }
}
window.waitForAppReady = () => appReadyPromise;

/**
 * Initialize the application.
 * Shows team picker on first visit, then proceeds with app setup.
 */
export async function initApp(): Promise<void> {
  console.log('=== INITIALIZING APP (Vite) ===');

  // Check if user needs to pick a team (first visit)
  if (needsTeamSelection()) {
    console.log('First visit - showing team picker');
    const selectedTeamId = await showTeamPicker();
    window.USER_TEAM_ID = selectedTeamId;
    console.log('User selected team:', selectedTeamId);
  } else {
    // Initialize theme from saved preference
    const userTeamId = initTheme();
    window.USER_TEAM_ID = userTeamId;
    console.log('User theme:', userTeamId);
  }

  // Initialize Sound Manager
  SoundManager.init();

  // Get or create user ID
  const userId = getUserId();
  setCurrentUserId(userId);
  console.log('Current user ID:', userId);

  // Check for league parameter
  const leagueSlug = getLeagueSlug();
  const adminOverride = isAdminOverride();

  if (leagueSlug) {
    // Track expected slug for "not found" handling
    setExpectedLeagueSlug(leagueSlug);
    // Subscribe to league data with gameId filter
    subscribeToLeague(gameId, leagueSlug, handleLeagueUpdate(adminOverride, leagueSlug));
  } else {
    // No league parameter - the original code handles league creation
    // This will be migrated later
    console.log('No league slug found - original code will handle league creation');
  }

  // Expose state store to window for legacy inline scripts
  exposeStoreToWindow();

  // Expose handlers and components to window for legacy HTML onclick handlers
  exposeHandlersToWindow();
  exposeComponentsToWindow();

  // Initialize render system
  // Note: The original index.html script still handles most rendering
  // This is a gradual migration - we're setting up the infrastructure
  initRender();

  // Signal that app is ready (team picker complete, theme applied)
  appReadyResolve();
  console.log('App initialization complete');
}

/**
 * Create a handler for league subscription updates.
 */
function handleLeagueUpdate(adminOverride: boolean, expectedSlug: string) {
  return ({ league, predictions }: { league: League | null; predictions: Prediction[] }) => {
    console.log('=== LEAGUE UPDATE (Vite) ===');
    console.log('League:', league);
    console.log('Predictions:', predictions.length);

    const state = getState();

    if (league) {
      // League found - save to localStorage
      saveLeagueSlug(league.slug);

      // Detect actualResults changes
      const currentActualResults = league.actualResults;
      const previousResults = state.previousActualResults;

      if (
        previousResults !== null &&
        JSON.stringify(currentActualResults) !== JSON.stringify(previousResults) &&
        state.currentTab !== 'scores'
      ) {
        if (currentActualResults && Object.keys(currentActualResults).length > 0) {
          setHasUnviewedScoreUpdate(true);
          updateScoresTabNotification();
        }
      }

      // Determine if user is league creator or manager
      const isCreator = league.creatorId === state.currentUserId || adminOverride;
      const userPrediction = predictions.find((p) => p.userId === state.currentUserId);
      const isManager = userPrediction?.isManager ?? false;

      // Update state in one batch
      updateState({
        currentLeague: league,
        allPredictions: predictions,
        isLeagueCreator: isCreator,
        isManager: isManager,
        currentTeamName: userPrediction?.teamName ?? '',
        previousActualResults: currentActualResults
          ? JSON.parse(JSON.stringify(currentActualResults))
          : null,
      });

      console.log('Is league creator:', isCreator);
      console.log('Is manager:', isManager);
    } else {
      console.log('No league found with slug:', expectedSlug);
      // Clear localStorage since this league doesn't exist
      clearLeagueSlug();
      setCurrentLeague(null);
      setAllPredictions([]);
    }
  };
}

// Auto-initialize when DOM is ready
// This runs before the legacy initApp, showing team picker if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initApp());
} else {
  // DOM already loaded
  initApp();
}
