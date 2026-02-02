import { Page } from '@playwright/test';

/**
 * Set up InstantDB mock that returns no leagues (simulates league not found scenario)
 * This injects client-side code to override the InstantDB client before app initialization
 */
export async function mockInstantDBLeagueNotFound(page: Page, _gameId: string, _slug: string) {
  await page.addInitScript(() => {
    // Override the InstantDB init function before the app loads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__INSTANTDB_MOCK__ = {
      type: 'league-not-found',
      data: {
        leagues: [],
        predictions: [],
      },
    };
  });
}

/**
 * Set up InstantDB mock that returns a valid league
 */
export async function mockInstantDBLeagueFound(
  page: Page,
  gameId: string,
  slug: string,
  leagueData?: {
    id?: string;
    name?: string;
    creatorId?: string;
    isOpen?: boolean;
    actualResults?: Record<string, string | number> | null;
  }
) {
  const defaultLeague = {
    id: 'league-123',
    name: 'Test League',
    slug,
    gameId,
    creatorId: 'user-123',
    isOpen: true,
    createdAt: Date.now(),
    actualResults: null,
    showAllPredictions: false,
    ...leagueData,
  };

  await page.addInitScript((league) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__INSTANTDB_MOCK__ = {
      type: 'league-found',
      data: {
        leagues: [league],
        predictions: [],
      },
    };
  }, defaultLeague);
}

/**
 * Set up InstantDB mock that returns a league with predictions
 */
export async function mockInstantDBWithPredictions(
  page: Page,
  gameId: string,
  slug: string,
  predictions: Record<string, unknown>[]
) {
  await page.addInitScript(
    (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__INSTANTDB_MOCK__ = {
        type: 'league-with-predictions',
        data: {
          leagues: [
            {
              id: 'league-123',
              name: 'Test League',
              slug: data.slug,
              gameId: data.gameId,
              creatorId: 'user-123',
              isOpen: true,
              createdAt: Date.now(),
              actualResults: null,
              showAllPredictions: false,
            },
          ],
          predictions: data.predictions,
        },
      };
    },
    { slug, gameId, predictions }
  );
}
