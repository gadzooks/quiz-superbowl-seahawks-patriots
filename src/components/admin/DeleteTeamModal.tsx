interface DeleteTeamModalProps {
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal for deleting a team from the league
 * Shows warning that deletion cannot be undone
 */
export function DeleteTeamModal({ teamName, onConfirm, onCancel }: DeleteTeamModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'var(--color-background)',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '400px',
          width: '90%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Delete Team</h3>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Are you sure you want to delete <strong>{teamName}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-error)',
              color: 'var(--color-background)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
