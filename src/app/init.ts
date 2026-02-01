/**
 * App initialization module.
 * Handles InstantDB setup, league subscription, and main render logic.
 * TODO: Refactor to use proper TypeScript types instead of any
 */

import { SoundManager } from '../sound/manager';
import { getUserId } from '../utils/user';
import {
  getState,
  setCurrentLeague,
  setAllPredictions,
  setIsLeagueCreator,
  setCurrentTeamName,
  setIsManager,
  setHasShownCompletionCelebration,
  setPreviousActualResults,
  setHasUnviewedScoreUpdate,
  setExpectedLeagueSlug,
} from '../state/store';
import { showLeagueNotFound } from '../ui/screens';
import { showToast } from '../ui/toast';
import { showIntroOverlay } from '../ui/celebration';

// InstantDB instance - set during init
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

/**
 * Get the InstantDB app ID from Vite environment.
 */
export function getAppId(): string {
  return (window as Window & { VITE_APP_ID?: string }).VITE_APP_ID || '__INSTANTDB_APP_ID__';
}

/**
 * Get the InstantDB instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  return db;
}

/**
 * Initialize the application.
 * Sets up InstantDB, subscribes to league data, and renders UI.
 */
export function initApp(): void {
  console.log('=== INITIALIZING APP ===');

  // Initialize Sound Manager
  SoundManager.init();

  // Initialize InstantDB
  const appId = getAppId();
  console.log('Using InstantDB App ID:', appId ? appId.substring(0, 8) + '...' : 'NOT SET');

  const InstantDBInit = (window as Window & { InstantDBInit?: (config: { appId: string }) => unknown }).InstantDBInit;
  if (!InstantDBInit) {
    console.error('InstantDB not loaded');
    return;
  }

  db = InstantDBInit({ appId });
  console.log('InstantDB initialized:', db);

  // Expose db to window for other modules that need it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).db = db;

  const currentUserId = getUserId();
  console.log('Current user ID:', currentUserId);

  // Check for league parameter and admin override
  const urlParams = new URLSearchParams(window.location.search);
  let leagueParam = urlParams.get('league');
  const isAdminOverride = urlParams.get('isAdmin') === 'true';

  // If no URL param, check localStorage for saved league
  if (!leagueParam) {
    const savedLeague = localStorage.getItem('currentLeagueSlug');
    if (savedLeague) {
      leagueParam = savedLeague;
      console.log('Restored league from localStorage:', leagueParam);
      // Update URL to reflect the league (without reload)
      const newUrl = `${window.location.pathname}?league=${leagueParam}`;
      window.history.replaceState({}, '', newUrl);
    }
  }

  if (leagueParam) {
    // Track expected slug for "not found" handling
    setExpectedLeagueSlug(leagueParam);
    const gameId = (window as Window & { GAME_ID?: string }).GAME_ID || 'lx';

    // Subscribe to this specific league by slug
    db.subscribeQuery(
      {
        leagues: { $: { where: { gameId, slug: leagueParam } } },
        predictions: { $: { where: { gameId } } },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result: any) => {
        console.log('=== INSTANTDB SUBSCRIPTION UPDATE ===');
        console.log('Result:', result);

        if (result.error) {
          console.error('InstantDB error:', result.error);
          return;
        }

        const league = result.data.leagues[0] || null;
        setCurrentLeague(league);
        console.log('Current league:', league);

        // Detect actualResults changes
        if (league) {
          const currentActualResults = league.actualResults;
          const state = getState();

          // Check if actualResults changed and user is not on scores tab
          if (
            state.previousActualResults !== null &&
            JSON.stringify(currentActualResults) !== JSON.stringify(state.previousActualResults) &&
            state.currentTab !== 'scores'
          ) {
            // Only show notification if results have content
            if (currentActualResults && Object.keys(currentActualResults).length > 0) {
              setHasUnviewedScoreUpdate(true);
              // Call window version since it may have inline dependencies
              (window as Window & { updateScoresTabNotification?: () => void }).updateScoresTabNotification?.();
            }
          }

          setPreviousActualResults(
            currentActualResults ? JSON.parse(JSON.stringify(currentActualResults)) : null
          );

          // Filter predictions for this league
          const predictions = result.data.predictions.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (p: any) => p.leagueId === league.id
          );
          setAllPredictions(predictions);

          const isCreator = league.creatorId === currentUserId || isAdminOverride;
          setIsLeagueCreator(isCreator);
          console.log(
            'Is league creator:',
            isCreator,
            '(creatorId:',
            league.creatorId,
            ', userId:',
            currentUserId,
            ', adminOverride:',
            isAdminOverride,
            ')'
          );
          console.log('All predictions:', predictions);
        } else {
          console.log('No league found with slug:', leagueParam);
          setAllPredictions([]);
          // Clear localStorage since this league doesn't exist
          localStorage.removeItem('currentLeagueSlug');
        }

        render();
      }
    );
  } else {
    // No league parameter - show league creation
    document.getElementById('loading')?.classList.add('hidden');
    document.getElementById('leagueCreation')?.classList.remove('hidden');
    const form = document.getElementById('leagueForm') as HTMLFormElement | null;
    if (form) {
      form.onsubmit = handleLeagueCreation;
    }
  }
}

/**
 * Handle league creation form submission.
 */
export async function handleLeagueCreation(e: Event): Promise<void> {
  e.preventDefault();

  const input = document.getElementById('leagueName') as HTMLInputElement | null;
  if (!input) return;

  const leagueName = input.value.trim();
  const leagueSlug = leagueName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const gameId = (window as Window & { GAME_ID?: string }).GAME_ID || 'lx';
  const { currentUserId } = getState();

  // Check if a league with this slug already exists
  const existingLeague = await db.queryOnce({
    leagues: { $: { where: { gameId, slug: leagueSlug } } },
  });

  if (existingLeague.data.leagues && existingLeague.data.leagues.length > 0) {
    alert('A league with this name already exists. Please choose a different name.');
    return;
  }

  // Generate UUID for league
  const leagueId = crypto.randomUUID();

  // Create league
  await db.transact([
    db.tx.leagues[leagueId].update({
      gameId: gameId,
      slug: leagueSlug,
      name: leagueName,
      creatorId: currentUserId,
      isOpen: true,
      createdAt: Date.now(),
    }),
  ]);

  // Update URL
  const newUrl = `${window.location.pathname}?league=${leagueSlug}`;
  window.history.pushState({}, '', newUrl);

  // Reload to initialize with league
  window.location.reload();
}

/**
 * Main render function.
 * Updates UI based on current state.
 */
export function render(): void {
  console.log('=== RENDER CALLED ===');
  document.getElementById('loading')?.classList.add('hidden');

  const state = getState();
  const { currentLeague, expectedLeagueSlug, currentUserId, allPredictions } = state;

  if (!currentLeague) {
    console.log('No current league');
    // If we expected a league but didn't find it, show the not found screen
    if (expectedLeagueSlug) {
      console.log('Expected league slug:', expectedLeagueSlug, '- showing not found screen');
      showLeagueNotFound(expectedLeagueSlug);
    }
    return;
  }

  console.log('Rendering for league:', currentLeague.name);

  // League found successfully - save to localStorage
  localStorage.setItem('currentLeagueSlug', currentLeague.slug);

  // Hide not found screen if it was showing
  document.getElementById('leagueNotFound')?.classList.add('hidden');

  // Store league URL for copy function
  const shareUrl = `${window.location.origin}${window.location.pathname}?league=${currentLeague.slug}`;
  const shareUrlEl = document.getElementById('shareUrl');
  if (shareUrlEl) shareUrlEl.textContent = shareUrl;

  // Render league name in header
  (window as Window & { renderLeagueName?: () => void }).renderLeagueName?.();

  // Check if completion celebration was already shown for this league
  if (localStorage.getItem(`completionCelebration-${currentLeague.id}`) === 'true') {
    setHasShownCompletionCelebration(true);
  }

  // Check if user has set their team name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userPrediction = allPredictions.find((p: any) => p.userId === currentUserId);

  if (!userPrediction) {
    // Show team name entry - don't show leaderboard yet
    document.getElementById('teamNameEntry')?.classList.remove('hidden');
    const form = document.getElementById('teamNameForm') as HTMLFormElement | null;
    if (form) {
      form.onsubmit = handleTeamNameSubmit;
    }

    // Hide leaderboard on team entry screen
    document.getElementById('leaderboardSection')?.classList.add('hidden');
  } else {
    setCurrentTeamName(userPrediction.teamName);
    setIsManager(userPrediction.isManager === true);

    // Show the intro replay button for returning users
    document.getElementById('introReplayBtn')?.classList.remove('hidden');

    // Update tab labels with team name
    const adminTab = document.getElementById('adminPredictionsTab');
    const userTab = document.getElementById('userPredictionsTab');
    if (adminTab) adminTab.innerHTML = `Team ${userPrediction.teamName}`;
    if (userTab) userTab.innerHTML = `Team ${userPrediction.teamName}`;

    // Show admin panel for creator
    if (state.isLeagueCreator) {
      document.getElementById('adminPanel')?.classList.remove('hidden');
      (window as Window & { renderAdminControls?: () => void }).renderAdminControls?.();
    } else {
      // Show user panel for non-admin users
      document.getElementById('userPanel')?.classList.remove('hidden');
      (window as Window & { renderUserTabs?: () => void }).renderUserTabs?.();
    }

    // Render all content but preserve current tab
    (window as Window & { renderPredictionsForm?: () => void }).renderPredictionsForm?.();
    (window as Window & { renderParticipants?: () => void }).renderParticipants?.();

    // Restore the correct tab view (preserve current tab on re-renders)
    if (state.isLeagueCreator) {
      (window as Window & { switchTab?: (tab: string) => void }).switchTab?.(state.currentTab);
    } else {
      (window as Window & { switchUserTab?: (tab: string) => void }).switchUserTab?.(state.currentTab);
    }
  }

  // Show all predictions if admin enabled it (defaults to false)
  const showAllPredictionsEnabled = currentLeague.showAllPredictions === true;
  console.log('Show All Predictions:', showAllPredictionsEnabled);
  if (showAllPredictionsEnabled) {
    console.log('Rendering all predictions section...');
    (window as Window & { renderAllPredictions?: () => void }).renderAllPredictions?.();
  } else {
    console.log('Hiding all predictions section...');
    document.getElementById('allPredictionsSection')?.classList.add('hidden');
  }
}

/**
 * Handle team name submission.
 */
export async function handleTeamNameSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const input = document.getElementById('teamNameInput') as HTMLInputElement | null;
  if (!input) return;

  const teamName = input.value.trim();
  const state = getState();
  const { currentLeague, currentUserId, allPredictions } = state;

  // Validate length (3-15 characters)
  if (teamName.length < 3 || teamName.length > 15) {
    alert('Team name must be 3-15 characters.');
    return;
  }

  // Check if team name already exists (case-insensitive)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teamNameExists = allPredictions.some(
    (p: any) => p.teamName.toLowerCase() === teamName.toLowerCase()
  );

  if (teamNameExists) {
    alert('This team name is already taken. Please choose a different name.');
    return;
  }

  if (!currentLeague) {
    showToast('No league selected');
    return;
  }

  setCurrentTeamName(teamName);

  // Generate UUID for prediction
  const predictionId = crypto.randomUUID();
  const gameId = (window as Window & { GAME_ID?: string }).GAME_ID || 'lx';

  // Create initial prediction entry
  await db.transact([
    db.tx.predictions[predictionId].update({
      gameId: gameId,
      leagueId: currentLeague.id,
      userId: currentUserId,
      teamName: teamName,
      submittedAt: Date.now(),
      score: 0,
      tiebreakDiff: 0,
      isManager: false,
    }),
  ]);

  // Hide team name entry
  document.getElementById('teamNameEntry')?.classList.add('hidden');

  // Show celebratory intro overlay
  showIntroOverlay(teamName);

  // Show the intro replay button in header
  document.getElementById('introReplayBtn')?.classList.remove('hidden');
}

/**
 * Expose app functions to window for legacy compatibility.
 */
export function exposeAppToWindow(): void {
  const win = window as Window & {
    initApp?: typeof initApp;
    handleLeagueCreation?: typeof handleLeagueCreation;
    render?: typeof render;
    handleTeamNameSubmit?: typeof handleTeamNameSubmit;
    getAppId?: typeof getAppId;
  };

  win.initApp = initApp;
  win.handleLeagueCreation = handleLeagueCreation;
  win.render = render;
  win.handleTeamNameSubmit = handleTeamNameSubmit;
  win.getAppId = getAppId;

  console.log('App functions exposed to window');
}
