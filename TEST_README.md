# Test Suite Documentation

Comprehensive test coverage for the Super Bowl Predictions application using Vitest.

## Test Framework

- **Vitest** - Fast, Vite-native testing framework
- **happy-dom** - Lightweight DOM implementation for testing
- **@testing-library/dom** - DOM testing utilities

## Running Tests

```bash
# Run all tests once
yarn test

# Run tests in watch mode (re-runs on file changes)
yarn test:watch

# Run tests with UI interface
yarn test:ui

# Generate coverage report
yarn test:coverage
```

## Test Organization

### Unit Tests

Tests are co-located with source files using the `.test.ts` naming convention:

```
src/
├── config/
│   └── games.test.ts          # Game configuration tests
├── questions.test.ts           # Question generation tests
├── scoring/
│   └── calculate.test.ts      # Scoring logic tests
├── services/
│   └── validation.test.ts     # Validation service tests
├── state/
│   └── store.test.ts          # State management tests
├── ui/
│   ├── screens.test.ts        # Screen navigation tests
│   └── toast.test.ts          # Toast notification tests
└── utils/
    ├── game.test.ts           # Game utility tests
    ├── url.test.ts            # URL utility tests
    └── user.test.ts           # User utility tests
```

### Test Coverage

Current test coverage: **177 tests across 9 test suites**

| Module | Tests | Coverage |
|--------|-------|----------|
| utils/user | 4 | User ID generation |
| utils/url | 19 | URL parsing, league slugs |
| utils/game | 18 | Game config, path parsing |
| config/games | 18 | Game registry, validation |
| questions | 16 | Question generation |
| scoring/calculate | 22 | Score calculation, tiebreakers |
| state/store | 22 | State management |
| services/validation | 58 | Form validation |
| ui/screens | 8 | Screen transitions |
| ui/toast | 10 | Toast notifications |

## Key Test Patterns

### 1. Pure Function Testing
```typescript
describe('calculateScore', () => {
  it('awards points for correct answer', () => {
    const predictions = { winner: 'seahawks' };
    const results = { winner: 'seahawks' };
    expect(calculateScore(predictions, results)).toBe(5);
  });
});
```

### 2. State Management Testing
```typescript
describe('store', () => {
  beforeEach(() => {
    // Reset state before each test
    updateState({ /* initial state */ });
  });

  it('should update state', () => {
    setCurrentUserId('user-123');
    expect(getState().currentUserId).toBe('user-123');
  });
});
```

### 3. DOM Testing
```typescript
describe('showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  it('should create toast element', () => {
    showToast('Test message');
    expect(document.querySelector('.toast-notification')).toBeDefined();
  });
});
```

### 4. URL/Location Mocking
```typescript
it('should parse game ID from URL', () => {
  delete (window as any).location;
  window.location = { pathname: '/lx/smith-family' } as Location;

  expect(getCurrentGameId()).toBe('lx');
});
```

## Coverage Thresholds

Configured in `vitest.config.ts`:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## What's Tested

### ✅ Covered
- User ID generation and persistence
- URL parsing (path-based and query parameter)
- Game configuration and validation
- Question generation with dynamic teams
- Score calculation logic
- Tiebreaker calculation
- State management (getters/setters)
- Form validation (team names, league names)
- Toast notifications
- Screen transitions

### ⚠️ Partial Coverage
- DOM manipulation functions (some rely on window globals)
- Event handlers (tested indirectly)
- Database queries (require InstantDB mock)

### ❌ Not Covered (Future Work)
- Integration tests with InstantDB
- E2E tests for user flows
- Component rendering tests
- Sound manager tests
- Theme system tests

## Best Practices

1. **Isolation** - Each test is independent, state is reset between tests
2. **Descriptive Names** - Test names clearly describe what's being tested
3. **AAA Pattern** - Arrange, Act, Assert structure
4. **Mock External Dependencies** - Use `vi.fn()` and `vi.mock()`
5. **Timer Management** - Use `vi.useFakeTimers()` for time-dependent tests
6. **Cleanup** - `beforeEach`/`afterEach` hooks ensure clean state

## Adding New Tests

When adding new functionality:

1. Create a `.test.ts` file next to the source file
2. Import the functions you want to test
3. Use `describe` blocks to group related tests
4. Use `beforeEach`/`afterEach` for setup/teardown
5. Write clear, focused test cases
6. Run tests to ensure they pass

Example:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { myFunction } from './myModule';

describe('myModule', () => {
  beforeEach(() => {
    // Setup
  });

  describe('myFunction', () => {
    it('should do something specific', () => {
      const result = myFunction(input);
      expect(result).toBe(expected);
    });
  });
});
```

## Continuous Integration

Tests should be run:
- Before every commit
- In CI/CD pipeline
- Before deploying to production

## Known Limitations

1. **InstantDB Integration** - Database operations are not tested (would require mocking InstantDB SDK)
2. **Browser APIs** - Some browser-specific APIs may behave differently in happy-dom vs real browsers
3. **CSS/Layout** - Visual layout and styling are not tested

## Future Improvements

- [ ] Add integration tests with InstantDB mock
- [ ] Add E2E tests using Playwright
- [ ] Increase coverage to 80%+
- [ ] Add visual regression tests
- [ ] Test error boundaries and edge cases
- [ ] Add performance benchmarks
