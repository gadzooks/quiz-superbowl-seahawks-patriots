import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
