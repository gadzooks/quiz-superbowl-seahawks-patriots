// Core type definitions for the Super Bowl Prediction Game

export interface Question {
  id: string;
  label: string;
  type: 'radio' | 'number';
  options?: string[];
  points: number;
}

export interface League {
  id: string;
  gameId: string;  // e.g., "lx", "lxi" - partitions data by Super Bowl year
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
  gameId: string;  // Denormalized from league for query efficiency
  leagueId: string;
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
  allPredictions: Prediction[];
  currentUserId: string;
  currentTeamName: string;
  isLeagueCreator: boolean;
  isManager: boolean;
  currentTab: TabType;
  hasShownCompletionCelebration: boolean;
  previousActualResults: Record<string, string | number> | null;
  hasUnviewedScoreUpdate: boolean;
  expectedLeagueSlug: string | null;
}

export type TabType = 'predictions' | 'scores' | 'results' | 'admin';

// InstantDB query result types
export interface InstantDBQueryResult {
  data: {
    leagues: League[];
    predictions: Prediction[];
  };
  error?: Error;
}
