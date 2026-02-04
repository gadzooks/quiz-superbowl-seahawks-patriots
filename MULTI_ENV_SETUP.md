# Multi-Environment Setup Guide: QA and Production Databases

This guide walks you through setting up separate InstantDB databases for QA (testing) and Production environments in Netlify.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding Deploy Contexts](#understanding-deploy-contexts)
3. [Method 1: Netlify Dashboard (Recommended)](#method-1-netlify-dashboard-recommended)
4. [Method 2: Netlify CLI](#method-2-netlify-cli)
5. [Method 3: netlify.toml Configuration](#method-3-netlifytoml-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, you need:

1. **Two InstantDB Applications**
   - Go to [InstantDB Dashboard](https://instantdb.com/dash)
   - Create two separate apps:
     - One named "Superbowl QA" (for testing)
     - One named "Superbowl Production" (for live users)
   - Copy both App IDs - they look like: `8b6d941d-edc0-4750-95ec-19660710b8d6`

2. **Netlify Site Connected**
   - Your repository should already be connected to Netlify
   - You should have access to the Netlify dashboard for your site

3. **Branch Strategy** (recommended)
   - `master` branch → QA environment
   - `prod` branch → Production environment

## Understanding Deploy Contexts

Netlify has three types of deploy contexts that determine which environment your site is being deployed to:

| Context            | Triggered By                                | Use Case                 | Which DB?     |
| ------------------ | ------------------------------------------- | ------------------------ | ------------- |
| **Production**     | Pushes to your production branch (`prod`)   | Live site for real users | Production DB |
| **Branch Deploy**  | Pushes to any other branch (`master`, etc.) | Testing and QA           | QA DB         |
| **Deploy Preview** | Pull requests                               | Code review              | QA DB         |

The key insight: **You can set the SAME environment variable name (`INSTANTDB_APP_ID`) with DIFFERENT values for each context.**

## Method 1: Netlify Dashboard (Recommended)

This is the easiest method for most users.

### Step-by-Step Instructions

1. **Open Netlify Dashboard**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Click on your site (e.g., "superbowl-predictions")

2. **Navigate to Environment Variables**
   - Click "Site configuration" in the left sidebar
   - Click "Environment variables"
   - Click "Add a variable" button (top right)

3. **Add Production Database Variable**
   - **Key:** `INSTANTDB_APP_ID`
   - **Values:** Click "Select a scope"
   - **Scopes to select:**
     - ☑ Production (only this one)
   - **Value:** Paste your Production InstantDB App ID
   - Click "Create variable"

4. **Add QA Database Variable**
   - Click "Add a variable" button again
   - **Key:** `INSTANTDB_APP_ID` (same name!)
   - **Values:** Click "Select a scope"
   - **Scopes to select:**
     - ☑ Deploy previews
     - ☑ Branch deploys
   - **Value:** Paste your QA InstantDB App ID
   - Click "Create variable"

5. **Verify Configuration**
   - You should now see `INSTANTDB_APP_ID` listed once
   - Click the dropdown next to it to see:
     - Production: `8b6d941d-...` (your prod ID)
     - Deploy previews: `a1b2c3d4-...` (your QA ID)
     - Branch deploys: `a1b2c3d4-...` (your QA ID)

### Visual Reference

```
Environment Variables Page
┌─────────────────────────────────────────────────┐
│ Add a variable                              [+] │
├─────────────────────────────────────────────────┤
│ INSTANTDB_APP_ID                          [▼]   │
│ ├─ Production: 8b6d941d-edc0-4750-95ec-...     │
│ ├─ Deploy previews: a1b2c3d4-5678-90ab-...     │
│ └─ Branch deploys: a1b2c3d4-5678-90ab-...      │
└─────────────────────────────────────────────────┘
```

### Common Mistakes to Avoid

❌ **WRONG:** Creating two different variable names

```
INSTANTDB_APP_ID_PROD = 8b6d941d...
INSTANTDB_APP_ID_QA = a1b2c3d4...
```

The build script looks for `INSTANTDB_APP_ID` specifically.

❌ **WRONG:** Setting the same value for all contexts

```
INSTANTDB_APP_ID (all contexts) = 8b6d941d...
```

Your QA and Production will share the same database.

✅ **CORRECT:** Same variable name, different values per context

```
INSTANTDB_APP_ID (production) = 8b6d941d...
INSTANTDB_APP_ID (other contexts) = a1b2c3d4...
```

## Method 2: Netlify CLI

If you prefer command-line tools:

### Installation

```bash
yarn install netlify-cli -g
netlify login
netlify link  # Link to your site
```

### Set Production Database

```bash
netlify env:set INSTANTDB_APP_ID "8b6d941d-edc0-4750-95ec-19660710b8d6" \
  --context production
```

### Set QA Database (for all non-production contexts)

```bash
netlify env:set INSTANTDB_APP_ID "a1b2c3d4-5678-90ab-cdef-1234567890ab" \
  --context deploy-preview

netlify env:set INSTANTDB_APP_ID "a1b2c3d4-5678-90ab-cdef-1234567890ab" \
  --context branch-deploy
```

### Verify

```bash
netlify env:list
```

You should see:

```
INSTANTDB_APP_ID
├─ production: 8b6d941d-edc0-4750-95ec-19660710b8d6
├─ deploy-preview: a1b2c3d4-5678-90ab-cdef-1234567890ab
└─ branch-deploy: a1b2c3d4-5678-90ab-cdef-1234567890ab
```

## Method 3: netlify.toml Configuration

⚠️ **Warning:** This method stores App IDs in your repository. Only use this if your repository is private.

Add to `netlify.toml`:

```toml
# Production context (prod branch)
[context.production.environment]
  INSTANTDB_APP_ID = "8b6d941d-edc0-4750-95ec-19660710b8d6"

# All other contexts (master, feature branches, PRs)
[context.deploy-preview.environment]
  INSTANTDB_APP_ID = "a1b2c3d4-5678-90ab-cdef-1234567890ab"

[context.branch-deploy.environment]
  INSTANTDB_APP_ID = "a1b2c3d4-5678-90ab-cdef-1234567890ab"
```

**Security Note:** If your repo is public, use Method 1 or 2 instead. App IDs in `netlify.toml` will be visible to anyone who can see your repository.

## Verification

After configuration, verify your setup works:

### 1. Run Validation Script

```bash
node validate-netlify-env.js
```

This checks if environment variables are properly configured.

### 2. Test QA Deployment

```bash
# Make a small change
echo "<!-- QA test -->" >> index.html

# Commit and push to master
git add index.html
git commit -m "Test QA environment"
git push origin master
```

**Expected behavior:**

- Netlify deploys from `master` branch
- Build log shows: "Using InstantDB App ID: a1b2c3d4..."
- The deployed site connects to your QA database
- Check InstantDB dashboard - you should see activity in the QA app

### 3. Test Production Deployment

```bash
# Merge master to prod
git checkout prod
git merge master
git push origin prod
```

**Expected behavior:**

- Netlify deploys from `prod` branch
- Build log shows: "Using InstantDB App ID: 8b6d941d..."
- The deployed site connects to your Production database
- Check InstantDB dashboard - you should see activity in the Production app

### 4. Verify Data Isolation

1. Open your QA site (e.g., `https://master--your-site.netlify.app`)
2. Create a test league called "QA Test League"
3. Open your Production site (e.g., `https://your-site.netlify.app`)
4. Verify "QA Test League" does NOT appear
5. Check both InstantDB dashboards - data should be separate

## Troubleshooting

### Problem: Both environments use the same database

**Symptoms:**

- Creating a league in QA shows up in Production
- Both sites show the same data

**Solution:**

- Verify environment variables are scoped correctly in Netlify dashboard
- Check build logs to see which App ID is being used
- Make sure you followed the context scoping in Method 1 step 3-4

**Debug command:**

```bash
# Check what Netlify sees
netlify env:list
```

### Problem: Build fails with "INSTANTDB_APP_ID not set"

**Symptoms:**

- Build log shows: `Error: INSTANTDB_APP_ID environment variable not set`
- Deploy fails

**Solution:**

1. Verify environment variable is set in Netlify dashboard
2. Check variable name is exactly `INSTANTDB_APP_ID` (case-sensitive)
3. Verify the context you're deploying to has the variable set
4. Try Method 2 (CLI) as an alternative

**Debug steps:**

```bash
# Re-set the variable
netlify env:set INSTANTDB_APP_ID "your-app-id" --context production
netlify env:set INSTANTDB_APP_ID "your-app-id" --context branch-deploy

# Trigger a new deploy
git commit --allow-empty -m "Trigger rebuild"
git push
```

### Problem: Wrong database is being used

**Symptoms:**

- Production site connects to QA database
- Or vice versa

**Solution:**

1. Check which branch triggered the deploy
   - Go to Netlify dashboard → Deploys
   - Look at "Branch" column
2. Verify branch is correctly configured
   - Production branch should be `prod` (check `netlify.toml`)
   - If using a different branch name, update `netlify.toml`:

     ```toml
     [build]
       publish = "dist"
       command = "node build.js"

     [context.production]
       branch = "main"  # Change this to your production branch
     ```

3. Check environment variable scoping matches your branch strategy

### Problem: App ID appears in built HTML file

**Symptoms:**

- View source of deployed site
- See App ID hardcoded in the JavaScript

**Explanation:**
This is expected and correct behavior. The `build.js` script replaces the placeholder with the actual App ID during build time. The App ID needs to be in the client-side JavaScript for InstantDB to work.

**Security note:**
InstantDB App IDs are designed to be public. Access control is managed through InstantDB's permission system, not by hiding the App ID.

### Problem: Local development uses production database

**Symptoms:**

- Running `yarn run dev` connects to production database

**Solution:**
Create a `.env` file (git-ignored) for local development:

```bash
# .env
INSTANTDB_APP_ID=a1b2c3d4-5678-90ab-cdef-1234567890ab
```

Then run:

```bash
yarn run dev
```

The `dev.js` script will use the App ID from `.env`.

### Problem: Can't remember which App ID is which

**Solution:**

1. Open [InstantDB Dashboard](https://instantdb.com/dash)
2. Your apps should be named:
   - "Superbowl QA" → QA App ID
   - "Superbowl Production" → Production App ID
3. Check the "Data" tab in each app
   - QA should have test data
   - Production should have real user data

## Branch Strategy Best Practices

### Recommended Workflow

```
feature/new-questions
    ↓ (PR)
master (QA DB) ← Test here first
    ↓ (PR after QA approval)
prod (Production DB) ← Deploy to users
```

### Deployment Flow

1. **Develop on feature branches**

   ```bash
   git checkout -b feature/new-questions
   # Make changes
   git commit -am "Add new questions"
   git push origin feature/new-questions
   ```

   - Creates a Deploy Preview with QA database
   - Safe to test without affecting QA

2. **Merge to master for QA testing**

   ```bash
   # After PR approval
   git checkout master
   git merge feature/new-questions
   git push origin master
   ```

   - Deploys to `master--your-site.netlify.app`
   - Uses QA database
   - Share this URL with QA testers

3. **Promote to production**

   ```bash
   # After QA sign-off
   git checkout prod
   git merge master
   git push origin prod
   ```

   - Deploys to `your-site.netlify.app`
   - Uses Production database
   - Live for real users

### Protecting Your Production Branch

Configure branch protection in GitHub/GitLab:

1. Go to repository settings
2. Add branch protection rule for `prod`
3. Enable:
   - ☑ Require pull request reviews before merging
   - ☑ Require status checks to pass before merging
   - ☑ Do not allow bypassing the above settings

This prevents accidental direct pushes to production.

## Summary Checklist

Use this checklist to verify your setup:

- [ ] Created two InstantDB apps (QA and Production)
- [ ] Copied both App IDs
- [ ] Set `INSTANTDB_APP_ID` in Netlify for production context
- [ ] Set `INSTANTDB_APP_ID` in Netlify for branch-deploy context
- [ ] Set `INSTANTDB_APP_ID` in Netlify for deploy-preview context
- [ ] Verified environment variables in Netlify dashboard
- [ ] Pushed to `master` and verified QA database is used
- [ ] Pushed to `prod` and verified Production database is used
- [ ] Tested data isolation between environments
- [ ] Created `.env` file for local development (with QA App ID)
- [ ] Added `.env` to `.gitignore`
- [ ] Documented App IDs in your password manager or secure notes

## Need Help?

If you're still stuck:

1. Run the validation script: `node validate-netlify-env.js`
2. Check Netlify build logs for which App ID is being used
3. Verify both InstantDB apps exist and are accessible
4. Review the troubleshooting section above
5. Check that your branch names match `netlify.toml` configuration

## Additional Resources

- [Netlify Deploy Contexts Documentation](https://docs.netlify.com/site-deploys/overview/#deploy-contexts)
- [Netlify Environment Variables Guide](https://docs.netlify.com/environment-variables/overview/)
- [InstantDB Documentation](https://instantdb.com/docs)
- [Project DEPLOYMENT.md](./DEPLOYMENT.md) - Original deployment guide
