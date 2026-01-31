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

export default defineConfig({
  define: {
    __GIT_COMMIT__: JSON.stringify(getGitCommit()),
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
