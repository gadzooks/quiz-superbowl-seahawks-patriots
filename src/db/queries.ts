import { id } from '@instantdb/core';

import { calculateScore, calculateTiebreakDiff } from '../scoring/calculate';
import type { Game, League, Prediction, Question } from '../types';

import { db } from './client';

// Re-export id helper for generating IDs
export { id };

// Type for InstantDB transaction chunks (supports mixed entity types)
type TransactionUpdate =
  | ReturnType<(typeof db.tx.leagues)[string]['update']>
  | ReturnType<(typeof db.tx.leagues)[string]['link']>
  | ReturnType<(typeof db.tx.games)[string]['update']>
  | ReturnType<(typeof db.tx.questions)[string]['update']>
  | ReturnType<(typeof db.tx.questions)[string]['link']>
  | ReturnType<(typeof db.tx.predictions)[string]['update']>
  | ReturnType<(typeof db.tx.predictions)[string]['link']>
  | ReturnType<(typeof db.tx.predictions)[string]['delete']>;

/**
 * Subscribe to a game, its league (by slug), league predictions, and game questions.
 * Uses link-based nested queries.
 * Returns an unsubscribe function.
 */
export function subscribeToLeague(
  gameId: string,
  slug: string,
  callback: (data: {
    game: Game | null;
    league: League | null;
    predictions: Prediction[];
    questions: Question[];
  }) => void
): () => void {
  return db.subscribeQuery(
    {
      games: {
        $: { where: { gameId } },
        questions: {
          $: { order: { serverCreatedAt: 'asc' } },
        },
      },
      leagues: {
        $: { where: { slug } },
        predictions: {},
      },
    },
    (result) => {
      if (result.error) {
        console.error('InstantDB error:', result.error);
        return;
      }

      const gameData = result.data.games[0] || null;
      const game = gameData ? ({ ...gameData } as unknown as Game) : null;

      // League is queried as a top-level entity (not nested under game)
      // so it works even if the league isn't linked to the game yet
      const leagueData = result.data.leagues[0] || null;
      const league = leagueData ? ({ ...leagueData } as unknown as League) : null;

      let predictions: Prediction[] = [];
      if (leagueData) {
        const predData = (leagueData as unknown as { predictions?: unknown[] })?.predictions;
        predictions = (predData || []) as unknown as Prediction[];
      }

      let questions: Question[] = [];
      if (gameData) {
        const qData = (gameData as unknown as { questions?: unknown[] }).questions;
        questions = ((qData || []) as unknown as Question[]).sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
      }

      callback({ game, league, predictions, questions });
    }
  );
}

/**
 * Check if a league with the given slug exists for a specific game.
 */
export async function leagueExists(gameId: string, slug: string): Promise<boolean> {
  const result = await db.queryOnce({
    games: {
      $: { where: { gameId } },
      leagues: { $: { where: { slug } } },
    },
  });
  const gameData = result.data.games[0];
  if (!gameData) return false;
  const leagues = (gameData as unknown as { leagues?: unknown[] }).leagues;
  return (leagues?.length ?? 0) > 0;
}

/**
 * Get a game by its gameId. Returns the game's InstantDB id or null.
 */
export async function getGameByGameId(
  gameId: string
): Promise<(Game & { _instantDbId: string }) | null> {
  const result = await db.queryOnce({
    games: { $: { where: { gameId } } },
  });
  const game = result.data.games[0];
  if (!game) return null;
  return { ...(game as unknown as Game), _instantDbId: game.id };
}

/**
 * Seed a game into the database if it doesn't exist.
 * Returns the InstantDB id of the game.
 */
export async function seedGame(config: {
  gameId: string;
  displayName: string;
  year: number;
  team1: string;
  team2: string;
}): Promise<string> {
  const existing = await getGameByGameId(config.gameId);
  if (existing) return existing._instantDbId;

  const gameInstantId = id();
  await db.transact([
    db.tx.games[gameInstantId].update({
      gameId: config.gameId,
      displayName: config.displayName,
      year: config.year,
      team1: config.team1,
      team2: config.team2,
    }),
  ]);
  return gameInstantId;
}

/**
 * Seed questions for a game if none exist.
 */
export async function seedQuestions(
  gameInstantId: string,
  questions: Array<{
    questionId: string;
    label: string;
    type: string;
    options?: string[];
    points: number;
    sortOrder: number;
    isTiebreaker: boolean;
  }>
): Promise<void> {
  // Check if questions already exist for this game
  const result = await db.queryOnce({
    games: {
      $: { where: { id: gameInstantId } },
      questions: {},
    },
  });
  const gameData = result.data.games[0];
  const existingQuestions = (gameData as unknown as { questions?: unknown[] })?.questions;
  if (existingQuestions && existingQuestions.length > 0) return;

  const txs: TransactionUpdate[] = [];
  for (const q of questions) {
    const qId = id();
    txs.push(
      db.tx.questions[qId].update({
        questionId: q.questionId,
        label: q.label,
        type: q.type,
        options: q.options ?? null,
        points: q.points,
        sortOrder: q.sortOrder,
        isTiebreaker: q.isTiebreaker,
      })
    );
    txs.push(db.tx.questions[qId].link({ game: gameInstantId }));
  }
  await db.transact(txs);
}

/**
 * Create a new league linked to a game.
 */
export async function createLeague(data: {
  gameInstantId: string;
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
    db.tx.leagues[leagueId].link({ game: data.gameInstantId }),
  ]);
  return leagueId;
}

/**
 * Update league open/closed status.
 */
export async function updateLeagueStatus(leagueId: string, isOpen: boolean): Promise<void> {
  await db.transact([db.tx.leagues[leagueId].update({ isOpen })]);
}

/**
 * Update league showAllPredictions setting.
 */
export async function updateShowAllPredictions(leagueId: string, show: boolean): Promise<void> {
  await db.transact([db.tx.leagues[leagueId].update({ showAllPredictions: show })]);
}

/**
 * Save actual results and update all prediction scores.
 */
export async function saveResults(
  leagueId: string,
  results: Record<string, string | number>,
  predictions: Prediction[],
  questions: Question[]
): Promise<void> {
  const updates: TransactionUpdate[] = [db.tx.leagues[leagueId].update({ actualResults: results })];

  // Recalculate scores for all predictions
  for (const pred of predictions) {
    const score = calculateScore(pred.predictions, results, questions);
    const diff = calculateTiebreakDiff(pred.predictions, results);
    const tiebreakDiff = Number.isFinite(diff) ? diff : 0;
    updates.push(db.tx.predictions[pred.id].update({ score, tiebreakDiff }));
  }

  await db.transact(updates);
}

/**
 * Clear results and reset all scores.
 */
export async function clearResults(leagueId: string, predictions: Prediction[]): Promise<void> {
  const updates: TransactionUpdate[] = [db.tx.leagues[leagueId].update({ actualResults: null })];

  for (const pred of predictions) {
    updates.push(db.tx.predictions[pred.id].update({ score: 0, tiebreakDiff: 0 }));
  }

  await db.transact(updates);
}

/**
 * Create or update a prediction linked to a league.
 */
export async function savePrediction(data: {
  id?: string;
  leagueId: string;
  userId: string;
  teamName: string;
  predictions: Record<string, string | number>;
  isManager?: boolean;
  actualResults?: Record<string, string | number> | null;
  questions?: Question[];
}): Promise<string> {
  const predictionId = data.id || id();
  const score =
    data.actualResults && data.questions
      ? calculateScore(data.predictions, data.actualResults, data.questions)
      : 0;

  // Only calculate tiebreakDiff if actualResults exists and has data
  // calculateTiebreakDiff can return Infinity which breaks InstantDB, so convert to 0
  const hasActualResults = data.actualResults && Object.keys(data.actualResults).length > 0;
  let tiebreakDiff = 0;
  if (hasActualResults) {
    const diff = calculateTiebreakDiff(data.predictions, data.actualResults);
    tiebreakDiff = Number.isFinite(diff) ? diff : 0;
  }

  const txs: TransactionUpdate[] = [
    db.tx.predictions[predictionId].update({
      userId: data.userId,
      teamName: data.teamName,
      predictions: data.predictions,
      submittedAt: Date.now(),
      score,
      tiebreakDiff,
      isManager: data.isManager ?? false,
    }),
  ];

  // Only link on creation (no existing id)
  if (!data.id) {
    txs.push(db.tx.predictions[predictionId].link({ league: data.leagueId }));
  }

  await db.transact(txs);

  return predictionId;
}

/**
 * Update team name for a prediction.
 */
export async function updateTeamName(predictionId: string, teamName: string): Promise<void> {
  await db.transact([db.tx.predictions[predictionId].update({ teamName })]);
}

/**
 * Toggle manager status for a prediction.
 */
export async function toggleManager(predictionId: string, isManager: boolean): Promise<void> {
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
  actualResults: Record<string, string | number> | null,
  questions: Question[]
): Promise<number> {
  if (!actualResults) return 0;

  const updates: TransactionUpdate[] = [];

  for (const pred of predictions) {
    const score = calculateScore(pred.predictions, actualResults, questions);
    const diff = calculateTiebreakDiff(pred.predictions, actualResults);
    const tiebreakDiff = Number.isFinite(diff) ? diff : 0;
    updates.push(db.tx.predictions[pred.id].update({ score, tiebreakDiff }));
  }

  if (updates.length > 0) {
    await db.transact(updates);
  }

  return updates.length;
}
