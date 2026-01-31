#!/usr/bin/env node

/**
 * Local development script
 * Builds and serves the app locally with env vars from .env file
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Try to load .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✓ Loaded environment from .env file');
} else {
  console.log('ℹ No .env file found. Using environment variables.');
  console.log('  To create one: cp .env.example .env');
}

// Get InstantDB App ID from environment variable
const instantDbAppId = process.env.INSTANTDB_APP_ID;

if (!instantDbAppId || instantDbAppId === 'your-app-id-here') {
  console.error('❌ ERROR: INSTANTDB_APP_ID is not set!');
  console.error('');
  console.error('   1. Copy .env.example to .env:');
  console.error('      cp .env.example .env');
  console.error('');
  console.error('   2. Edit .env and set your InstantDB App ID');
  console.error('      Get it from: https://instantdb.com/dash');
  console.error('');
  process.exit(1);
}

console.log('🔧 Building app for local development...');
console.log(`✓ Using InstantDB App ID: ${instantDbAppId.substring(0, 8)}...`);

// Read the template
const templatePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(templatePath, 'utf8');

// Replace placeholder with actual value
content = content.replace('__INSTANTDB_APP_ID__', instantDbAppId);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Write the output file
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, content, 'utf8');

// Copy favicon to dist
const faviconPath = path.join(__dirname, 'favicon.svg');
const faviconOutputPath = path.join(distDir, 'favicon.svg');
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

console.log('✓ Build complete!');
console.log('');
console.log('🚀 Starting local server...');
console.log('👀 Watching for changes to index.html and favicon.svg...');

// Function to rebuild the app
function rebuild() {
  try {
    console.log('');
    console.log('📝 Change detected, rebuilding...');

    // Read the template
    let content = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholder with actual value
    content = content.replace('__INSTANTDB_APP_ID__', instantDbAppId);

    // Write the output file
    fs.writeFileSync(outputPath, content, 'utf8');

    // Copy favicon to dist
    const faviconPath = path.join(__dirname, 'favicon.svg');
    const faviconOutputPath = path.join(distDir, 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      fs.copyFileSync(faviconPath, faviconOutputPath);
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(`✓ Rebuild complete at ${timestamp}`);
    console.log('  Refresh your browser to see changes');
    console.log('');
  } catch (err) {
    console.error('❌ Error rebuilding:', err.message);
  }
}

// Watch index.html for changes
fs.watch(templatePath, (eventType) => {
  if (eventType === 'change' || eventType === 'rename') {
    rebuild();
  }
});

// Watch favicon.svg for changes (reuse faviconPath from above)
if (fs.existsSync(faviconPath)) {
  fs.watch(faviconPath, (eventType) => {
    if (eventType === 'change' || eventType === 'rename') {
      rebuild();
    }
  });
}

// Simple HTTP server
const PORT = 8000;
const server = http.createServer((req, res) => {
  // Parse URL to handle query strings
  const urlPath = req.url.split('?')[0];

  let filePath, contentType;

  if (urlPath === '/favicon.svg') {
    filePath = path.join(distDir, 'favicon.svg');
    contentType = 'image/svg+xml';
  } else if (urlPath.startsWith('/images/')) {
    // Serve images from images folder (relative to project root)
    filePath = path.join(__dirname, urlPath);
    // Determine content type based on extension
    if (urlPath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (urlPath.endsWith('.jpg') || urlPath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (urlPath.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (urlPath.endsWith('.webp')) {
      contentType = 'image/webp';
    } else if (urlPath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else {
      contentType = 'application/octet-stream';
    }
  } else {
    filePath = path.join(distDir, 'index.html');
    contentType = 'text/html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error serving ${filePath}:`, err.message);
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('');
});
