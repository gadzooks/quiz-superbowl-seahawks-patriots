interface SubmissionControlsProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  deadline?: Date | null;
}

/** Format a deadline Date for display (e.g., "3:10 PM PST") */
function formatDeadlineTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Toggle control for opening/closing submissions
 * Shows confirmation dialog before changing state
 */
export function SubmissionControls({ isOpen, onToggle, deadline }: SubmissionControlsProps) {
  const handleToggle = (newState: boolean) => {
    const action = newState ? 'open' : 'close';
    const confirmed = confirm(`Are you sure you want to ${action} submissions?`);
    if (confirmed) {
      onToggle(newState);
    }
  };

  return (
    <div className="admin-control-row">
      <span className="admin-control-label">Submissions</span>
      <div className="admin-toggle-group">
        <label
          className={`admin-toggle-option ${
            isOpen ? 'admin-toggle-active-open' : 'admin-toggle-inactive'
          }`}
        >
          <input
            type="radio"
            name="submissions"
            value="open"
            checked={isOpen}
            onChange={() => handleToggle(true)}
          />
          🔓 Open
        </label>
        <label
          className={`admin-toggle-option ${
            !isOpen ? 'admin-toggle-active-closed' : 'admin-toggle-inactive'
          }`}
        >
          <input
            type="radio"
            name="submissions"
            value="closed"
            checked={!isOpen}
            onChange={() => handleToggle(false)}
          />
          🔒 Closed
        </label>
      </div>
      {deadline && isOpen && deadline.getTime() > Date.now() && (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          Auto-closes at {formatDeadlineTime(deadline)}
        </div>
      )}
    </div>
  );
}
