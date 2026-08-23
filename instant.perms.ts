// Docs: https://www.instantdb.com/docs/permissions
//
// Phase 3 (league admin roles, see WEEKLY_QUIZ_PLAN.md): writes now require
// a signed-in user (auth.id != null), enforced via the predictionUser and
// leagueAdmins links added to instant.schema.ts. Reads stay public.
//
// `predictions.userId` / `leagues.creatorId` remain as plain string fields
// for backwards compat with pre-auth data (Super Bowl LX is frozen
// read-only and never gets new writes, so it's unaffected either way).
// `games`/`questions` stay admin-token-only — only ever written by scripts.

import type { InstantRules } from '@instantdb/core';

import type { AppSchema } from './instant.schema';

const rules = {
  games: {
    allow: {
      view: 'true',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
  },
  questions: {
    allow: {
      view: 'true',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
  },
  leagues: {
    bind: {
      isAdmin: "auth.id != null && auth.id in data.ref('admins.id')",
    },
    allow: {
      view: 'true',
      create: 'auth.id != null',
      update: 'isAdmin',
      delete: 'false',
    },
  },
  predictions: {
    bind: {
      isOwner: "auth.id != null && auth.id in data.ref('user.id')",
      isLeagueAdmin: "auth.id != null && auth.id in data.ref('league.admins.id')",
    },
    allow: {
      view: 'true',
      create: 'auth.id != null',
      update: 'isOwner || isLeagueAdmin',
      delete: 'isLeagueAdmin',
    },
  },
} satisfies InstantRules<AppSchema>;

export default rules;
