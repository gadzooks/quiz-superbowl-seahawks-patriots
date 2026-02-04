/**
 * Super Bowl LX Questions - Source Version
 * Seahawks vs Patriots - 2026
 *
 * This is the source-accessible version for automatic game seeding.
 * It mirrors data/games/lx-questions.ts which is used for manual seeding scripts.
 */

/**
 * Generate question seed data with team names for Super Bowl LX.
 */
export function createLXQuestions(teams: [string, string]): Array<{
  questionId: string;
  label: string;
  type: string;
  options?: string[];
  points: number;
  sortOrder: number;
  isTiebreaker: boolean;
}> {
  const [team1, team2] = teams;

  return [
    {
      questionId: 'winner',
      label: `The winner is ...`,
      type: 'radio',
      options: [team1, team2],
      points: 6,
      sortOrder: 0,
      isTiebreaker: false,
    },
    {
      questionId: 'winningMargin',
      label: 'Winning margin?',
      type: 'radio',
      options: ['1-7', '8-14', '15+'],
      points: 6,
      sortOrder: 1,
      isTiebreaker: false,
    },
    {
      questionId: 'firstHalfLeader',
      label: 'Halftime leader?',
      type: 'radio',
      options: [team1, team2, 'Tied'],
      points: 3,
      sortOrder: 2,
      isTiebreaker: false,
    },
    {
      questionId: 'totalTDs',
      label: 'Total touchdowns?',
      type: 'number',
      points: 3,
      sortOrder: 3,
      isTiebreaker: false,
    },
    {
      questionId: 'overtime',
      label: 'Overtime?',
      type: 'radio',
      options: ['Yes', 'No'],
      points: 3,
      sortOrder: 4,
      isTiebreaker: false,
    },
    {
      questionId: 'defensiveTD',
      label: 'Defensive/special teams TD?',
      type: 'radio',
      options: ['Yes', 'No'],
      points: 2,
      sortOrder: 5,
      isTiebreaker: false,
    },
    {
      questionId: 'successfulTwoPoints',
      label: 'Successful 2-point conversion?',
      type: 'radio',
      options: ['Yes', 'No'],
      points: 2,
      sortOrder: 6,
      isTiebreaker: false,
    },
    {
      questionId: 'finalScoreSumEvenOdd',
      label: 'Final score sum even/odd?',
      type: 'radio',
      options: ['Even', 'Odd'],
      points: 1,
      sortOrder: 7,
      isTiebreaker: false,
    },
    {
      questionId: 'longestTD',
      label: 'Longest TD (passing/running)?',
      type: 'radio',
      options: ['20-39', '40-59', '60+'],
      points: 1,
      sortOrder: 8,
      isTiebreaker: false,
    },
    {
      questionId: 'totalPoints',
      label: 'Total combined points',
      type: 'number',
      points: 0,
      sortOrder: 9,
      isTiebreaker: true,
    },
  ];
}
