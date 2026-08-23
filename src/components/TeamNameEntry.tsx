import { useState, type FormEvent } from 'react';

import { db } from '../db/client';
import { savePrediction } from '../db/queries';
import { validateTeamName } from '../services/validation';
import type { League } from '../types';
import { startYahooLogin } from '../utils/yahooAuth';

interface TeamNameEntryProps {
  league: League;
  userId: string;
  showToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
  onRegistered: (teamName: string) => void;
}

export function TeamNameEntry({ league, userId, showToast, onRegistered }: TeamNameEntryProps) {
  const { user, isLoading: authLoading } = db.useAuth();
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = teamName.trim();

    const validation = validateTeamName(trimmedName);
    if (!validation.valid) {
      showToast(validation.error ?? 'Invalid team name', 'error');
      return;
    }

    if (!user) {
      startYahooLogin(window.location.pathname);
      return;
    }

    setIsSubmitting(true);

    try {
      await savePrediction({
        leagueId: league.id,
        userId,
        teamName: trimmedName,
        predictions: {},
        isManager: false,
        authUserId: user.id,
      });

      onRegistered(trimmedName);
    } catch (error) {
      showToast('An error occurred while registering your team name', 'error');
      console.error('Team name registration error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">Enter Your Team Name</h2>
        <p className="text-base-content/80">Choose a unique name for your team in this league.</p>
        <p className="text-sm mt-2 text-warning">
          ⚠️ Choose carefully — only admins can change team names later.
        </p>
        {!authLoading && !user && (
          <p className="text-sm text-base-content/60 mt-2">
            You'll need to sign in with Yahoo to join this league.
          </p>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label" htmlFor="teamNameInput">
              <span className="label-text text-base-content">Your Team Name</span>
            </label>
            <input
              type="text"
              id="teamNameInput"
              className="input input-bordered input-primary w-full text-lg"
              placeholder="e.g., John's Picks"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              minLength={3}
              maxLength={15}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? 'Joining...' : user ? 'Continue' : 'Sign in with Yahoo'}
          </button>
        </form>
      </div>
    </div>
  );
}
