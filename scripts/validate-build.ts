#!/usr/bin/env npx tsx
/**
 * Build Validation Script
 *
 * Validates that all assets referenced in the built HTML exist and that
 * Netlify redirects will correctly serve them.
 *
 * Run after build: npx tsx scripts/validate-build.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');

// Configuration - must match vite.config.ts
const BASE_PATH = '/superbowl';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  assets: { path: string; exists: boolean; mappedTo: string }[];
}

/**
 * Simulate Netlify rewrite rules from netlify.toml
 */
function applyNetlifyRewrite(requestPath: string): string {
  // /superbowl/assets/* → /assets/*
  if (requestPath.startsWith(`${BASE_PATH}/assets/`)) {
    return requestPath.replace(`${BASE_PATH}/assets/`, '/assets/');
  }

  // /superbowl/images/* → /images/*
  if (requestPath.startsWith(`${BASE_PATH}/images/`)) {
    return requestPath.replace(`${BASE_PATH}/images/`, '/images/');
  }

  // /superbowl/favicon.svg → /favicon.svg
  if (requestPath === `${BASE_PATH}/favicon.svg`) {
    return '/favicon.svg';
  }

  // Default: strip base path
  if (requestPath.startsWith(BASE_PATH)) {
    return requestPath.slice(BASE_PATH.length) || '/';
  }

  return requestPath;
}

/**
 * Check if a path is a local asset (not external URL or data URI)
 */
function isLocalAsset(path: string): boolean {
  return (
    !path.startsWith('http://') &&
    !path.startsWith('https://') &&
    !path.startsWith('data:') &&
    !path.startsWith('//')
  );
}

/**
 * Extract asset references from HTML content
 */
function extractAssetReferences(html: string): string[] {
  const assets: string[] = [];

  // CSS: <link rel="stylesheet" href="...">
  const cssMatches = html.matchAll(/href="([^"]+\.css)"/g);
  for (const match of cssMatches) {
    if (isLocalAsset(match[1])) {
      assets.push(match[1]);
    }
  }

  // JS: <script src="...">
  const jsMatches = html.matchAll(/src="([^"]+\.js)"/g);
  for (const match of jsMatches) {
    if (isLocalAsset(match[1])) {
      assets.push(match[1]);
    }
  }

  // Images in HTML: src="..." for common image formats
  const imgMatches = html.matchAll(/src="([^"]+\.(svg|png|jpg|jpeg|gif|webp))"/gi);
  for (const match of imgMatches) {
    if (isLocalAsset(match[1])) {
      assets.push(match[1]);
    }
  }

  // Favicon: <link rel="icon" href="...">
  const faviconMatches = html.matchAll(/rel="icon"[^>]*href="([^"]+)"/g);
  for (const match of faviconMatches) {
    if (isLocalAsset(match[1])) {
      assets.push(match[1]);
    }
  }

  return [...new Set(assets)]; // Remove duplicates
}

/**
 * Validate that an asset exists in the dist directory
 */
function validateAsset(assetPath: string): { exists: boolean; mappedTo: string; distPath: string } {
  const mappedPath = applyNetlifyRewrite(assetPath);
  const distPath = join(DIST_DIR, mappedPath);
  const exists = existsSync(distPath);

  return { exists, mappedTo: mappedPath, distPath };
}

/**
 * Run the validation
 */
function validate(): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    assets: [],
  };

  // Check dist directory exists
  if (!existsSync(DIST_DIR)) {
    result.passed = false;
    result.errors.push(`Build directory not found: ${DIST_DIR}`);
    result.errors.push('Run "yarn run build" first.');
    return result;
  }

  // Read index.html
  const indexPath = join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    result.passed = false;
    result.errors.push(`index.html not found: ${indexPath}`);
    return result;
  }

  const html = readFileSync(indexPath, 'utf-8');

  // Extract and validate assets
  const assetPaths = extractAssetReferences(html);

  console.log(`\n📦 Validating ${assetPaths.length} assets...\n`);

  for (const assetPath of assetPaths) {
    const { exists, mappedTo, distPath } = validateAsset(assetPath);

    result.assets.push({ path: assetPath, exists, mappedTo });

    if (exists) {
      console.log(`  ✅ ${assetPath}`);
      console.log(`     → ${mappedTo} (found)`);
    } else {
      result.passed = false;
      result.errors.push(`Asset not found: ${assetPath}`);
      console.log(`  ❌ ${assetPath}`);
      console.log(`     → ${mappedTo} (MISSING)`);
      console.log(`     Expected at: ${distPath}`);
    }
  }

  // Check for base path consistency
  const assetsWithBasePath = assetPaths.filter((p) => p.startsWith(BASE_PATH));
  const assetsWithoutBasePath = assetPaths.filter(
    (p) => !p.startsWith(BASE_PATH) && !p.startsWith('http')
  );

  if (assetsWithBasePath.length > 0 && assetsWithoutBasePath.length > 0) {
    result.warnings.push(
      `Mixed base paths detected: ${assetsWithBasePath.length} with "${BASE_PATH}", ${assetsWithoutBasePath.length} without`
    );
  }

  return result;
}

/**
 * Main entry point
 */
function main(): void {
  console.log('🔍 Build Validation');
  console.log('='.repeat(50));
  console.log(`Base path: ${BASE_PATH}`);
  console.log(`Dist dir:  ${DIST_DIR}`);

  const result = validate();

  console.log('\n' + '='.repeat(50));

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach((w) => console.log(`   - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((e) => console.log(`   - ${e}`));
  }

  if (result.passed) {
    console.log('\n✅ All assets validated successfully!');
    console.log('\nTo test with Netlify redirects locally, run:');
    console.log('  npx netlify dev\n');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed!');
    console.log('\nCommon fixes:');
    console.log('  1. Check vite.config.ts base path matches netlify.toml redirects');
    console.log('  2. Ensure netlify.toml rewrites map /superbowl/* to /*');
    console.log('  3. Run "yarn run build" to regenerate dist/\n');
    process.exit(1);
  }
}

main();
