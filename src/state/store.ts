import type { Game, League, Prediction, Question, TabType, AppState } from '../types';

// Initial state
const initialState: AppState = {
  currentLeague: null,
  currentGame: null,
  questions: [],
  allPredictions: [],
  currentUserId: '',
  currentTeamName: '',
  isLeagueCreator: false,
  isManager: false,
  currentTab: (localStorage.getItem('currentTab') as TabType) || 'predictions',
  hasShownCompletionCelebration: false,
  hasTriggeredNonWinnerCelebration: false,
  previousActualResults: null,
  hasUnviewedScoreUpdate: false,
  expectedLeagueSlug: null,
};

// Private state object
let state: AppState = { ...initialState };

// Listeners for state changes
type StateListener = (state: AppState) => void;
const listeners: Set<StateListener> = new Set();

/**
 * Get the current state (read-only).
 */
export function getState(): Readonly<AppState> {
  return state;
}

/**
 * Subscribe to state changes.
 * Returns an unsubscribe function.
 */
export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of state change.
 */
function notifyListeners(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

// State setters

export function setCurrentLeague(league: League | null): void {
  state = { ...state, currentLeague: league };
  notifyListeners();
}

export function setCurrentGame(game: Game | null): void {
  state = { ...state, currentGame: game };
  notifyListeners();
}

export function setQuestions(questions: Question[]): void {
  state = { ...state, questions };
  notifyListeners();
}

export function setAllPredictions(predictions: Prediction[]): void {
  state = { ...state, allPredictions: predictions };
  notifyListeners();
}

export function setCurrentUserId(userId: string): void {
  state = { ...state, currentUserId: userId };
  notifyListeners();
}

export function setCurrentTeamName(teamName: string): void {
  state = { ...state, currentTeamName: teamName };
  notifyListeners();
}

export function setIsLeagueCreator(isCreator: boolean): void {
  state = { ...state, isLeagueCreator: isCreator };
  notifyListeners();
}

export function setIsManager(isManager: boolean): void {
  state = { ...state, isManager: isManager };
  notifyListeners();
}

export function setCurrentTab(tab: TabType): void {
  state = { ...state, currentTab: tab };
  localStorage.setItem('currentTab', tab);
  notifyListeners();
}

export function setHasShownCompletionCelebration(shown: boolean): void {
  state = { ...state, hasShownCompletionCelebration: shown };
  notifyListeners();
}

export function setPreviousActualResults(results: Record<string, string | number> | null): void {
  state = { ...state, previousActualResults: results };
  notifyListeners();
}

export function setHasUnviewedScoreUpdate(hasUpdate: boolean): void {
  state = { ...state, hasUnviewedScoreUpdate: hasUpdate };
  notifyListeners();
}

export function setExpectedLeagueSlug(slug: string | null): void {
  state = { ...state, expectedLeagueSlug: slug };
  notifyListeners();
}

/**
 * Batch update multiple state properties at once.
 * More efficient than calling multiple setters.
 */
export function updateState(updates: Partial<AppState>): void {
  state = { ...state, ...updates };
  if (updates.currentTab !== undefined) {
    localStorage.setItem('currentTab', updates.currentTab);
  }
  notifyListeners();
}

/**
 * Reset state to initial values.
 */
export function resetState(): void {
  state = { ...initialState };
  notifyListeners();
}

// Computed getters

/**
 * Get the current user's prediction, if any.
 */
export function getCurrentUserPrediction(): Prediction | undefined {
  return state.allPredictions.find((p) => p.userId === state.currentUserId);
}

/**
 * Check if the current user has admin access.
 * Admin = league creator OR has isAdmin=true URL param OR is a manager.
 */
export function hasAdminAccess(): boolean {
  return state.isLeagueCreator || state.isManager;
}

/**
 * Check if submissions are currently open.
 */
export function isSubmissionsOpen(): boolean {
  return state.currentLeague?.isOpen ?? false;
}

/**
 * Check if results have been entered.
 */
export function hasResults(): boolean {
  const results = state.currentLeague?.actualResults;
  return results !== null && results !== undefined && Object.keys(results).length > 0;
}

// Type declaration for window extensions
declare global {
  interface Window {
    AppState: {
      getState: typeof getState;
      subscribe: typeof subscribe;
      updateState: typeof updateState;
      setCurrentLeague: typeof setCurrentLeague;
      setCurrentGame: typeof setCurrentGame;
      setQuestions: typeof setQuestions;
      setAllPredictions: typeof setAllPredictions;
      setCurrentUserId: typeof setCurrentUserId;
      setCurrentTeamName: typeof setCurrentTeamName;
      setIsLeagueCreator: typeof setIsLeagueCreator;
      setIsManager: typeof setIsManager;
      setCurrentTab: typeof setCurrentTab;
      setHasShownCompletionCelebration: typeof setHasShownCompletionCelebration;
      setPreviousActualResults: typeof setPreviousActualResults;
      setHasUnviewedScoreUpdate: typeof setHasUnviewedScoreUpdate;
      setExpectedLeagueSlug: typeof setExpectedLeagueSlug;
      getCurrentUserPrediction: typeof getCurrentUserPrediction;
      hasAdminAccess: typeof hasAdminAccess;
      isSubmissionsOpen: typeof isSubmissionsOpen;
      hasResults: typeof hasResults;
      resetState: typeof resetState;
    };
  }
}
