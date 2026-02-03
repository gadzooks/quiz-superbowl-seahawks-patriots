# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Super Bowl prediction game — a mobile-first web app where users create leagues, submit predictions on game questions, and compete on a real-time leaderboard. Built with TypeScript, Vite, and InstantDB for real-time sync. Designed for elderly users with large touch targets and high contrast.

## Commands

```bash
# Development
npm run dev              # Vite dev server on port 8000
npm run build            # TypeScript check + Vite production build

# Testing
npm run test             # Vitest unit tests (single run)
npm run test:watch       # Vitest watch mode
npx vitest run src/path/to/file.test.ts  # Run single test file
npm run test:e2e         # Playwright E2E tests (starts dev server)
npm run test:e2e:headed  # E2E with visible browser

# Code quality
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript check (tsc --noEmit)
npm run validate         # Full suite: lint + format + type-check + test
npm run check:unused     # Knip unused code detection

# Deploy
npm run validate:build   # Build + asset validation
```

**Pre-commit hooks** (Husky + lint-staged): ESLint fix, Prettier format, type-check, and full test suite run on every commit. If the hook fails, the commit did not happen — create a new commit after fixing, do not amend.

## Architecture

### Module System

Entry point is `src/main.ts` (loaded by Vite). The app is in **hybrid migration mode** — modern TypeScript modules coexist with legacy inline JavaScript in `index.html`. Modules expose functions to `window.*` globals so the HTML `onclick` handlers and inline `<script>` still work. The legacy script waits for `window.waitForAppReady()` before running.

### Initialization Flow

1. Vite loads `src/main.ts`
2. Team picker shown if first visit (sets theme)
3. Theme system initialized, sound manager started
4. User ID retrieved/created (localStorage)
5. If `?league=slug` in URL, subscribes to InstantDB for real-time updates
6. All modules exposed to `window` for legacy compatibility
7. `appReadyResolve()` called — legacy `index.html` script proceeds

### Key Directories

| Directory             | Purpose                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `src/state/store.ts`  | Centralized state — getState(), setter functions, subscribe()                            |
| `src/db/`             | InstantDB client (`client.ts`) and subscription queries (`queries.ts`)                   |
| `src/handlers/`       | Form submission handlers (league, team, predictions, results)                            |
| `src/components/`     | UI rendering functions (PredictionsForm, ResultsForm, Participants, AdminPanel)          |
| `src/ui/`             | Screen management, modals, tabs, toast, celebration animations                           |
| `src/theme/`          | Dynamic NFL team color theming (32 teams). Tokens in `tokens.ts`, applied via `apply.ts` |
| `src/config/games.ts` | Multi-year Super Bowl config (gameId, teams, year). Add future games here                |
| `src/questions.ts`    | Question definitions — dynamically generated from game config                            |
| `src/scoring/`        | Score calculation against actual results                                                 |
| `src/styles/`         | Modular CSS: `base.css` (tokens), `components/` (buttons, inputs, etc.), `features/`     |

### State Management

Custom store in `src/state/store.ts`. Pattern: private state object + individual setter functions + `updateState()` for batch updates + `subscribe()` for listeners. All setters notify subscribers. Key computed getters: `getCurrentUserPrediction()`, `hasAdminAccess()`, `isSubmissionsOpen()`.

### Data Layer (InstantDB)

App ID from env var `VITE_INSTANTDB_APP_ID` (set per deploy context). Public read/write, no auth. Two entities: `leagues` and `predictions`, both partitioned by `gameId`. Real-time updates via `db.subscribeQuery()`.

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
