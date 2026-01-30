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

console.log('✓ Build complete!');
console.log('');
console.log('🚀 Starting local server...');

// Simple HTTP server
const PORT = 8000;
const server = http.createServer((req, res) => {
  const filePath = path.join(distDir, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
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
