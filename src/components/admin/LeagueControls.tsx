import { ShowAnswersControl } from './ShowAnswersControl';
import { SubmissionControls } from './SubmissionControls';

interface LeagueControlsProps {
  isOpen: boolean;
  showAllPredictions: boolean;
  onToggleSubmissions: (isOpen: boolean) => void;
  onToggleShowAnswers: (show: boolean) => void;
}

/**
 * Grouped league control settings in a card
 * Contains submission open/close and answer visibility toggles
 */
export function LeagueControls({
  isOpen,
  showAllPredictions,
  onToggleSubmissions,
  onToggleShowAnswers,
}: LeagueControlsProps) {
  return (
    <div className="admin-section">
      <h3 className="admin-section-title">⚙️ League Settings</h3>
      <div className="admin-card" style={{ padding: 'var(--space-md)' }}>
        <SubmissionControls isOpen={isOpen} onToggle={onToggleSubmissions} />
        <div style={{ marginTop: 'var(--space-md)' }}>
          <ShowAnswersControl
            showAllPredictions={showAllPredictions}
            onToggle={onToggleShowAnswers}
          />
        </div>
      </div>
    </div>
  );
}
