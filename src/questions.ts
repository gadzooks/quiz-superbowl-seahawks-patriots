import type { Question } from './types';

export const questions: Question[] = [
  { id: 'winner', label: 'Who wins?', type: 'radio', options: ['Seahawks', 'Patriots'], points: 5 },
  { id: 'totalTDs', label: 'Total touchdowns?', type: 'number', points: 5 },
  { id: 'overtime', label: 'Overtime?', type: 'radio', options: ['Yes', 'No'], points: 5 },
  { id: 'winningMargin', label: 'Winning margin?', type: 'radio', options: ['1-7', '8-14', '15+'], points: 5 },
  { id: 'totalFieldGoals', label: 'Total field goals?', type: 'number', points: 5 },
  { id: 'firstHalfLeader', label: 'Halftime leader?', type: 'radio', options: ['Seahawks', 'Patriots', 'Tied'], points: 5 },
  // Tiebreaker question - 0 points
  { id: 'totalPoints', label: 'TIEBREAKER: Total combined points', type: 'number', points: 0 },
];

// Max possible score (excluding tiebreaker)
export const MAX_SCORE = questions
  .filter(q => q.id !== 'totalPoints')
  .reduce((sum, q) => sum + q.points, 0);

// Get tiebreaker question
export const TIEBREAKER_QUESTION = questions.find(q => q.id === 'totalPoints')!;
