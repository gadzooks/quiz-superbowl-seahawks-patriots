import { useState } from 'react';

import { updateQuizStatus } from '../../db/queries';

interface WeeklyQuizAdminControlsProps {
  gameInstantId: string;
  isOpen: boolean;
}

/**
 * Admin-only open/close toggle for a weekly quiz. Deliberately not tied to
 * quizDate — some quizzes close the same day, others 2-3 days later, so the
 * admin decides when answers stop being accepted, not the calendar.
 */
export function WeeklyQuizAdminControls({ gameInstantId, isOpen }: WeeklyQuizAdminControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await updateQuizStatus(gameInstantId, !isOpen);
    } catch (err) {
      console.error('updateQuizStatus failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body py-3 flex-row items-center justify-between">
        <span className="text-sm text-base-content/70">
          Quiz is currently <strong>{isOpen ? 'open' : 'closed'}</strong> for answers.
        </span>
        <button
          type="button"
          className={`btn btn-sm ${isOpen ? 'btn-error' : 'btn-primary'}`}
          disabled={isUpdating}
          onClick={() => void handleToggle()}
        >
          {isUpdating ? '...' : isOpen ? 'Close Quiz' : 'Reopen Quiz'}
        </button>
      </div>
    </div>
  );
}
