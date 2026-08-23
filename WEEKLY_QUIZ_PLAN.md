# Weekly Quiz Support — Implementation Plan & Handoff

Status handoff document. **Phase 1 (event model + routing) is complete and committed** (`1f1d43a`). **Phase 2 (auth + perms) is in progress**: `instant.perms.ts` exists, the Yahoo OAuth broker (`netlify/functions/auth-yahoo-*.ts`) is verified end-to-end against a real Yahoo account, and the client is wired up (`useYahooAuthCallback`, `YahooSignIn` in `WeeklyView`) — committed as `bb29e8f` and `6e5434b`. Remaining Phase 2 work: link `predictions`/`leagues` to `$users` so perms can move from open writes to real ownership checks. `DESIGN_REVIEW.md` has the full architecture review this work is based on.

## Decisions already made (with the user)

- **URL scheme:** `/superbowl/:gameId/:leagueSlug` (unchanged) and `/weekly/:leagueSlug/:quizDate` (league-first, e.g. `/weekly/smith-family/2026-08-26`).
- Weekly quiz game IDs are **date-based and synthesized**, not registered in code: `weekly-YYYY-MM-DD`. Quiz dates are auto-generated (next Sunday) via `getUpcomingQuizDate()`.
- For now there is **one family league** for weekly; leagues may skip weeks (quizzes created ad hoc).
- **Yahoo login is required for both weekly and Super Bowl going forward** (updated 2026-08-23 — supersedes the earlier "weekly gets Yahoo auth, Super Bowl stays anonymous for now" framing). Applies to new/active leagues in both products; the already-completed, read-only Super Bowl LX (2026) is unaffected since it has no writes to gate regardless — old localStorage `user-*` IDs stay frozen with it, never migrated. Exact scope (gate all reads, or only writes/predictions?) still to be nailed down — see open questions below.
- **Future: Google login for Super Bowl only** (not Yahoo), on top of Yahoo for weekly. Not being built now — noting so the auth broker isn't designed in a way that makes adding a second provider painful later (e.g. keep the "mint an InstantDB token from a verified email" pattern provider-agnostic).
- Roadmap order (user approved "Event model + routing" first):
  1. **Event model + routing** — done (`1f1d43a`).
  2. **Auth + perms** — `instant.perms.ts`, Yahoo OAuth via Netlify Function → InstantDB `signInWithToken`, client wiring — done (`bb29e8f`, `6e5434b`). Remaining: link `predictions`/`leagues` to `$users`.
  3. **League admin roles (plumbing)** — done 2026-08-23. Decisions made: writes require sign-in, reads stay public ("gate writes only"); sign-in control lives in a persistent app-wide `AccountBar` (not scoped to weekly); a league's admin is auto-assigned to whoever creates it while signed in (no invite flow yet). Implemented: `leagueAdmins` (`leagues` ↔ `$users`, many-to-many) and `predictionUser` (`predictions` → `$users`, one) links in `instant.schema.ts`; `instant.perms.ts` now requires `auth.id != null` to create leagues/predictions, admin-only to update/delete a league, owner-or-league-admin to update a prediction, league-admin-only to delete one; `AccountBar` component mounted in `AppRouter` on every branch; `LeagueCreation.tsx` and `TeamNameEntry.tsx` (the only two entity-creation call sites) redirect to `startYahooLogin()` instead of writing when signed out, and pass the InstantDB `$users` id through to `createLeague`/`savePrediction` so the new links get set. `predictions.userId` / `leagues.creatorId` string fields are unchanged (still localStorage-based, kept for backward compat / display) — this pass adds real ownership alongside them, it does not replace `AppContext.currentUserId`, which still drives gameplay identity (guest detection, celebration tracking, theme). **Pushed to the dev InstantDB app** (`c77accca...c7e0`) 2026-08-23 via `instant-cli push all -y` (schema + perms both applied, confirmed idempotent on re-push). Note: `yarn db:push`'s interactive confirm prompt needs a real TTY — it silently no-ops (while still reporting success) when run non-interactively without `-y`, so automated pushes must call `instant-cli push all -y` directly.
  4. **Admin question authoring UI** ← next phase. The per-league admin role from step 3 is who gets access to this: replace `data/games/<id>-questions.ts` files with an admin UI writing `questions` rows, and build the "validate/enter actual results" UI (writes `leagues.actualResults`, per league — not a global scoring admin). Needs an `isLeagueAdmin` check in the client (via `auth.id` + the league's `admins` link) gating the UI, mirroring what perms already enforce server-side.
  5. Weekly quiz UI (real data wiring, season navigation, cumulative standings TBD).
  6. **Seasons: unify weekly + Super Bowl under one league** (added 2026-08-23 at user's request — not yet built, design only). See "Seasons — design" below.

## Seasons — design (Phase 6, not yet built)

Two distinct kinds of league going forward:

- **Season leagues** (the user's fantasy football league). One league, scoped to a season (e.g. `lxi`), not to a single game. Members participate in both that season's weekly quizzes and its Super Bowl — joining once (whichever surface they land on first) auto-enrolls them in both; there's no separate "join the Super Bowl" step. Standings are **three separate leaderboards, not one combined score**: (1) each individual week's winner, (2) cumulative weekly-quiz total across the season ("bragging rights"), (3) the Super Bowl leaderboard — entirely separate scoring, never mixed into the weekly total.
- **Standalone Super Bowl leagues** (open to anyone, e.g. today's LX leagues). Unchanged — scoped to a single game via `leagueGame`, no season, no weekly quizzes. This is how the app stays usable for people who only care about the Super Bowl.

URL scheme changes to accommodate a season prefix, e.g. `/lxi/weekly/smith-family/2026-08-30` (a specific week) and season-level views at `/lxi/weekly/smith-family` (cumulative weekly standings) and `/lxi/superbowl/smith-family` (that league's Super Bowl leaderboard). Today's `/superbowl/:gameId/:leagueSlug` and `/weekly/:leagueSlug/:quizDate` (no season prefix) keep working for standalone leagues — needs a decision on whether standalone leagues ever get a season-prefixed URL or stay on the old scheme permanently.

Schema implications (not yet implemented):

- A season league can't link to one `game` the way `leagueGame` does today — it's scoped to a season instead. Reuse `games.year` as the season id (`lxi` → its year, via the existing `GAMES` config) rather than adding a new `seasonId` field, so no new entity needed there.
- Every prediction in a season league — weekly **and** Super Bowl — needs its game explicit via the `predictionGame` link (already in schema from Phase 1), since the league itself no longer implies "the game" the way it does for standalone leagues.
- Need a way to tell season leagues apart from standalone ones — likely `leagues.eventType` (`'season' | 'superbowl'`, mirroring `games.eventType`) or simply: has a season year vs. has a `game` link.
- The three-leaderboard model means score aggregation logic is new work: per-week (already works — one prediction's score), season-cumulative-weekly (sum of a user's `predictions.score` across all weekly-quiz predictions in that league for the season year), and Super Bowl (unchanged, single prediction's score).

Not started — this is a bigger schema/routing change than Phase 3's plumbing and should get its own confirmation pass before implementation, especially the URL restructuring (it changes routes already tested in Phase 1) and the standalone-vs-season league split (`leagues.eventType` or equivalent).

## Phase 1 changes already made (this session, uncommitted)

- `src/config/games.ts`: added `EventType` (`'superbowl' | 'weekly'`), `eventType` required on `GameConfig`, `teams` now **optional**, added `quizDate`. New helpers: `isValidQuizDate`, `buildWeeklyGameId`, `isWeeklyGameId`, `getQuizDateFromGameId`, `getUpcomingQuizDate`, `formatQuizDate`. `getGameConfig`/`isValidGameId` now synthesize weekly configs from `weekly-YYYY-MM-DD` IDs (status: past date → `completed`, today → `in-progress`, future → `upcoming`). `getTeamIds` returns `null` when no teams.
- `src/utils/game.ts`: `parseUrlPath` returns `ParsedRoute { eventType, gameId: string|null, leagueSlug, quizDate }`; parses `/weekly/:leagueSlug/:quizDate?`; added `buildWeeklyPath`/`buildWeeklyUrl`; `getCurrentGameId()` falls back to `DEFAULT_GAME_ID` when gameId null.
- `src/hooks/useUrlParams.ts`: returns `ParsedRoute`.
- `src/AppRouter.tsx`: branches on `eventType === 'weekly'` → renders new `src/components/WeeklyView.tsx` (placeholder, DaisyUI card style); weekly skips team picker and header team colors, uses guest theme.
- `src/context/AppContext.tsx`: added `isGameReadOnly: boolean` to context (single source of truth). `LeagueView.tsx` and `LeagueCreation.tsx` now consume it instead of recomputing (their local `getGameConfig`/`isGameCompleted` derivations removed).
- Guarded optional `teams` in: `src/theme/apply.ts` (`applyHeaderTeamColors` early-returns on null `getTeamIds`), `src/theme/backgrounds.ts` (`applyGameTeamBackgrounds` same), `src/handlers/league.ts` (error if no teams), `src/components/SeedTab.tsx`, `src/components/admin/SeedingSection.tsx` (local `teams` const after guard; teams row conditional in JSX), `scripts/seed-game.ts`.
- `instant.schema.ts`: `games` gains optional `eventType` + `quizDate`, `team1`/`team2` now optional; new `predictionGame` link (predictions → games, reverse label `gamePredictions`) for multi-quiz leagues. NOTE: schema is pushed automatically on Netlify deploy (`push-schema.ts -y` in build command).
- `netlify.toml`: `/weekly/*` and `/weekly` rewrite → `/index.html`.
- `vite.config.ts`: `weeklySpaFallback()` dev plugin rewriting `/weekly*` requests to `/superbowl/index.html`.

## Phase 1 — completed this session

All 9 original "immediate next steps" are done:

1.–4. Fixed the 4 type errors (unused import in `LeagueView.tsx`; optional-`teams`/nullable-`getTeamIds` handling in `games.test.ts` and `game.test.ts`; `eventType: 'superbowl'` added to test fixtures in `games.test.ts` and `league.test.ts`). 5. `LeagueCreation.test.tsx` now mocks `../context/AppContext` (`useAppContext` → `{ isGameReadOnly: false }`) since `LeagueCreation` reads the centralized flag. 6. Added weekly-route tests to `src/utils/game.test.ts` (parsing `/weekly/:slug/:date`, missing date, invalid date, bare `/weekly`, slug lowercasing, `buildWeeklyPath`/`buildWeeklyUrl`) and to `src/config/games.test.ts` (`isValidQuizDate`, `buildWeeklyGameId`/`getQuizDateFromGameId` round-trip, `isWeeklyGameId`, `isValidGameId` for weekly IDs, `getUpcomingQuizDate`, synthesized config status for past/future dates, `getTeamIds` returning null). 7. `yarn run validate` passes clean (lint, format, type-check, 336 tests). `yarn run check:unused` clean — no knip ignores needed. 8. Verified via curl against the dev server: `/superbowl/lx` and `/weekly/smith-family/2026-08-26` both return 200 with the correct SPA shell; the `weeklySpaFallback` vite plugin works. (No browser extension was available in that session to visually confirm the WeeklyView placeholder renders — recommend a quick `yarn dev` + manual browser check before merging.) 9. **Not committed yet** — all changes are uncommitted in the working tree. Also ran `yarn run build` (full production build via `tsc && vite build`) successfully.

## Next steps (Phase 2 and cleanup)

- **Recommended before merging:** open `http://localhost:8000/weekly/smith-family/2026-08-26` in an actual browser once to eyeball the WeeklyView placeholder and confirm no console errors (the automated check only verified HTTP response, not rendered output).
- Commit on a feature branch (pre-commit hook runs lint+format+type-check+tests; if the hook fails, the commit did NOT happen — fix and create a new commit, do not amend).
- Then proceed to **Phase 2: Auth + perms** per the roadmap below — this blocks on the user creating a Yahoo developer app and an InstantDB admin token.

## Bonus fix this session: `scripts/schema-check.ts` false positive

Running `yarn db:check` against the `instant.schema.ts` change above reported `games.team1`/`games.team2` as **destructive field removals**, which was wrong — the change only relaxes them from required to optional (safe). Root cause: the script's diff parser paired a removed line with an added line only when they were _immediately adjacent_ in the raw git diff, but git groups all `-` lines before all `+` lines for a multi-line edit, so two fields changing together broke the pairing. Rewrote `detectSchemaChanges` to: (1) build a line-number → entity map from the full old/new file content (robust to diff context truncation) instead of relying on hunk-visible entity headers, and (2) pair removed/added fields by name within each contiguous change block instead of by line adjacency. Verified against both the real (safe) diff and a simulated real deletion (still correctly flagged destructive). Also added a new "FIELD LOOSENED TO OPTIONAL" safe-change category for symmetry with the existing "MADE REQUIRED" warning. This did not affect Netlify deploys either way — `netlify.toml` calls `push-schema.ts -y` directly and never runs `db:check` — but it's now trustworthy for local `db:push-safe` workflows going forward.

## Known deferrals / cautions

- WeeklyView is a placeholder; no data wiring (that's Phase 4, after auth). The `predictionGame` schema link exists but nothing writes it yet.
- Weekly league entity design still open: weekly leagues won't link to a single game; likely `leagues.eventType` field + predictions linked to both league and game. Decide in Phase 4.
- `index.html` OG tags still hardcoded to LX; `DEFAULT_GAME_ID` still `'lx'` — flagged in DESIGN_REVIEW.md, not in this phase.
- Do not run `yarn db:push` locally against prod; schema updates flow through the Netlify build.
- Project rules: no inline styles, CSS vars only (css-audit test enforces), components < 200 lines, mobile-first, follow `UX_GUIDELINES.md` before UI work.
