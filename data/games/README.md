# Game Questions

This directory contains question definitions for each Super Bowl game.

## Structure

Each game has its own questions file:

- `lx-questions.ts` - Super Bowl LX (Seahawks vs Patriots, 2026)
- `lxi-questions.ts` - Super Bowl LXI (TBD, 2027) - _create when needed_

## Adding a New Game

When it's time to set up a new Super Bowl:

### 1. Add game config to `src/config/games.ts`

```typescript
export const GAMES: Record<string, GameConfig> = {
  lx: {
    gameId: 'lx',
    displayName: 'Super Bowl LX',
    year: 2026,
    teams: ['Seahawks', 'Patriots'],
  },
  lxi: {
    // NEW GAME
    gameId: 'lxi',
    displayName: 'Super Bowl LXI',
    year: 2027,
    teams: ['Team1', 'Team2'],
  },
};
```

### 2. Create questions file: `data/games/lxi-questions.ts`

Copy `lx-questions.ts` as a template and update:

```typescript
/**
 * Super Bowl LXI Questions
 * Team1 vs Team2 - 2027
 */

export function createLXIQuestions(teams: [string, string]): Array<{
  questionId: string;
  label: string;
  type: string;
  options?: string[];
  points: number;
  sortOrder: number;
  isTiebreaker: boolean;
}> {
  const [team1, team2] = teams;

  return [
    // Your questions here...
  ];
}
```

### 3. Seed the database

```bash
yarn seed-game lxi
```

## Important Notes

- **DO NOT import these files into `src/`** - they are only for seeding scripts
- The seed script will automatically verify the questions file exists
- Each game must have its own unique questions file
- Questions are tied to the game via the InstantDB relationship
