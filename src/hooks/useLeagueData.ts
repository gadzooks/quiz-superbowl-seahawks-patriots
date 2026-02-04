import { db } from '../db/client';
import { parseGame, parseLeague, parsePredictions, parseQuestions } from '../db/typeHelpers';
import type { Game, League, Prediction, Question } from '../types';

interface LeagueData {
  game: Game | null;
  league: League | null;
  predictions: Prediction[];
  questions: Question[];
  isLoading: boolean;
  error: unknown;
}

/**
 * Hook that subscribes to real-time league data via InstantDB.
 * Replaces the old subscribeToLeague callback pattern.
 */
export function useLeagueData(gameId: string, slug: string | null): LeagueData {
  // Query games with nested questions and leagues
  // This ensures we only get leagues for the specific game
  const queryConfig = {
    games: {
      $: { where: { gameId } },
      questions: {
        $: { order: { serverCreatedAt: 'asc' } },
      },
      ...(slug
        ? {
            leagues: {
              $: { where: { slug } },
              predictions: {},
            },
          }
        : {}),
    },
  };

  // @ts-expect-error - InstantDB types don't properly support conditional nested queries
  const gameQuery = db.useQuery(queryConfig);

  // Extract data from the nested query
  const gameData = gameQuery.data?.games?.[0];
  const leagueData = gameData && 'leagues' in gameData ? gameData.leagues?.[0] : null;

  const isLoading = gameQuery.isLoading;
  const error = gameQuery.error;

  // Extract and parse game with runtime validation (excluding nested leagues)
  const { leagues: _, ...gameDataOnly } = gameData ?? {};
  const game = parseGame(gameDataOnly);

  // Extract and parse questions with validation, sorted by sortOrder
  let questions: Question[] = [];
  if (gameData && typeof gameData === 'object' && 'questions' in gameData) {
    questions = parseQuestions(gameData.questions).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Extract and parse league with runtime validation
  const league = parseLeague(leagueData);

  // Extract and parse predictions with validation
  let predictions: Prediction[] = [];
  if (leagueData && typeof leagueData === 'object' && 'predictions' in leagueData) {
    predictions = parsePredictions(leagueData.predictions);
  }

  return { game, league, predictions, questions, isLoading, error };
}
