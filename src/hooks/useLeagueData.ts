import { db } from '../db/client';
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

  // Extract game
  const gameData = gameQuery.data?.games?.[0] || null;
  const game = gameData ? ({ ...gameData } as unknown as Game) : null;

  // Extract questions sorted by sortOrder
  let questions: Question[] = [];
  if (gameData) {
    const qData = (gameData as unknown as { questions?: unknown[] }).questions;
    questions = ((qData || []) as unknown as Question[]).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Extract league
  const leagueData = leagueQuery.data?.leagues?.[0] || null;
  const league = leagueData ? ({ ...leagueData } as unknown as League) : null;

  // Extract predictions
  let predictions: Prediction[] = [];
  if (leagueData) {
    const predData = (leagueData as unknown as { predictions?: unknown[] })?.predictions;
    predictions = (predData || []) as unknown as Prediction[];
  }

  return { game, league, predictions, questions, isLoading, error };
}
