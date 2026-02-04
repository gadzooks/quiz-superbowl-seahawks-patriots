// Backup of pulled schema from backend (for reference)
// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/core';

const _schema = i.schema({
  // We inferred 19 attributes!
  // Take a look at this schema, and if everything looks good,
  // run `push schema` again to enforce the types.
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    games: i.entity({
      displayName: i.string().optional(),
      gameId: i.string().unique().indexed().optional(),
      team1: i.string().optional(),
      team2: i.string().optional(),
      year: i.number().indexed().optional(),
    }),
    leagues: i.entity({
      actualResults: i.json().optional(),
      answersLocked: i.boolean().optional(),
      createdAt: i.number().optional(),
      creatorId: i.string().optional(),
      gameId: i.string().optional(),
      isOpen: i.boolean().optional(),
      name: i.string().optional(),
      showAllPredictions: i.boolean().optional(),
      slug: i.string().optional(),
    }),
    predictions: i.entity({
      gameId: i.string().optional(),
      isManager: i.boolean().optional(),
      leagueId: i.string().optional(),
      predictions: i.json().optional(),
      score: i.number().optional(),
      submittedAt: i.number().optional(),
      teamName: i.string().optional(),
      tiebreakDiff: i.number().optional(),
      userId: i.string().optional(),
    }),
    questions: i.entity({
      isTiebreaker: i.boolean().optional(),
      label: i.string().optional(),
      options: i.json().optional(),
      points: i.number().optional(),
      questionId: i.string().indexed().optional(),
      sortOrder: i.number().indexed().optional(),
      type: i.string().optional(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers',
      },
    },
    predictionsLeague: {
      forward: {
        on: 'predictions',
        has: 'many',
        label: 'league',
      },
      reverse: {
        on: 'league',
        has: 'many',
        label: 'predictions',
      },
    },
    questionsGame: {
      forward: {
        on: 'questions',
        has: 'one',
        label: 'game',
      },
      reverse: {
        on: 'games',
        has: 'many',
        label: 'questions',
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
