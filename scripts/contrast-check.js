#!/usr/bin/env node
/**
 * Automated Contrast Check Script
 * Scans source files for low-contrast text classes
 * 
 * Usage: npm run contrast:check
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Low contrast patterns to detect
const LOW_CONTRAST_PATTERNS = [
  { pattern: /text-kiosk-text\/[1-4][0-9]/g, level: 'critical', min: 85 },
  { pattern: /text-kiosk-text\/5[0-9]/g, level: 'serious', min: 85 },
  { pattern: /text-kiosk-text\/6[0-9]/g, level: 'moderate', min: 85 },
  { pattern: /text-kiosk-text\/7[0-4]/g, level: 'minor', min: 90 },
];

function findTsxFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTsxFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

function runContrastCheck() {
  console.log(`${COLORS.cyan}╔═══════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║   TSiJUKEBOX Contrast Audit           ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚═══════════════════════════════════════╝${COLORS.reset}\n`);

  const srcDir = path.join(process.cwd(), 'src');
  const files = findTsxFiles(srcDir);
  let totalIssues = 0;
  const fileIssues = {};

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(process.cwd(), file);

    for (const { pattern, level, min } of LOW_CONTRAST_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = content.match(pattern);
      if (matches) {
        if (!fileIssues[relativePath]) fileIssues[relativePath] = [];
        matches.forEach(m => {
          fileIssues[relativePath].push({ match: m, level, suggestion: `Use /${min} or higher` });
          totalIssues++;
        });
      }
    }
  }

  if (totalIssues === 0) {
    console.log(`${COLORS.green}✓ No low-contrast issues found!${COLORS.reset}`);
    process.exit(0);
  }

  console.log(`${COLORS.red}✗ Found ${totalIssues} low-contrast issues in ${Object.keys(fileIssues).length} files${COLORS.reset}\n`);

  for (const [file, issues] of Object.entries(fileIssues)) {
    console.log(`${COLORS.yellow}${file}${COLORS.reset}`);
    issues.forEach(i => console.log(`  ${i.level}: ${i.match} → ${i.suggestion}`));
  }

  process.exit(1);
}

runContrastCheck();
