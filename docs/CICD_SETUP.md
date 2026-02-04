# CI/CD Setup Guide

This project uses **GitHub Actions for CI** (testing) and **Netlify for CD** (deployment + schema).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Developer pushes code to GitHub                         │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌───────────────┐  ┌──────────────┐
│ GitHub Actions│  │   Netlify    │
│   (CI Tests)  │  │ (Deployment) │
└───────────────┘  └──────────────┘
        │                 │
        ▼                 ▼
┌───────────────┐  ┌──────────────┐
│ TEST Database │  │PROD/QA DB    │
│ (for tests)   │  │(for users)   │
└───────────────┘  └──────────────┘
```

## GitHub Actions (CI Only)

**Purpose**: Validate code quality before merge
**Runs on**: Every push and pull request
**Uses**: Repository secrets (not environment-specific)

### What it does:

- ✅ Lint code
- ✅ Type check
- ✅ Run unit tests
- ✅ Run E2E tests
- ✅ Validate build
- ✅ Check for unused code

### Required GitHub Repository Secrets

**Location**: GitHub repo → Settings → Secrets and variables → Actions → Repository secrets

| Secret Name             | Value                     | Purpose                             |
| ----------------------- | ------------------------- | ----------------------------------- |
| `VITE_INSTANTDB_APP_ID` | Your TEST/QA database ID  | For running E2E tests               |
| `INSTANT_ADMIN_TOKEN`   | TEST database admin token | Optional (not currently used in CI) |

**Why TEST database?**

- Tests create/delete data
- Parallel test runs
- Don't pollute production data

### Files:

- `.github/workflows/ci.yml` - CI pipeline configuration

---

## Netlify (CD - Deployment + Schema)

**Purpose**: Deploy app and sync database schema
**Runs on**: Push to tracked branches (prod, master, feature/\*)
**Uses**: Netlify environment variables (per deploy context)

### What it does:

1. 📤 **Push schema** to InstantDB (if `INSTANT_ADMIN_TOKEN` is set)
2. 🏗️ **Build** the app (`yarn build`)
3. 🚀 **Deploy** to CDN

### Deploy Contexts

Netlify has 3 deployment contexts:

| Context            | Branch                | Database      | Schema Push       |
| ------------------ | --------------------- | ------------- | ----------------- |
| **Production**     | `prod`                | Production DB | ✅ Yes            |
| **Branch Deploy**  | `master`, `feature/*` | QA/Staging DB | ✅ Yes            |
| **Deploy Preview** | Pull Requests         | QA/Staging DB | ❌ No (read-only) |

### Required Netlify Environment Variables

**Location**: Netlify site → Site settings → Environment variables

#### For Production Context:

```
VITE_INSTANTDB_APP_ID = <production-database-id>
INSTANT_ADMIN_TOKEN = <production-admin-token>
```

#### For Branch Deploy Context:

```
VITE_INSTANTDB_APP_ID = <qa-staging-database-id>
INSTANT_ADMIN_TOKEN = <qa-staging-admin-token>
```

#### For Deploy Preview (optional):

```
VITE_INSTANTDB_APP_ID = <qa-staging-database-id>
# No admin token = no schema push (read-only previews)
```

### How to Set in Netlify:

1. Go to your site in Netlify Dashboard
2. Site settings → Environment variables
3. Add variable `VITE_INSTANTDB_APP_ID`
4. Click "Values" → "Add value for deploy context"
5. Set different values for each context:
   - Production: Your production database ID
   - Branch deploys: Your QA/staging database ID
   - Deploy previews: Your QA/staging database ID
6. Repeat for `INSTANT_ADMIN_TOKEN`

### Files:

- `netlify.toml` - Build commands and deploy configuration

---

## Summary: What Goes Where

### GitHub (Repository Secrets)

- **Purpose**: Run tests in CI
- **Database**: TEST database
- **Secrets needed**:
  - `VITE_INSTANTDB_APP_ID` (test DB)
  - `INSTANT_ADMIN_TOKEN` (optional)

### Netlify (Environment Variables per Context)

- **Purpose**: Deploy app + sync schema
- **Database**: Production or QA/Staging (depends on context)
- **Variables needed**:
  - `VITE_INSTANTDB_APP_ID` (prod or QA)
  - `INSTANT_ADMIN_TOKEN` (prod or QA)

### Local Development (.env file)

- **Purpose**: Run dev server locally
- **Database**: Local/dev database
- **Variables needed**:
  - `VITE_INSTANTDB_APP_ID` (local DB)
  - `INSTANT_ADMIN_TOKEN` (local admin token)

---

## Setup Checklist

### 1. Create InstantDB Apps (if using multiple databases)

- [ ] Production database (for live users)
- [ ] QA/Staging database (for testing)
- [ ] TEST database (for CI tests)

### 2. Configure GitHub

- [ ] Add `VITE_INSTANTDB_APP_ID` secret (TEST database)
- [ ] Optionally add `INSTANT_ADMIN_TOKEN` secret

### 3. Configure Netlify

#### Production Context:

- [ ] Set `VITE_INSTANTDB_APP_ID` to production database
- [ ] Set `INSTANT_ADMIN_TOKEN` to production admin token

#### Branch Deploy Context:

- [ ] Set `VITE_INSTANTDB_APP_ID` to QA/staging database
- [ ] Set `INSTANT_ADMIN_TOKEN` to QA/staging admin token

### 4. Test the Setup

- [ ] Push to a feature branch → CI should run, Netlify should deploy to QA
- [ ] Create a PR → CI should run, Netlify should create preview
- [ ] Merge to master → CI should run, Netlify should deploy to QA
- [ ] Merge master to prod → Netlify should deploy to production

---

## How Schema Deployment Works

When you push code to a tracked branch:

1. **Netlify build starts**
2. **Install dependencies**: `yarn install`
3. **Check for admin token**: If `INSTANT_ADMIN_TOKEN` exists...
4. **Push schema**: `yarn tsx scripts/push-schema.ts -y`
   - Reads `VITE_INSTANTDB_APP_ID` from Netlify env
   - Reads `INSTANT_ADMIN_TOKEN` from Netlify env
   - Pushes schema changes to the appropriate database
5. **Build app**: `yarn build`
6. **Deploy**: Netlify publishes to CDN

**Benefits:**

- ✅ Schema and app deploy together (atomic)
- ✅ Schema is always in sync with app code
- ✅ Uses Netlify's existing environment variables
- ✅ No duplicate configuration in GitHub
- ✅ Automatic for all tracked branches

---

## Troubleshooting

### GitHub Actions failing:

- Check that `VITE_INSTANTDB_APP_ID` secret is set
- Verify it points to a TEST database (not production)
- Check CI logs for specific error

### Netlify build failing:

- Check that environment variables are set for the deploy context
- Verify `INSTANT_ADMIN_TOKEN` is set (if schema push is enabled)
- Check Netlify build logs for schema push errors

### Schema not updating:

- Verify `INSTANT_ADMIN_TOKEN` is set in Netlify
- Check Netlify build logs - should see "Pushing schema to app..."
- Verify token has admin permissions

### Wrong database being used:

- Check which deploy context is active (production vs branch-deploy)
- Verify environment variables are set correctly for each context
- Check Netlify build logs to see which app ID is being used
