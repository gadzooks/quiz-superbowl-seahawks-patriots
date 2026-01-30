# Environment Variables Setup Summary

This document summarizes the changes made to support environment variables for InstantDB configuration.

## What Changed

### Files Modified
- **`index.html`** - InstantDB App ID now uses placeholder `__INSTANTDB_APP_ID__` instead of hardcoded value
- **`netlify.toml`** - Updated to use `node build.js` as build command and publish from `dist/` directory

### Files Added
- **`build.js`** - Build script that replaces placeholders with environment variables
- **`dev.js`** - Local development server with env var support
- **`.env.example`** - Template for local environment variables
- **`.gitignore`** - Prevents committing build artifacts and secrets
- **`package.json`** - NPM scripts for easy development
- **`ENV_VARS_SETUP.md`** - This file

## How It Works

### Build Time
1. Netlify reads `INSTANTDB_APP_ID` from environment variables
2. Runs `node build.js` which:
   - Reads `index.html`
   - Replaces `__INSTANTDB_APP_ID__` with the actual App ID from env var
   - Writes the result to `dist/index.html`
3. Netlify deploys the `dist/` folder

### Local Development
1. Create `.env` file with your InstantDB App ID
2. Run `npm run dev`
3. Dev script:
   - Loads env vars from `.env`
   - Builds the app with env vars injected
   - Starts a local server at http://localhost:8000

## Benefits

✅ **Security** - No hardcoded credentials in source code
✅ **Multi-environment** - Use different databases for QA vs Production
✅ **Flexibility** - Easy to change App ID without editing code
✅ **Best Practice** - Follows 12-factor app methodology

## Usage

### For Local Development
```bash
# First time setup
cp .env.example .env
# Edit .env and add: INSTANTDB_APP_ID=your-app-id

# Run dev server
npm run dev
# Opens at http://localhost:8000
```

### For Netlify Deployment
1. Go to Site Settings → Environment variables
2. Add variable:
   - Key: `INSTANTDB_APP_ID`
   - Value: Your InstantDB App ID
   - Scopes: Select appropriate deploy contexts

3. Update build settings:
   - Build command: `node build.js`
   - Publish directory: `dist`

4. Deploy! Environment variables will be injected automatically.

### For Different Environments
Set different `INSTANTDB_APP_ID` values for different deploy contexts:

- **Production** (prod branch) → Production InstantDB App
- **Branch Deploys** (master branch) → QA/Staging InstantDB App

This way you can test changes in QA without affecting production data.

## Troubleshooting

### "INSTANTDB_APP_ID environment variable is not set"
- **Local:** Make sure you created `.env` file with the App ID
- **Netlify:** Check Site Settings → Environment variables to ensure it's set

### "App not working after deployment"
- Check Netlify deploy logs for build errors
- Verify `INSTANTDB_APP_ID` is set correctly in Netlify
- Ensure build command is `node build.js` and publish dir is `dist`

### "Changes not showing"
- Clear browser cache
- Check that you pushed to the correct branch
- Verify deploy completed successfully in Netlify dashboard

## Reverting to Hardcoded (Not Recommended)

If you need to revert to a hardcoded App ID:

1. In `index.html`, change:
   ```javascript
   const APP_ID = '__INSTANTDB_APP_ID__';
   ```
   to:
   ```javascript
   const APP_ID = 'your-actual-app-id';
   ```

2. In `netlify.toml`, change:
   ```toml
   command = "node build.js"
   publish = "dist"
   ```
   to:
   ```toml
   command = ""
   publish = "."
   ```

3. Redeploy

But we recommend keeping the environment variable approach for better security and flexibility!
