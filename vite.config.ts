import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import react from '@vitejs/plugin-react';

// Serve the SPA for /weekly/* URLs in dev. In production this is handled by
// a Netlify rewrite (/weekly/* -> /index.html); the dev server only falls
// back to index.html under the /superbowl base path, so mirror it here.
const weeklySpaFallback = (): Plugin => ({
  name: 'weekly-spa-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.startsWith('/weekly')) {
        req.url = '/superbowl/index.html';
      }
      next();
    });
  },
});

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
  plugins: [react(), weeklySpaFallback()],
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
    // Under `netlify dev`, Vite's own port (8000) has no /.netlify/functions/*
    // routing — only the outer netlify dev proxy (8888) does. Auto-opening
    // Vite's own URL here would land the browser on the wrong port for
    // anything that hits a Netlify Function (e.g. Yahoo login).
    open: !process.env.NETLIFY_DEV,
    // `netlify dev` already terminates HTTPS on its own proxy (see
    // [dev.https] in netlify.toml) and expects a plain-HTTP upstream target;
    // enabling HTTPS here too breaks its proxying. Only self-serve HTTPS
    // when running Vite standalone (`yarn dev`) for direct-to-Vite testing.
    https:
      !process.env.NETLIFY_DEV && fs.existsSync('./localhost-key.pem')
        ? {
            key: fs.readFileSync('./localhost-key.pem'),
            cert: fs.readFileSync('./localhost.pem'),
          }
        : undefined,
  },

  // Copy static assets
  publicDir: 'public',
});
