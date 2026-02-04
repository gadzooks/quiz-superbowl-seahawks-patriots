import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import-x';

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'data/**', // Question files - not part of src/
      '*.config.js',
      '*.config.ts',
      'instant.schema.backup.ts',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        crypto: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Audio: 'readonly',
        AudioContext: 'readonly',
        Image: 'readonly',
        // TypeScript globals
        Window: 'readonly',
        Document: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDialogElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLImageElement: 'readonly',
        Event: 'readonly',
        Location: 'readonly',
        Crypto: 'readonly',
        // Node globals for tests
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      'import-x': importPlugin,
    },
    settings: {
      'import-x/extensions': ['.ts', '.tsx', '.js', '.jsx'],
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import-x/resolver': {
        node: {
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'off', // Allow console.log for this project
      'no-debugger': 'warn',
      // Import rules
      'import-x/no-cycle': 'error', // Prevent circular dependencies
      'import-x/no-namespace': 'error', // Disallow "import * as" syntax
      'import-x/no-duplicates': 'error', // Merge multiple imports from same module
      'import-x/no-self-import': 'error', // Prevent importing from the same file
      'import-x/no-useless-path-segments': 'error', // Clean up unnecessary path segments
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Stricter TypeScript rules (type-aware)
      '@typescript-eslint/no-floating-promises': 'error', // Catch unhandled promises
      '@typescript-eslint/await-thenable': 'error', // Prevent await on non-promises
      '@typescript-eslint/no-misused-promises': 'error', // Catch promises in wrong contexts
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Use ?? instead of ||
      '@typescript-eslint/prefer-optional-chain': 'warn', // Use ?. for safer property access
      '@typescript-eslint/no-unnecessary-condition': 'warn', // Catch always-true/false conditions
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for this codebase
      // React best practices
      'no-restricted-syntax': [
        'error',
        {
          // Disallow type assertions except "as const" (which creates literal types)
          selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
          message: 'Avoid type assertions. Use type guards or validation instead.',
        },
      ],
    },
  },
  {
    // Scripts are build tools that often need type flexibility
    files: ['scripts/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off', // Allow type assertions in build scripts
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', 'src/test/**/*.ts'],
    languageOptions: {
      globals: {
        // Vitest globals
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-restricted-syntax': 'off', // Allow type assertions in tests for mocking
    },
  },
];
