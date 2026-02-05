interface ShowAnswersControlProps {
  showAllPredictions: boolean;
  onToggle: (show: boolean) => void;
}

/**
 * Toggle control for showing/hiding all participant answers
 * Shows confirmation dialog before changing state
 */
export function ShowAnswersControl({ showAllPredictions, onToggle }: ShowAnswersControlProps) {
  const handleToggle = (show: boolean) => {
    const action = show ? 'show' : 'hide';
    const confirmed = confirm(`Are you sure you want to ${action} all answers?`);
    if (confirmed) {
      onToggle(show);
    }
  };

  return (
    <div className="admin-control-row">
      <span className="admin-control-label">Show Answers</span>
      <div className="admin-toggle-group">
        <label
          className={`admin-toggle-option ${
            !showAllPredictions ? 'admin-toggle-active-open' : 'admin-toggle-inactive'
          }`}
        >
          <input
            type="radio"
            name="showPredictions"
            value="hidden"
            checked={!showAllPredictions}
            onChange={() => handleToggle(false)}
          />
          🔒 Hidden
        </label>
        <label
          className={`admin-toggle-option ${
            showAllPredictions ? 'admin-toggle-active-closed' : 'admin-toggle-inactive'
          }`}
        >
          <input
            type="radio"
            name="showPredictions"
            value="visible"
            checked={showAllPredictions}
            onChange={() => handleToggle(true)}
          />
          👁️ Visible
        </label>
      </div>
    </div>
  );
}
