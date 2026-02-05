import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

import { describe, it, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Finds all CSS files in a directory recursively.
 */
function findCssFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extname(entry) === '.css') {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Checks if a color value is a hardcoded hex color that should use CSS variables.
 * Allows certain colors that are intentionally hardcoded (black, white, transparency).
 */
function isHardcodedThemeColor(value: string): boolean {
  // Match hex colors
  const hexPattern = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
  const matches = value.match(hexPattern);

  if (!matches) return false;

  // Colors that are allowed to be hardcoded
  const allowedColors = new Set([
    '#000000',
    '#000', // Black
    '#ffffff',
    '#fff', // White
    '#fff8dc', // Cornsilk (used in gold shimmer gradient)
    '#e57373', // Results tab coral (intentional fixed color)
    '#ff5252', // Delete hover state
  ]);

  // Check if any match is a disallowed hardcoded color
  for (const match of matches) {
    const normalized = match.toLowerCase();
    if (!allowedColors.has(normalized)) {
      // Skip if it's inside a url() or comment
      if (value.includes('url(') || value.includes('/*') || value.includes('//')) {
        continue;
      }
      return true;
    }
  }

  return false;
}

/**
 * Finds hardcoded colors in CSS content.
 * Returns array of {line, content, colors} objects.
 */
function findHardcodedColors(
  cssContent: string,
  _filePath: string
): Array<{ line: number; content: string; colors: string[] }> {
  const violations: Array<{ line: number; content: string; colors: string[] }> = [];
  const lines = cssContent.split('\n');

  // Track if we're inside a :root block (where variables are defined)
  let inRootBlock = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip comments
    if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('//')) {
      continue;
    }

    // Track :root block
    if (trimmedLine.includes(':root')) {
      inRootBlock = true;
    }
    if (inRootBlock) {
      braceDepth += (line.match(/{/g) ?? []).length;
      braceDepth -= (line.match(/}/g) ?? []).length;
      if (braceDepth <= 0) {
        inRootBlock = false;
        braceDepth = 0;
      }
      // Allow hardcoded colors in :root (variable definitions)
      continue;
    }

    // Skip lines that are CSS variable definitions
    if (trimmedLine.startsWith('--')) {
      continue;
    }

    // Check for hardcoded colors
    const hexPattern = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
    const matches = line.match(hexPattern);

    if (matches && isHardcodedThemeColor(line)) {
      violations.push({
        line: i + 1,
        content: trimmedLine,
        colors: matches,
      });
    }
  }

  return violations;
}

describe('CSS Audit - No Hardcoded Theme Colors', () => {
  const stylesDir = join(__dirname, '../styles');

  it('should not have hardcoded theme colors in CSS files', () => {
    const cssFiles = findCssFiles(stylesDir);
    const allViolations: Array<{
      file: string;
      violations: Array<{ line: number; content: string; colors: string[] }>;
    }> = [];

    for (const file of cssFiles) {
      const content = readFileSync(file, 'utf-8');
      const violations = findHardcodedColors(content, file);

      if (violations.length > 0) {
        allViolations.push({
          file: file.replace(stylesDir, 'src/styles'),
          violations,
        });
      }
    }

    if (allViolations.length > 0) {
      const message = allViolations
        .map(({ file, violations }) => {
          const lines = violations
            .map((v) => `  Line ${v.line}: ${v.content} (colors: ${v.colors.join(', ')})`)
            .join('\n');
          return `${file}:\n${lines}`;
        })
        .join('\n\n');

      expect.fail(
        `Found hardcoded theme colors in CSS files. Use CSS variables instead:\n\n${message}`
      );
    }
  });

  it('should use CSS variables for primary colors', () => {
    const cssFiles = findCssFiles(stylesDir);
    let foundPrimaryVar = false;

    for (const file of cssFiles) {
      const content = readFileSync(file, 'utf-8');
      if (content.includes('var(--color-primary)')) {
        foundPrimaryVar = true;
        break;
      }
    }

    expect(foundPrimaryVar, 'CSS files should use var(--color-primary)').toBe(true);
  });

  it('should use CSS variables for background colors', () => {
    const cssFiles = findCssFiles(stylesDir);
    let foundBackgroundVar = false;

    for (const file of cssFiles) {
      const content = readFileSync(file, 'utf-8');
      if (content.includes('var(--color-background)')) {
        foundBackgroundVar = true;
        break;
      }
    }

    expect(foundBackgroundVar, 'CSS files should use var(--color-background)').toBe(true);
  });

  it('should define semantic color variables', () => {
    const baseCss = readFileSync(join(stylesDir, 'base.css'), 'utf-8');

    expect(baseCss).toContain('--color-primary');
    expect(baseCss).toContain('--color-secondary');
    expect(baseCss).toContain('--color-background');
    expect(baseCss).toContain('--color-background-alt');
    expect(baseCss).toContain('--color-text');
    expect(baseCss).toContain('--color-text-muted');
    expect(baseCss).toContain('--color-input-bg');
    expect(baseCss).toContain('--color-primary-hover');
    expect(baseCss).toContain('--color-primary-rgb');
  });
});
