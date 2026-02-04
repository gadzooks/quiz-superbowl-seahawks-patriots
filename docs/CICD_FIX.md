# CI/CD Configuration Fix Guide

This document explains how to fix the three CI/CD issues where tests fail but code still deploys and merges.

## Issues Identified

1. ✅ **E2E Tests Failing** - Fixed (tests updated for React)
2. ⚠️ **Netlify Deploying Despite Failures** - Needs configuration
3. ⚠️ **Merge Allowed Despite Failures** - Needs branch protection

---

## Issue 1: E2E Tests Fixed ✅

The E2E tests were using old DOM IDs (`#leagueCreation`, `#teamNameEntry`) from the vanilla JS app. These have been updated to use accessibility-based selectors:

**Before** (vanilla JS):

```typescript
await page.locator('#leagueCreation').toBeVisible();
```

**After** (React):

```typescript
await page.getByRole('heading', { name: /create.*league/i }).toBeVisible();
```

This follows React Testing Library best practices and is more resilient to UI changes.

---

## Issue 2: Configure Netlify Deploy Controls

Netlify deploys on every commit by default, regardless of GitHub Actions status. Fix this:

### Option A: GitHub Status Checks (Recommended)

1. **Go to Netlify Dashboard** → Your Site → Site Settings → Build & Deploy
2. **Navigate to** Deploy Notifications → GitHub commit status
3. **Enable** "Wait for GitHub status checks before deploying"

**OR via Netlify CLI:**

```bash
netlify sites:update --context production --build-settings.wait_for_ci_checks=true
```

### Option B: Netlify Build Plugin

Add build plugins to fail deployment if checks fail:

1. Install GitHub status plugin:

```bash
npm install --save-dev netlify-plugin-github-check-status
```

2. Add to `netlify.toml`:

```toml
[[plugins]]
  package = "netlify-plugin-github-check-status"

  [plugins.inputs]
    # Wait for these GitHub checks to pass
    checks = ["test", "e2e"]
```

### Option C: Manual Deploys Only

For critical branches, disable auto-deploy:

1. Netlify Dashboard → Site Settings → Build & Deploy → Deploy contexts
2. Set production branch to "Deploy only manually"
3. Use Netlify CLI or dashboard to deploy after verifying checks

**Recommendation**: Use Option A (GitHub status checks) for the best balance of automation and safety.

---

## Issue 3: Configure GitHub Branch Protection

GitHub allows merging even when checks fail because branch protection rules aren't configured.

### Configure via GitHub UI

1. **Go to** GitHub Repository → Settings → Branches
2. **Click** "Add branch protection rule"
3. **Branch name pattern**: `master` (or `main`)
4. **Enable these settings**:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 0 (or 1 if you want code review)
   - ✅ **Require status checks to pass before merging** ← CRITICAL
   - ✅ Require branches to be up to date before merging
5. **Select required status checks**:
   - ✅ `test` (from `.github/workflows/ci.yml`)
   - ✅ `e2e` (from `.github/workflows/ci.yml`)
6. **Additional settings** (recommended):
   - ✅ Require linear history
   - ✅ Include administrators (enforces rules on admins too)
7. **Click** "Create" or "Save changes"

### Configure via GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh

# Authenticate
gh auth login

# Add branch protection rule
gh api repos/:owner/:repo/branches/master/protection \
  --method PUT \
  -H "Accept: application/vnd.github.v3+json" \
  -f required_status_checks='{"strict":true,"contexts":["test","e2e"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":0}' \
  -f restrictions=null
```

### Verify Branch Protection

After configuring, verify it works:

1. Create a test branch with failing tests
2. Open a PR to master
3. Verify:
   - ❌ "Merge" button is disabled
   - ⚠️ "Some checks were not successful" message appears
   - ✅ "Required" badge appears on status checks

---

## Workflow After Configuration

### Normal Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feature/my-feature

# 4. GitHub Actions runs automatically
#    - test job
#    - e2e job

# 5. If all checks pass ✅
#    - Open PR on GitHub
#    - Merge button enabled
#    - Netlify preview deploy ready

# 6. If checks fail ❌
#    - Fix issues locally
#    - Push fix
#    - Wait for checks to pass
#    - Then merge
```

### Production Deployment Flow

```bash
# 1. Merge PR to master (after checks pass)
#    → GitHub Actions runs on master
#    → All checks must pass

# 2. If Netlify configured to wait for checks:
#    → Netlify waits for GitHub status ✅
#    → Then deploys to production

# 3. If manual deploy configured:
#    → Verify checks passed on GitHub
#    → Manually trigger Netlify deploy
```

---

## Testing the Configuration

### Test Branch Protection

1. Create a test branch with intentionally failing test:

```bash
git checkout -b test/branch-protection
echo "test.failing('should fail', () => { expect(true).toBe(false); });" >> e2e/test.spec.ts
git add .
git commit -m "test: verify branch protection"
git push origin test/branch-protection
```

2. Open PR on GitHub
3. **Expected behavior**:
   - ❌ CI checks fail
   - ⚠️ "Some checks were not successful"
   - 🚫 Merge button disabled or shows "Merging is blocked"

4. Fix the test:

```bash
git checkout test/branch-protection
git revert HEAD
git push origin test/branch-protection
```

5. **Expected behavior**:
   - ✅ CI checks pass
   - ✅ Merge button enabled
   - 🎉 Can merge to master

### Test Netlify Deploy Controls

1. Push broken code to a branch
2. Verify Netlify preview deploy is blocked or shows warning
3. Fix code and push again
4. Verify Netlify deploys after checks pass

---

## Troubleshooting

### "Status checks never complete"

**Cause**: GitHub Actions workflow not running

**Fix**:

1. Check `.github/workflows/ci.yml` exists
2. Verify workflow triggers on your branch:
   ```yaml
   on:
     push:
       branches: [master, 'feature/**']
   ```
3. Check Actions tab on GitHub for errors

### "Netlify still deploys when checks fail"

**Cause**: Netlify not configured to wait for GitHub status

**Fix**:

1. Verify "Wait for CI checks" is enabled in Netlify settings
2. Check that GitHub app has correct permissions:
   - Netlify Dashboard → Site Settings → Build & Deploy → Deploy notifications
   - Verify GitHub integration is connected

### "Can still merge despite failing checks"

**Cause**: Branch protection not configured correctly

**Fix**:

1. Verify branch name pattern matches exactly (case-sensitive)
2. Ensure "Require status checks" is enabled
3. Confirm correct check names are selected (`test`, `e2e`)
4. Check "Include administrators" if you're a repo admin

### "E2E tests fail with timeout"

**Cause**: Tests waiting for elements that don't exist

**Fix**:

1. Run tests locally: `yarn test:e2e:headed`
2. Verify VITE_INSTANTDB_APP_ID is set in GitHub secrets
3. Check test selectors match actual DOM structure

---

## Security Best Practices

1. **Never bypass checks on production branches**
   - Resist the temptation to disable checks "just this once"
   - If truly urgent, use hotfix process with post-deployment verification

2. **Require code review for sensitive changes**
   - Enable "Require approvals: 1" for production branch
   - Add CODEOWNERS file for critical paths

3. **Use Netlify deploy previews**
   - Test changes in deploy preview before merging
   - Share preview URL for stakeholder review

4. **Monitor deployment notifications**
   - Set up Slack/email alerts for failed deployments
   - Configure Netlify → Deploy notifications

---

## Current Status

After applying these fixes:

✅ **E2E tests**: Updated to use React selectors
⚠️ **Branch protection**: Needs configuration in GitHub UI
⚠️ **Netlify controls**: Needs configuration in Netlify Dashboard

### Next Steps

1. Apply branch protection rules on GitHub (5 minutes)
2. Configure Netlify deploy controls (2 minutes)
3. Test with a failing PR to verify blocking works
4. Document team workflow for deployments

---

## References

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Netlify Deploy Controls](https://docs.netlify.com/site-deploys/manage-deploys/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
