import { memo } from 'react';

interface UnsavedChangesBarProps {
  saveStatus: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  onCancel: () => void;
}

export const UnsavedChangesBar = memo(function UnsavedChangesBar({
  saveStatus,
  onSave,
  onCancel,
}: UnsavedChangesBarProps) {
  return (
    <div className="unsaved-changes-bar">
      <div className="unsaved-changes-bar-inner">
        {saveStatus !== 'saved' && (
          <button
            type="button"
            className="btn btn-md unsaved-cancel-btn"
            disabled={saveStatus === 'saving'}
            onClick={onCancel}
          >
            Discard Changes
          </button>
        )}
        <button
          type="button"
          className={`btn btn-md unsaved-save-btn ${
            saveStatus === 'saved' ? 'save-btn-saved' : 'btn-primary save-btn-unsaved'
          }`}
          disabled={saveStatus === 'saving'}
          onClick={onSave}
        >
          {saveStatus === 'saving'
            ? 'Saving...'
            : saveStatus === 'saved'
              ? '\u2705 Saved!'
              : 'Submit'}
        </button>
      </div>
    </div>
  );
});
