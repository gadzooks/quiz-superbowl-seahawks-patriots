// Super Bowl Prediction Game - Entry Point
// This module initializes the app and orchestrates all components

import { SoundManager } from './sound/manager';
import { getUserId } from './utils/user';
import { getLeagueSlug, isAdminOverride, saveLeagueSlug, clearLeagueSlug } from './utils/url';
import { subscribeToLeague } from './db/queries';
import {
  setCurrentUserId,
  setCurrentLeague,
  setAllPredictions,
  setHasUnviewedScoreUpdate,
  setExpectedLeagueSlug,
  getState,
  updateState,
} from './state/store';
import { initRender } from './ui/render';
import { updateScoresTabNotification } from './ui/tabs';
import type { League, Prediction } from './types';

console.log('Vite + TypeScript app loading...');

// Expose the app ID globally for the legacy inline script
// This allows incremental migration without running both build systems
const APP_ID = import.meta.env.VITE_INSTANTDB_APP_ID || '';
(window as typeof window & { VITE_APP_ID?: string }).VITE_APP_ID = APP_ID;
console.log('InstantDB App ID available:', APP_ID ? `${APP_ID.substring(0, 8)}...` : 'NOT SET');

/**
 * Initialize the application.
 */
export function initApp(): void {
  console.log('=== INITIALIZING APP (Vite) ===');

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
    // Subscribe to league data (save to localStorage only after confirming league exists)
    subscribeToLeague(leagueSlug, handleLeagueUpdate(adminOverride, leagueSlug));
  } else {
    // No league parameter - the original code handles league creation
    // This will be migrated later
    console.log('No league slug found - original code will handle league creation');
  }

  // Initialize render system
  // Note: The original index.html script still handles most rendering
  // This is a gradual migration - we're setting up the infrastructure
  initRender();
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

// Note: The original initApp in index.html is still the primary entry point.
// This Vite module provides the new infrastructure that will gradually
// replace the inline script. For now, both coexist during the migration.
