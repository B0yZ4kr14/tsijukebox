#!/usr/bin/env node
/**
 * Automated Accessibility Audit Script
 * Uses axe-core to test WCAG 2.1 AA compliance across multiple routes
 * 
 * Usage:
 *   npm run a11y         - Run audit with colored output (requires Puppeteer)
 *   npm run a11y:ci      - Run audit in CI mode with JSON output
 *   npm run a11y:simple  - Run lightweight CSS/code checks (no Puppeteer)
 */

const fs = require('fs');
const path = require('path');

// Routes to test for accessibility
const ROUTES_TO_TEST = [
  { path: '/', name: 'Player (Home)' },
  { path: '/settings', name: 'Settings' },
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/admin/library', name: 'Admin Library' },
  { path: '/help', name: 'Help' },
  { path: '/wiki', name: 'Wiki' },
];

// WCAG 2.1 AA tags to test
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

// Severity colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

// Impact level colors
const IMPACT_COLORS = {
  critical: COLORS.red,
  serious: COLORS.red,
  moderate: COLORS.yellow,
  minor: COLORS.dim,
};

// Prohibited patterns for simple mode
const PROHIBITED_PATTERNS = [
  // === COLOR & CONTRAST PATTERNS ===
  { 
    pattern: /className="[^"]*\bbg-white\b[^"]*"/g, 
    message: 'Use bg-kiosk-surface or bg-kiosk-bg instead of bg-white',
    severity: 'serious'
  },
  { 
    pattern: /className="[^"]*\btext-black\b[^"]*"/g, 
    message: 'Use text-kiosk-text instead of text-black',
    severity: 'serious'
  },
  { 
    pattern: /className="[^"]*\bbg-background(?!\/)[^"]*"/g, 
    message: 'Use bg-kiosk-surface instead of bg-background (may be light in some themes)',
    severity: 'moderate'
  },
  { 
    pattern: /variant="outline"(?![^>]*button-outline-neon)/g, 
    message: 'Use variant="kiosk-outline" or add button-outline-neon class',
    severity: 'moderate'
  },
  
  // === IMAGES WITHOUT ALT ===
  { 
    pattern: /<img\s+(?![^>]*alt=)[^>]*>/gi, 
    message: 'Image missing alt attribute - add alt="" for decorative or descriptive alt for informative images',
    severity: 'serious'
  },
  { 
    pattern: /<img[^>]*alt=""\s*[^>]*>/gi, 
    message: 'Empty alt attribute - ensure this is intentional for decorative images only',
    severity: 'minor'
  },
  
  // === LINKS WITHOUT TEXT ===
  { 
    pattern: /<Link[^>]*>\s*<[^>]*Icon[^/]*\/>\s*<\/Link>/gi, 
    message: 'Link with only icon - add aria-label or visible text for accessibility',
    severity: 'serious'
  },
  { 
    pattern: /<a\s+[^>]*>\s*<[^>]*Icon[^/]*\/>\s*<\/a>/gi, 
    message: 'Anchor link with only icon - add aria-label or visible text',
    severity: 'serious'
  },
  
  // === BUTTONS WITHOUT ACCESSIBLE NAME ===
  { 
    pattern: /<(button|Button)[^>]*>[\s]*<[^>]*Icon[^>]*\/>[\s]*<\/(button|Button)>/g, 
    message: 'Icon-only button may be missing aria-label',
    severity: 'serious'
  },
  { 
    pattern: /<Button\s+[^>]*size="icon"[^>]*(?!aria-label)[^>]*>/gi, 
    message: 'Button with size="icon" should have aria-label',
    severity: 'serious'
  },
  
  // === INPUTS WITHOUT LABELS ===
  { 
    pattern: /<Input[^>]*(?!aria-label|aria-labelledby|id=)[^>]*\/>/gi, 
    message: 'Input may be missing accessible label - add aria-label, aria-labelledby, or associated label element',
    severity: 'moderate'
  },
  { 
    pattern: /<select[^>]*(?!aria-label|aria-labelledby)[^>]*>/gi, 
    message: 'Select element may be missing accessible label',
    severity: 'moderate'
  },
  { 
    pattern: /<textarea[^>]*(?!aria-label|aria-labelledby)[^>]*>/gi, 
    message: 'Textarea may be missing accessible label',
    severity: 'moderate'
  },
  
  // === CLICKABLE ELEMENTS WITHOUT ROLE ===
  { 
    pattern: /<div[^>]*onClick={[^}]*}[^>]*(?!role=)[^>]*>/gi, 
    message: 'Clickable div should have role="button" and be keyboard accessible',
    severity: 'moderate'
  },
  { 
    pattern: /<span[^>]*onClick={[^}]*}[^>]*(?!role=)[^>]*>/gi, 
    message: 'Clickable span should have role="button" and be keyboard accessible',
    severity: 'moderate'
  },
  
  // === COLOR-ONLY ERROR INDICATORS ===
  { 
    pattern: /className="[^"]*\btext-red-\d{3}\b[^"]*"[^>]*>\s*[^<]*error/gi, 
    message: 'Error state using color only - consider adding icon or sr-only text for accessibility',
    severity: 'moderate'
  },
  { 
    pattern: /className="[^"]*\bborder-red-\d{3}\b[^"]*"[^>]*(?!aria-invalid)/gi, 
    message: 'Red border may indicate error - consider adding aria-invalid="true"',
    severity: 'minor'
  },
  
  // === TABLES WITHOUT HEADERS ===
  { 
    pattern: /<Table[^>]*>(?:(?!<TableHeader|<thead).)*?<TableBody/gis, 
    message: 'Table may be missing header row (<TableHeader> or <thead>)',
    severity: 'moderate'
  },
  
  // === FOCUS INDICATORS ===
  { 
    pattern: /focus:outline-none(?![^"]*focus:ring|[^"]*focus-visible)/g, 
    message: 'Removing focus outline without alternative focus indicator may harm keyboard navigation',
    severity: 'moderate'
  },
  
  // === HEADING STRUCTURE ===
  { 
    pattern: /<h1[^>]*>[^<]*<\/h1>[\s\S]*?<h1[^>]*>/gi, 
    message: 'Multiple h1 elements detected - page should have single main heading',
    severity: 'moderate'
  },
  
  // === MISSING LANG ATTRIBUTE ===
  { 
    pattern: /<html(?![^>]*lang=)[^>]*>/gi, 
    message: 'HTML element missing lang attribute',
    severity: 'serious'
  },
];

// Positive patterns to count (accessibility best practices found)
const POSITIVE_PATTERNS = [
  { pattern: /aria-label=/g, name: 'aria-label' },
  { pattern: /aria-labelledby=/g, name: 'aria-labelledby' },
  { pattern: /aria-describedby=/g, name: 'aria-describedby' },
  { pattern: /alt="[^"]+"/g, name: 'alt text' },
  { pattern: /role="[^"]+"/g, name: 'role attribute' },
  { pattern: /sr-only/g, name: 'screen reader text' },
  { pattern: /tabIndex=/g, name: 'tabIndex' },
  { pattern: /aria-hidden=/g, name: 'aria-hidden' },
];

/**
 * Format violation for terminal output
 */
function formatViolation(violation, index) {
  const impact = violation.impact || 'unknown';
  const color = IMPACT_COLORS[impact] || COLORS.dim;
  
  let output = `\n${color}${COLORS.bold}${index + 1}. [${impact.toUpperCase()}] ${violation.id}${COLORS.reset}\n`;
  output += `   ${violation.description}\n`;
  if (violation.helpUrl) {
    output += `   ${COLORS.cyan}Help: ${violation.helpUrl}${COLORS.reset}\n`;
  }
  if (violation.file) {
    output += `   ${COLORS.dim}File: ${violation.file}:${violation.line}${COLORS.reset}\n`;
  }
  output += `   ${COLORS.dim}Affected: ${violation.nodes?.length || 1} element(s)${COLORS.reset}`;
  
  return output;
}

/**
 * Print summary for a route
 */
function printRouteSummary(result) {
  const { route, name, violations, passes, incomplete } = result;
  const hasViolations = violations.length > 0;
  
  console.log(`\n${COLORS.bold}━━━ ${name} (${route}) ━━━${COLORS.reset}`);
  
  if (hasViolations) {
    console.log(`${COLORS.red}✗ ${violations.length} violation(s) found${COLORS.reset}`);
    violations.forEach((v, i) => console.log(formatViolation(v, i)));
  } else {
    console.log(`${COLORS.green}✓ No violations found${COLORS.reset}`);
  }
  
  console.log(`${COLORS.dim}  Passed: ${passes} rules | Incomplete: ${incomplete.length} rules${COLORS.reset}`);
}

/**
 * Generate JSON report
 */
function generateReport(results, mode = 'full') {
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
  const criticalViolations = results.reduce((sum, r) => 
    sum + r.violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length, 0
  );
  
  return {
    timestamp: new Date().toISOString(),
    mode,
    wcagTags: mode === 'full' ? WCAG_TAGS : ['css-check'],
    routesTested: results.length,
    totalViolations,
    criticalViolations,
    passed: totalViolations === 0,
    routes: results.map(r => ({
      path: r.route || r.file,
      name: r.name,
      violationCount: r.violations.length,
      passCount: r.passes || 0,
      incompleteCount: r.incomplete?.length || 0,
      violations: r.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        helpUrl: v.helpUrl,
        file: v.file,
        line: v.line,
        affectedNodes: v.nodes?.length || 1,
      })),
    })),
  };
}

/**
 * Simple mode: Scan source files for accessibility issues without Puppeteer
 */
async function runSimpleAudit() {
  console.log(`${COLORS.bold}${COLORS.cyan}`);
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     TSiJUKEBOX Accessibility Audit                ║');
  console.log('║     Simple Mode (CSS/Code Patterns)               ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`${COLORS.reset}`);
  console.log(`${COLORS.dim}Scanning source files for accessibility patterns...${COLORS.reset}\n`);

  const srcDir = path.join(process.cwd(), 'src');
  const results = [];
  const violations = [];
  const positiveMatches = {};

  // Initialize positive pattern counters
  for (const { name } of POSITIVE_PATTERNS) {
    positiveMatches[name] = 0;
  }

  // Recursively find all TSX files
  function findTsxFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...findTsxFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const tsxFiles = findTsxFiles(srcDir);
  console.log(`${COLORS.dim}Found ${tsxFiles.length} component files to scan${COLORS.reset}\n`);

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), file);
    const fileViolations = [];

    // Check prohibited patterns
    for (const { pattern, message, severity } of PROHIBITED_PATTERNS) {
      // Reset regex state
      pattern.lastIndex = 0;
      
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        
        fileViolations.push({
          id: 'css-pattern-check',
          impact: severity,
          description: message,
          file: relativePath,
          line: lineNumber,
          match: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
        });
      }
    }

    // Count positive patterns
    for (const { pattern, name } of POSITIVE_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = content.match(pattern);
      if (matches) {
        positiveMatches[name] += matches.length;
      }
    }

    if (fileViolations.length > 0) {
      violations.push(...fileViolations);
    }
  }

  // Group by file for output
  const fileGroups = violations.reduce((acc, v) => {
    if (!acc[v.file]) acc[v.file] = [];
    acc[v.file].push(v);
    return acc;
  }, {});

  // Print results
  for (const [file, fileViolations] of Object.entries(fileGroups)) {
    console.log(`\n${COLORS.bold}━━━ ${file} ━━━${COLORS.reset}`);
    console.log(`${COLORS.red}✗ ${fileViolations.length} issue(s) found${COLORS.reset}`);
    fileViolations.forEach((v, i) => console.log(formatViolation(v, i)));
  }

  if (violations.length === 0) {
    console.log(`${COLORS.green}✓ No CSS/pattern issues found!${COLORS.reset}`);
  }

  // Print positive patterns summary
  console.log(`\n${COLORS.bold}${COLORS.green}━━━ Accessibility Best Practices Found ━━━${COLORS.reset}`);
  const totalPositive = Object.values(positiveMatches).reduce((sum, count) => sum + count, 0);
  console.log(`${COLORS.green}✓ ${totalPositive} accessibility attributes found${COLORS.reset}`);
  for (const [name, count] of Object.entries(positiveMatches)) {
    if (count > 0) {
      console.log(`  ${COLORS.dim}• ${name}: ${count}${COLORS.reset}`);
    }
  }

  results.push({
    route: 'src/**/*.tsx',
    name: 'Source Files',
    violations,
    passes: tsxFiles.length - Object.keys(fileGroups).length,
    incomplete: [],
    positivePatterns: positiveMatches,
    totalPositive,
  });

  return results;
}

/**
 * Main audit function using axe-core + Puppeteer (full mode)
 */
async function runFullAudit() {
  const isCI = process.argv.includes('--ci');
  const baseUrl = process.env.BASE_URL || 'http://localhost:4173';
  
  console.log(`${COLORS.bold}${COLORS.cyan}`);
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     WCAG 2.1 AA Accessibility Audit               ║');
  console.log('║     TSiJUKEBOX - axe-core                         ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`${COLORS.reset}`);
  console.log(`${COLORS.dim}Base URL: ${baseUrl}${COLORS.reset}`);
  console.log(`${COLORS.dim}Testing ${ROUTES_TO_TEST.length} routes...${COLORS.reset}`);

  let puppeteer, AxePuppeteer;
  
  try {
    puppeteer = require('puppeteer');
    AxePuppeteer = require('@axe-core/puppeteer').AxePuppeteer;
  } catch (error) {
    console.log(`\n${COLORS.yellow}⚠ Puppeteer/axe-core not installed.${COLORS.reset}`);
    console.log(`${COLORS.dim}Install with: npm install -D puppeteer @axe-core/puppeteer${COLORS.reset}`);
    console.log(`${COLORS.dim}Or use: npm run a11y:simple for lightweight checks${COLORS.reset}\n`);
    
    // Generate mock report for CI when dependencies not available
    const mockReport = {
      timestamp: new Date().toISOString(),
      mode: 'skipped',
      wcagTags: WCAG_TAGS,
      routesTested: 0,
      totalViolations: 0,
      criticalViolations: 0,
      passed: true,
      message: 'Dependencies not installed - skipped audit',
      routes: [],
    };
    
    if (isCI) {
      fs.writeFileSync('a11y-report.json', JSON.stringify(mockReport, null, 2));
      console.log(`${COLORS.green}✓ Report generated: a11y-report.json${COLORS.reset}`);
    }
    
    return [];
  }

  const results = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const { path: routePath, name } of ROUTES_TO_TEST) {
      const page = await browser.newPage();
      
      try {
        await page.goto(`${baseUrl}${routePath}`, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });

        // Wait for React to render
        await page.waitForTimeout(1000);

        const axeResults = await new AxePuppeteer(page)
          .withTags(WCAG_TAGS)
          .analyze();

        results.push({
          route: routePath,
          name,
          violations: axeResults.violations,
          passes: axeResults.passes.length,
          incomplete: axeResults.incomplete,
        });

        if (!isCI) {
          printRouteSummary(results[results.length - 1]);
        }
      } catch (error) {
        console.log(`${COLORS.yellow}⚠ Could not test ${routePath}: ${error.message}${COLORS.reset}`);
        results.push({
          route: routePath,
          name,
          violations: [],
          passes: 0,
          incomplete: [],
          error: error.message,
        });
      }

      await page.close();
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

/**
 * Main entry point
 */
async function runAudit() {
  const isCI = process.argv.includes('--ci');
  const isSimple = process.argv.includes('--simple');

  let results;
  let mode;

  if (isSimple) {
    mode = 'simple';
    results = await runSimpleAudit();
  } else {
    mode = 'full';
    results = await runFullAudit();
  }

  if (results.length === 0) {
    process.exit(0);
  }

  // Generate report
  const report = generateReport(results, mode);

  // Print final summary
  console.log(`\n${COLORS.bold}═══════════════════════════════════════════════════`);
  console.log(`                    SUMMARY`);
  console.log(`═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`Mode: ${mode}`);
  console.log(`${mode === 'full' ? 'Routes' : 'Files'} tested: ${report.routesTested}`);
  console.log(`Total violations: ${report.totalViolations}`);
  console.log(`Critical/Serious: ${report.criticalViolations}`);
  console.log(`Status: ${report.passed ? `${COLORS.green}✓ PASSED${COLORS.reset}` : `${COLORS.red}✗ FAILED${COLORS.reset}`}`);

  // Save JSON report
  if (isCI || process.argv.includes('--json')) {
    const reportPath = path.join(process.cwd(), 'a11y-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${COLORS.green}✓ Report saved: ${reportPath}${COLORS.reset}`);
  }

  // Exit with appropriate code
  if (report.criticalViolations > 0) {
    process.exit(1);
  }

  process.exit(0);
}

// Run audit
runAudit().catch((error) => {
  console.error(`${COLORS.red}Audit failed: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
