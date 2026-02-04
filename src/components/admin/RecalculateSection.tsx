import { useState } from 'react';

interface RecalculateSectionProps {
  onRecalculate: () => Promise<void>;
  hasResults: boolean;
}

/**
 * Collapsible section for recalculating all participant scores
 * Only enabled when actual results have been entered
 */
export function RecalculateSection({ onRecalculate, hasResults }: RecalculateSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState('');

  const handleRecalculate = async () => {
    if (!hasResults) {
      setStatus('No actual results entered yet');
      return;
    }

    setStatus('Recalculating scores...');
    try {
      await onRecalculate();
      setStatus('Scores recalculated successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error recalculating scores:', error);
      setStatus('Error recalculating scores');
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="collapsible-toggle"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          cursor: 'pointer',
        }}
      >
        <span className="admin-control-label">Recalculate Scores</span>
        <span className="collapsible-icon">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: 'var(--color-input-bg)',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Recalculate all participant scores based on the current actual results. This is useful
            if you've updated the results or scoring logic.
          </p>
          <button
            onClick={() => void handleRecalculate()}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-background)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Recalculate All Scores
          </button>
          {status && (
            <div className="status-text-muted" style={{ marginTop: '12px' }}>
              {status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
