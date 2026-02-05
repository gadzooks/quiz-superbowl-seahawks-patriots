# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Super Bowl prediction game — a mobile-first web app where users create leagues, submit predictions on game questions, and compete on a real-time leaderboard. Built with TypeScript, Vite, and InstantDB for real-time sync. Designed for elderly users with large touch targets and high contrast.

## Commands

```bash
# Development
yarn run dev              # Vite dev server on port 8000
yarn run build            # TypeScript check + Vite production build

# Testing
yarn run test             # Vitest unit tests (single run)
yarn run test:watch       # Vitest watch mode
npx vitest run src/path/to/file.test.ts  # Run single test file
yarn run test:e2e         # Playwright E2E tests (starts dev server)
yarn run test:e2e:headed  # E2E with visible browser

# Code quality
yarn run lint             # ESLint check
yarn run lint:fix         # ESLint auto-fix
yarn run type-check       # TypeScript check (tsc --noEmit)
yarn run validate         # Full suite: lint + format + type-check + test
yarn run check:unused     # Knip unused code detection

# Deploy
yarn run validate:build   # Build + asset validation
```

**Pre-commit hooks** (Husky + lint-staged): ESLint fix, Prettier format, type-check, and full test suite run on every commit. If the hook fails, the commit did not happen — create a new commit after fixing, do not amend.

## Architecture

### Module System

Entry point is `src/main.tsx` — a full React application using Vite. The app renders into `#root` in `index.html`.

### Initialization Flow

1. Vite loads `src/main.tsx` which renders `<App />` wrapped in context providers
2. `AppRouter` handles routing based on URL parameters (gameId, leagueSlug)
3. Team picker shown if first visit (sets theme)
4. Theme system initialized, sound manager started
5. User ID retrieved/created (localStorage)
6. `LeagueView` subscribes to InstantDB for real-time updates via `useLeagueData` hook

### Key Directories

| Directory               | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `src/components/`       | React components (PredictionsForm, ResultsForm, Leaderboard, AdminPanel, etc.)           |
| `src/components/admin/` | AdminPanel sub-components (ParticipantsList, SubmissionControls, ShareSection, etc.)     |
| `src/context/`          | React contexts — `AppContext` (app state), `ToastContext` (notifications)                |
| `src/hooks/`            | Custom React hooks — `useLeagueData`, `useUrlParams`                                     |
| `src/db/`               | InstantDB client (`client.ts`), queries (`queries.ts`), type helpers (`typeHelpers.ts`)  |
| `src/services/`         | Business logic — `validation.ts` (team/league name validation)                           |
| `src/constants/`        | Configuration — `timing.ts` (auto-save delays, animation durations)                      |
| `src/handlers/`         | Form submission handlers (league creation)                                               |
| `src/theme/`            | Dynamic NFL team color theming (32 teams). Tokens in `tokens.ts`, applied via `apply.ts` |
| `src/config/games.ts`   | Multi-year Super Bowl config (gameId, teams, year). Add future games here                |
| `src/scoring/`          | Score calculation against actual results                                                 |
| `src/styles/`           | Modular CSS: `base.css` (tokens), `components/` (buttons, inputs, etc.), `features/`     |
| `src/types/`            | TypeScript type definitions (`League`, `Prediction`, `Question`, etc.)                   |
| `src/utils/`            | Utility functions — `logger.ts`, `url.ts`, `user.ts`, `game.ts`                          |

### State Management

React Context in `src/context/AppContext.tsx`. Provides app-wide state including:

- `currentUserId`, `currentTeamId`, `currentTab`
- Celebration flags (`hasTriggeredWinnerCelebration`, `hasShownCompletionCelebration`)
- Score update notifications (`hasUnviewedScoreUpdate`)

Data fetching uses the `useLeagueData` hook which wraps InstantDB's `useQuery` for real-time league and prediction data.

### Component Architecture

Components are kept under 200 lines (per UX_GUIDELINES.md). Large components are split into focused sub-components:

- `AdminPanel` → 7 sub-components in `src/components/admin/`
- Presentational components use `React.memo` for performance

### Data Layer (InstantDB)

App ID from env var `VITE_INSTANTDB_APP_ID` (set per deploy context). Public read/write, no auth. Three entities: `games`, `leagues`, and `predictions`, partitioned by `gameId`. Real-time updates via `db.useQuery()` hook in `useLeagueData`. Mutations via `db.transact()` in `src/db/queries.ts`.

### Multi-Game Support

Games are registered in `src/config/games.ts`. Current: `lx` (Super Bowl LX, 2026, Seahawks vs Patriots). The `gameId` partitions all database queries so multiple Super Bowls can coexist. Add new years by adding entries to the `GAMES` object.

### Theme System

32 NFL team themes defined in `src/theme/teams.ts`. Each theme sets CSS custom properties (primary, secondary, background, text colors). User selection saved to localStorage. All UI uses `var(--color-*)` tokens — never hardcode colors. A CSS audit test (`src/theme/css-audit.test.ts`) enforces this.

## Design System

**Read `UX_GUIDELINES.md` before making any UI changes.** It defines the Apple-inspired design language: spacing tokens (8px grid), component patterns, motion rules, and accessibility requirements.

**Key constraints:**

- Mobile-first, dark mode only
- 8px spacing grid (`--space-xs` through `--space-2xl`)
- 56px minimum touch targets for primary actions, 44px minimum for all interactive elements
- All colors via CSS custom properties (dynamic theming)
- No inline styles in TypeScript — use CSS classes
- `dvh` units (not `vh`), `env(safe-area-inset-*)` for iPhone support
- `prefers-reduced-motion` must be respected

## Testing

**Unit tests** (Vitest + happy-dom): `*.test.ts` files alongside source. Global test functions enabled (no imports for `describe`, `it`, `expect`). Setup in `src/test/setup.ts`.

**E2E tests** (Playwright): Specs in `e2e/specs/`. Runs against Chromium desktop + iPhone 13 mobile. Auto-starts dev server.

## Deployment

Netlify with context-based env vars:

- **production** (prod branch): Production InstantDB database
- **branch-deploy** (master, feature/\*): QA database
- **deploy-preview** (PRs): QA database

Base path is `/superbowl/`. Rewrites in `netlify.toml` map paths accordingly.

## Code Quality Rules

- ESLint flat config with TypeScript strict mode, import ordering, circular dependency detection
- Prettier for formatting
- Type-aware lint rules: `no-floating-promises`, `await-thenable`, `no-misused-promises`
- Knip for detecting unused exports/dependencies
