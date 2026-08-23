import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    // Main app entry
    'src/main.tsx',
    // Test files
    'src/**/*.test.{ts,tsx}',
    'e2e/**/*.spec.ts',
    // Scripts
    'scripts/**/*.ts',
    // Netlify Functions (Yahoo OAuth broker) — each file is its own entry point
    'netlify/functions/**/*.ts',
  ],
  project: [
    'src/**/*.{ts,tsx}',
    'e2e/**/*.{ts,tsx}',
    'scripts/**/*.ts',
    'netlify/functions/**/*.ts',
  ],
  ignore: [
    // Build output
    'dist/**',
    'coverage/**',
    // Test output
    'playwright-report/**',
    'test-results/**',
    // Deprecated/backup files (already deleted, but keep for safety)
    '**/*.backup.*',
  ],
  ignoreBinaries: [
    // System/CI binaries that don't need to be in package.json
    'netlify',
  ],
  ignoreDependencies: [
    // Used in scripts via shell commands (execSync)
    'instant-cli',
  ],
  // Allow certain patterns of unused exports
  ignoreExportsUsedInFile: true,
};

export default config;
