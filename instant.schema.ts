import { i } from '@instantdb/core';

const _schema = i.schema({
  entities: {
    // Built-in auth entity (magic-code/OAuth via signInWithToken). Declared
    // with no fields — this SDK version needs it as an explicit entity key
    // for links to reference '$users'; InstantDB merges it with the real
    // system entity rather than creating a new one.
    $users: i.entity({}),

    games: i.entity({
      gameId: i.string().unique().indexed(),
      displayName: i.string(),
      year: i.number().indexed(),
      team1: i.string().optional(), // absent for weekly quizzes
      team2: i.string().optional(), // absent for weekly quizzes
      eventType: i.string().optional().indexed(), // 'superbowl' (default when absent) or 'weekly'
      quizDate: i.string().optional().indexed(), // YYYY-MM-DD, weekly quizzes only
      actualResults: i.json().optional(), // weekly quiz grading (Super Bowl uses leagues.actualResults)
      isOpen: i.boolean().optional(), // weekly quizzes only: admin-controlled, not date-derived — some quizzes close same-day, others 2-3 days later
    }),

    questions: i.entity({
      questionId: i.string().indexed(),
      label: i.string(),
      type: i.string(),
      options: i.json().optional(),
      points: i.number(),
      sortOrder: i.number().indexed(),
      isTiebreaker: i.boolean(),
    }),

    leagues: i.entity({
      name: i.string(),
      slug: i.string().indexed(),
      creatorId: i.string().indexed(),
      isOpen: i.boolean(),
      createdAt: i.date().indexed(),
      actualResults: i.json().optional(),
      showAllPredictions: i.boolean(),
      activeCelebration: i.string().optional(),
      celebrationTriggeredAt: i.number().optional(),
    }),

    predictions: i.entity({
      userId: i.string().indexed(),
      teamName: i.string(),
      submittedAt: i.date().indexed(),
      score: i.number(),
      tiebreakDiff: i.number(),
      isManager: i.boolean(),
      predictions: i.json(),
      themeTeamId: i.string().optional(),
    }),
  },

  links: {
    leagueGame: {
      forward: { on: 'leagues', has: 'one', label: 'game' },
      reverse: { on: 'games', has: 'many', label: 'leagues' },
    },
    questionGame: {
      forward: { on: 'questions', has: 'one', label: 'game' },
      reverse: { on: 'games', has: 'many', label: 'questions' },
    },
    predictionLeague: {
      forward: { on: 'predictions', has: 'one', label: 'league' },
      reverse: { on: 'leagues', has: 'many', label: 'predictions' },
    },
    // Weekly quiz support: a league hosts many quizzes over a season, so
    // predictions link directly to the game (quiz) they belong to.
    // Super Bowl predictions may leave this unset (game derives from league).
    predictionGame: {
      forward: { on: 'predictions', has: 'one', label: 'game' },
      reverse: { on: 'games', has: 'many', label: 'gamePredictions' },
    },
    // Phase 3 (league admin roles): real ownership, distinct from the
    // pre-auth `predictions.userId` / `leagues.creatorId` string fields
    // (kept for backwards compat with anonymous/frozen LX data). Perms use
    // these to enforce that only the signed-in owner/admin can write.
    predictionUser: {
      forward: { on: 'predictions', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'many', label: 'predictions' },
    },
    leagueAdmins: {
      forward: { on: 'leagues', has: 'many', label: 'admins' },
      reverse: { on: '$users', has: 'many', label: 'adminLeagues' },
    },
  },
});

type AppSchema = typeof _schema;
const schema: AppSchema = _schema;
export type { AppSchema };
export default schema;
