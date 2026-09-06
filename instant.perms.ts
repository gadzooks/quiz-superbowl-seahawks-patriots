// Docs: https://www.instantdb.com/docs/permissions
//
// Phase 3 (league admin roles, see WEEKLY_QUIZ_PLAN.md): writes now require
// a signed-in user (auth.id != null), enforced via the predictionUser and
// leagueAdmins links added to instant.schema.ts. Reads stay public.
//
// `predictions.userId` / `leagues.creatorId` remain as plain string fields
// for backwards compat with pre-auth data (Super Bowl LX is frozen
// read-only and never gets new writes, so it's unaffected either way).
//
// Phase 4 (admin question authoring): weekly quizzes are authored in-app by
// any signed-in user who admins at least one league (auth.ref('$user.adminLeagues.id')
// — the reverse of leagueAdmins). Super Bowl `games`/`questions` rows stay
// admin-token/script-only: the `data.eventType == 'weekly'` guard on `games`
// keeps this rule from opening up writes to Super Bowl rows.

import type { InstantRules } from '@instantdb/core';

import type { AppSchema } from './instant.schema';

const rules = {
  games: {
    bind: {
      isWeeklyAdmin:
        "auth.id != null && data.eventType == 'weekly' && size(auth.ref('$user.adminLeagues.id')) > 0",
    },
    allow: {
      view: 'true',
      create: 'isWeeklyAdmin',
      update: 'isWeeklyAdmin',
      delete: 'false',
    },
  },
  questions: {
    bind: {
      isAnyLeagueAdmin: "auth.id != null && size(auth.ref('$user.adminLeagues.id')) > 0",
    },
    allow: {
      view: 'true',
      create: 'isAnyLeagueAdmin',
      update: 'isAnyLeagueAdmin',
      delete: 'isAnyLeagueAdmin',
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
