// Core type definitions for the Super Bowl Prediction Game

export interface Game {
  id: string;
  gameId: string;
  displayName: string;
  year: number;
  team1: string;
  team2: string;
}

export interface Question {
  id: string;
  questionId: string;
  label: string;
  type: 'radio' | 'number';
  options?: string[];
  points: number;
  sortOrder: number;
  isTiebreaker: boolean;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  creatorId: string;
  isOpen: boolean;
  createdAt: number;
  actualResults: Record<string, string | number> | null;
  showAllPredictions: boolean;
}

export interface Prediction {
  id: string;
  userId: string;
  teamName: string;
  submittedAt: number;
  score: number;
  tiebreakDiff: number;
  isManager: boolean;
  predictions: Record<string, string | number>;
}

export interface AppState {
  currentLeague: League | null;
  currentGame: Game | null;
  questions: Question[];
  allPredictions: Prediction[];
  currentUserId: string;
  currentTeamName: string;
  isLeagueCreator: boolean;
  isManager: boolean;
  currentTab: TabType;
  hasShownCompletionCelebration: boolean;
  hasTriggeredNonWinnerCelebration: boolean;
  previousActualResults: Record<string, string | number> | null;
  hasUnviewedScoreUpdate: boolean;
  expectedLeagueSlug: string | null;
}

export type TabType = 'predictions' | 'scores' | 'results' | 'admin';
