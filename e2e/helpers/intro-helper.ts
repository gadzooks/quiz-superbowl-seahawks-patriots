import type { Page } from '@playwright/test';

/**
 * Wait for and dismiss the intro overlay if it appears.
 * The intro overlay shows after team name entry and auto-dismisses,
 * but we can speed up tests by clicking to dismiss it manually.
 *
 * Strategy:
 * 1. Wait for intro to appear (up to 5 seconds)
 * 2. If it appears, click to dismiss immediately
 * 3. Wait for it to fully fade out
 * 4. If it doesn't appear within 5 seconds, assume it already auto-dismissed
 */
export async function waitForAndDismissIntro(page: Page): Promise<void> {
  const introOverlay = page.locator('.intro-overlay');

  try {
    // Wait for intro to appear (timeout after 5 seconds if it doesn't)
    await introOverlay.waitFor({ state: 'visible', timeout: 5000 });

    // Click anywhere on the intro to dismiss it
    await introOverlay.click();

    // Wait for fade-out animation to complete
    await introOverlay.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // If intro never appeared or is already gone, that's fine
    // Continue with the test
  }

  // Extra small wait to ensure form is ready
  await page.waitForTimeout(500);
}
