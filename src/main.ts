// Super Bowl Prediction Game - Entry Point
// This module initializes the app and orchestrates all components

// Import all CSS styles
import './styles/index.css';

// Legacy app module removed - all functionality is in modern modules
import { exposeComponentsToWindow } from './components';
import { subscribeToLeague } from './db/queries';
import { exposeHandlersToWindow } from './handlers';
import { SoundManager } from './sound/manager';
import {
  setCurrentUserId,
  setCurrentLeague,
  setAllPredictions,
  setCurrentGame,
  setQuestions,
  setHasUnviewedScoreUpdate,
  setExpectedLeagueSlug,
  getState,
  updateState,
  exposeStoreToWindow,
} from './state/store';
import { initTheme } from './theme';
import type { Game, League, Prediction, Question } from './types';
import { exposeUIToWindow } from './ui';
import { initRender } from './ui/render';
import { updateScoresTabNotification } from './ui/tabs';
import { needsTeamSelection, showTeamPicker } from './ui/teamPicker';
import { initThemeMenu } from './ui/themeMenu';
import { getCurrentGameId, getCurrentGameConfig } from './utils/game';
import { getLeagueSlug, isAdminOverride, saveLeagueSlug, clearLeagueSlug } from './utils/url';
import { getUserId } from './utils/user';

console.log('Vite + TypeScript app loading...');

// Expose the app ID globally for the legacy inline script
// This allows incremental migration without running both build systems
const APP_ID = import.meta.env.VITE_INSTANTDB_APP_ID || '';
(window as typeof window & { VITE_APP_ID?: string }).VITE_APP_ID = APP_ID;
console.log('InstantDB App ID available:', APP_ID ? `${APP_ID.substring(0, 8)}...` : 'NOT SET');

// Expose git commit and commit message for admin panel
declare const __GIT_COMMIT__: string;
declare const __GIT_COMMIT_MESSAGE__: string;
(window as typeof window & { VITE_GIT_COMMIT?: string }).VITE_GIT_COMMIT = __GIT_COMMIT__;
(window as typeof window & { VITE_GIT_COMMIT_MESSAGE?: string }).VITE_GIT_COMMIT_MESSAGE =
  __GIT_COMMIT_MESSAGE__;
console.log('Git commit:', __GIT_COMMIT__);
console.log('Git commit message:', __GIT_COMMIT_MESSAGE__);

// Expose game config globally for legacy code
const gameConfig = getCurrentGameConfig();
const gameId = getCurrentGameId();

// Extend window type for game config, SoundManager, and utilities
declare global {
  interface Window {
    VITE_APP_ID?: string;
    VITE_GIT_COMMIT?: string;
    VITE_GIT_COMMIT_MESSAGE?: string;
    GAME_ID: string;
    GAME_CONFIG: typeof gameConfig;
    USER_TEAM_ID: string;
    SoundManager: typeof SoundManager;
    getUserId: typeof getUserId;
  }
}

window.GAME_ID = gameId;
window.GAME_CONFIG = gameConfig;
window.SoundManager = SoundManager;
window.getUserId = getUserId;
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
    // Initialize theme from saved preference (also applies header team colors)
    const userTeamId = initTheme();
    window.USER_TEAM_ID = userTeamId;
    console.log('User theme:', userTeamId);
  }

  // Initialize floating theme menu (FAB)
  initThemeMenu();

  // Initialize Sound Manager
  SoundManager.init();

  // Get or create user ID
  const userId = getUserId();
  setCurrentUserId(userId);
  console.log('Current user ID:', userId);

  // Load the game and questions into state
  // Note: Game and questions must be seeded first using: yarn seed-game lx
  console.log('Loading game data for:', gameId);
  const { getGameByGameId } = await import('./db/queries');
  const gameData = await getGameByGameId(gameId);

  if (!gameData) {
    console.error(`Game ${gameId} not found! Run: yarn seed-game ${gameId}`);
    document.getElementById('loading')?.classList.add('hidden');
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="card bg-base-200">
          <div class="card-body">
            <h2 class="card-title text-error">Game Not Set Up</h2>
            <p>This Super Bowl game hasn't been set up yet.</p>
            <p class="text-sm text-base-content/60 mt-2">Admin: Run <code>yarn seed-game ${gameId}</code> to set up the game and questions.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  setCurrentGame({
    id: gameData._instantDbId,
    gameId: gameData.gameId,
    displayName: gameData.displayName,
    year: gameData.year,
    team1: gameData.team1,
    team2: gameData.team2,
  });
  console.log('Game loaded into state:', gameData);

  // Expose the modern db client to window for any code that needs it
  const { db } = await import('./db/client');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).db = db;
  console.log('Modern db client exposed to window');

  // Expose state store to window for legacy inline scripts
  exposeStoreToWindow();

  // Expose handlers, components, UI, and app to window for legacy HTML onclick handlers
  // Must be done before setting up form handlers below
  exposeHandlersToWindow();
  exposeComponentsToWindow();
  exposeUIToWindow();

  // Check for league parameter
  const leagueSlug = getLeagueSlug();
  const adminOverride = isAdminOverride();

  if (leagueSlug) {
    // Track expected slug for "not found" handling
    setExpectedLeagueSlug(leagueSlug);
    // Subscribe to league data via link-based query
    subscribeToLeague(gameId, leagueSlug, handleLeagueUpdate(adminOverride, leagueSlug));
  } else {
    // No league parameter - show league creation form
    console.log('No league slug found - showing league creation form');
    document.getElementById('loading')?.classList.add('hidden');
    document.getElementById('leagueCreation')?.classList.remove('hidden');

    // Set up form handler - the handler is already exposed to window by exposeHandlersToWindow()
    const form = document.getElementById('leagueForm') as HTMLFormElement | null;
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const handleLeagueForm = (window as Window & { handleLeagueForm?: (e: Event) => void })
          .handleLeagueForm;
        if (handleLeagueForm) {
          void handleLeagueForm(e);
        }
      };
    }
  }

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
  return ({
    game,
    league,
    predictions,
    questions,
  }: {
    game: Game | null;
    league: League | null;
    predictions: Prediction[];
    questions: Question[];
  }) => {
    console.log('=== LEAGUE UPDATE (Vite) ===');
    console.log('Game:', game);
    console.log('League:', league);
    console.log('Predictions:', predictions.length);
    console.log('Questions:', questions.length);

    const state = getState();

    // Store game and questions in state
    if (game) {
      setCurrentGame(game);
    }
    if (questions.length > 0) {
      setQuestions(questions);
    }

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

    // State changes will trigger render via the subscription in initRender()
  };
}

// Auto-initialize when DOM is ready
// This runs before the legacy initApp, showing team picker if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void initApp());
} else {
  // DOM already loaded
  void initApp();
}
