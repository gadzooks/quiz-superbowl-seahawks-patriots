# Deployment Guide

This guide explains how to deploy the Super Bowl Prediction Game to Netlify with automatic deployments.

## Quick Start

```bash
# 1. Setup local environment
cp .env.example .env
# Edit .env and add your InstantDB App ID

# 2. Test locally
npm run dev

# 3. Deploy to Netlify (see detailed instructions below)
# - Connect GitHub repo to Netlify
# - Set INSTANTDB_APP_ID environment variable
# - Configure branch deploys
# - Done! Auto-deploys on push
```

## 🔄 Migration Note (If Already Deployed)

If you already have the app deployed with a hardcoded InstantDB ID:

1. **Set the environment variable in Netlify:**
   - Go to Site Settings → Environment variables
   - Add `INSTANTDB_APP_ID` with your current InstantDB App ID value
   - Value: `8b6d941d-edc0-4750-95ec-19660710b8d6` (or your custom ID)

2. **Update build settings in Netlify:**
   - Go to Site Settings → Build & deploy → Build settings
   - Build command: `node build.js`
   - Publish directory: `dist`
   - Save

3. **Trigger a redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - Your app will rebuild with the env var

Your existing data in InstantDB will remain unchanged.

## Environment Variables

The app uses environment variables to configure the InstantDB App ID, allowing different databases for QA and production environments.

### Required Environment Variable

- `INSTANTDB_APP_ID` - Your InstantDB application ID (get from https://instantdb.com/dash)

### Local Development

1. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your InstantDB App ID:**
   ```
   INSTANTDB_APP_ID=8b6d941d-edc0-4750-95ec-19660710b8d6
   ```

3. **Run the development server:**
   ```bash
   node dev.js
   ```
   Opens at http://localhost:8000

4. **Or manually build and serve:**
   ```bash
   # Build
   INSTANTDB_APP_ID=your-app-id node build.js

   # Serve
   cd dist && python3 -m http.server 8000
   ```

## Setup Netlify Deployment

### Option 1: Netlify Dashboard (Easiest)

1. **Sign up/Login to Netlify**
   - Go to https://netlify.com
   - Sign up with your GitHub account

2. **Connect Repository**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

3. **Configure Build Settings**
   - Build command: `node build.js`
   - Publish directory: `dist`
   - Click "Deploy site"

4. **Set Environment Variables**
   - Go to Site Settings → Environment variables
   - Add variable: `INSTANTDB_APP_ID`
   - Value: Your InstantDB App ID from https://instantdb.com/dash
   - Scopes: Select "All" or specific deploy contexts

   **For separate QA/Prod databases:**
   - Use "Deploy contexts" to set different values:
     - Production context: Use production InstantDB App ID
     - Branch deploys: Use QA/staging InstantDB App ID

5. **Configure Branch Deploys**
   - Go to Site Settings → Build & deploy → Continuous deployment
   - Under "Branch deploys", select "Let me add individual branches"
   - Add `master` for QA
   - Set `prod` as production branch

6. **Done!**
   - Push to `master` → Auto-deploys to preview URL
   - Push to `prod` → Auto-deploys to production URL

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (from project root)
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Connect to your GitHub repo
# - Build command: (leave empty)
# - Directory to deploy: . (current directory)

# Manual deploy (optional)
netlify deploy --prod
```

## Setting Up Different Databases for QA and Production

It's recommended to use separate InstantDB apps for QA and production environments.

### Option 1: Using Netlify Dashboard (Recommended)

1. Create two InstantDB apps at https://instantdb.com/dash:
   - One for QA/testing
   - One for production

2. In Netlify, go to Site Settings → Environment variables

3. Click "Add a variable" → Select "Add a single variable"

4. For **Production:**
   - Key: `INSTANTDB_APP_ID`
   - Value: Your production InstantDB App ID
   - Scopes: Select only "Production"

5. Add another variable for **Branch deploys:**
   - Key: `INSTANTDB_APP_ID`
   - Value: Your QA InstantDB App ID
   - Scopes: Select "Deploy previews" and "Branch deploys"

### Option 2: Using netlify.toml

Uncomment and edit the environment sections in `netlify.toml`:

```toml
[context.production.environment]
  INSTANTDB_APP_ID = "your-production-app-id"

[context.branch-deploy.environment]
  INSTANTDB_APP_ID = "your-qa-app-id"
```

**Note:** If you commit these to git, anyone with repo access can see them. Use Netlify dashboard for sensitive values.

## Branch Strategy

- **`master` branch** → QA environment (preview URL)
  - `your-site-name.netlify.app` or custom QA subdomain
  - Test changes here before production

- **`prod` branch** → Production environment
  - Your main production URL
  - Only merge from master after QA testing

## Workflow Example

```bash
# Work on a feature
git checkout -b feature/new-question
# ... make changes ...
git commit -m "Add new prediction question"

# Deploy to QA
git checkout master
git merge feature/new-question
git push origin master
# → Auto-deploys to QA URL

# After testing, deploy to production
git checkout prod
git merge master
git push origin prod
# → Auto-deploys to production URL
```

## Environment URLs

After setup, Netlify will provide:
- **Production**: `https://your-site-name.netlify.app`
- **Branch deploys**: `https://master--your-site-name.netlify.app`
- **Deploy previews**: For each pull request

## Custom Domain (Optional)

1. Go to Site Settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. Set up separate domains for QA and prod if desired

## Monitoring

- View deploy logs in Netlify dashboard
- Set up deploy notifications (email, Slack, etc.)
- Monitor site analytics in Netlify

## Troubleshooting

### Deploy fails
- Check the deploy log in Netlify dashboard
- Ensure `index.html` is in the root directory
- Verify `netlify.toml` syntax

### Changes not showing
- Clear browser cache
- Check which branch you pushed to
- Verify deploy completed successfully in dashboard

## Testing Locally

Before deploying, test locally:

```bash
# Recommended: Use the dev script (includes env var injection)
npm run dev
# Opens at http://localhost:8000

# Or manually with custom env var
INSTANTDB_APP_ID=your-app-id node dev.js

# Or build and serve manually
npm run build
cd dist && python3 -m http.server 8000
```

**First time setup:**
```bash
# Copy environment example
cp .env.example .env

# Edit .env and add your InstantDB App ID
# Then run
npm run dev
```

## Security Notes

- The app uses InstantDB which requires public read/write access
- Consider adding authentication if storing sensitive data
- Review the security headers in `netlify.toml`
