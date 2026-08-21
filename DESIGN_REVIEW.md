# High-Level Design Review

**Scope:** Architecture review of the Super Bowl prediction app, focused on three questions:

1. What changes are needed to support **weekly quizzes backed by Yahoo login**?
2. Can we **keep showing Super Bowl LX results** while reusing this codebase for future Super Bowls?
3. What **architecture issues** show up as we add these features?

This review is based on `CLAUDE.md`, `package.json`, the InstantDB schema, and targeted reads of the config, data, and identity layers — not a line-by-line code review.

---

## Current Architecture (one-paragraph summary)

A client-only React/Vite SPA served from Netlify at `/superbowl/`, backed by InstantDB (real-time sync, one app ID per deploy context). Three-plus entities — `games`, `questions`, `leagues`, `predictions` — partitioned relationally by game via `leagueGame`/`questionGame` links. **There is no auth**: users are random localStorage IDs (`src/utils/user.ts`), admin access is `?isAdmin=true` (`src/utils/url.ts:46`) or a `creatorId` string match, and there is no `instant.perms.ts`, so the database is open read/write to any client. Questions are data-driven at runtime (seeded rows) but authored as per-game TypeScript files (`data/games/lx-questions.ts`). Game lifecycle (`upcoming`/`in-progress`/`completed`) lives in `src/config/games.ts` and drives the read-only mode shipped recently.

---

## Q1: Weekly quizzes with Yahoo login

This is the feature that forces real architectural change. Four layers need work, roughly in this order:

### 1. Identity and permissions (the foundation)

Today identity is a free-form string threaded through `predictions.userId` and `leagues.creatorId`, and nothing on the server enforces anything. A login-backed product needs:

- **A real user entity.** InstantDB has built-in auth (`$users`) with magic-code and OAuth flows. Yahoo is not a first-class InstantDB OAuth provider, so the practical options are:
  - **Netlify Function as OAuth broker** — a small serverless function handles the Yahoo OAuth code exchange, verifies the identity, and mints an InstantDB token (`signInWithToken` via the Admin SDK). No new vendor; fits the existing Netlify deployment.
  - **Clerk (or similar) with Yahoo as a social provider** — InstantDB has first-class Clerk integration. Less code, one more paid dependency.
  - Recommendation: the Netlify Function broker, since the app already deploys to Netlify and the surface area is one endpoint.
- **`instant.perms.ts`** — currently absent, meaning any browser can rewrite anyone's predictions or scores. Once there are real accounts, permissions are mandatory: predictions writable only by their owner, results writable only by league managers, etc. This is the single biggest gap in the codebase today.
- **Given your decision to go all-in on Yahoo auth** (see Q2 note below), you avoid the hardest version of this problem: maintaining anonymous and authenticated identity side by side, with account-linking/migration for existing `user-*` IDs. Requiring login for all _writes_ makes the perms model simple and uniform.

### 2. Event model: generalize `games`

The schema is Super-Bowl-shaped: `games` requires `team1`/`team2`, and there's no concept of a season, week, or recurring event. Two options:

- **Incremental (recommended):** keep the `games` entity, make `team1`/`team2` optional, add `eventType: 'superbowl' | 'weekly-quiz'`, `seasonId`, and `weekNumber` fields. All the existing partitioning (relational links, `useLeagueData` scoping by gameId) carries over unchanged — a weekly quiz is just another "game" row.
- **Bigger rewrite:** a new `events`/`quizzes` entity hierarchy (`season → week → quiz`). Cleaner conceptually, but duplicates the query/link plumbing that already works.

The lifecycle machinery you just built (`status`, `isGameCompleted`, `isGameReadOnly`, submission-close windows in `src/config/games.ts`) generalizes directly to weekly quizzes — a week "closes" the same way a Super Bowl does. That's a real asset.

### 3. Question authoring must become data, not code

Today each game's questions are a TypeScript file (`data/games/<id>-questions.ts`) seeded via `yarn seed-game`. That's fine once a year; it's untenable weekly — every quiz would require a code change and redeploy. Move authoring to an admin UI writing `questions` rows directly (the runtime is _already_ data-driven; only the authoring path is code). This also fixes an existing boundary violation: `data/` files are marked "do not import into src/" yet `SeedTab.tsx` and `SeedingSection.tsx` import them.

Related: the question `type` union is only `'radio' | 'number'`. Weekly quizzes will likely want more (multi-select, text, player pickers), so make the type system extensible when you touch it.

### 4. Theming and routing

The theme system is keyed to 32 NFL team nicknames and `getTeamIds()` derives themes by lowercasing team names. Weekly quizzes need a neutral/default theme path that doesn't assume two NFL teams. The `/superbowl/` base path is hardcoded in three places (`vite.config.ts`, `src/utils/game.ts`, `netlify.toml`) — routing for a second product surface (`/quiz/...` or week-scoped URLs) means consolidating that first.

---

## Q2: Keep LX results, reuse for future Super Bowls

**This mostly works already.** The multi-game foundation is genuinely in place:

- Multiple game years coexist in one InstantDB app; all queries are scoped relationally by gameId with no hardcoding (verified in `useLeagueData.ts` and `db/queries.ts`).
- Adding a future Super Bowl is a documented three-step recipe: add an entry to `GAMES` in `src/config/games.ts` (a commented `lxi` template already exists), create `data/games/<id>-questions.ts`, run `yarn seed-game <id>`.
- The `completed` status + read-only mode you shipped recently is exactly the right mechanism for freezing LX.

**On deprecating LX views vs. keeping them:** you offered to deprecate LX if keeping it complicates the Yahoo-auth move. The good news is you don't face that trade-off, because the expensive thing isn't _showing_ LX — it's keeping the anonymous _write_ path alive alongside authenticated writes. LX is already read-only, and read-only display needs no identity at all. So the recommended posture is:

- **Reads stay public** (or at least LX's reads do) — the leaderboard and results render fine for anonymous visitors under InstantDB perms that allow public read.
- **All writes require Yahoo login** — one identity system, one perms model, no anonymous/auth dual-path, no migration of old `user-*` IDs (they become inert historical strings on frozen LX data).

Remaining gaps worth closing for the multi-year story:

- `DEFAULT_GAME_ID` is pinned to `'lx'`; it should resolve to "the latest active game" so old links and the root URL do the right thing each season.
- `index.html` OG/meta tags are baked to LX imagery — future games need per-game (or at least per-active-game) metadata.
- There's no landing/index page for choosing among game years; today you need a direct game URL.
- `yarn db:push` runs on every deploy and mutates the production schema at build time. With frozen historical data in the same database, an accidental schema change could break old results — consider gating schema pushes behind an explicit manual step.

---

## Q3: Architecture issues (ranked by how much they'll hurt)

1. **No server-side trust boundary.** No `instant.perms.ts`, admin via `?isAdmin=true`, any client can write any row. Perfectly reasonable for a family Super Bowl game; a hard blocker the moment real accounts exist. Fix first — everything auth-related builds on it.
2. **Identity as bare strings.** `userId`/`creatorId` are free-form localStorage strings with no user entity behind them. The all-in-on-Yahoo decision caps this debt (old IDs get frozen with LX rather than migrated), but every feature built before the auth switch deepens it.
3. **Question authoring is code, not data.** File-per-game TS + seed script + redeploy can't support weekly cadence, and the `data/` → `src/` import boundary is already being violated in two components.
4. **Read-only/"completed" state is derived independently in ~6 files** (LeagueView, LeagueCreation, league handler, AppContext, AppRouter, teamPicker). The predicate is centralized but consumers each recompute it; it should be provided once via context so lifecycle rules stay consistent as event types multiply.
5. **Build-time schema pushes to prod.** Deploys mutating the production database schema is risky once multiple live events (and frozen historical ones) share one InstantDB app.
6. **Deployment/branding coupling.** Base path in three places, LX-specific OG tags, and a `db` client singleton with a single compile-time app ID. Fine for one product; friction for two surfaces sharing a codebase.
7. **Content-model rigidity.** Required `team1`/`team2`, two question types, NFL-nickname-keyed theming. Each is a small change, but together they define the "Super Bowl shape" that weekly quizzes must escape.

None of these are signs of a bad codebase — the game-partitioning, lifecycle, and data-driven-questions foundations are solid. They're signs of a codebase correctly scoped to its original problem, now being pointed at a bigger one.

---

## Suggested sequencing

1. **Perms + auth groundwork** — add `instant.perms.ts`, stand up the Yahoo OAuth broker (Netlify Function → InstantDB token), require login for writes; LX reads stay public.
2. **Generalize the event model** — optional teams, `eventType`/`seasonId`/`weekNumber` on `games`; centralize the read-only flag in context while you're in there.
3. **Admin question authoring** — replace file-per-game seeding with an admin UI writing `questions` rows; retire the `data/` import violations.
4. **Weekly quiz product surface** — routing, neutral theming, season/week navigation, per-game metadata, "latest active game" default.

Steps 1–2 are the load-bearing ones; 3–4 can follow incrementally once a weekly quiz can technically exist.
