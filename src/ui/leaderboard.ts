import { countAnsweredQuestions } from '../components/helpers';
import { getQuestionsForGame } from '../questions';
import { getState } from '../state/store';
import type { Prediction } from '../types';
import { getCurrentGameConfig } from '../utils/game';

import { triggerWinnerCelebration } from './celebration';

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
    return '<div style="padding: 12px; color: #9DA2A3; text-align: center;">No predictions submitted</div>';
  }

  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  let html = '';
  questions.forEach((q) => {
    const userAnswer = pred.predictions?.[q.id];
    const correctAnswer = actualResults?.[q.id];

    // Format the answer for display
    let displayAnswer: string | number | undefined = userAnswer;
    if (q.type === 'radio' && userAnswer && typeof userAnswer === 'string') {
      // Convert from slug format back to readable format
      displayAnswer = userAnswer
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    // Determine if answer is correct and set colors
    let bgColor = '#00203B';
    let borderColor = '#9DA2A3';
    let textColor = '#FFFFFF';
    let statusIcon = '';
    let answerClass = '';

    if (correctAnswer !== undefined && correctAnswer !== null && correctAnswer !== '') {
      if (
        userAnswer === correctAnswer ||
        (q.type === 'number' && parseInt(String(userAnswer)) === parseInt(String(correctAnswer)))
      ) {
        answerClass = 'correct';
        bgColor = '#003320';
        borderColor = '#33F200';
        textColor = '#33F200';
        statusIcon = '✓';
      } else {
        answerClass = 'incorrect';
        bgColor = '#330a0a';
        borderColor = '#ff6b6b';
        textColor = '#ff9999';
        statusIcon = '✗';
      }
    }

    html += `
      <div class="answer-item ${answerClass}" style="background-color: ${bgColor}; border: 2px solid ${borderColor}; ${answerClass ? `border-left: 6px solid ${borderColor};` : ''} padding: 16px 20px; margin: 8px 0; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: ${textColor}; font-size: 16px; font-weight: 500;">${q.label}</span>
        <span style="color: ${textColor}; font-size: 18px; font-weight: 700;">
          ${displayAnswer || '-'}
          ${statusIcon ? `<strong style="margin-left: 10px; font-size: 20px;">${statusIcon}</strong>` : ''}
        </span>
      </div>
    `;
  });

  return html;
}

/**
 * Render the leaderboard section.
 * Copied from inline implementation for consistency, will refactor later.
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
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);
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
    let shimmerClass = '';

    if (isFirst) {
      placeClass = 'place-gold';
      placeEmoji =
        '<span class="trophy-bounce" style="font-size: 28px; margin-right: 8px;">🏆</span>';
      shimmerClass = 'winner-shimmer';
      shouldCelebrate = true;
    } else if (isSecond) {
      placeClass = 'place-silver';
      placeEmoji = '<span style="font-size: 24px; margin-right: 8px;">🥈</span>';
    } else if (isThird) {
      placeClass = 'place-bronze';
      placeEmoji = '<span style="font-size: 24px; margin-right: 8px;">🥉</span>';
    }

    html += `
      <div class="card bg-base-200 shadow-lg ${placeClass} ${shimmerClass}">
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

  // Trigger winner celebration if there's a first place winner
  if (shouldCelebrate && answeredCount === totalQuestions) {
    // Small delay to let the DOM update
    setTimeout(() => {
      triggerWinnerCelebration();
    }, 300);
  }
}
