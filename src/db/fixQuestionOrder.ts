// fixQuestionOrder.ts
// One-time utility to fix sortOrder for existing questions

import type { Question } from '../types';

import { db } from './client';
import { parseQuestions } from './typeHelpers';

type TransactionUpdate = ReturnType<(typeof db.tx.questions)[string]['update']>;

/**
 * Fix the sortOrder of all questions for a game to match the desired order.
 * Pass the desired question order as an array of questionIds.
 */
export async function fixQuestionOrder(
  gameInstantId: string,
  desiredQuestionIds: string[]
): Promise<number> {
  // Fetch existing questions
  const result = await db.queryOnce({
    games: {
      $: { where: { id: gameInstantId } },
      questions: {},
    },
  });

  const gameData = result.data.games[0];

  // Validate and extract questions using parseQuestions helper
  let existingQuestions: Question[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- gameData can be undefined if games array is empty
  if (gameData && typeof gameData === 'object' && 'questions' in gameData) {
    existingQuestions = parseQuestions(gameData.questions);
  }

  if (existingQuestions.length === 0) {
    return 0;
  }

  // Create a map of questionId -> InstantDB id
  const questionMap = new Map<string, string>();
  for (const q of existingQuestions) {
    questionMap.set(q.questionId, q.id);
  }

  // Build updates to set correct sortOrder
  const txs: TransactionUpdate[] = [];
  for (let i = 0; i < desiredQuestionIds.length; i++) {
    const questionId = desiredQuestionIds[i];
    const instantId = questionMap.get(questionId);
    if (instantId) {
      txs.push(
        db.tx.questions[instantId].update({
          sortOrder: i,
        })
      );
    }
  }

  if (txs.length > 0) {
    await db.transact(txs);
  }

  return txs.length;
}
