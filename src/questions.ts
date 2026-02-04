// questions.ts

import type { GameConfig } from './config/games';
import type { Question } from './types';

/**
 * Generate questions with dynamic team names from game config.
 * This allows the same question structure to work for any Super Bowl matchup.
 */
export function createQuestions(teams: [string, string]): Question[] {
  const [team1, team2] = teams;

  return [
    { id: 'winner', label: `The winner is ...`, type: 'radio', options: [team1, team2], points: 6 },
    {
      id: 'winningMargin',
      label: 'Winning margin?',
      type: 'radio',
      options: ['1-7', '8-14', '15+'],
      points: 6,
    },
    {
      id: 'firstHalfLeader',
      label: 'Halftime leader?',
      type: 'radio',
      options: [team1, team2, 'Tied'],
      points: 3,
    },
    { id: 'totalTDs', label: 'Total touchdowns?', type: 'number', points: 3 },
    { id: 'overtime', label: 'Overtime?', type: 'radio', options: ['Yes', 'No'], points: 3 },
    {
      id: 'defensiveTD',
      label: 'Defensive/special teams TD?',
      type: 'radio',
      options: ['Yes', 'No'],
      points: 2,
    },
    {
      id: 'successfulTwoPoints',
      label: 'Successful 2-point conversion?',
      type: 'radio',
      options: ['Yes', 'No'],
      points: 2,
    },
    {
      id: 'finalScoreSumEvenOdd',
      label: 'Final score sum even/odd?',
      type: 'radio',
      options: ['Even', 'Odd'],
      points: 1,
    },
    {
      id: 'longestTD',
      label: 'Longest TD (passing/running)?',
      type: 'radio',
      options: ['20-39', '40-59', '60+'],
      points: 1,
    },
    { id: 'totalPoints', label: 'Total combined points', type: 'number', points: 0 },
  ];
}

/**
 * Get questions for a specific game configuration.
 */
export function getQuestionsForGame(config: GameConfig): Question[] {
  return createQuestions(config.teams);
}

/**
 * Calculate max possible score from a questions array.
 */
export function getMaxScore(questions: Question[]): number {
  return questions.filter((q) => q.id !== 'totalPoints').reduce((sum, q) => sum + q.points, 0);
}

/**
 * Get the tiebreaker question from a questions array.
 */
export function getTiebreakerQuestion(questions: Question[]): Question | undefined {
  return questions.find((q) => q.id === 'totalPoints');
}

// Default questions for backward compatibility (Seahawks vs Patriots)
// This will be removed once all code is migrated to use createQuestions
export const questions: Question[] = [
  { id: 'winner', label: 'Who wins?', type: 'radio', options: ['Seahawks', 'Patriots'], points: 5 },
  { id: 'totalTDs', label: 'Total touchdowns?', type: 'number', points: 5 },
  { id: 'overtime', label: 'Overtime?', type: 'radio', options: ['Yes', 'No'], points: 5 },
  {
    id: 'winningMargin',
    label: 'Winning margin?',
    type: 'radio',
    options: ['1-7', '8-14', '15+'],
    points: 5,
  },
  { id: 'totalFieldGoals', label: 'Total field goals?', type: 'number', points: 5 },
  {
    id: 'firstHalfLeader',
    label: 'Halftime leader?',
    type: 'radio',
    options: ['Seahawks', 'Patriots', 'Tied'],
    points: 5,
  },
  // Tiebreaker question - 0 points
  { id: 'totalPoints', label: 'TIEBREAKER: Total combined points', type: 'number', points: 0 },
];

// Max possible score (excluding tiebreaker)
export const MAX_SCORE = questions
  .filter((q) => q.id !== 'totalPoints')
  .reduce((sum, q) => sum + q.points, 0);

// Get tiebreaker question
const tiebreakerQuestion = questions.find((q) => q.id === 'totalPoints');
if (!tiebreakerQuestion) {
  throw new Error('Tiebreaker question (totalPoints) not found in questions array');
}
export const TIEBREAKER_QUESTION = tiebreakerQuestion;
