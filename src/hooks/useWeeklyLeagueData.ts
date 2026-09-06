/* eslint-disable no-restricted-syntax -- InstantDB query results are cast after runtime validation, matching src/db/typeHelpers.ts */
import { useMemo } from 'react';

import { db } from '../db/client';
import { parseGame, parseLeague, parsePredictions, parseQuestions } from '../db/typeHelpers';
import type { Game, League, Prediction, Question } from '../types';

export interface WeeklyQuiz {
  game: Game;
  questions: Question[];
  /** Predictions submitted by members of this league for this quiz. */
  predictions: Prediction[];
}

interface WeeklyLeagueData {
  league: League | null;
  quizzes: WeeklyQuiz[];
  isLoading: boolean;
  error: unknown;
}

/**
 * Data for a weekly league's summary and single-quiz views. Quizzes are
 * global (every weekly league sees every quiz), so this fetches all weekly
 * games and filters each one's predictions down to this league's members.
 */
export function useWeeklyLeagueData(leagueSlug: string | null): WeeklyLeagueData {
  const leagueQuery = db.useQuery(
    leagueSlug
      ? {
          leagues: {
            $: { where: { slug: leagueSlug } },
            admins: {},
          },
        }
      : null
  );

  const quizzesQuery = db.useQuery({
    games: {
      $: { where: { eventType: 'weekly' } },
      questions: { $: { order: { sortOrder: 'asc' } } },
      gamePredictions: { league: {} },
    },
  });

  const leagueData = leagueQuery.data?.leagues[0];
  const league = useMemo(() => parseLeague(leagueData), [leagueData]);

  const quizzes = useMemo(() => {
    if (!league) return [];
    const gamesData = quizzesQuery.data?.games ?? [];

    const result: WeeklyQuiz[] = [];
    for (const gameData of gamesData) {
      const game = parseGame(gameData);
      if (!game) continue;

      const questions = parseQuestions(
        'questions' in gameData ? gameData.questions : undefined
      ).sort((a, b) => a.sortOrder - b.sortOrder);

      const gamePredictions =
        'gamePredictions' in gameData && Array.isArray(gameData.gamePredictions)
          ? gameData.gamePredictions
          : [];
      const leaguePredictions = gamePredictions.filter((p) => {
        const predLeague = (p as { league?: { id?: string } }).league;
        return predLeague?.id === league.id;
      });

      result.push({
        game,
        questions,
        predictions: parsePredictions(leaguePredictions),
      });
    }

    return result.sort((a, b) => (a.game.quizDate ?? '').localeCompare(b.game.quizDate ?? ''));
  }, [league, quizzesQuery.data]);

  return {
    league,
    quizzes,
    isLoading: leagueQuery.isLoading || quizzesQuery.isLoading,
    error: leagueQuery.error ?? quizzesQuery.error,
  };
}
