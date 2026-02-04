# Multi-Environment Database Migration Workflow

Quick reference for working with LOCAL → DEV → QA → PROD databases.

## Setup

### 1. Configure `.env` File

```bash
# Copy example and fill in your app IDs
cp .env.example .env

# Edit .env with your actual InstantDB app IDs
vim .env
```

**Minimal setup** (app and migrations use same database):

```bash
# Required - your Vite app uses this
VITE_INSTANTDB_APP_ID=00000000-0000-0000-0000-000000000000
```

**Multi-environment setup** (optional - for targeting different databases):

```bash
# Required - your Vite app uses this
VITE_INSTANTDB_APP_ID=00000000-0000-0000-0000-000000000000

# Optional - uncomment to enable explicit targeting
# INSTANT_APP_ID_DEV=11111111-1111-1111-1111-111111111111
# INSTANT_APP_ID_QA=22222222-2222-2222-2222-222222222222
# INSTANT_APP_ID_PROD=33333333-3333-3333-3333-333333333333
```

**Note:** Migration scripts will use `VITE_INSTANTDB_APP_ID` if `INSTANT_APP_ID` is not set.

## Testing Locally (Recommended Workflow)

### Step 1: Make Schema Changes

```bash
# Edit instant.schema.ts
vim instant.schema.ts
```

### Step 2: Check for Safety Issues

```bash
yarn db:check

# Output shows:
# ✅ SAFE: Added optional field
# ⚠️  WARNING: Made field required
# 🚨 DESTRUCTIVE: Removed field
```

### Step 3: Push to LOCAL Database

```bash
# Uses INSTANT_APP_ID from .env (your LOCAL database)
yarn db:push

# Or with safety check first:
yarn db:push-safe
```

### Step 4: Verify Data Integrity

```bash
yarn db:verify

# Checks:
# ✅ All required fields present
# ✅ Valid data types
# ✅ Unique constraints satisfied
```

### Step 5: Test Your App

```bash
# Uses VITE_INSTANTDB_APP_ID (should also be LOCAL)
yarn dev
```

## Testing Against Other Environments

### Push to DEV

```bash
# Set environment variable for this command only
INSTANT_APP_ID=$INSTANT_APP_ID_DEV yarn db:push-safe
```

### Push to QA

```bash
INSTANT_APP_ID=$INSTANT_APP_ID_QA yarn db:push-safe
```

### Push to PRODUCTION (with extra safety)

```bash
# Creates backup before pushing
INSTANT_APP_ID=$INSTANT_APP_ID_PROD yarn db:push-prod-safe
```

## Using the Environment Helper (Optional)

For convenience, use the shell helper to switch environments:

```bash
# Set environment for session
source scripts/db-env.sh local   # Default
source scripts/db-env.sh dev
source scripts/db-env.sh qa
source scripts/db-env.sh prod    # ⚠️  Careful!

# Then run commands normally
yarn db:push
yarn db:verify
yarn db:export
```

## Environment-Specific Operations

### Export Backups

```bash
# Export LOCAL
yarn db:export

# Export PROD before migration
INSTANT_APP_ID=$INSTANT_APP_ID_PROD yarn db:export
```

Backups saved to `backups/backup-YYYY-MM-DDTHH-MM-SS.json`

### Verify Data Integrity

```bash
# Verify LOCAL
yarn db:verify

# Verify PROD after migration
INSTANT_APP_ID=$INSTANT_APP_ID_PROD yarn db:verify
```

### Check Schema Changes

```bash
# Works against any environment (checks git diff, not database)
yarn db:check
```

## Complete Migration Workflow

### For Non-Destructive Changes

```bash
# 1. LOCAL: Make changes
vim instant.schema.ts

# 2. LOCAL: Check safety
yarn run db:check

# 3. LOCAL: Test migration
yarn run db:push-safe

# 4. LOCAL: Verify data
yarn run db:verify

# 5. LOCAL: Test app
yarn run dev

# 6. Commit (triggers pre-commit hook)
git add instant.schema.ts
git commit -m "Add optional analytics field"

# 7. DEV: Push to test with team
INSTANT_APP_ID=$INSTANT_APP_ID_DEV yarn run db:push-safe

# 8. QA: Push to staging
INSTANT_APP_ID=$INSTANT_APP_ID_QA yarn run db:push-safe

# 9. PROD: Push to production (creates backup first)
INSTANT_APP_ID=$INSTANT_APP_ID_PROD yarn run db:push-prod-safe

# 10. PROD: Verify
INSTANT_APP_ID=$INSTANT_APP_ID_PROD yarn run db:verify
```

### For Destructive Changes

**DO NOT** push destructive changes directly. Use backward-compatible migration:

```bash
# STEP 1: Add new optional field
leagues: i.entity({
  oldField: i.string(),           # Keep
  newField: i.date().optional(),  # Add
})

# Push to all environments
yarn run db:push-safe  # LOCAL
INSTANT_APP_ID=$INSTANT_APP_ID_DEV yarn run db:push-safe
# ... etc

# STEP 2: Migrate data (manual or script)
# Write script to copy oldField → newField

# STEP 3: Make new field required
leagues: i.entity({
  oldField: i.string(),  # Keep
  newField: i.date(),    # Required
})

# Push to all environments again
# ... verify everything works

# STEP 4: Remove old field
leagues: i.entity({
  newField: i.date(),
})

# Final push
```

## Quick Command Reference

| Task                    | Command                                                      |
| ----------------------- | ------------------------------------------------------------ |
| **Check schema safety** | `yarn db:check`                                              |
| **Push to LOCAL**       | `yarn db:push-safe`                                          |
| **Push to DEV**         | `INSTANT_APP_ID=$INSTANT_APP_ID_DEV yarn db:push-safe`       |
| **Push to QA**          | `INSTANT_APP_ID=$INSTANT_APP_ID_QA yarn db:push-safe`        |
| **Push to PROD**        | `INSTANT_APP_ID=$INSTANT_APP_ID_PROD yarn db:push-prod-safe` |
| **Verify data**         | `yarn db:verify`                                             |
| **Create backup**       | `yarn db:export`                                             |
| **Test app locally**    | `yarn dev`                                                   |

## Safety Features

✅ **Pre-commit hook** - Blocks destructive schema commits
✅ **Safety checker** - Detects breaking changes before push
✅ **Automatic backups** - Before production pushes
✅ **Data verification** - Validates integrity after migrations
✅ **Preview before apply** - InstantDB CLI shows changes first

## Troubleshooting

### "Which database am I affecting?"

```bash
# Check current INSTANT_APP_ID
echo $INSTANT_APP_ID

# If empty, scripts will use VITE_INSTANTDB_APP_ID
echo $VITE_INSTANTDB_APP_ID
```

### "I accidentally pushed to wrong environment"

```bash
# 1. Don't panic - backups are in backups/ directory
ls -lh backups/

# 2. For production, restore from backup via InstantDB dashboard
# 3. Re-push correct schema to affected environment
```

### "Schema push failed"

```bash
# Pull current schema from database to sync
npx instant-cli pull schema

# Review differences
git diff instant.schema.ts

# Commit synced version or fix conflicts
```

## CI/CD Integration

For automated deployments, Netlify uses environment-specific variables:

- **Production branch**: `INSTANT_APP_ID_PROD`
- **QA branches**: `INSTANT_APP_ID_QA`
- **Feature branches**: `INSTANT_APP_ID_DEV`

See `scripts/README.md` for CI/CD configuration examples.
