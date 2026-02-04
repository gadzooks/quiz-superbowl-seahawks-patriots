// export-data.ts

/* global process */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const appId = process.env.INSTANT_APP_ID || process.env.VITE_INSTANTDB_APP_ID;

if (!appId) {
  console.error('❌ Error: INSTANT_APP_ID or VITE_INSTANTDB_APP_ID environment variable required');
  console.log('\nUsage:');
  console.log('  INSTANT_APP_ID=your-app-id yarn run db:export');
  console.log('  or');
  console.log('  VITE_INSTANTDB_APP_ID=your-app-id yarn run db:export\n');
  process.exit(1);
}

/**
 * Export database backup
 */
function exportData() {
  console.log('\n💾 Exporting InstantDB Data\n');
  console.log('='.repeat(80));
  console.log(`App ID: ${appId}\n`);

  // Create backups directory if it doesn't exist
  const backupsDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
    console.log(`📁 Created backups directory: ${backupsDir}\n`);
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupsDir, filename);

  try {
    console.log('🔄 Exporting data...\n');

    // Run InstantDB export command
    execSync(`yarn instant-cli export "${filepath}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        INSTANT_APP_ID: appId,
      },
    });

    // Verify export file exists and has content
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      const sizeInKB = (stats.size / 1024).toFixed(2);

      console.log('\n✅ Export successful!');
      console.log(`   File: ${filename}`);
      console.log(`   Size: ${sizeInKB} KB`);
      console.log(`   Path: ${filepath}\n`);

      // Show recent backups
      const backupFiles = fs
        .readdirSync(backupsDir)
        .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 5);

      if (backupFiles.length > 0) {
        console.log('📋 Recent backups:');
        backupFiles.forEach((file) => {
          const stats = fs.statSync(path.join(backupsDir, file));
          const size = (stats.size / 1024).toFixed(2);
          console.log(`   - ${file} (${size} KB)`);
        });
        console.log('');
      }

      // Cleanup old backups (keep last 10)
      const allBackups = fs
        .readdirSync(backupsDir)
        .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (allBackups.length > 10) {
        const toDelete = allBackups.slice(10);
        console.log(`🗑️  Cleaning up ${toDelete.length} old backups...\n`);
        toDelete.forEach((file) => {
          fs.unlinkSync(path.join(backupsDir, file));
        });
      }
    } else {
      console.error('❌ Export file was not created');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    console.log('\nTroubleshooting:');
    console.log('  1. Ensure instant-cli is installed: yarn install -D @instantdb/cli');
    console.log('  2. Verify your app ID is correct');
    console.log('  3. Check you have network connectivity\n');
    process.exit(1);
  }
}

// Run export
exportData();
