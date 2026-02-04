import { useState, type FormEvent } from 'react';

import { handleLeagueCreation } from '../handlers/league';
import { buildGamePath } from '../utils/game';

interface LeagueCreationProps {
  gameId: string;
}

export function LeagueCreation({ gameId }: LeagueCreationProps) {
  const [leagueName, setLeagueName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Navigate to the new league URL
        window.history.pushState({}, '', buildGamePath(gameId, result.slug));
        window.location.reload();
      } else {
        alert(result.error || 'Failed to create league');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('An error occurred while creating the league');
      console.error('League creation error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary">Create Your League</h2>
        <p className="text-base-content/80">
          Enter a name for your prediction league. You'll get a shareable link to invite others!
        </p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-base-content">League Name</span>
            </label>
            <input
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
