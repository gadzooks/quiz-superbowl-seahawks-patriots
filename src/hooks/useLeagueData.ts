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
  const gameQuery = db.useQuery({
    games: {
      $: { where: { gameId } },
      questions: {
        $: { order: { serverCreatedAt: 'asc' } },
      },
    },
  });

  const leagueQuery = db.useQuery(
    slug
      ? {
          leagues: {
            $: { where: { slug } },
            predictions: {},
          },
        }
      : null
  );

  const isLoading = gameQuery.isLoading || leagueQuery.isLoading;
  const error = gameQuery.error || leagueQuery.error;

  // Extract and parse game with runtime validation
  const gameData = gameQuery.data?.games?.[0] || null;
  const game = parseGame(gameData);

  // Extract and parse questions with validation, sorted by sortOrder
  let questions: Question[] = [];
  if (gameData && typeof gameData === 'object' && 'questions' in gameData) {
    questions = parseQuestions(gameData.questions).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Extract and parse league with runtime validation
  const leagueData = leagueQuery.data?.leagues?.[0] || null;
  const league = parseLeague(leagueData);

  // Extract and parse predictions with validation
  let predictions: Prediction[] = [];
  if (leagueData && typeof leagueData === 'object' && 'predictions' in leagueData) {
    predictions = parsePredictions(leagueData.predictions);
  }

  return { game, league, predictions, questions, isLoading, error };
}
