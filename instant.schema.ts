import { i } from '@instantdb/core';

const _schema = i.schema({
  entities: {
    games: i.entity({
      gameId: i.string().unique().indexed(),
      displayName: i.string(),
      year: i.number().indexed(),
      team1: i.string().optional(), // absent for weekly quizzes
      team2: i.string().optional(), // absent for weekly quizzes
      eventType: i.string().optional().indexed(), // 'superbowl' (default when absent) or 'weekly'
      quizDate: i.string().optional().indexed(), // YYYY-MM-DD, weekly quizzes only
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
  },
});

type AppSchema = typeof _schema;
const schema: AppSchema = _schema;
export type { AppSchema };
export default schema;
