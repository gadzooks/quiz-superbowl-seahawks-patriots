# E2E Testing with Playwright

This directory contains end-to-end tests for the Super Bowl prediction app using Playwright.

## Important: Testing Strategy

**These tests run against a REAL InstantDB instance**, not mocked data. This approach:

- ✅ Tests the actual integration with InstantDB
- ✅ Validates real WebSocket behavior
- ✅ Catches real-world edge cases
- ⚠️ Requires a test database instance
- ⚠️ Tests may create data in the database

## Structure

```
e2e/
├── fixtures/
│   └── instantdb-mock.ts     # (Reserved for future mocking attempts)
├── helpers/
│   └── test-data.ts          # Reusable test data
├── specs/
│   ├── league-not-found.spec.ts  # League not found tests
│   └── league-creation.spec.ts   # League creation tests
└── README.md                 # This file
```

Configuration is in the root `playwright.config.ts`.

## Running Tests

### Prerequisites

1. **Set up environment variables:**

   ```bash
   # Create .env file with test InstantDB app ID
   VITE_INSTANTDB_APP_ID=your-test-app-id
   ```

2. **Start dev server** (or let Playwright auto-start it):
   ```bash
   yarn run dev
   ```

### Run Commands

```bash
# Run all E2E tests (headless)
yarn run test:e2e

# Run tests in UI mode (interactive) - RECOMMENDED
yarn run test:e2e:ui

# Run tests with browser visible
yarn run test:e2e:headed

# Debug a specific test
yarn run test:e2e:debug

# Run all tests (unit + e2e)
yarn run test:all
```

## Test Coverage

### ✅ Implemented Tests

**League Not Found:**

- Shows proper error screen for non-existent league
- Displays correct slug in error message
- Clears localStorage when league not found
- Allows navigation to game home via "Create a New League"

**League Creation:**

- Shows league creation form on game home
- Creates new league and navigates to team entry

### 📋 Planned Tests

- Team name entry and validation
- Prediction submission flow
- Real-time leaderboard updates
- Admin controls (toggle submissions, enter results)
- Score calculation and tiebreaker logic

## Testing Approach

### No Mocking (Intentional)

We initially planned to mock InstantDB using network interception, but InstantDB uses:

- WebSocket connections (not HTTP)
- Complex SDK with internal state
- Real-time subscriptions

**Mocking these would be:**

- Complex and fragile
- Not representative of production behavior
- Prone to false positives/negatives

**Instead, we use:**

- Real InstantDB test instance
- Unique timestamps in test data to avoid conflicts
- Non-existent slugs for negative tests (e.g., `nonexistent-league-${Date.now()}`)

### Test Data Strategy

1. **For negative tests** (league not found):
   - Use timestamp-based unique slugs that won't exist
   - Example: `nonexistent-league-${Date.now()}`

2. **For positive tests** (creation, submissions):
   - Use timestamp-based unique names
   - Example: `Test League ${Date.now()}`
   - Data persists in test database (acceptable for E2E tests)

3. **For cleanup** (future):
   - Create utility scripts to clear test data
   - Use naming conventions (e.g., prefix with "test-")

## Writing New Tests

Example test:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_GAME_ID } from '../helpers/test-data';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    // Use unique data to avoid conflicts
    const uniqueName = `Test ${Date.now()}`;

    await page.goto(`/${TEST_GAME_ID}/`);

    // Your test steps
    await page.fill('input[name="name"]', uniqueName);
    await page.click('button:has-text("Submit")');

    // Assertions
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: yarn run test:e2e
  env:
    VITE_INSTANTDB_APP_ID: ${{ secrets.TEST_INSTANTDB_APP_ID }}
```

### Key Points for CI

- Use a dedicated test InstantDB app ID
- Store app ID in CI secrets
- Tests run with 2 retries in CI mode
- Screenshots/videos captured on failure

## Browser Support

Tests run on multiple browsers/viewports:

- **Chromium** (Desktop Chrome)
- **Mobile** (iPhone 13 viewport)

Add more in `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile', use: { ...devices['iPhone 13'] } },
],
```

## Debugging

### UI Mode (Recommended)

```bash
yarn run test:e2e:ui
```

Benefits:

- See tests running in real-time
- Pause and inspect at any step
- View DOM snapshots at each action
- Inspect network activity
- Time travel through test execution

### Debug Mode

```bash
yarn run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Screenshots & Traces

On failure, check `test-results/` for:

- **Screenshots**: Visual proof of failure state
- **Trace files**: Full execution trace (view with `npx playwright show-trace trace.zip`)

## Best Practices

1. **Use semantic selectors**
   - Prefer `role`, `text`, IDs over CSS classes
   - Example: `page.locator('button:has-text("Submit")')`

2. **Test user flows, not implementation**
   - Focus on what users see/do
   - Don't test internal state unless necessary

3. **Keep tests independent**
   - Each test should work in isolation
   - Clear localStorage between tests if needed
   - Use unique data (timestamps) to avoid conflicts

4. **Use descriptive names**
   - Test names should describe user behavior
   - Good: "should show error when league not found"
   - Bad: "test league 404"

5. **Wait for network idle**
   - InstantDB uses WebSockets (async)
   - Use `await page.waitForLoadState('networkidle')` when needed

## Troubleshooting

### Port Already in Use

```bash
lsof -ti:8000 | xargs kill -9
```

### Tests Failing with "Element not visible"

- InstantDB is async - add `{ timeout: 10000 }` to assertions
- Wait for network idle: `await page.waitForLoadState('networkidle')`
- Check if test is using real/test database correctly

### InstantDB Connection Errors

- Verify `VITE_INSTANTDB_APP_ID` is set
- Check test database permissions (should allow public read/write)
- Look at browser console in headed mode: `yarn run test:e2e:headed`

### Tests Passing Locally, Failing in CI

- Check CI environment variables
- Verify test database is accessible from CI
- Review CI logs for InstantDB connection errors
- Increase timeouts for slower CI environments

## Future Improvements

1. **Test data cleanup utility**
   - Script to clear test leagues/predictions
   - Run before/after test suite

2. **Visual regression testing**
   - Add screenshot comparison tests
   - Use Playwright's built-in visual testing

3. **Performance testing**
   - Measure page load times
   - Test with large datasets (100+ predictions)

4. **Dedicated test InstantDB app**
   - Separate app ID for CI/CD
   - Automated cleanup on schedule
