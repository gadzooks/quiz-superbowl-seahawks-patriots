# Weekly Quiz Support — Implementation Plan & Handoff

Status handoff document. **Phase 1 (event model + routing) is complete**: type-check, lint, format, and all 336 unit tests pass (`yarn run validate`), `yarn run check:unused` is clean, and a production build (`yarn run build`) succeeds. Manually verified via curl that both `/superbowl/lx` and `/weekly/smith-family/2026-08-26` serve the SPA shell correctly in dev. Changes are uncommitted — see "Next steps" for what's left before Phase 2. `DESIGN_REVIEW.md` has the full architecture review this work is based on.

## Decisions already made (with the user)

- **URL scheme:** `/superbowl/:gameId/:leagueSlug` (unchanged) and `/weekly/:leagueSlug/:quizDate` (league-first, e.g. `/weekly/smith-family/2026-08-26`).
- Weekly quiz game IDs are **date-based and synthesized**, not registered in code: `weekly-YYYY-MM-DD`. Quiz dates are auto-generated (next Sunday) via `getUpcomingQuizDate()`.
- For now there is **one family league** for weekly; leagues may skip weeks (quizzes created ad hoc).
- **Everything moves to Yahoo auth eventually.** All writes will require Yahoo login; reads stay public. LX stays visible read-only forever; old localStorage `user-*` IDs are never migrated (frozen with LX). User explicitly OK'd deprecating anonymous flows.
- Roadmap order (user approved "Event model + routing" first):
  1. **Event model + routing** ← current phase
  2. Auth + perms: `instant.perms.ts`, Yahoo OAuth via Netlify Function → InstantDB `signInWithToken`, `users` entity. Blocks on user creating a Yahoo developer app + InstantDB admin token.
  3. Admin question authoring (replace `data/games/<id>-questions.ts` files with admin UI writing `questions` rows).
  4. Weekly quiz UI (real data wiring, season navigation, cumulative standings TBD).

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
