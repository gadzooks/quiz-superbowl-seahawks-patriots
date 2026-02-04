/* global process */
/**
 * Verify InstantDB App ID configuration
 * Logs the app ID that will be used by the application
 */

// Get app ID from environment variable (same logic as src/db/client.ts)
const APP_ID = process.env.VITE_INSTANTDB_APP_ID;

console.log('\n📋 InstantDB App ID Configuration');
console.log('='.repeat(50));

if (!APP_ID) {
  console.error('❌ VITE_INSTANTDB_APP_ID is not set!');
  console.error('\nSet this environment variable in:');
  console.error('  - .env file for local development');
  console.error('  - Netlify environment variables for deployments');
  process.exit(1);
}

console.log('✅ App ID:', `${APP_ID.substring(0, 8)}...${APP_ID.slice(-4)}`);
console.log('📍 Full App ID:', APP_ID);
console.log('🌍 Context:', process.env.CONTEXT || 'local');
console.log('🔧 Deploy URL:', process.env.DEPLOY_URL || 'N/A');
console.log('='.repeat(50));
console.log('\nThis is the app ID that will be used by:');
console.log('  - Schema push (push-schema.ts)');
console.log('  - Frontend application (src/db/client.ts)');
console.log('  - Database queries\n');
