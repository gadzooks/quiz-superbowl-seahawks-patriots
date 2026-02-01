// Participants Component
// Renders the list of participants with their progress

import { getState } from '../state/store';
import { getCurrentGameConfig } from '../utils/game';
import { getQuestionsForGame } from '../questions';
import {
  countAnsweredQuestions,
  getCompletionPercentage,
  sortPredictionsForParticipants,
  escapeForJs,
} from './helpers';

/**
 * Render the participants list.
 */
export function renderParticipants(): void {
  const { currentLeague, allPredictions, isLeagueCreator } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  const participantsDiv = document.getElementById('participantsList');
  if (!participantsDiv || !currentLeague) return;

  if (allPredictions.length === 0) {
    participantsDiv.innerHTML = '<div class="alert"><span>No participants yet!</span></div>';
    return;
  }

  const sorted = sortPredictionsForParticipants(allPredictions, questions);
  let html = '';

  sorted.forEach((pred) => {
    const answeredCount = countAnsweredQuestions(pred.predictions, questions);
    const totalQuestions = questions.length;
    const percentage = getCompletionPercentage(pred.predictions, questions);
    const isComplete = answeredCount === totalQuestions;
    const participantIsManager = pred.isManager === true;
    const escapedName = escapeForJs(pred.teamName);

    // Manager toggle (only visible to admin)
    const managerToggle = isLeagueCreator
      ? `
        <div class="mt-3" style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--color-text-muted); font-size: 13px; font-weight: 500;">Manager?</span>
          <label style="display: flex; gap: 4px;">
            <button onclick="toggleManager('${pred.id}', false)" style="padding: 6px 12px; border-radius: 6px 0 0 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${!participantIsManager ? 'background: var(--color-primary); color: var(--color-background); border: 2px solid var(--color-primary);' : 'background: var(--color-input-bg); color: var(--color-text-muted); border: 2px solid var(--color-text-muted);'}">No</button>
            <button onclick="toggleManager('${pred.id}', true)" style="padding: 6px 12px; border-radius: 0 6px 6px 0; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${participantIsManager ? 'background: #f59e0b; color: var(--color-background); border: 2px solid #f59e0b;' : 'background: var(--color-input-bg); color: var(--color-text-muted); border: 2px solid var(--color-text-muted);'}">👑 Yes</button>
          </label>
        </div>
      `
      : participantIsManager
        ? '<span class="badge badge-warning badge-sm mt-2" style="background: #f59e0b; color: var(--color-background);">👑 Manager</span>'
        : '';

    html += `
      <div class="card bg-base-200 shadow-lg ${isComplete ? 'ring-2 ring-success' : ''}">
        <div class="card-body p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-bold text-lg" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" onclick="openTeamNameModal('${pred.id}', '${escapedName}')">
                ${pred.teamName}
                <span class="team-name-edit-btn" style="font-size: 12px;">Edit</span>
              </h3>
              <p class="text-sm text-base-content/60 mt-1">
                ${answeredCount} of ${totalQuestions} questions answered
              </p>
              <div class="mt-3">
                <div class="flex justify-between text-xs mb-1">
                  <span>${percentage}%</span>
                  <span>${isComplete ? 'Complete!' : 'In progress'}</span>
                </div>
                <progress class="progress progress-primary w-full" value="${percentage}" max="100"></progress>
              </div>
              <div class="flex gap-2 flex-wrap items-center">
                <button onclick="copyParticipantLink('${pred.userId}', '${escapedName}')" class="btn btn-ghost btn-xs mt-3" style="color: var(--color-text-muted);">
                  📋 Copy recovery link
                </button>
                ${managerToggle}
                ${isLeagueCreator ? `<button onclick="openDeleteModal('${pred.id}', '${escapedName}')" class="delete-team-btn mt-3">🗑️ Delete</button>` : ''}
              </div>
            </div>
            <div class="ml-4">
              ${isComplete
                ? '<div class="badge badge-success badge-lg">✓</div>'
                : `<div class="radial-progress text-primary" style="--value:${percentage}; --size:3rem;">${percentage}%</div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  });

  participantsDiv.innerHTML = html;
}

/**
 * Copy participant recovery link to clipboard.
 */
export function copyParticipantLink(userId: string, teamName: string): void {
  const { currentLeague } = getState();
  if (!currentLeague) return;

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const link = `${baseUrl}?league=${currentLeague.slug}&user=${userId}`;

  navigator.clipboard.writeText(link).then(() => {
    import('../ui/toast').then(({ showToast }) => {
      showToast(`Recovery link copied for ${teamName}!`);
    });
  }).catch(() => {
    // Fallback for older browsers
    prompt(`Copy this recovery link for ${teamName}:`, link);
  });
}

// Expose to window
declare global {
  interface Window {
    copyParticipantLink: typeof copyParticipantLink;
    openDeleteModal: (predictionId: string, teamName: string) => void;
    toggleManager: (predictionId: string, makeManager: boolean) => void;
  }
}

/**
 * Expose participant functions to window for onclick handlers.
 */
export function exposeParticipantFunctions(): void {
  window.copyParticipantLink = copyParticipantLink;

  window.openDeleteModal = (predictionId: string, teamName: string) => {
    const modal = document.getElementById('deleteTeamModal') as HTMLDialogElement;
    const idInput = document.getElementById('deleteTeamId') as HTMLInputElement;
    const nameSpan = document.getElementById('deleteTeamName');

    if (modal && idInput && nameSpan) {
      idInput.value = predictionId;
      nameSpan.textContent = teamName;
      modal.showModal();
    }
  };

  window.toggleManager = async (predictionId: string, makeManager: boolean) => {
    const { toggleManager } = await import('../db/queries');
    const { showToast } = await import('../ui/toast');
    const { allPredictions } = getState();

    try {
      await toggleManager(predictionId, makeManager);
      const pred = allPredictions.find(p => p.id === predictionId);
      const teamName = pred?.teamName || 'Team';
      showToast(makeManager ? `${teamName} is now a manager!` : `${teamName} is no longer a manager.`);
    } catch (error) {
      console.error('Error toggling manager status:', error);
      showToast('Error updating manager status');
    }
  };
}
