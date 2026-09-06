import { formatQuizDate } from '../../config/games';
import type { WeeklyQuiz } from '../../hooks/useWeeklyLeagueData';
import type { League } from '../../types';

import { WeeklyGradingForm } from './WeeklyGradingForm';
import { WeeklyPredictionForm } from './WeeklyPredictionForm';
import { WeeklyQuizAdminControls } from './WeeklyQuizAdminControls';
import { WeeklyQuizAuthorForm } from './WeeklyQuizAuthorForm';
import { WeeklyQuizResults } from './WeeklyQuizResults';

interface WeeklyQuizViewProps {
  league: League;
  quiz: WeeklyQuiz | null;
  quizDate: string;
  userId: string;
  teamName: string;
  isAdmin: boolean;
}

/** /weekly/:leagueSlug/:quizDate — one specific week's quiz. */
export function WeeklyQuizView({
  league,
  quiz,
  quizDate,
  userId,
  teamName,
  isAdmin,
}: WeeklyQuizViewProps) {
  if (!quiz) {
    if (isAdmin) {
      return <WeeklyQuizAuthorForm quizDate={quizDate} onCreated={() => undefined} />;
    }
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary">{formatQuizDate(quizDate)}</h2>
          <p className="text-base-content/70">
            This week's quiz hasn't been created yet. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  const userPrediction = quiz.predictions.find((p) => p.userId === userId);
  const isClosed = quiz.game.isOpen === false;

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && <WeeklyQuizAdminControls gameInstantId={quiz.game.id} isOpen={!isClosed} />}

      {userPrediction ? (
        <WeeklyQuizResults
          questions={quiz.questions}
          userPrediction={userPrediction}
          actualResults={quiz.game.actualResults}
          leaguePredictions={quiz.predictions}
        />
      ) : isClosed ? (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl text-primary">{formatQuizDate(quizDate)}</h2>
            <p className="text-base-content/70">
              This quiz's window has closed and you didn't submit an answer.
            </p>
          </div>
        </div>
      ) : (
        <WeeklyPredictionForm
          gameInstantId={quiz.game.id}
          leagueId={league.id}
          userId={userId}
          teamName={teamName}
          questions={quiz.questions}
          onSubmitted={() => undefined}
        />
      )}

      {isAdmin && isClosed && !quiz.game.actualResults && (
        <WeeklyGradingForm
          gameInstantId={quiz.game.id}
          questions={quiz.questions}
          predictions={quiz.predictions}
          onGraded={() => undefined}
        />
      )}
    </div>
  );
}
