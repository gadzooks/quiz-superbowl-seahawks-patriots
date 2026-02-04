import { type FormEvent, useEffect, useRef, useState } from 'react';

import { updateTeamName } from '../db/queries';

interface Prediction {
  id: string;
  userId: string;
  teamName: string;
  submittedAt: number;
  score: number;
  tiebreakDiff: number;
  isManager: boolean;
  predictions: Record<string, string | number>;
}

interface TeamNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionId: string | null; // null = editing own team, string = admin editing another team
  currentName: string; // current team name to pre-populate
  allPredictions: Prediction[];
  currentUserId: string;
  showToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
}

export function TeamNameModal({
  isOpen,
  onClose,
  predictionId,
  currentName,
  allPredictions,
  currentUserId,
  showToast,
}: TeamNameModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [teamName, setTeamName] = useState(currentName);

  // Open/close dialog based on isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setTeamName(currentName);
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen, currentName]);

  // Handle backdrop click
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newName = teamName.trim();

    // Validate length
    if (newName.length < 3 || newName.length > 15) {
      showToast('Team name must be 3-15 characters', 'error');
      return;
    }

    // Check if same as current name
    if (newName.toLowerCase() === currentName.toLowerCase()) {
      onClose();
      return;
    }

    // Determine which prediction is being edited
    const isAdminEdit = predictionId !== null;
    const excludeId = isAdminEdit
      ? predictionId
      : allPredictions.find((p) => p.userId === currentUserId)?.id;

    // Check if team name already exists (case-insensitive, excluding the team being edited)
    const teamNameExists = allPredictions.some(
      (p) => p.id !== excludeId && p.teamName.toLowerCase() === newName.toLowerCase()
    );

    if (teamNameExists) {
      showToast('This team name is already taken', 'error');
      return;
    }

    // Get the prediction to update
    let predictionToUpdate;
    if (isAdminEdit) {
      predictionToUpdate = allPredictions.find((p) => p.id === predictionId);
    } else {
      predictionToUpdate = allPredictions.find((p) => p.userId === currentUserId);
    }

    if (!predictionToUpdate) {
      showToast('Error: Could not find team', 'error');
      return;
    }

    try {
      await updateTeamName(predictionToUpdate.id, newName);
      onClose();
      showToast('Team name updated!', 'success');
    } catch (error) {
      console.error('Error updating team name:', error);
      showToast('Error updating team name', 'error');
    }
  };

  const getCharCountClass = () => {
    const length = teamName.length;
    if (length < 3) return 'char-count-error';
    if (length > 12) return 'char-count-warning';
    return 'char-count-valid';
  };

  const modalTitle = predictionId !== null ? `Edit Team: ${currentName}` : 'Edit Team Name';

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box bg-base-200">
        <h3 className="font-bold text-lg text-primary mb-4">{modalTitle}</h3>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Team Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-primary w-full text-lg"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={15}
              autoFocus
            />
            <div className={`char-count ${getCharCountClass()}`}>
              {teamName.length}/15 characters (min 3)
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
