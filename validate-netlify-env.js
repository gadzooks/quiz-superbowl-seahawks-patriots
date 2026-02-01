#!/usr/bin/env node

/**
 * Netlify Environment Validation Script
 *
 * This script helps verify that your InstantDB App ID environment variables
 * are correctly configured for multi-environment deployments (QA vs Production).
 *
 * Usage:
 *   node validate-netlify-env.js
 *
 * Or run during Netlify build (add to build command):
 *   node validate-netlify-env.js && node build.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

function checkmark() {
  return '✓';
}

function crossmark() {
  return '✗';
}

// Validate UUID format (InstantDB App IDs are UUIDs)
function isValidAppId(appId) {
  if (!appId) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(appId);
}

// Get environment variable from process.env or .env file
function getEnvVar(name) {
  // First check process.env
  if (process.env[name]) {
    return process.env[name];
  }

  // Then check .env file (for local development)
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes
    }
  }

  return null;
}

// Detect current deploy context
function getDeployContext() {
  // Netlify sets CONTEXT environment variable
  const netlifyContext = process.env.CONTEXT;

  if (netlifyContext) {
    return netlifyContext; // 'production', 'deploy-preview', 'branch-deploy'
  }

  // Local development
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    return 'local-development';
  }

  return 'unknown';
}

// Get current branch
function getCurrentBranch() {
  // Netlify sets these
  return process.env.BRANCH || process.env.HEAD || 'unknown';
}

// Main validation function
function validateEnvironment() {
  header('Netlify Environment Validation');

  log('\n📍 Environment Information:', 'bright');
  const context = getDeployContext();
  const branch = getCurrentBranch();

  log(`   Context: ${context}`, context === 'production' ? 'green' : 'yellow');
  log(`   Branch: ${branch}`, 'cyan');
  log(`   Node Version: ${process.version}`, 'cyan');

  // Check for INSTANTDB_APP_ID
  header('InstantDB Configuration');

  const appId = getEnvVar('INSTANTDB_APP_ID');

  if (!appId) {
    log(`\n${crossmark()} INSTANTDB_APP_ID is not set!`, 'red');
    log('\nThis will cause the build to fail.', 'yellow');
    log('\nTo fix this:', 'bright');

    if (context === 'local-development') {
      log('\n1. Create a .env file in the project root:', 'cyan');
      log('   echo "INSTANTDB_APP_ID=your-app-id-here" > .env\n', 'yellow');
    } else {
      log('\n1. Go to Netlify Dashboard → Site Configuration → Environment Variables', 'cyan');
      log('2. Add INSTANTDB_APP_ID with appropriate scopes:', 'cyan');
      log('   - Production context: Use your Production App ID', 'yellow');
      log('   - Deploy preview context: Use your QA App ID', 'yellow');
      log('   - Branch deploy context: Use your QA App ID', 'yellow');
      log('\nOr use Netlify CLI:', 'cyan');
      log('   netlify env:set INSTANTDB_APP_ID "your-app-id" --context production', 'yellow');
      log('   netlify env:set INSTANTDB_APP_ID "your-app-id" --context branch-deploy', 'yellow');
      log('   netlify env:set INSTANTDB_APP_ID "your-app-id" --context deploy-preview\n', 'yellow');
    }

    log('See MULTI_ENV_SETUP.md for detailed instructions.\n', 'blue');
    process.exit(1);
  }

  // Validate App ID format
  if (!isValidAppId(appId)) {
    log(`\n${crossmark()} INSTANTDB_APP_ID has invalid format!`, 'red');
    log(`   Current value: ${appId}`, 'yellow');
    log('\nInstantDB App IDs should be UUIDs in format:', 'yellow');
    log('   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'cyan');
    log('\nPlease check your environment variable value.\n', 'yellow');
    process.exit(1);
  }

  // Success!
  log(`\n${checkmark()} INSTANTDB_APP_ID is set and valid`, 'green');
  log(`   App ID: ${appId.substring(0, 8)}...${appId.substring(appId.length - 4)}`, 'cyan');

  // Context-specific guidance
  header('Environment Validation Results');

  if (context === 'production') {
    log(`\n${checkmark()} Production deployment detected`, 'green');
    log('   This build will use your PRODUCTION database', 'yellow');
    log('   Make sure the App ID above is your production InstantDB app\n', 'yellow');
  } else if (context === 'branch-deploy') {
    log(`\n${checkmark()} Branch deployment detected`, 'green');
    log(`   Branch: ${branch}`, 'cyan');
    log('   This build will use your QA/Testing database', 'yellow');
    log('   Make sure the App ID above is your QA InstantDB app\n', 'yellow');
  } else if (context === 'deploy-preview') {
    log(`\n${checkmark()} Deploy preview detected`, 'green');
    log('   This build will use your QA/Testing database', 'yellow');
    log('   Make sure the App ID above is your QA InstantDB app\n', 'yellow');
  } else if (context === 'local-development') {
    log(`\n${checkmark()} Local development environment`, 'green');
    log('   Using App ID from .env file', 'cyan');
    log('   Recommended: Use your QA App ID for local testing\n', 'yellow');
  } else {
    log(`\n⚠️  Unknown deployment context: ${context}`, 'yellow');
    log('   Validation passed, but context could not be determined\n', 'yellow');
  }

  // Check for multiple environment files (potential confusion)
  header('Configuration Files Check');

  const configFiles = [
    { path: '.env', purpose: 'Local development' },
    { path: '.env.local', purpose: 'Local development (alternative)' },
    { path: 'netlify.toml', purpose: 'Netlify configuration' },
  ];

  let foundConfigs = [];
  configFiles.forEach(({ path: filePath, purpose }) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      foundConfigs.push({ path: filePath, purpose });
    }
  });

  if (foundConfigs.length > 0) {
    log('\nFound configuration files:', 'cyan');
    foundConfigs.forEach(({ path, purpose }) => {
      log(`   ${checkmark()} ${path} (${purpose})`, 'green');
    });
  }

  // Check netlify.toml for environment variables
  const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf-8');

    if (tomlContent.includes('INSTANTDB_APP_ID')) {
      log('\n⚠️  Warning: INSTANTDB_APP_ID found in netlify.toml', 'yellow');
      log('   This will override environment variables set in Netlify dashboard', 'yellow');
      log('   If your repo is public, App IDs will be visible to everyone', 'yellow');
      log('   Consider using Netlify dashboard for sensitive values\n', 'yellow');
    }
  }

  // Check .gitignore
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');

    if (!gitignoreContent.includes('.env')) {
      log('\n⚠️  Warning: .env not found in .gitignore', 'yellow');
      log('   Your local environment file should not be committed to git', 'yellow');
      log('   Add this line to .gitignore:', 'yellow');
      log('   .env\n', 'cyan');
    } else {
      log(`\n${checkmark()} .env is properly git-ignored`, 'green');
    }
  }

  // Final summary
  header('Validation Complete');
  log('\n✨ All checks passed! Your environment is properly configured.\n', 'green');

  // Helpful next steps
  log('Next steps:', 'bright');
  if (context === 'local-development') {
    log('   • Run: npm run dev', 'cyan');
    log('   • Test the app at http://localhost:8080', 'cyan');
  } else {
    log('   • Build will proceed with the configuration above', 'cyan');
    log('   • Check InstantDB dashboard after deploy to verify data isolation', 'cyan');
  }

  log('\nFor detailed setup instructions, see:', 'bright');
  log('   📖 MULTI_ENV_SETUP.md\n', 'cyan');
}

// Additional helper: List all environment variables (for debugging)
function listAllEnvVars() {
  if (process.argv.includes('--list-env')) {
    header('All Environment Variables');

    const relevantVars = [
      'CONTEXT',
      'BRANCH',
      'HEAD',
      'DEPLOY_PRIME_URL',
      'DEPLOY_URL',
      'URL',
      'INSTANTDB_APP_ID',
      'NODE_ENV',
    ];

    log('\nNetlify & Build Variables:', 'bright');
    relevantVars.forEach((varName) => {
      const value = process.env[varName];
      if (value) {
        // Mask sensitive values
        const displayValue =
          varName === 'INSTANTDB_APP_ID' ? `${value.substring(0, 8)}...[masked]` : value;
        log(`   ${varName}=${displayValue}`, 'cyan');
      }
    });

    log('\n');
  }
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('\nNetlify Environment Validation Script', 'bright');
  log('\nUsage:', 'cyan');
  log('   node validate-netlify-env.js [options]\n', 'yellow');
  log('Options:', 'cyan');
  log('   --help, -h       Show this help message', 'yellow');
  log('   --list-env       List all relevant environment variables', 'yellow');
  log('\nThis script validates that INSTANTDB_APP_ID is properly configured', 'bright');
  log('for your deployment context (production, QA, or local development).\n', 'bright');
  process.exit(0);
}

// Run validation
try {
  listAllEnvVars();
  validateEnvironment();
  process.exit(0);
} catch (error) {
  log('\n❌ Validation failed with error:', 'red');
  log(`   ${error.message}\n`, 'yellow');
  console.error(error);
  process.exit(1);
}
