# Database Migration Scripts

This directory contains automated safety tools for InstantDB schema migrations.

## Overview

The hybrid migration system combines:

- **InstantDB CLI built-in safety** (preview changes, type validation, blocks destructive ops)
- **Custom pre-commit checks** (catch destructive changes early in git workflow)
- **Data verification** (validate integrity after migrations)
- **Automated backups** (export data before risky operations)

## Available Scripts

### `yarn db:check`

**Schema Safety Check** - Analyzes git diff to detect destructive schema changes.

```bash
yarn db:check
```

**What it detects:**

- 🚨 **Destructive**: Removed fields/entities, incompatible type changes
- ⚠️ **Warning**: Made fields required, added unique constraints
- ✅ **Safe**: Added optional fields, new entities, new relationships

**When it runs:**

- Automatically on `git commit` if `instant.schema.ts` changed
- Manually before pushing schema
- Part of `db:push-qa` and `db:push-prod` workflows

**Exit codes:**

- `0` - Safe to proceed
- `1` - Destructive changes detected, manual intervention required

---

### `yarn db:verify`

**Data Integrity Verification** - Validates data structure after migration.

```bash
INSTANT_APP_ID=your-app-id yarn db:verify
# or
VITE_INSTANTDB_APP_ID=your-app-id yarn db:verify
```

**What it checks:**

- All required fields present
- No duplicate values in unique fields
- Valid types (numbers, booleans, dates)
- No orphaned relationships

**When to use:**

- After pushing schema changes
- Before production deployments
- After data migrations

---

### `yarn db:export`

**Database Backup** - Exports full database to JSON.

```bash
INSTANT_APP_ID=your-app-id yarn db:export
```

**Features:**

- Timestamped backups in `backups/` directory
- Automatic cleanup (keeps last 10 backups)
- Shows recent backup history

**When to use:**

- Before production schema pushes (automated in `db:push-prod`)
- Before risky migrations
- Regular backup schedule

---

### `yarn db:push-local`

**Push to Local/Dev Database** - Test schema changes safely.

```bash
INSTANT_APP_ID=your-dev-app-id yarn db:push-local
```

**Workflow:**

1. Test schema changes here first
2. Verify with `db:verify`
3. Only then push to QA/production

---

### `yarn db:push-qa`

**Push to QA Database** - Automated safety workflow.

```bash
yarn db:push-qa
```

**What it does:**

1. ✅ Runs `db:check` (blocks if destructive)
2. 📤 Pushes schema to InstantDB
3. 👀 Shows preview, requires confirmation

**Environment:**

- Uses `VITE_INSTANTDB_APP_ID` from env vars
- Netlify: branch-deploy and deploy-preview contexts

---

### `yarn db:push-prod`

**Push to Production** - Maximum safety workflow.

```bash
yarn db:push-prod
```

**What it does:**

1. ✅ Runs `db:check` (blocks if destructive)
2. 💾 Creates backup with `db:export`
3. 📤 Pushes schema to InstantDB
4. 👀 Shows preview, requires confirmation

**IMPORTANT:** Manual verification recommended:

```bash
# After pushing to production:
INSTANT_APP_ID=prod-app-id yarn db:verify
```

---

## Safe Migration Workflow

### For Non-Destructive Changes

```bash
# 1. Make schema changes
vim instant.schema.ts

# 2. Check safety locally
yarn db:check

# 3. Test in dev environment
INSTANT_APP_ID=dev-id yarn db:push-local

# 4. Verify data integrity
INSTANT_APP_ID=dev-id yarn db:verify

# 5. Commit (triggers pre-commit check)
git add instant.schema.ts
git commit -m "Add optional field to leagues entity"

# 6. Push to QA (automated by CI/CD)
git push origin feature/add-league-field

# 7. After QA testing, merge to production
```

### For Destructive Changes

```bash
# 1. db:check will catch destructive changes
yarn db:check
# Output: 🚨 DESTRUCTIVE CHANGES DETECTED

# 2. Use backward-compatible migration instead:

# STEP 1: Add new field as optional
leagues: i.entity({
  oldField: i.string(),           # Keep
  newField: i.date().optional(),  # Add new
})

# Push this change first
yarn db:push-qa
git commit -m "Step 1: Add optional newField"

# STEP 2: Migrate data (manual or script)
# Copy oldField → newField for all records

# STEP 3: Make new field required
leagues: i.entity({
  oldField: i.string(),  # Still keep
  newField: i.date(),    # Now required
})

git commit -m "Step 2: Make newField required"

# STEP 4: Remove old field (after validating)
leagues: i.entity({
  newField: i.date(),
})

git commit -m "Step 3: Remove oldField"
```

### For Field/Entity Deletion

**IMPORTANT:** InstantDB CLI intentionally blocks delete/rename operations!

```bash
yarn db:push-local
# Error: CLI doesn't support deleting attributes

# Instead: Use InstantDB dashboard Explorer
# 1. Go to instantdb.com/dash
# 2. Select your app
# 3. Navigate to Explorer
# 4. Manually delete field/entity
# 5. Update instant.schema.ts to match
```

---

## Pre-commit Hook Integration

The `.husky/pre-commit` hook automatically runs `db:check` when you commit schema changes:

```bash
git add instant.schema.ts
git commit -m "Update schema"

# Output:
# 📋 Schema changes detected, running safety check...
# ✅ SAFE CHANGES: ...
# (or)
# 🚨 DESTRUCTIVE CHANGES DETECTED
# (commit blocked)
```

**To bypass** (NOT recommended):

```bash
git commit --no-verify -m "..."
```

---

## CI/CD Integration

### Netlify Configuration

Update `netlify.toml`:

```toml
# QA environments - auto-push schema
[context.branch-deploy.build]
  command = "yarn db:push-qa && yarn build"

[context.deploy-preview.build]
  command = "yarn db:push-qa && yarn build"

# Production - manual schema push only
[context.production.build]
  command = "yarn build"

[context.production.environment]
  INSTANT_APP_ID = "prod-app-id"
```

**Required Netlify env vars:**

- `VITE_INSTANTDB_APP_ID` - for QA environments
- `INSTANT_APP_ID` - for production (if using auto-push)

### GitHub Actions (Optional)

```yaml
# .github/workflows/db-migration.yml
name: Database Migration

on:
  push:
    paths:
      - 'instant.schema.ts'

jobs:
  check-schema:
    runs-on: ubyarnu-latest
    steps:
      - uses: actions/checkout@v4
        with:
yarn       fetch-depth: 2 # Need history for diff
      - uses: actions/setup-node@v4
      - run: yarn install --frozen-lockfile
      - run: yarn db:check
```

---

## Troubleshooting

### "Schema file not yet tracked in git"

This is normal for first-time schema creation. Add to git:

```bash
git add instant.schema.ts
git commit -m "Add initial schema"
```

### "process is not defined" errors

The scripts need Node.js environment. Make sure you have:

- `@types/node` installed (✅ already in devDependencies)
- Running via `npm run` (not direct node execution)

### InstantDB CLI not found

```bash
npm install -D instant-cli
# or use with npx (no install needed)
npx instant-cli --version
```

### Backup directory getting large

Backups auto-cleanup after 10 files. To manually clean:

```bash
rm -rf backups/*
```

### Schema push fails with "attribute doesn't exist"

This means the InstantDB dashboard has different schema than your file.

**To sync:**

```bash
# Pull current schema from InstantDB
npx instant-cli pull schema

# This creates/updates instant.schema.ts
# Review changes and commit
```

---

## File Structure

```
scripts/
├── README.md           # This file
├── schema-check.ts     # Git diff parser, detects destructive changes
├── verify-data.ts      # Data integrity validation
├── export-data.ts      # Database backup utility
└── validate-build.ts   # Build asset validation (existing)

backups/                # Auto-created, gitignored
└── backup-*.json       # Timestamped exports (kept 10 most recent)
```

---

## Advanced Usage

### Export production before migration

```bash
# Export before risky migration
INSTANT_APP_ID=prod yarn db:export

# Later, if needed, restore from backup
# (manual process via InstantDB dashboard import)
```

### Check specific environment

```bash
# Verify QA database
INSTANT_APP_ID=qa-app-id yarn db:verify

# Verify production database
INSTANT_APP_ID=prod-app-id yarn db:verify
```

### Dry-run schema push

```bash
# InstantDB CLI shows preview before applying
npx instant-cli push schema instant.schema.ts
# Prompts: "OK to proceed? (y/N)"
# Press 'N' to cancel
```

---

## Safety Guarantees

### What's Protected

✅ Catch destructive changes before commit
✅ Automatic backups before production
✅ Data integrity validation
✅ Preview all changes before applying
✅ CLI blocks delete/rename operations
✅ Type validation against existing data

### What's NOT Protected

❌ Manual dashboard operations (no git tracking)
❌ Direct database manipulation
❌ Schema changes via API (bypasses CLI safety)
❌ Accidental deletion via dashboard Explorer

**Best practice:** Always use schema-as-code workflow, never manually edit schema in dashboard unless necessary.

---

## Questions?

- **InstantDB Docs:** https://www.instantdb.com/docs
- **Schema-as-Code:** https://www.instantdb.com/docs/schema
- **CLI Reference:** https://www.instantdb.com/docs/cli
