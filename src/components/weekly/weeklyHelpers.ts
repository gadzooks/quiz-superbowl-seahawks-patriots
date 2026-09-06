import type { WeeklyQuiz } from '../../hooks/useWeeklyLeagueData';

export interface RunningTotal {
  userId: string;
  teamName: string;
  total: number;
  quizzesPlayed: number;
}

/**
 * Sum each participant's score across every graded/ungraded quiz prediction
 * in a league, for the season-long "running total" leaderboard.
 */
export function computeRunningTotals(quizzes: WeeklyQuiz[]): RunningTotal[] {
  const totals = new Map<string, RunningTotal>();

  for (const quiz of quizzes) {
    for (const prediction of quiz.predictions) {
      const existing = totals.get(prediction.userId);
      if (existing) {
        existing.total += prediction.score;
        existing.quizzesPlayed += 1;
        existing.teamName = prediction.teamName; // keep most recent display name
      } else {
        totals.set(prediction.userId, {
          userId: prediction.userId,
          teamName: prediction.teamName,
          total: prediction.score,
          quizzesPlayed: 1,
        });
      }
    }
  }

  return [...totals.values()].sort(
    (a, b) => b.total - a.total || a.teamName.localeCompare(b.teamName)
  );
}

/** The earliest still-open quiz (sorted ascending by quizDate). Open/closed is admin-controlled, not date-derived. */
export function getCurrentQuiz(quizzes: WeeklyQuiz[]): WeeklyQuiz | null {
  return quizzes.find((q) => q.game.isOpen !== false) ?? null;
}

/** Closed quizzes, most recently dated first. */
export function getPastQuizzes(quizzes: WeeklyQuiz[]): WeeklyQuiz[] {
  return quizzes
    .filter((q) => q.game.isOpen === false)
    .sort((a, b) => (b.game.quizDate ?? '').localeCompare(a.game.quizDate ?? ''));
}
