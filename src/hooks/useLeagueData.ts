import { useRef, useMemo } from 'react';

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
 * Return the previous value if the new JSON serialization is the same.
 * This gives stable references even when db.useQuery() returns new objects
 * with identical content on every render.
 */
function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  const prevJson = useRef<string>('');

  const json = JSON.stringify(value);
  if (json !== prevJson.current) {
    ref.current = value;
    prevJson.current = json;
  }

  return ref.current;
}

/**
 * Keep the last non-nullish value. When InstantDB's IDB cache briefly drops
 * (e.g. "database connection is closing" error), useQuery can return
 * incomplete data. This prevents downstream components from unmounting
 * due to a transient null.
 */
function useLastValid<T>(value: T): T {
  const ref = useRef(value);
  const isEmpty = Array.isArray(value) && value.length === 0;
  if (value != null && !isEmpty) {
    ref.current = value;
  }
  return ref.current;
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
        $: { order: { sortOrder: 'asc' } },
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

  // Stabilize the raw query data so downstream useMemo calls only recompute
  // when the actual content changes, not just the object reference.
  const gameData = useStableValue(gameQuery.data?.games?.[0]);
  const leagueData = useStableValue(
    gameData && 'leagues' in gameData ? gameData.leagues?.[0] : null
  );

  const isLoading = gameQuery.isLoading;
  const error = gameQuery.error;

  // Memoize parsed results so downstream components get stable references
  // and don't re-render unless the underlying InstantDB data actually changes.
  const game = useMemo(() => {
    const { leagues: _, ...gameDataOnly } = gameData ?? {};
    return parseGame(gameDataOnly);
  }, [gameData]);

  const questions = useMemo(() => {
    if (gameData && typeof gameData === 'object' && 'questions' in gameData) {
      return parseQuestions(gameData.questions).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    const empty: Question[] = [];
    return empty;
  }, [gameData]);

  const league = useMemo(() => parseLeague(leagueData), [leagueData]);

  const predictions = useMemo(() => {
    if (leagueData && typeof leagueData === 'object' && 'predictions' in leagueData) {
      return parsePredictions(leagueData.predictions);
    }
    const empty: Prediction[] = [];
    return empty;
  }, [leagueData]);

  // Defend against transient nulls from InstantDB IDB cache errors.
  // Keep the last valid values so downstream components don't unmount/remount.
  const stableGame = useLastValid(game);
  const stableLeague = useLastValid(league);
  const stablePredictions = useLastValid(predictions);
  const stableQuestions = useLastValid(questions);

  return {
    game: stableGame,
    league: stableLeague,
    predictions: stablePredictions,
    questions: stableQuestions,
    isLoading,
    error,
  };
}
