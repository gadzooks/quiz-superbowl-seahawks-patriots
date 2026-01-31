import { db } from './client';
import { id } from '@instantdb/core';
import type { League, Prediction } from '../types';
import { calculateScore, calculateTiebreakDiff } from '../scoring/calculate';

// Re-export id helper for generating IDs
export { id };

// Type for InstantDB transaction updates
type TransactionUpdate = ReturnType<typeof db.tx.leagues[string]['update']>;

/**
 * Subscribe to a league and its predictions by slug.
 * Returns an unsubscribe function.
 */
export function subscribeToLeague(
  slug: string,
  callback: (data: { league: League | null; predictions: Prediction[] }) => void
): () => void {
  return db.subscribeQuery(
    {
      leagues: { $: { where: { slug } } },
      predictions: {},
    },
    (result) => {
      if (result.error) {
        console.error('InstantDB error:', result.error);
        return;
      }

      const league = (result.data.leagues[0] as League | undefined) || null;
      const predictions = league
        ? (result.data.predictions as Prediction[]).filter((p) => p.leagueId === league.id)
        : [];

      callback({ league, predictions });
    }
  );
}

/**
 * Check if a league with the given slug exists.
 */
export async function leagueExists(slug: string): Promise<boolean> {
  const result = await db.queryOnce({
    leagues: { $: { where: { slug } } },
  });
  return result.data.leagues.length > 0;
}

/**
 * Create a new league.
 */
export async function createLeague(data: {
  name: string;
  slug: string;
  creatorId: string;
}): Promise<string> {
  const leagueId = id();
  await db.transact([
    db.tx.leagues[leagueId].update({
      slug: data.slug,
      name: data.name,
      creatorId: data.creatorId,
      isOpen: true,
      createdAt: Date.now(),
      actualResults: null,
      showAllPredictions: false,
    }),
  ]);
  return leagueId;
}

/**
 * Update league open/closed status.
 */
export async function updateLeagueStatus(
  leagueId: string,
  isOpen: boolean
): Promise<void> {
  await db.transact([db.tx.leagues[leagueId].update({ isOpen })]);
}

/**
 * Update league showAllPredictions setting.
 */
export async function updateShowAllPredictions(
  leagueId: string,
  show: boolean
): Promise<void> {
  await db.transact([db.tx.leagues[leagueId].update({ showAllPredictions: show })]);
}

/**
 * Save actual results and update all prediction scores.
 */
export async function saveResults(
  leagueId: string,
  results: Record<string, string | number>,
  predictions: Prediction[]
): Promise<void> {
  const updates: TransactionUpdate[] = [
    db.tx.leagues[leagueId].update({ actualResults: results }),
  ];

  // Recalculate scores for all predictions
  for (const pred of predictions) {
    const score = calculateScore(pred.predictions, results);
    const tiebreakDiff = calculateTiebreakDiff(pred.predictions, results);
    updates.push(
      db.tx.predictions[pred.id].update({ score, tiebreakDiff })
    );
  }

  await db.transact(updates);
}

/**
 * Clear results and reset all scores.
 */
export async function clearResults(
  leagueId: string,
  predictions: Prediction[]
): Promise<void> {
  const updates: TransactionUpdate[] = [
    db.tx.leagues[leagueId].update({ actualResults: null }),
  ];

  for (const pred of predictions) {
    updates.push(
      db.tx.predictions[pred.id].update({ score: 0, tiebreakDiff: 0 })
    );
  }

  await db.transact(updates);
}

/**
 * Create or update a prediction.
 */
export async function savePrediction(data: {
  id?: string;
  leagueId: string;
  userId: string;
  teamName: string;
  predictions: Record<string, string | number>;
  isManager?: boolean;
  actualResults?: Record<string, string | number> | null;
}): Promise<string> {
  const predictionId = data.id || id();
  const score = data.actualResults
    ? calculateScore(data.predictions, data.actualResults)
    : 0;
  const tiebreakDiff = data.actualResults
    ? calculateTiebreakDiff(data.predictions, data.actualResults)
    : 0;

  await db.transact([
    db.tx.predictions[predictionId].update({
      leagueId: data.leagueId,
      userId: data.userId,
      teamName: data.teamName,
      predictions: data.predictions,
      submittedAt: Date.now(),
      score,
      tiebreakDiff,
      isManager: data.isManager ?? false,
    }),
  ]);

  return predictionId;
}

/**
 * Update team name for a prediction.
 */
export async function updateTeamName(
  predictionId: string,
  teamName: string
): Promise<void> {
  await db.transact([db.tx.predictions[predictionId].update({ teamName })]);
}

/**
 * Toggle manager status for a prediction.
 */
export async function toggleManager(
  predictionId: string,
  isManager: boolean
): Promise<void> {
  await db.transact([db.tx.predictions[predictionId].update({ isManager })]);
}

/**
 * Delete a prediction.
 */
export async function deletePrediction(predictionId: string): Promise<void> {
  await db.transact([db.tx.predictions[predictionId].delete()]);
}

/**
 * Recalculate scores for all predictions.
 */
export async function recalculateAllScores(
  predictions: Prediction[],
  actualResults: Record<string, string | number> | null
): Promise<number> {
  if (!actualResults) return 0;

  const updates: TransactionUpdate[] = [];

  for (const pred of predictions) {
    const score = calculateScore(pred.predictions, actualResults);
    const tiebreakDiff = calculateTiebreakDiff(pred.predictions, actualResults);
    updates.push(db.tx.predictions[pred.id].update({ score, tiebreakDiff }));
  }

  if (updates.length > 0) {
    await db.transact(updates);
  }

  return updates.length;
}
