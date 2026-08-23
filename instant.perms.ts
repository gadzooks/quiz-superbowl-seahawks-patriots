// Docs: https://www.instantdb.com/docs/permissions
//
// Phase 2 scaffold (see WEEKLY_QUIZ_PLAN.md / DESIGN_REVIEW.md "Perms + auth
// groundwork"). This file makes the trust boundary explicit for the first
// time — previously there was no instant.perms.ts at all, so any client
// could write any row.
//
// Rules below are intentionally still permissive on `create`/`update` for
// `leagues` and `predictions`: the client does not yet authenticate writes
// with Yahoo (that lands once the OAuth broker in netlify/functions/ is
// wired up end-to-end and predictions/leagues carry an owner linked to
// $users). Flipping these to auth-only before then would break the
// currently-shipped anonymous-write flow for Super Bowl LX. `games` and
// `questions` are locked down now since they are only ever written by
// scripts using the admin token (which bypasses perms entirely).
//
// TODO(auth): once predictions/leagues link to $users, replace the `true`
// rules below with ownership checks, e.g.
//   bind: { isOwner: "auth.id != null && auth.id in data.ref('owner.id')" }

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
    allow: {
      view: 'true',
      create: 'true',
      update: 'true',
      delete: 'false',
    },
  },
  predictions: {
    allow: {
      view: 'true',
      create: 'true',
      update: 'true',
      delete: 'false',
    },
  },
} satisfies InstantRules<AppSchema>;

export default rules;
