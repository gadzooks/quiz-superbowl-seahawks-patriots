import { sortPredictionsForLeaderboard } from '../components/helpers';
import type { Prediction } from '../types';

/**
 * Service for celebration logic
 * Handles completion transitions and leaderboard position calculations
 */
export class CelebrationService {
  /**
   * Check if a completion celebration should trigger
   * Triggers when:
   * 1. User transitions from incomplete to complete, OR
   * 2. First save in session and already complete
   */
  static checkCompletionTransition(
    previousCount: number,
    currentCount: number,
    totalQuestions: number,
    isFirstSave: boolean
  ): boolean {
    const wasIncomplete = previousCount < totalQuestions;
    const isNowComplete = currentCount === totalQuestions;

    // Celebrate if transitioning to complete OR first save and already complete
    return isNowComplete && (wasIncomplete || isFirstSave);
  }

  /**
   * Calculate user's position in the leaderboard (0-indexed)
   * Returns the index of the user in the sorted predictions list
   * Returns -1 if user not found
   */
  static calculateLeaderboardPosition(userId: string, predictions: Prediction[]): number {
    const sorted = sortPredictionsForLeaderboard(predictions);
    return sorted.findIndex((p) => p.userId === userId);
  }

  /**
   * Check if user should get winner celebration (top 3)
   * Position is 0-indexed, so top 3 are positions 0, 1, 2
   */
  static isWinnerPosition(position: number): boolean {
    return position >= 0 && position < 3;
  }

  /**
   * Check if user should get non-winner celebration (4th place or below)
   */
  static isNonWinnerPosition(position: number): boolean {
    return position >= 3;
  }
}
