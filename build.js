#!/usr/bin/env node

/**
 * Build script for Netlify deployment
 * Replaces environment variable placeholders in index.html
 */

const fs = require('fs');
const path = require('path');

// Read the template file
const templatePath = path.join(__dirname, 'index.html');
const outputPath = path.join(__dirname, 'dist', 'index.html');

console.log('🔧 Building Super Bowl Prediction App...');

// Get InstantDB App ID from environment variable
const instantDbAppId = process.env.INSTANTDB_APP_ID;

if (!instantDbAppId) {
  console.error('❌ ERROR: INSTANTDB_APP_ID environment variable is not set!');
  console.error('   Please set it in Netlify dashboard or netlify.toml');
  process.exit(1);
}

console.log(`✓ Found INSTANTDB_APP_ID: ${instantDbAppId.substring(0, 8)}...`);

// Read the template
let content = fs.readFileSync(templatePath, 'utf8');

// Replace placeholder with actual value
content = content.replace('__INSTANTDB_APP_ID__', instantDbAppId);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Write the output file
fs.writeFileSync(outputPath, content, 'utf8');

// Copy favicon to dist
const faviconPath = path.join(__dirname, 'favicon.svg');
const faviconOutputPath = path.join(__dirname, 'dist', 'favicon.svg');
if (fs.existsSync(faviconPath)) {
  fs.copyFileSync(faviconPath, faviconOutputPath);
  console.log('✓ Favicon copied to dist/');
}

// Copy images folder to dist
const imagesDir = path.join(__dirname, 'images');
const imagesOutputDir = path.join(distDir, 'images');
if (fs.existsSync(imagesDir)) {
  // Create images dir in dist if it doesn't exist
  if (!fs.existsSync(imagesOutputDir)) {
    fs.mkdirSync(imagesOutputDir, { recursive: true });
  }
  // Copy all files from images folder
  const imageFiles = fs.readdirSync(imagesDir);
  imageFiles.forEach(file => {
    const srcPath = path.join(imagesDir, file);
    const destPath = path.join(imagesOutputDir, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log(`✓ Images copied to dist/ (${imageFiles.length} files)`);
}

console.log('✓ Build complete! Output: dist/index.html');
console.log('✓ InstantDB App ID injected successfully');
