/* global process */
import { execSync } from 'child_process';

interface SchemaChange {
  type: 'added' | 'removed' | 'modified';
  entity?: string;
  field?: string;
  risk: 'safe' | 'warning' | 'destructive';
  message: string;
  details?: string;
}

/**
 * Parse git diff for InstantDB schema changes
 */
function detectSchemaChanges(): SchemaChange[] {
  const changes: SchemaChange[] = [];

  try {
    // Check if schema file exists in git
    try {
      execSync('git ls-files --error-unmatch instant.schema.ts', {
        stdio: 'pipe',
      });
    } catch {
      console.log('ℹ️  Schema file not yet tracked in git - treating as initial version');
      return [
        {
          type: 'added',
          risk: 'safe',
          message: '✅ Initial schema creation',
          details: 'First time adding schema to repository',
        },
      ];
    }

    // Get diff of instant.schema.ts
    const diff = execSync('git diff HEAD instant.schema.ts', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!diff.trim()) {
      console.log('✅ No schema changes detected');
      return [];
    }

    const lines = diff.split('\n');
    let currentEntity = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Track current entity context
      const entityMatch = trimmedLine.match(/^[+-]?\s*(\w+):\s*i\.entity\(/);
      if (entityMatch) {
        currentEntity = entityMatch[1];
      }

      // DESTRUCTIVE: Removed entity
      if (line.startsWith('-') && trimmedLine.includes(': i.entity({')) {
        const match = trimmedLine.match(/(\w+):\s*i\.entity/);
        if (match) {
          changes.push({
            type: 'removed',
            entity: match[1],
            risk: 'destructive',
            message: `🚨 ENTITY REMOVED: "${match[1]}"`,
            details: 'ALL RECORDS IN THIS ENTITY WILL BE PERMANENTLY DELETED',
          });
        }
      }

      // DESTRUCTIVE: Removed field
      if (line.startsWith('-') && /:\s*i\.\w+\(/.test(trimmedLine)) {
        const fieldMatch = trimmedLine.match(/(\w+):\s*i\.(\w+)\(/);
        if (fieldMatch && !trimmedLine.includes('entity({')) {
          const [, fieldName, fieldType] = fieldMatch;

          // Check if this is actually a removal (not just a modification)
          const nextLine = lines[i + 1];
          const isModification = nextLine?.startsWith('+') && nextLine.includes(`${fieldName}:`);

          if (!isModification) {
            changes.push({
              type: 'removed',
              entity: currentEntity,
              field: fieldName,
              risk: 'destructive',
              message: `⛔ FIELD REMOVED: "${currentEntity}.${fieldName}"`,
              details: `ALL DATA IN THIS FIELD WILL BE PERMANENTLY DELETED (was type: ${fieldType})`,
            });
          }
        }
      }

      // DESTRUCTIVE: Type change
      if (line.startsWith('-') && /:\s*i\.\w+\(/.test(trimmedLine)) {
        const nextLine = lines[i + 1];
        if (nextLine?.startsWith('+')) {
          const oldMatch = trimmedLine.match(/(\w+):\s*i\.(\w+)\(/);
          const newMatch = nextLine.trim().match(/(\w+):\s*i\.(\w+)\(/);

          if (oldMatch && oldMatch[1] === newMatch?.[1]) {
            const [, fieldName, oldType] = oldMatch;
            const newType = newMatch[2];

            if (oldType !== newType) {
              changes.push({
                type: 'modified',
                entity: currentEntity,
                field: fieldName,
                risk: 'destructive',
                message: `⚠️  TYPE CHANGED: "${currentEntity}.${fieldName}"`,
                details: `${oldType} → ${newType} (May cause data loss if incompatible)`,
              });
            }
          }
        }
      }

      // WARNING: Removed .optional()
      if (line.startsWith('-') && trimmedLine.includes('.optional()')) {
        const nextLine = lines[i + 1];
        if (nextLine?.startsWith('+') && !nextLine.includes('.optional()')) {
          const fieldMatch = trimmedLine.match(/(\w+):\s*i\./);
          if (fieldMatch) {
            changes.push({
              type: 'modified',
              entity: currentEntity,
              field: fieldMatch[1],
              risk: 'warning',
              message: `⚠️  MADE REQUIRED: "${currentEntity}.${fieldMatch[1]}"`,
              details:
                'Field is no longer optional - existing records without this field may fail validation',
            });
          }
        }
      }

      // WARNING: Added .unique()
      if (line.startsWith('+') && trimmedLine.includes('.unique()')) {
        const prevLine = lines[i - 1];
        if (prevLine?.startsWith('-') && !prevLine.includes('.unique()')) {
          const fieldMatch = trimmedLine.match(/(\w+):\s*i\./);
          if (fieldMatch) {
            changes.push({
              type: 'modified',
              entity: currentEntity,
              field: fieldMatch[1],
              risk: 'warning',
              message: `⚠️  UNIQUE CONSTRAINT ADDED: "${currentEntity}.${fieldMatch[1]}"`,
              details: 'Existing duplicate values will cause migration to fail',
            });
          }
        }
      }

      // SAFE: Added optional field
      if (
        line.startsWith('+') &&
        /:\s*i\.\w+\(/.test(trimmedLine) &&
        trimmedLine.includes('.optional()')
      ) {
        const fieldMatch = trimmedLine.match(/(\w+):\s*i\.(\w+)\(/);
        if (fieldMatch && !trimmedLine.includes('entity({')) {
          const [, fieldName, fieldType] = fieldMatch;
          changes.push({
            type: 'added',
            entity: currentEntity,
            field: fieldName,
            risk: 'safe',
            message: `✅ ADDED OPTIONAL FIELD: "${currentEntity}.${fieldName}"`,
            details: `New optional ${fieldType} field - existing records unaffected`,
          });
        }
      }

      // SAFE: Added new entity
      if (line.startsWith('+') && trimmedLine.includes(': i.entity({')) {
        const match = trimmedLine.match(/(\w+):\s*i\.entity/);
        if (match) {
          // Check if entity was really added (not moved)
          const wasRemoved = changes.some((c) => c.type === 'removed' && c.entity === match[1]);
          if (!wasRemoved) {
            changes.push({
              type: 'added',
              entity: match[1],
              risk: 'safe',
              message: `✅ NEW ENTITY ADDED: "${match[1]}"`,
              details: 'New entity created - no impact on existing data',
            });
          }
        }
      }

      // SAFE: Added link
      if (
        line.startsWith('+') &&
        trimmedLine.includes('forward:') &&
        trimmedLine.includes('reverse:')
      ) {
        changes.push({
          type: 'added',
          risk: 'safe',
          message: '✅ NEW RELATIONSHIP LINK ADDED',
          details: 'New entity relationship - existing records unaffected',
        });
      }
    }
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 128) {
      // Not a git repository or file not tracked
      console.log('ℹ️  Not in a git repository or schema not tracked');
      return [];
    }
    console.error('Error checking schema:', error);
    throw error;
  }

  return changes;
}

/**
 * Generate backup command based on environment
 */
function getBackupCommand(): string {
  const appId = process.env.INSTANT_APP_ID || process.env.VITE_INSTANTDB_APP_ID;
  if (!appId) {
    return 'Set INSTANT_APP_ID env var to enable backups';
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `INSTANT_APP_ID=${appId} yarn instant-cli export ./backups/${timestamp}.json`;
}

/**
 * Main validation function
 */
async function validateMigration(): Promise<boolean> {
  console.log('\n🔍 InstantDB Schema Safety Check\n');
  console.log('='.repeat(80));

  const changes = detectSchemaChanges();

  if (changes.length === 0) {
    console.log('\n✅ No schema changes detected - safe to proceed\n');
    return true;
  }

  // Categorize changes
  const destructive = changes.filter((c) => c.risk === 'destructive');
  const warnings = changes.filter((c) => c.risk === 'warning');
  const safe = changes.filter((c) => c.risk === 'safe');

  // Print changes by risk level
  console.log('\n📋 Schema Changes Detected:\n');

  if (safe.length > 0) {
    console.log('✅ SAFE CHANGES:');
    safe.forEach((c) => {
      console.log(`   ${c.message}`);
      if (c.details) console.log(`      ${c.details}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNING - POTENTIALLY RISKY:');
    warnings.forEach((c) => {
      console.log(`   ${c.message}`);
      if (c.details) console.log(`      ${c.details}`);
    });
    console.log('');
  }

  if (destructive.length > 0) {
    console.log('🚨 DESTRUCTIVE CHANGES - DATA LOSS RISK:');
    destructive.forEach((c) => {
      console.log(`   ${c.message}`);
      if (c.details) console.log(`      ${c.details}`);
    });
    console.log('');
  }

  console.log('='.repeat(80));

  // Risk assessment and recommendations
  if (destructive.length > 0) {
    console.log('\n🛑 DESTRUCTIVE CHANGES DETECTED\n');
    console.log('⚠️  These changes will cause permanent data loss!\n');
    console.log('Required safety steps:\n');
    console.log('  1. Backup production data:');
    console.log(`     ${getBackupCommand()}\n`);
    console.log('  2. Test in local/QA environment first:');
    console.log('     yarn run db:push-local\n');
    console.log('  3. Verify data integrity:');
    console.log('     yarn run db:verify\n');
    console.log('  4. Consider backward-compatible migration:');
    console.log('     - Add new fields as optional');
    console.log('     - Migrate data gradually');
    console.log('     - Remove old fields in separate step\n');
    console.log('  5. Manual intervention required:');
    console.log('     - Delete/rename operations must be done via InstantDB dashboard');
    console.log('     - CLI intentionally blocks destructive operations\n');

    return false;
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS DETECTED\n');
    console.log('Recommended actions:\n');
    console.log('  1. Test in QA environment: yarn run db:push-qa');
    console.log('  2. Verify existing data compatibility');
    console.log('  3. For unique constraints: check for duplicates first');
    console.log('  4. For required fields: ensure all records have values\n');
  }

  if (safe.length > 0 && warnings.length === 0 && destructive.length === 0) {
    console.log('\n✅ All changes are safe - ready to push\n');
  }

  // Summary
  console.log('Summary:');
  console.log(`  ✅ Safe: ${safe.length}`);
  console.log(`  ⚠️  Warnings: ${warnings.length}`);
  console.log(`  🚨 Destructive: ${destructive.length}\n`);

  // Exit code: fail only on destructive changes
  return destructive.length === 0;
}

// Run validation
validateMigration()
  .then((isValid) => {
    process.exit(isValid ? 0 : 1);
  })
  .catch((error) => {
    console.error('Schema validation failed:', error);
    process.exit(1);
  });
