import { formatQuizDate, getUpcomingQuizDate } from '../config/games';
import { db } from '../db/client';
import { useIsAnyLeagueAdmin } from '../hooks/useIsAnyLeagueAdmin';
import { useWeeklyLeagueData } from '../hooks/useWeeklyLeagueData';
import { buildWeeklyPath } from '../utils/game';

import { WeeklyLeagueCreate } from './weekly/WeeklyLeagueCreate';
import { WeeklyQuizView } from './weekly/WeeklyQuizView';
import { WeeklySummary } from './weekly/WeeklySummary';

interface WeeklyViewProps {
  leagueSlug: string | null;
  quizDate: string | null;
}

/**
 * Weekly quiz product surface. Routes: /weekly/:leagueSlug (season summary)
 * and /weekly/:leagueSlug/:quizDate (one week's quiz). Sign-in control
 * lives in the app-wide AccountBar, not here.
 */
export function WeeklyView({ leagueSlug, quizDate }: WeeklyViewProps) {
  const { user, isLoading: authLoading } = db.useAuth();
  const { league, quizzes, isLoading } = useWeeklyLeagueData(leagueSlug);
  const isAdmin = useIsAnyLeagueAdmin();

  if (!leagueSlug) {
    const upcomingDate = getUpcomingQuizDate();
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary">Weekly Quiz</h2>
          <p className="text-base-content/80">
            To visit a league, use its link, e.g. <code>/weekly/your-league/{upcomingDate}</code>.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!league) {
    if (!user) {
      return (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl text-primary">Weekly Quiz</h2>
            <p className="text-base-content/80">
              Sign in with Yahoo to create or join the "{leagueSlug}" league.
            </p>
          </div>
        </div>
      );
    }
    return <WeeklyLeagueCreate suggestedSlug={leagueSlug} />;
  }

  const teamName = user?.email?.split('@')[0] ?? 'Player';

  if (!quizDate) {
    return (
      <WeeklySummary
        leagueSlug={leagueSlug}
        leagueName={league.name}
        quizzes={quizzes}
        isAdmin={isAdmin}
      />
    );
  }

  if (!user) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary">{formatQuizDate(quizDate)}</h2>
          <p className="text-base-content/80">Sign in with Yahoo to answer this week's quiz.</p>
          <a className="link link-primary mt-2" href={buildWeeklyPath(leagueSlug)}>
            &larr; Back to {league.name}
          </a>
        </div>
      </div>
    );
  }

  const quiz = quizzes.find((q) => q.game.quizDate === quizDate) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <a className="link link-primary" href={buildWeeklyPath(leagueSlug)}>
        &larr; Back to {league.name}
      </a>
      <WeeklyQuizView
        league={league}
        quiz={quiz}
        quizDate={quizDate}
        userId={user.id}
        teamName={teamName}
        isAdmin={isAdmin}
      />
    </div>
  );
}
