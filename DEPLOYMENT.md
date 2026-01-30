# Deployment Guide

This guide explains how to deploy the Super Bowl Prediction Game to Netlify with automatic deployments.

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
   - Build command: (leave empty)
   - Publish directory: `.` (or leave as is)
   - Click "Deploy site"

4. **Configure Branch Deploys**
   - Go to Site Settings → Build & deploy → Continuous deployment
   - Under "Branch deploys", select "Let me add individual branches"
   - Add `master` for QA
   - Set `prod` as production branch

5. **Done!**
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
# Simple HTTP server
python3 -m http.server 8000
# Or
npx serve .

# Open http://localhost:8000 in browser
```

## Security Notes

- The app uses InstantDB which requires public read/write access
- Consider adding authentication if storing sensitive data
- Review the security headers in `netlify.toml`
