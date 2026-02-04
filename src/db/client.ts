import { init } from '@instantdb/core';

import schema from '../../instant.schema';

// Get app ID from environment variable
// Vite exposes VITE_ prefixed env vars via import.meta.env
const APP_ID = import.meta.env.VITE_INSTANTDB_APP_ID;

if (!APP_ID) {
  console.error('VITE_INSTANTDB_APP_ID is not set!');
}

// Initialize InstantDB client with schema for typed queries
export const db = init({ appId: APP_ID || '', schema });
