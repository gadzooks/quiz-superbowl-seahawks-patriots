/* global process */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface SchemaChange {
  type: 'added' | 'removed' | 'modified';
  entity?: string;
  field?: string;
  risk: 'safe' | 'warning' | 'destructive';
  message: string;
  details?: string;
}

interface DiffLine {
  type: 'context' | 'add' | 'remove';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

interface FieldInfo {
  fieldName: string;
  fieldType: string;
  isOptional: boolean;
  isUnique: boolean;
  isEntityOpen: boolean;
}

/**
 * Read a file's content at a given git ref (e.g. 'HEAD'). Returns an empty
 * array if the file doesn't exist at that ref.
 */
function getFileContentAtRef(ref: string, path: string): string[] {
  try {
    const content = execSync(`git show ${ref}:${path}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return content.split('\n');
  } catch {
    return [];
  }
}

/**
 * Build a line-number -> enclosing entity name map by tracking brace depth.
 * Index i in the result corresponds to line i+1 (1-indexed, matching diff
 * line numbers). This lets us attribute a diff line to its entity even when
 * the entity's opening line falls outside the diff's visible context window.
 */
function computeEntityMap(lines: string[]): string[] {
  const map: string[] = [];
  let currentEntity = '';
  let entityDepth = -1;
  let depth = 0;

  for (const line of lines) {
    const openMatch = line.match(/(\w+):\s*i\.entity\(\{/);
    if (openMatch && !currentEntity) {
      currentEntity = openMatch[1];
      entityDepth = depth;
    }

    map.push(currentEntity);

    for (const ch of line) {
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (currentEntity && depth === entityDepth) {
          currentEntity = '';
          entityDepth = -1;
        }
      }
    }
  }

  return map;
}

/**
 * Parse a unified diff into a flat list of context/add/remove lines, each
 * tagged with its line number in the old and/or new file.
 */
function parseDiffLines(diff: string): DiffLine[] {
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of diff.split('\n')) {
    const hunkMatch = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      oldLine = parseInt(hunkMatch[1], 10);
      newLine = parseInt(hunkMatch[2], 10);
      continue;
    }

    if (
      raw.startsWith('+++') ||
      raw.startsWith('---') ||
      raw.startsWith('diff ') ||
      raw.startsWith('index ') ||
      raw.startsWith('\\')
    ) {
      continue;
    }

    if (raw.startsWith('+')) {
      result.push({ type: 'add', content: raw.slice(1), newLineNum: newLine });
      newLine++;
    } else if (raw.startsWith('-')) {
      result.push({ type: 'remove', content: raw.slice(1), oldLineNum: oldLine });
      oldLine++;
    } else if (raw.startsWith(' ')) {
      result.push({
        type: 'context',
        content: raw.slice(1),
        oldLineNum: oldLine,
        newLineNum: newLine,
      });
      oldLine++;
      newLine++;
    }
  }

  return result;
}

/**
 * Parse a single schema line for field info: name, type, optional/unique
 * flags. Returns null for lines that aren't a field or entity declaration.
 */
function parseFieldInfo(content: string): FieldInfo | null {
  const trimmed = content.trim();

  if (trimmed.includes('i.entity({')) {
    const match = trimmed.match(/(\w+):\s*i\.entity/);
    if (match) {
      return {
        fieldName: match[1],
        fieldType: 'entity',
        isOptional: false,
        isUnique: false,
        isEntityOpen: true,
      };
    }
  }

  const match = trimmed.match(/(\w+):\s*i\.(\w+)\(/);
  if (!match) return null;

  return {
    fieldName: match[1],
    fieldType: match[2],
    isOptional: trimmed.includes('.optional()'),
    isUnique: trimmed.includes('.unique()'),
    isEntityOpen: false,
  };
}

/**
 * Process one contiguous block of removed lines followed by added lines
 * (git's standard grouping for a multi-line edit). Fields are paired by
 * name within the block rather than by line adjacency, so changing two
 * adjacent fields in the same edit doesn't misreport a modification as a
 * removal.
 */
function processChangeBlock(
  removed: DiffLine[],
  added: DiffLine[],
  oldEntityMap: string[],
  newEntityMap: string[],
  changes: SchemaChange[]
): void {
  const addedByField = new Map<string, DiffLine>();
  for (const a of added) {
    const info = parseFieldInfo(a.content);
    if (info && !info.isEntityOpen) addedByField.set(info.fieldName, a);
  }

  const removedFieldNames = new Set<string>();

  for (const r of removed) {
    const info = parseFieldInfo(r.content);
    if (!info) continue;

    const entity = oldEntityMap[(r.oldLineNum ?? 1) - 1] || '';

    if (info.isEntityOpen) {
      changes.push({
        type: 'removed',
        entity: info.fieldName,
        risk: 'destructive',
        message: `🚨 ENTITY REMOVED: "${info.fieldName}"`,
        details: 'ALL RECORDS IN THIS ENTITY WILL BE PERMANENTLY DELETED',
      });
      continue;
    }

    removedFieldNames.add(info.fieldName);
    const matchAdded = addedByField.get(info.fieldName);

    if (!matchAdded) {
      changes.push({
        type: 'removed',
        entity,
        field: info.fieldName,
        risk: 'destructive',
        message: `⛔ FIELD REMOVED: "${entity}.${info.fieldName}"`,
        details: `ALL DATA IN THIS FIELD WILL BE PERMANENTLY DELETED (was type: ${info.fieldType})`,
      });
      continue;
    }

    // Field survived as a modification - compare old vs new details
    const newInfo = parseFieldInfo(matchAdded.content);
    if (!newInfo) continue;

    if (newInfo.fieldType !== info.fieldType) {
      changes.push({
        type: 'modified',
        entity,
        field: info.fieldName,
        risk: 'destructive',
        message: `⚠️  TYPE CHANGED: "${entity}.${info.fieldName}"`,
        details: `${info.fieldType} → ${newInfo.fieldType} (May cause data loss if incompatible)`,
      });
    }

    if (info.isOptional && !newInfo.isOptional) {
      changes.push({
        type: 'modified',
        entity,
        field: info.fieldName,
        risk: 'warning',
        message: `⚠️  MADE REQUIRED: "${entity}.${info.fieldName}"`,
        details:
          'Field is no longer optional - existing records without this field may fail validation',
      });
    } else if (!info.isOptional && newInfo.isOptional) {
      changes.push({
        type: 'modified',
        entity,
        field: info.fieldName,
        risk: 'safe',
        message: `✅ FIELD LOOSENED TO OPTIONAL: "${entity}.${info.fieldName}"`,
        details: 'Existing records without this field remain valid',
      });
    }

    if (!info.isUnique && newInfo.isUnique) {
      changes.push({
        type: 'modified',
        entity,
        field: info.fieldName,
        risk: 'warning',
        message: `⚠️  UNIQUE CONSTRAINT ADDED: "${entity}.${info.fieldName}"`,
        details: 'Existing duplicate values will cause migration to fail',
      });
    }
  }

  for (const a of added) {
    const info = parseFieldInfo(a.content);
    if (!info) continue;

    const entity = newEntityMap[(a.newLineNum ?? 1) - 1] || '';

    if (info.isEntityOpen) {
      changes.push({
        type: 'added',
        entity: info.fieldName,
        risk: 'safe',
        message: `✅ NEW ENTITY ADDED: "${info.fieldName}"`,
        details: 'New entity created - no impact on existing data',
      });
      continue;
    }

    if (removedFieldNames.has(info.fieldName)) continue; // handled as a modification above

    if (info.isOptional) {
      changes.push({
        type: 'added',
        entity,
        field: info.fieldName,
        risk: 'safe',
        message: `✅ ADDED OPTIONAL FIELD: "${entity}.${info.fieldName}"`,
        details: `New optional ${info.fieldType} field - existing records unaffected`,
      });
    } else {
      changes.push({
        type: 'added',
        entity,
        field: info.fieldName,
        risk: 'warning',
        message: `⚠️  ADDED REQUIRED FIELD: "${entity}.${info.fieldName}"`,
        details: `New required ${info.fieldType} field - existing records may fail validation unless backfilled`,
      });
    }
  }

  // Links are multi-line (forward/reverse on separate lines), so check the
  // whole added block's text rather than a single line.
  const addedText = added.map((a) => a.content).join('\n');
  if (addedText.includes('forward:') && addedText.includes('reverse:')) {
    changes.push({
      type: 'added',
      risk: 'safe',
      message: '✅ NEW RELATIONSHIP LINK ADDED',
      details: 'New entity relationship - existing records unaffected',
    });
  }
}

/**
 * Parse git diff for InstantDB schema changes.
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

    const oldLines = getFileContentAtRef('HEAD', 'instant.schema.ts');
    const newLines = readFileSync('instant.schema.ts', 'utf8').split('\n');
    const oldEntityMap = computeEntityMap(oldLines);
    const newEntityMap = computeEntityMap(newLines);

    const diffLines = parseDiffLines(diff);

    // Walk the diff, grouping each contiguous run of removed lines followed
    // by added lines into one block (git's standard shape for an edit), so
    // fields can be paired by name rather than by line adjacency.
    let i = 0;
    while (i < diffLines.length) {
      if (diffLines[i].type === 'context') {
        i++;
        continue;
      }

      const removed: DiffLine[] = [];
      const added: DiffLine[] = [];

      while (i < diffLines.length && diffLines[i].type === 'remove') {
        removed.push(diffLines[i]);
        i++;
      }
      while (i < diffLines.length && diffLines[i].type === 'add') {
        added.push(diffLines[i]);
        i++;
      }

      processChangeBlock(removed, added, oldEntityMap, newEntityMap, changes);
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
