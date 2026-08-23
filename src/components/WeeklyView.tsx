import { formatQuizDate, getUpcomingQuizDate } from '../config/games';
import { buildWeeklyPath } from '../utils/game';

interface WeeklyViewProps {
  leagueSlug: string | null;
  quizDate: string | null;
}

/**
 * Weekly quiz product surface (placeholder).
 * Routes: /weekly/:leagueSlug and /weekly/:leagueSlug/:quizDate
 * Data wiring (quiz questions, predictions, standings) lands in a later phase.
 * Sign-in control lives in the app-wide AccountBar, not here.
 */
export function WeeklyView({ leagueSlug, quizDate }: WeeklyViewProps) {
  const upcomingDate = getUpcomingQuizDate();

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">Weekly Quiz</h2>

        {leagueSlug ? (
          <>
            <p className="text-base-content/80">League: "{leagueSlug}"</p>
            {quizDate ? (
              <p className="text-base-content/80">Quiz for {formatQuizDate(quizDate)}</p>
            ) : (
              <p className="text-base-content/80">
                No quiz week selected. The upcoming quiz week is{' '}
                <a className="link link-primary" href={buildWeeklyPath(leagueSlug, upcomingDate)}>
                  {formatQuizDate(upcomingDate)}
                </a>
                .
              </p>
            )}
            <p className="text-sm text-base-content/60 mt-2">
              Weekly quizzes are coming soon. Check back here for this week's questions.
            </p>
          </>
        ) : (
          <p className="text-base-content/80">
            Weekly quizzes are coming soon. To visit a league, use its link, e.g.{' '}
            <code>/weekly/your-league/{upcomingDate}</code>.
          </p>
        )}
      </div>
    </div>
  );
}
