# Environment Variables Setup Guide

This guide explains how to configure environment variables across GitHub Actions and Netlify.

## Overview

We use the **same variable names** across all platforms, but with different values per environment:

| Variable                | Purpose               | Where Used                 |
| ----------------------- | --------------------- | -------------------------- |
| `VITE_INSTANTDB_APP_ID` | InstantDB app ID      | Vite build, tests, scripts |
| `INSTANT_ADMIN_TOKEN`   | InstantDB admin token | Schema push scripts        |

## GitHub Actions Setup

**Location**: Repository Settings → Secrets and variables → Actions → New repository secret

### Required Secrets

1. **VITE_INSTANTDB_APP_ID**
   - Value: Your TEST/QA database ID (not production!)
   - Used by: CI tests, E2E tests
   - Example: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

2. **INSTANT_ADMIN_TOKEN**
   - Value: Admin token for TEST/QA database
   - Used by: Optional schema deployment
   - Example: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - ⚠️ Mark as secret - never commit this!

### Why Use TEST Database for GitHub Actions?

- Tests run on every PR and might create/delete data
- You don't want to pollute your production database
- Parallel test runs won't conflict with real users

## Netlify Setup

**Location**: Site settings → Build & deploy → Environment variables

### Option 1: Single Database (Simplest)

Use the same database for all contexts:

```
VITE_INSTANTDB_APP_ID = your-production-app-id
```

### Option 2: Multi-Database (Recommended)

Use different databases per deploy context:

#### Production Context (master/main branch)

```
VITE_INSTANTDB_APP_ID = your-production-app-id
```

#### Branch Deploy & Deploy Preview

```
VITE_INSTANTDB_APP_ID = your-qa-staging-app-id
```

**How to set in Netlify:**

1. Go to Site settings → Environment variables
2. Click "Add a variable"
3. Add `VITE_INSTANTDB_APP_ID`
4. Click "Values" → "Add value for deploy context"
5. Set different values for Production vs Branch deploys

## Local Development

**Location**: `.env` file in project root

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your values
VITE_INSTANTDB_APP_ID=your-local-or-dev-app-id
INSTANT_ADMIN_TOKEN=your-admin-token
```

⚠️ `.env` is gitignored - never commit it!

## Summary Table

| Environment             | App ID        | Admin Token       | Deploy Method           |
| ----------------------- | ------------- | ----------------- | ----------------------- |
| **Local dev**           | Local/Dev DB  | Local admin token | Manual (`yarn run dev`) |
| **GitHub Actions (CI)** | TEST/QA DB    | TEST admin token  | Auto on push/PR         |
| **Netlify Preview**     | QA/Staging DB | N/A               | Auto on PR              |
| **Netlify Production**  | Production DB | N/A               | Auto on merge to master |

## Creating Multiple InstantDB Apps

If you want separate databases for TEST/QA/PROD:

1. Go to https://instantdb.com/dash
2. Click "Create new app" for each environment
3. Name them clearly:
   - `superbowl-prod`
   - `superbowl-qa`
   - `superbowl-test`
4. Copy the App IDs and Admin tokens
5. Set them in GitHub/Netlify as described above

## Security Best Practices

✅ **DO:**

- Use different databases for test vs production
- Store admin tokens in GitHub Secrets / Netlify env vars
- Keep `.env` gitignored
- Use TEST database for CI/CD tests

❌ **DON'T:**

- Commit `.env` or admin tokens to git
- Use production database for tests
- Share admin tokens in code/docs
- Hardcode app IDs in code (use env vars)

## Troubleshooting

**GitHub Actions can't find env vars:**

- Check spelling matches exactly: `VITE_INSTANTDB_APP_ID` (not `VITE_INSTANT_DB_APP_ID`)
- Verify secrets are set in repo settings
- Check the workflow YAML has `env:` block

**Netlify build fails:**

- Check env vars are set in Netlify site settings
- Verify the variable name includes `VITE_` prefix (required for Vite)
- Check deploy context is correct (Production vs Branch deploy)

**Local dev can't connect:**

- Verify `.env` file exists and has correct values
- Check `.env` is in project root (not in subdirectory)
- Restart dev server after changing `.env`
