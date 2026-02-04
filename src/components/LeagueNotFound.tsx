import { buildGamePath } from '../utils/game';

interface LeagueNotFoundProps {
  slug: string;
  gameId: string;
}

export function LeagueNotFound({ slug, gameId }: LeagueNotFoundProps) {
  const handleCreateNewLeague = () => {
    localStorage.removeItem('currentLeagueSlug');
    window.location.href = buildGamePath(gameId);
  };

  const handleEnterDifferentLeague = () => {
    localStorage.removeItem('currentLeagueSlug');
    window.location.href = buildGamePath(gameId);
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">League Not Found</h2>
        <p className="text-base-content/80">
          We couldn't find a league with the slug you provided.
        </p>
        <p className="text-sm text-base-content/60 mt-2">League slug: "{slug}"</p>

        <div className="divider">What would you like to do?</div>

        <button className="btn btn-primary w-full btn-lg" onClick={handleCreateNewLeague}>
          Create a New League
        </button>

        <button
          className="btn btn-outline btn-secondary w-full"
          onClick={handleEnterDifferentLeague}
        >
          Enter a Different League
        </button>
      </div>
    </div>
  );
}
