import { triggerCelebration } from '../../db/queries';

interface CelebrationControlsProps {
  leagueId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

/**
 * Admin controls for triggering victory celebrations across all league participants
 * Shows buttons for each of the 3 celebration styles
 * Broadcasts celebrations to all users in real-time via InstantDB
 */
export function CelebrationControls({ leagueId, showToast }: CelebrationControlsProps) {
  const handleCelebration = async (type: 'stadium' | 'boom' | 'matrix', name: string) => {
    try {
      await triggerCelebration(leagueId, type);
      showToast(`🎉 ${name} celebration triggered for all users!`, 'success');
    } catch (error) {
      console.error('Error triggering celebration:', error);
      showToast('Failed to trigger celebration', 'error');
    }
  };

  return (
    <div className="card bg-base-200 shadow-md mb-4">
      <div className="card-body">
        <h3 className="card-title text-lg mb-2">🎊 Victory Celebrations</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Trigger epic full-screen celebrations for all participants!
        </p>

        <div className="flex flex-col gap-3">
          {/* Option 1: Stadium Roar */}
          <button
            type="button"
            onClick={() => void handleCelebration('stadium', '12th Man Stadium Roar')}
            className="btn btn-primary btn-block justify-start text-left h-auto py-3"
          >
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🏟️</span>
                <span className="font-bold">12th Man Stadium Roar</span>
              </div>
              <span className="text-xs opacity-80">
                Classic: Confetti, helmets, crowd wave, fireworks
              </span>
            </div>
          </button>

          {/* Option 2: Boom Tower */}
          <button
            type="button"
            onClick={() => void handleCelebration('boom', 'Boom Tower Shake')}
            className="btn btn-secondary btn-block justify-start text-left h-auto py-3"
          >
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">💥</span>
                <span className="font-bold">Boom Tower Shake</span>
              </div>
              <span className="text-xs opacity-80">
                Modern: Screen shake, explosions, rising elements
              </span>
            </div>
          </button>

          {/* Option 3: Matrix Rain */}
          <button
            type="button"
            onClick={() => void handleCelebration('matrix', 'Matrix Rain Championship')}
            className="btn btn-accent btn-block justify-start text-left h-auto py-3"
          >
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">💻</span>
                <span className="font-bold">Matrix Rain Championship</span>
              </div>
              <span className="text-xs opacity-80">
                Hacker: Terminal, code rain, glitch effects
              </span>
            </div>
          </button>
        </div>

        <div className="alert alert-info mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">
            Celebrations play for 5 seconds and can be triggered multiple times
          </span>
        </div>
      </div>
    </div>
  );
}
