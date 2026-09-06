import { useState, type FormEvent } from 'react';

import { db } from '../../db/client';
import { handleWeeklyLeagueCreation } from '../../handlers/league';
import { startYahooLogin } from '../../utils/yahooAuth';

interface WeeklyLeagueCreateProps {
  /** Slug from the URL, used to prefill the name so the created league matches. */
  suggestedSlug: string;
}

/**
 * Shown at /weekly/:leagueSlug when no league exists yet for that slug.
 * Whoever creates it becomes its admin (leagueAdmins link), same as Super
 * Bowl leagues today.
 */
export function WeeklyLeagueCreate({ suggestedSlug }: WeeklyLeagueCreateProps) {
  const { user, isLoading: authLoading } = db.useAuth();
  const [leagueName, setLeagueName] = useState(suggestedSlug.replace(/-/g, ' '));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!leagueName.trim()) {
      setError('Please enter a league name');
      return;
    }

    if (!user) {
      startYahooLogin(window.location.pathname);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await handleWeeklyLeagueCreation(leagueName.trim(), user.id);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error ?? 'Failed to create league');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred while creating the league');
      console.error('Weekly league creation error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">Start This Weekly League</h2>
        <p className="text-base-content/80">
          No league found for this link yet. Create it and you'll be its admin — able to add each
          week's quiz and grade it once the week is over.
        </p>
        {!authLoading && !user && (
          <p className="text-sm text-base-content/60 mt-2">
            You'll need to sign in with Yahoo to create a league.
          </p>
        )}

        {error && (
          <div className="alert alert-error mt-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-control">
            <label className="label" htmlFor="weekly-league-name">
              <span className="label-text text-base-content">League Name</span>
            </label>
            <input
              id="weekly-league-name"
              type="text"
              className="input input-bordered input-primary w-full text-lg"
              placeholder="e.g., Smith Family"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg mt-4"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? 'Creating...' : user ? 'Create League' : 'Sign in with Yahoo'}
          </button>
        </form>
      </div>
    </div>
  );
}
