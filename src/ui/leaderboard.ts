import { countAnsweredQuestions } from '../components/helpers';
import { getState } from '../state/store';
import type { Prediction } from '../types';

import { triggerWinnerCelebration, triggerNonWinnerCelebration } from './celebration';

/**
 * Sort predictions by score (desc), then tiebreak diff (asc), then team name (alphabetic).
 */
export function sortLeaderboard(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.tiebreakDiff !== b.tiebreakDiff) return a.tiebreakDiff - b.tiebreakDiff;
    return a.teamName.localeCompare(b.teamName);
  });
}

/**
 * Render answer details for a prediction (used in leaderboard expandable sections).
 */
export function renderAnswerDetails(
  pred: Prediction,
  actualResults: Record<string, string | number> | null | undefined
): string {
  if (!pred.predictions) {
    return '<div class="answer-detail-empty">No predictions submitted</div>';
  }

  const { questions } = getState();

  let html = '';
  questions.forEach((q) => {
    const userAnswer = pred.predictions?.[q.questionId];
    const correctAnswer = actualResults?.[q.questionId];

    // Format the answer for display
    let displayAnswer: string | number | undefined = userAnswer;
    if (q.type === 'radio' && userAnswer && typeof userAnswer === 'string') {
      // Convert from slug format back to readable format
      displayAnswer = userAnswer
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    // Determine if answer is correct and set class
    let statusIcon = '';
    let answerClass = 'answer-neutral';

    if (correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '') {
      if (
        userAnswer === correctAnswer ||
        (q.type === 'number' && parseInt(String(userAnswer)) === parseInt(String(correctAnswer)))
      ) {
        answerClass = 'answer-correct';
        statusIcon = '\u2713';
      } else {
        answerClass = 'answer-incorrect';
        statusIcon = '\u2717';
      }
    }

    html += `
      <div class="answer-detail-item ${answerClass}">
        <span class="answer-detail-label">${q.label}</span>
        <span class="answer-detail-value">
          ${displayAnswer || '-'}
          ${statusIcon ? `<strong class="answer-status-icon">${statusIcon}</strong>` : ''}
        </span>
      </div>
    `;
  });

  return html;
}

/**
 * Render the leaderboard section.
 */
export function renderLeaderboard(): void {
  const state = getState();
  const leaderboardDiv = document.getElementById('leaderboard');

  if (!leaderboardDiv || !state.currentLeague) return;

  const currentLeague = state.currentLeague;
  const teamsWithPredictions = state.allPredictions.filter((p) => p.predictions);

  if (teamsWithPredictions.length === 0) {
    leaderboardDiv.innerHTML = '<div class="alert"><span>No predictions yet!</span></div>';
    return;
  }

  document.getElementById('leaderboardSection')?.classList.remove('hidden');

  // Check if any scores have been calculated
  const hasScores =
    currentLeague.actualResults && Object.keys(currentLeague.actualResults).length > 0;

  // Sort by score (desc), then tiebreak diff (asc), then team name (alphabetic)
  const sorted = sortLeaderboard(teamsWithPredictions);

  let html = '';

  // Count how many questions admin has answered
  const questions = state.questions;
  const answeredCount = countAnsweredQuestions(currentLeague.actualResults, questions);
  const totalQuestions = questions.length;

  // Show status message about admin progress
  if (answeredCount < totalQuestions) {
    html += `<div class="alert alert-info mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>${answeredCount} out of ${totalQuestions} answers checked.</span>
    </div>`;
  }

  // Track if we should trigger winner celebration
  let shouldCelebrate = false;

  sorted.forEach((pred, index) => {
    const isFirst = index === 0 && pred.score > 0 && hasScores;
    const isSecond = index === 1 && pred.score > 0 && hasScores;
    const isThird = index === 2 && pred.score > 0 && hasScores;
    const uniqueId = `answers-${pred.id}`;
    const canShowAnswers = !currentLeague.isOpen && currentLeague.showAllPredictions === true;

    // Determine place styling
    let placeClass = '';
    let placeEmoji = '';

    if (isFirst) {
      placeClass = 'place-gold';
      placeEmoji = '<span class="trophy-bounce leaderboard-trophy">🏆</span>';
      shouldCelebrate = true;
    } else if (isSecond) {
      placeClass = 'place-silver';
      placeEmoji = '<span class="leaderboard-medal">🥈</span>';
    } else if (isThird) {
      placeClass = 'place-bronze';
      placeEmoji = '<span class="leaderboard-medal">🥉</span>';
    }

    html += `
      <div class="card bg-base-200 ${placeClass}">
        <div class="card-body p-4">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                ${placeEmoji}
                <span class="badge badge-lg ${isFirst ? 'badge-primary' : 'badge-ghost'}">${index + 1}</span>
                <h3 class="text-lg font-bold">${pred.teamName}</h3>
              </div>
              ${pred.tiebreakDiff > 0 && hasScores ? `<div class="text-xs text-base-content/60 mt-1">Tiebreaker diff: ${pred.tiebreakDiff}</div>` : ''}
            </div>
            <div class="text-3xl font-bold text-primary">${hasScores ? pred.score : 0}</div>
          </div>
          ${
            canShowAnswers
              ? `
            <button class="btn btn-ghost btn-sm mt-2" onclick="toggleAnswers('${uniqueId}')">
              <span class="toggle-text">Show answers ▼</span>
            </button>
            <div id="${uniqueId}" class="collapsible-answers">
              ${renderAnswerDetails(pred, currentLeague.actualResults)}
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  });

  leaderboardDiv.innerHTML = html;

  // Trigger appropriate celebration if all questions are answered
  if (shouldCelebrate && answeredCount === totalQuestions) {
    // Find current user's position
    const currentUserPrediction = sorted.find((p) => p.userId === state.currentUserId);
    const userPosition = currentUserPrediction ? sorted.indexOf(currentUserPrediction) : -1;

    // Small delay to let the DOM update
    setTimeout(() => {
      if (userPosition === 0) {
        // User is the winner - show confetti
        triggerWinnerCelebration();
      } else if (userPosition > 0) {
        // User participated but didn't win - show encouraging message
        triggerNonWinnerCelebration(userPosition);
      }
    }, 300);
  }
}
