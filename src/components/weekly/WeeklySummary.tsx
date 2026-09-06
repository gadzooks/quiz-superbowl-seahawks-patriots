import { formatQuizDate, getUpcomingQuizDate } from '../../config/games';
import type { WeeklyQuiz } from '../../hooks/useWeeklyLeagueData';
import { buildWeeklyPath } from '../../utils/game';

import { computeRunningTotals, getCurrentQuiz, getPastQuizzes } from './weeklyHelpers';

interface WeeklySummaryProps {
  leagueSlug: string;
  leagueName: string;
  quizzes: WeeklyQuiz[];
  isAdmin: boolean;
}

/**
 * /weekly/:leagueSlug — season summary: running total, this week's quiz,
 * and past weeks' results.
 */
export function WeeklySummary({ leagueSlug, leagueName, quizzes, isAdmin }: WeeklySummaryProps) {
  const runningTotals = computeRunningTotals(quizzes);
  const currentQuiz = getCurrentQuiz(quizzes);
  const pastQuizzes = getPastQuizzes(quizzes);
  const nextQuizDate = currentQuiz?.game.quizDate ?? getUpcomingQuizDate();

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary">{leagueName}</h2>

          <h3 className="font-semibold text-base-content mt-2">This Week</h3>
          {currentQuiz ? (
            <a
              className="btn btn-primary w-full"
              href={buildWeeklyPath(leagueSlug, currentQuiz.game.quizDate)}
            >
              {formatQuizDate(currentQuiz.game.quizDate ?? nextQuizDate)} quiz
            </a>
          ) : isAdmin ? (
            <a className="btn btn-primary w-full" href={buildWeeklyPath(leagueSlug, nextQuizDate)}>
              Create the {formatQuizDate(nextQuizDate)} quiz
            </a>
          ) : (
            <p className="text-base-content/70">No quiz scheduled yet — check back soon.</p>
          )}
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg text-primary">Running Total</h3>
          {runningTotals.length === 0 ? (
            <p className="text-base-content/70">No scores yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Weeks Played</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {runningTotals.map((row) => (
                  <tr key={row.userId}>
                    <td>{row.teamName}</td>
                    <td>{row.quizzesPlayed}</td>
                    <td className="font-bold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg text-primary">Past Quizzes</h3>
          {pastQuizzes.length === 0 ? (
            <p className="text-base-content/70">No past quizzes yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pastQuizzes.map((quiz) => (
                <li key={quiz.game.id}>
                  <a
                    className="link link-primary flex items-center justify-between"
                    href={buildWeeklyPath(leagueSlug, quiz.game.quizDate)}
                  >
                    <span>{formatQuizDate(quiz.game.quizDate ?? '')}</span>
                    <span className="text-sm text-base-content/60">
                      {quiz.game.actualResults ? 'Graded' : 'Awaiting grading'}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
