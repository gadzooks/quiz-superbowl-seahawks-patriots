/* global process */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load .env file and push schema to InstantDB
 */
function pushSchema() {
  // Check for -y or --yes flag
  const autoConfirm = process.argv.includes('-y') || process.argv.includes('--yes');

  // Load .env file
  const envPath = join(process.cwd(), '.env');
  let appId = process.env.VITE_INSTANTDB_APP_ID;
  let adminToken = process.env.INSTANT_ADMIN_TOKEN;

  try {
    const envFile = readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');

    for (const line of lines) {
      const match = line.match(/^(VITE_INSTANTDB_APP_ID|INSTANT_ADMIN_TOKEN)=(.+)$/);
      if (match) {
        const [, key, value] = match;
        if (key === 'VITE_INSTANTDB_APP_ID') {
          appId = value.trim();
        }
        if (key === 'INSTANT_ADMIN_TOKEN') {
          adminToken = value.trim();
        }
      }
    }
  } catch {
    console.error('Warning: Could not read .env file');
  }

  if (!appId) {
    console.error('❌ Error: No app ID found');
    console.error('\nSet VITE_INSTANTDB_APP_ID in .env');
    console.error('Or run: yarn instant-cli login');
    process.exit(1);
  }

  if (!adminToken) {
    console.error('❌ Error: No admin token found');
    console.error('\nSet INSTANT_ADMIN_TOKEN in .env or Netlify environment variables');
    console.error('Or run: yarn instant-cli login');
    console.error('\nSchema push is REQUIRED to prevent query timeout issues.');
    process.exit(1);
  }

  console.log(`\n📤 Pushing schema to app: ${appId.substring(0, 8)}...${appId.slice(-4)}\n`);

  const tokenFlag = `-t ${adminToken}`;
  const yesFlag = autoConfirm ? '-y' : '';

  try {
    execSync(`yarn instant-cli push schema instant.schema.ts -a ${appId} ${tokenFlag} ${yesFlag}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_INSTANTDB_APP_ID: appId,
      },
    });
    console.log(
      `\n✅ Schema pushed successfully to app: ${appId.substring(0, 8)}...${appId.slice(-4)}\n`
    );
  } catch (error) {
    console.error('\n❌ Schema push failed!');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

pushSchema();
