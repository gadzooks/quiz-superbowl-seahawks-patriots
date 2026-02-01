# Linting & Code Quality

Comprehensive code quality setup with ESLint, Prettier, and TypeScript.

## Tools

- **ESLint 9** - Linting for TypeScript/JavaScript
- **Prettier 3** - Code formatting
- **TypeScript** - Type checking

## Available Scripts

```bash
# Lint all TypeScript files
yarn lint

# Lint and auto-fix issues
yarn lint:fix

# Format all files
yarn format

# Check formatting (CI)
yarn format:check

# Type checking
yarn type-check

# Run all checks (lint + format + types + tests)
yarn validate
```

## Configuration

### ESLint (`eslint.config.js`)

Using flat config format (ESLint 9):
- TypeScript support with `@typescript-eslint`
- Prettier integration
- Browser globals configured
- Relaxed rules for test files

**Key Rules:**
- Unused vars: Warning (allows `_` prefix)
- `any` type: Warning (not error)
- Non-null assertions: Warning
- `console.log`: Allowed
- Prettier violations: Error

### Prettier (`.prettierrc.json`)

**Settings:**
- Single quotes
- Semicolons: Yes
- Print width: 100
- Tab width: 2 spaces
- Trailing commas: ES5
- Line endings: LF

### TypeScript (`tsconfig.json`)

Strict type checking enabled.

## Current Status

### Lint Results
```
✖ 20 problems (0 errors, 20 warnings)
```

**Warnings** (acceptable):
- Unused error variables in catch blocks (`_e`)
- Non-null assertions (DOM elements we know exist)
- Unused `any` in legacy compatibility code

All errors resolved! ✅

### Format Check
```
All matched files use Prettier code style!
```

### Type Check
```
No TypeScript errors
```

### Tests
```
193 tests passed
```

## Integration with IDE

### VS Code

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Lint
  run: yarn lint

- name: Check formatting
  run: yarn format:check

- name: Type check
  run: yarn type-check

- name: Test
  run: yarn test
```

Or use the combined script:

```yaml
- name: Validate
  run: yarn validate
```

## Pre-commit Hooks (Optional)

To add pre-commit hooks, install `husky` and `lint-staged`:

```bash
yarn add -D husky lint-staged
npx husky init
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,json,css,md}": [
      "prettier --write"
    ]
  }
}
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
yarn lint-staged
```

## Troubleshooting

### ESLint errors about globals

Browser globals are configured in `eslint.config.js`. If you see "not defined" errors, add the global to the `globals` object.

### Prettier conflicts with ESLint

The `eslint-plugin-prettier` integration should handle this. If you see conflicts, run:

```bash
yarn lint:fix
yarn format
```

### TypeScript errors in tests

Test files have relaxed rules. Make sure test files match the pattern:
- `**/*.test.ts`
- `**/*.spec.ts`
- `src/test/**/*.ts`

## Code Quality Standards

- **No TypeScript errors** - Strict mode enabled
- **No ESLint errors** - Only warnings allowed
- **Consistent formatting** - Prettier enforced
- **All tests passing** - 100% test success rate

Current status: **All checks passing** ✅
