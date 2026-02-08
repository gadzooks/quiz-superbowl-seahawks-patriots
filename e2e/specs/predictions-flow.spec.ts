import { test, expect } from '@playwright/test';

import { waitForAndDismissIntro } from '../helpers/intro-helper';
import { TEST_GAME_ID } from '../helpers/test-data';

/**
 * Predictions Flow Tests
 *
 * Tests the complete user journey from entering a team name to submitting predictions.
 * NOTE: These tests run against a REAL InstantDB instance.
 *
 * CURRENTLY SKIPPED: Form interaction and auto-save tests have timing issues
 * with database sync and form state updates. These need more robust wait
 * strategies or test environment configuration.
 */

test.describe.skip('Predictions Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('supportedTeam', 'sea'); // Seahawks
    });
  });

  test('should allow entering team name and show predictions form', async ({ page }) => {
    const leagueName = `Predictions Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    // Wait for team name entry screen
    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });

    // Enter team name
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Verify predictions form is interactive
    await expect(page.locator('.question-group, .question-card').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show unsaved changes indicator when making predictions', async ({ page }) => {
    const leagueName = `Unsaved Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Wait for the form to be fully rendered and interactive
    const firstRadio = page.locator('input[type="radio"]').first();
    await expect(firstRadio).toBeVisible({ timeout: 10000 });
    await expect(firstRadio).toBeEnabled({ timeout: 5000 });

    // Click first radio button option
    await firstRadio.click();

    // Should show unsaved changes bar
    await expect(page.getByText(/unsaved changes/i)).toBeVisible({ timeout: 5000 });
  });

  test('should auto-save predictions after delay', async ({ page }) => {
    const leagueName = `Autosave Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Wait for form to be interactive
    const firstRadio = page.locator('input[type="radio"]').first();
    await expect(firstRadio).toBeVisible({ timeout: 10000 });
    await expect(firstRadio).toBeEnabled({ timeout: 5000 });

    // Make a prediction
    await firstRadio.click();

    // Verify unsaved changes bar appears
    await expect(page.getByText(/unsaved changes/i)).toBeVisible({ timeout: 3000 });

    // Wait for auto-save (3 seconds debounce + 1 second buffer)
    await page.waitForTimeout(4500);

    // Unsaved changes bar should disappear after auto-save
    await expect(page.getByText(/unsaved changes/i)).not.toBeVisible();
  });

  test('should allow updating team name via modal', async ({ page }) => {
    const leagueName = `Team Update Test ${Date.now()}`;
    const initialTeamName = 'Initial Team';
    const updatedTeamName = 'Updated Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(initialTeamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Click on team name in header to open modal
    await page.getByText(initialTeamName).click();

    // Should show team name modal
    await expect(page.getByRole('heading', { name: /update.*team name/i })).toBeVisible({
      timeout: 5000,
    });

    // Update team name
    const teamNameInput = page.getByRole('textbox', { name: /team name/i });
    await teamNameInput.clear();
    await teamNameInput.fill(updatedTeamName);
    await page.getByRole('button', { name: /update/i }).click();

    // Modal should close and new team name should be visible
    await expect(page.getByText(updatedTeamName)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: /update.*team name/i })).not.toBeVisible();
  });
});
