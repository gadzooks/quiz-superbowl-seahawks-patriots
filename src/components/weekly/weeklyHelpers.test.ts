import { describe, it, expect } from 'vitest';

import type { WeeklyQuiz } from '../../hooks/useWeeklyLeagueData';

import { computeRunningTotals, getCurrentQuiz, getPastQuizzes } from './weeklyHelpers';

function makeQuiz(
  overrides: { quizDate: string; isOpen?: boolean } & Partial<
    Pick<WeeklyQuiz, 'questions' | 'predictions'>
  >
): WeeklyQuiz {
  return {
    game: {
      id: `game-${overrides.quizDate}`,
      gameId: `weekly-${overrides.quizDate}`,
      displayName: `Weekly Quiz · ${overrides.quizDate}`,
      year: 2026,
      team1: '',
      team2: '',
      eventType: 'weekly',
      quizDate: overrides.quizDate,
      isOpen: overrides.isOpen ?? true,
    },
    questions: overrides.questions ?? [],
    predictions: overrides.predictions ?? [],
  };
}

describe('computeRunningTotals', () => {
  it('sums scores per user across quizzes', () => {
    const quizzes: WeeklyQuiz[] = [
      makeQuiz({
        quizDate: '2026-08-24',
        isOpen: false,
        predictions: [
          {
            id: 'p1',
            userId: 'u1',
            teamName: 'Alice',
            submittedAt: 0,
            score: 3,
            tiebreakDiff: 0,
            isManager: false,
            predictions: {},
          },
        ],
      }),
      makeQuiz({
        quizDate: '2026-08-31',
        isOpen: false,
        predictions: [
          {
            id: 'p2',
            userId: 'u1',
            teamName: 'Alice',
            submittedAt: 0,
            score: 2,
            tiebreakDiff: 0,
            isManager: false,
            predictions: {},
          },
          {
            id: 'p3',
            userId: 'u2',
            teamName: 'Bob',
            submittedAt: 0,
            score: 5,
            tiebreakDiff: 0,
            isManager: false,
            predictions: {},
          },
        ],
      }),
    ];

    const totals = computeRunningTotals(quizzes);
    expect(totals).toEqual([
      { userId: 'u1', teamName: 'Alice', total: 5, quizzesPlayed: 2 },
      { userId: 'u2', teamName: 'Bob', total: 5, quizzesPlayed: 1 },
    ]);
  });

  it('returns an empty array with no quizzes', () => {
    expect(computeRunningTotals([])).toEqual([]);
  });
});

describe('getCurrentQuiz', () => {
  it('returns the earliest still-open quiz', () => {
    const quizzes = [
      makeQuiz({ quizDate: '2026-08-24', isOpen: false }),
      makeQuiz({ quizDate: '2026-08-31', isOpen: true }),
      makeQuiz({ quizDate: '2026-09-07', isOpen: true }),
    ];
    expect(getCurrentQuiz(quizzes)?.game.quizDate).toBe('2026-08-31');
  });

  it('returns null when every quiz is closed', () => {
    const quizzes = [makeQuiz({ quizDate: '2026-08-24', isOpen: false })];
    expect(getCurrentQuiz(quizzes)).toBeNull();
  });
});

describe('getPastQuizzes', () => {
  it('returns closed quizzes newest first', () => {
    const quizzes = [
      makeQuiz({ quizDate: '2026-08-24', isOpen: false }),
      makeQuiz({ quizDate: '2026-08-31', isOpen: true }),
      makeQuiz({ quizDate: '2026-08-17', isOpen: false }),
    ];
    expect(getPastQuizzes(quizzes).map((q) => q.game.quizDate)).toEqual([
      '2026-08-24',
      '2026-08-17',
    ]);
  });
});
