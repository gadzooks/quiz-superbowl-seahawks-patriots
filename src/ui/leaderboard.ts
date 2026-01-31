import type { Prediction } from '../types';
import { getState } from '../state/store';
import { triggerWinnerCelebration } from './celebration';

/**
 * Sort predictions by score (desc), then tiebreak diff (asc), then submission time (asc).
 */
export function sortLeaderboard(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => {
    // Primary: higher score wins
    if (b.score !== a.score) return b.score - a.score;

    // Secondary: lower tiebreak diff wins
    if (a.tiebreakDiff !== b.tiebreakDiff) return a.tiebreakDiff - b.tiebreakDiff;

    // Tertiary: earlier submission wins
    return a.submittedAt - b.submittedAt;
  });
}

/**
 * Render the leaderboard section.
 */
export function renderLeaderboard(): void {
  const state = getState();
  const container = document.getElementById('leaderboardTable');

  if (!container || !state.currentLeague) return;

  const hasResults =
    state.currentLeague.actualResults &&
    Object.keys(state.currentLeague.actualResults).length > 0;

  const sortedPredictions = sortLeaderboard(state.allPredictions);

  if (sortedPredictions.length === 0) {
    container.innerHTML = `
      <div class="text-center text-seahawks-grey py-8">
        <p class="text-lg">No predictions yet</p>
        <p class="text-sm mt-2">Be the first to make your picks!</p>
      </div>
    `;
    return;
  }

  // Determine if current user is a winner (first place, has results)
  let isCurrentUserWinner = false;
  if (hasResults && sortedPredictions.length > 0) {
    const topScore = sortedPredictions[0].score;
    const topTiebreak = sortedPredictions[0].tiebreakDiff;
    isCurrentUserWinner = sortedPredictions.some(
      (p) =>
        p.userId === state.currentUserId &&
        p.score === topScore &&
        p.tiebreakDiff === topTiebreak
    );

    if (isCurrentUserWinner) {
      triggerWinnerCelebration();
    }
  }

  let html = '';
  let currentRank = 0;
  let lastScore = -1;
  let lastTiebreak = -1;

  sortedPredictions.forEach((pred, index) => {
    // Calculate rank (handle ties)
    if (pred.score !== lastScore || pred.tiebreakDiff !== lastTiebreak) {
      currentRank = index + 1;
      lastScore = pred.score;
      lastTiebreak = pred.tiebreakDiff;
    }

    const isCurrentUser = pred.userId === state.currentUserId;
    const isWinner = hasResults && currentRank === 1;

    // Rank display with trophy for winners
    let rankDisplay = `#${currentRank}`;
    if (isWinner) {
      rankDisplay = '🏆';
    } else if (currentRank === 2) {
      rankDisplay = '🥈';
    } else if (currentRank === 3) {
      rankDisplay = '🥉';
    }

    html += `
      <div class="leaderboard-row ${isCurrentUser ? 'current-user' : ''} ${isWinner ? 'winner' : ''}">
        <div class="rank">${rankDisplay}</div>
        <div class="team-name">
          ${pred.teamName}
          ${pred.isManager ? '<span class="badge badge-sm badge-ghost ml-1">Manager</span>' : ''}
          ${isCurrentUser ? '<span class="badge badge-sm badge-primary ml-1">You</span>' : ''}
        </div>
        <div class="score">
          ${hasResults ? pred.score : '-'}
          ${hasResults && pred.tiebreakDiff !== undefined ? `<span class="tiebreak">(±${pred.tiebreakDiff})</span>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
