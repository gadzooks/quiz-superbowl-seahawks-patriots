import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Get git commit hash at build time
const getGitCommit = (): string => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

// Get git commit message at build time
const getGitCommitMessage = (): string => {
  try {
    // Get first line of commit message (subject)
    return execSync('git log -1 --pretty=%s').toString().trim();
  } catch {
    return 'No commit message';
  }
};

export default defineConfig({
  base: '/superbowl/',
  define: {
    __GIT_COMMIT__: JSON.stringify(getGitCommit()),
    __GIT_COMMIT_MESSAGE__: JSON.stringify(getGitCommitMessage()),
  },
  // Environment variable handling - Vite exposes VITE_* vars to client
  envPrefix: 'VITE_',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  server: {
    port: 8000,
    open: true,
  },

  // Copy static assets
  publicDir: 'public',
});
