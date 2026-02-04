# Netlify Multi-Environment Quick Reference

One-page cheat sheet for managing QA and Production databases in Netlify.

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  feature/xyz → master (QA DB) → prod (Production DB)          │
│                   ↓                   ↓                        │
│             Auto-deploy to       Auto-deploy to                │
│             QA environment       Production                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Concept:** Same variable name (`INSTANTDB_APP_ID`), different values per context.

## Quick Setup (3 Steps)

### 1. Create Two InstantDB Apps

- QA App → Copy App ID (e.g., `a1b2c3d4-...`)
- Production App → Copy App ID (e.g., `8b6d941d-...`)

### 2. Set in Netlify Dashboard

Go to: **Site configuration → Environment variables → Add a variable**

```
Variable 1:
  Key: INSTANTDB_APP_ID
  Scopes: [✓] Production
  Value: 8b6d941d-edc0-4750-95ec-19660710b8d6 (your Production ID)

Variable 2:
  Key: INSTANTDB_APP_ID (same name!)
  Scopes: [✓] Deploy previews, [✓] Branch deploys
  Value: a1b2c3d4-5678-90ab-cdef-1234567890ab (your QA ID)
```

### 3. Verify

```bash
netlify env:list
```

Done! Push to `master` (uses QA DB), push to `prod` (uses Production DB).

---

## Decision Tree: Which Method Should I Use?

```
Do you prefer command line?
│
├─ Yes → Use Netlify CLI (see "CLI Commands" below)
│
└─ No → Do you have a public repository?
       │
       ├─ Yes → Use Netlify Dashboard (see "Dashboard Setup" above)
       │
       └─ No (private repo) → Use netlify.toml OR Dashboard
```

---

## Common Commands

### Netlify CLI Setup

```bash
# One-time setup
yarn install netlify-cli -g
netlify login
netlify link
```

### Set Environment Variables

```bash
# Production context
netlify env:set INSTANTDB_APP_ID "8b6d941d-..." --context production

# QA contexts
netlify env:set INSTANTDB_APP_ID "a1b2c3d4-..." --context branch-deploy
netlify env:set INSTANTDB_APP_ID "a1b2c3d4-..." --context deploy-preview
```

### Verify Configuration

```bash
netlify env:list
node validate-netlify-env.js
```

### Local Development

```bash
# Create .env file
echo "INSTANTDB_APP_ID=a1b2c3d4-..." > .env

# Run dev server
yarn run dev
```

---

## Deploy Contexts Explained

| Context            | Triggered By                              | Environment | Database      |
| ------------------ | ----------------------------------------- | ----------- | ------------- |
| **production**     | Push to `prod` branch                     | Production  | Production DB |
| **branch-deploy**  | Push to any other branch (`master`, etc.) | QA          | QA DB         |
| **deploy-preview** | Pull request created                      | QA          | QA DB         |

**Production Branch:** Defined in `netlify.toml` (currently: `prod`)

---

## Typical Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-questions

# 2. Make changes and test locally
yarn run dev  # Uses QA DB from .env

# 3. Push to GitHub
git push origin feature/new-questions
# → Creates Deploy Preview (uses QA DB)

# 4. Merge to master
git checkout master
git merge feature/new-questions
git push origin master
# → Deploys to master--yoursite.netlify.app (uses QA DB)

# 5. Test on QA, then promote to production
git checkout prod
git merge master
git push origin prod
# → Deploys to yoursite.netlify.app (uses Production DB)
```

---

## Environment Variable Scopes

| Scope               | Purpose               | When Applied                         |
| ------------------- | --------------------- | ------------------------------------ |
| **Production**      | Live site             | Deploys from `prod` branch           |
| **Deploy previews** | PR testing            | Any pull request                     |
| **Branch deploys**  | Branch testing        | Deploys from non-production branches |
| **All**             | Same value everywhere | Avoid for INSTANTDB_APP_ID           |

⚠️ **Common Mistake:** Setting "All" scope means QA and Production share the same database!

---

## Troubleshooting at a Glance

| Problem                                     | Quick Fix                                                          |
| ------------------------------------------- | ------------------------------------------------------------------ |
| **Both environments use same DB**           | Check scopes in Netlify dashboard - Production should be separate  |
| **Build fails: "INSTANTDB_APP_ID not set"** | Run: `netlify env:set INSTANTDB_APP_ID "..." --context production` |
| **Wrong database being used**               | Verify branch name matches `netlify.toml` production branch        |
| **Local dev uses production DB**            | Create `.env` file with QA App ID                                  |
| **Can't remember which App ID is which**    | Check app names in InstantDB dashboard                             |

---

## File Locations

```
superbowl/
├── .env                          # Local dev config (git-ignored)
├── .gitignore                    # Should include .env
├── netlify.toml                  # Netlify config (branch settings)
├── build.js                      # Build script (uses INSTANTDB_APP_ID)
├── validate-netlify-env.js       # Validation helper
├── MULTI_ENV_SETUP.md           # Full setup guide
└── NETLIFY_QUICK_REF.md         # This file
```

---

## Validation Checklist

Before going live, verify:

- [ ] Two InstantDB apps created (QA and Production)
- [ ] `INSTANTDB_APP_ID` set for production context in Netlify
- [ ] `INSTANTDB_APP_ID` set for branch-deploy context in Netlify
- [ ] `INSTANTDB_APP_ID` set for deploy-preview context in Netlify
- [ ] Pushed to `master` and verified QA database used
- [ ] Pushed to `prod` and verified Production database used
- [ ] Tested creating league in QA - doesn't appear in Production
- [ ] `.env` file created for local dev (with QA App ID)
- [ ] `.env` added to `.gitignore`
- [ ] Validation script runs successfully: `node validate-netlify-env.js`

---

## Important URLs

- **Netlify Dashboard:** https://app.netlify.com
- **InstantDB Dashboard:** https://instantdb.com/dash
- **Environment Variables:** Netlify → Site configuration → Environment variables
- **Deploy Logs:** Netlify → Deploys → [Click deploy] → Deploy log

---

## Security Notes

✅ **Safe to commit:**

- `netlify.toml` with branch configuration
- `build.js` and `dev.js` scripts
- Documentation files

❌ **Never commit:**

- `.env` file (contains App IDs)
- Actual App ID values in README/docs
- Environment variables for private data

⚠️ **App IDs in netlify.toml:**

- Only if repository is private
- Otherwise use Netlify dashboard or CLI

---

## Getting More Help

- **Detailed guide:** Read `MULTI_ENV_SETUP.md`
- **Validation:** Run `node validate-netlify-env.js`
- **Netlify docs:** https://docs.netlify.com/environment-variables/overview/
- **InstantDB docs:** https://instantdb.com/docs

---

## Pro Tips

💡 **Use descriptive App names in InstantDB**

- "Superbowl QA" and "Superbowl Production"
- Makes it obvious which is which

💡 **Protect your production branch**

- Enable branch protection on `prod` in GitHub
- Require PR reviews before merging

💡 **Check deploy logs**

- Build log shows which App ID is being used
- Look for: "Using InstantDB App ID: ..."

💡 **Test in QA first**

- Always test changes on `master` before promoting to `prod`
- Share `master--yoursite.netlify.app` with QA testers

💡 **Use different test data**

- Create obviously fake leagues in QA ("TEST LEAGUE")
- Makes it clear which environment you're in

---

**Last Updated:** 2026-01-30
