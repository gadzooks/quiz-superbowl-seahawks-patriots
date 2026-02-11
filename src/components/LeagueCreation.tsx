// LeagueCreation.tsx

import { useState, type FormEvent, useEffect, useRef } from 'react';

import { getGameConfig, isGameCompleted } from '../config/games';
import { db } from '../db/client';
import { handleLeagueCreation } from '../handlers/league';
import { buildGamePath } from '../utils/game';

interface LeagueCreationProps {
  gameId: string;
}

export function LeagueCreation({ gameId }: LeagueCreationProps) {
  const gameConfig = getGameConfig(gameId);
  const isCompleted = gameConfig ? isGameCompleted(gameConfig) : false;

  const [leagueName, setLeagueName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wait for league to exist in InstantDB before navigating
  // Query through game relationship to ensure we find the right league
  const leagueQuery = db.useQuery(
    pendingSlug
      ? {
          games: {
            $: { where: { gameId } },
            leagues: {
              $: { where: { slug: pendingSlug } },
            },
          },
        }
      : null
  );

  // Navigate once league is available in the subscription
  useEffect(() => {
    if (!pendingSlug) return;

    // Check if league exists in query results (nested under games)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const gameData = leagueQuery.data?.games?.[0];
    const leagueExists =
      gameData &&
      'leagues' in gameData &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      gameData.leagues &&
      Array.isArray(gameData.leagues) &&
      gameData.leagues.length > 0;

    if (leagueExists) {
      // League found! Navigate immediately
      window.history.pushState({}, '', buildGamePath(gameId, pendingSlug));
      window.location.reload();
    } else if (!leagueQuery.isLoading) {
      // If query finished but league not found, set a timeout fallback
      // In case of subscription delay, navigate after 2 seconds
      navigationTimeoutRef.current ??= setTimeout(() => {
        window.history.pushState({}, '', buildGamePath(gameId, pendingSlug));
        window.location.reload();
      }, 2000);
    }

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, [pendingSlug, leagueQuery.data, leagueQuery.isLoading, gameId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!leagueName.trim()) {
      alert('Please enter a league name');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await handleLeagueCreation(leagueName.trim());

      if (result.success && result.slug) {
        // Set pending slug to trigger subscription and wait for league to exist
        setPendingSlug(result.slug);
      } else {
        alert(result.error ?? 'Failed to create league');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('An error occurred while creating the league');
      console.error('League creation error:', error);
      setIsSubmitting(false);
    }
  };

  // Show message if game is completed
  if (isCompleted) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary">
            {gameConfig?.displayName ?? 'Game'} Has Ended
          </h2>
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>This event has ended. New leagues can no longer be created for this event.</span>
          </div>
          <p className="text-base-content/70 mt-4">
            You can still browse existing leagues if you have a league link. All data is available
            in read-only mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">Create Your League</h2>
        <p className="text-base-content/80">
          Enter a name for your prediction league. You'll get a shareable link to invite others!
        </p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-control">
            <label className="label" htmlFor="league-name">
              <span className="label-text text-base-content">League Name</span>
            </label>
            <input
              id="league-name"
              type="text"
              className="input input-bordered input-primary w-full text-lg"
              placeholder="e.g., Good Vibes"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create League'}
          </button>
        </form>
      </div>
    </div>
  );
}
