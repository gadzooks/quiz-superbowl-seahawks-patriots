/* global process */
import { init } from '@instantdb/react';

import schema from '../../instant.schema';

// Get app ID from environment variable
// Works in both Vite (browser) and Node.js (scripts) contexts
const APP_ID =
  typeof import.meta.env !== 'undefined'
    ? import.meta.env.VITE_INSTANTDB_APP_ID // Vite context
    : typeof process !== 'undefined'
      ? process.env.VITE_INSTANTDB_APP_ID // Node.js context
      : undefined;

if (!APP_ID) {
  console.error('VITE_INSTANTDB_APP_ID is not set!');
}

// Initialize InstantDB client with schema for typed queries
// Using @instantdb/react provides useQuery() hook while keeping transact()
export const db = init({ appId: APP_ID || '', schema });
