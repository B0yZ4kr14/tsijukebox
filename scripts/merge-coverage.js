#!/usr/bin/env node
/**
 * Merge Coverage Reports
 * 
 * Merges Vitest and Playwright coverage reports into a unified report
 * Generates HTML, JSON, and badge files for CI/CD
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_DIRS = {
  vitest: './coverage/vitest',
  playwright: './playwright-report',
  combined: './coverage/combined',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.warn(`⚠️ Could not read ${filePath}: ${e.message}`);
  }
  return null;
}

function generateCoverageReport() {
  console.log('📊 Merging coverage reports...\n');
  
  ensureDir(COVERAGE_DIRS.combined);
  
  // Read Vitest coverage
  const vitestSummary = readJsonSafe(path.join(COVERAGE_DIRS.vitest, 'coverage-summary.json'));
  
  // Read Playwright results
  const playwrightResults = readJsonSafe(path.join(COVERAGE_DIRS.playwright, 'results.json'));
  
  // Build combined report
  const report = {
    timestamp: new Date().toISOString(),
    unitTestCoverage: null,
    e2eTestResults: null,
  };
  
  // Process Vitest coverage
  if (vitestSummary && vitestSummary.total) {
    report.unitTestCoverage = {
      lines: vitestSummary.total.lines?.pct || 0,
      statements: vitestSummary.total.statements?.pct || 0,
      functions: vitestSummary.total.functions?.pct || 0,
      branches: vitestSummary.total.branches?.pct || 0,
    };
    console.log('✅ Vitest coverage loaded');
  } else {
    console.log('⚠️ No Vitest coverage found');
  }
  
  // Process Playwright results
  if (playwrightResults) {
    const stats = playwrightResults.stats || {};
    const total = stats.expected || 0;
    const passed = stats.expected - (stats.unexpected || 0) - (stats.flaky || 0);
    const failed = stats.unexpected || 0;
    const skipped = stats.skipped || 0;
    
    report.e2eTestResults = {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
      duration: stats.duration || 0,
    };
    console.log('✅ Playwright results loaded');
  } else {
    console.log('⚠️ No Playwright results found');
  }
  
  // Save combined JSON report
  const reportPath = path.join(COVERAGE_DIRS.combined, 'coverage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(path.join(COVERAGE_DIRS.combined, 'index.html'), htmlReport);
  
  // Calculate total coverage for badge
  const totalCoverage = report.unitTestCoverage 
    ? Math.round((report.unitTestCoverage.lines + report.unitTestCoverage.functions + report.unitTestCoverage.branches) / 3)
    : 0;
  
  // Generate badges in badges/ subdirectory
  const badgesDir = path.join(COVERAGE_DIRS.combined, 'badges');
  ensureDir(badgesDir);
  
  // Badge: coverage.json
  const coverageColor = totalCoverage >= 80 ? 'brightgreen' : totalCoverage >= 70 ? 'green' : totalCoverage >= 50 ? 'yellow' : 'red';
  fs.writeFileSync(path.join(badgesDir, 'coverage.json'), JSON.stringify({
    schemaVersion: 1,
    label: 'coverage',
    message: `${totalCoverage}%`,
    color: coverageColor,
  }, null, 2));
  
  // Badge: unit-tests.json
  if (report.unitTestCoverage) {
    const unitColor = report.unitTestCoverage.lines >= 80 ? 'blue' : report.unitTestCoverage.lines >= 60 ? 'blueviolet' : 'orange';
    fs.writeFileSync(path.join(badgesDir, 'unit-tests.json'), JSON.stringify({
      schemaVersion: 1,
      label: 'unit tests',
      message: `${Math.round(report.unitTestCoverage.lines)}% lines`,
      color: unitColor,
    }, null, 2));
  }
  
  // Badge: e2e-tests.json
  if (report.e2eTestResults) {
    const passRate = parseFloat(report.e2eTestResults.passRate) || 0;
    const e2eColor = passRate >= 90 ? 'brightgreen' : passRate >= 70 ? 'yellow' : 'red';
    fs.writeFileSync(path.join(badgesDir, 'e2e-tests.json'), JSON.stringify({
      schemaVersion: 1,
      label: 'E2E tests',
      message: `${report.e2eTestResults.passed}/${report.e2eTestResults.total} passed`,
      color: e2eColor,
    }, null, 2));
  }
  
  // Badge: status.json
  const statusPassing = totalCoverage >= 70;
  fs.writeFileSync(path.join(badgesDir, 'status.json'), JSON.stringify({
    schemaVersion: 1,
    label: 'tests',
    message: statusPassing ? 'passing' : 'failing',
    color: statusPassing ? 'brightgreen' : 'red',
  }, null, 2));
  
  // Legacy badge.json for backwards compatibility
  fs.writeFileSync(path.join(COVERAGE_DIRS.combined, 'badge.json'), JSON.stringify({
    schemaVersion: 1,
    label: 'coverage',
    message: `${totalCoverage}%`,
    color: coverageColor,
    totalCoverage,
  }, null, 2));
  
  // Write summary.json for CI
  const summaryData = {
    totalCoverage,
    unitTests: report.unitTestCoverage || null,
    e2eTests: report.e2eTestResults || null,
    threshold: 70,
    passing: totalCoverage >= 70,
  };
  fs.writeFileSync(path.join(COVERAGE_DIRS.combined, 'summary.json'), JSON.stringify(summaryData, null, 2));
  
  console.log('\n✅ Coverage reports merged successfully!\n');
  console.log(`📁 Combined report: ${COVERAGE_DIRS.combined}/index.html`);
  console.log(`📁 JSON report: ${reportPath}`);
  console.log(`📁 Badges directory: ${badgesDir}`);
  console.log(`   📛 coverage.json`);
  console.log(`   📛 unit-tests.json`);
  console.log(`   📛 e2e-tests.json`);
  console.log(`   📛 status.json\n`);
  
  // Print summary
  if (report.unitTestCoverage) {
    console.log('📈 Unit Test Coverage:');
    console.log(`   Lines: ${report.unitTestCoverage.lines}%`);
    console.log(`   Statements: ${report.unitTestCoverage.statements}%`);
    console.log(`   Functions: ${report.unitTestCoverage.functions}%`);
    console.log(`   Branches: ${report.unitTestCoverage.branches}%\n`);
  }
  
  if (report.e2eTestResults) {
    console.log('🎭 E2E Test Results:');
    console.log(`   Total: ${report.e2eTestResults.total}`);
    console.log(`   Passed: ${report.e2eTestResults.passed}`);
    console.log(`   Failed: ${report.e2eTestResults.failed}`);
    console.log(`   Pass Rate: ${report.e2eTestResults.passRate}%\n`);
  }
  
  console.log(`📊 Total Coverage: ${totalCoverage}%`);
  console.log(`🎯 Threshold: 70%`);
  console.log(`${totalCoverage >= 70 ? '✅' : '❌'} Status: ${totalCoverage >= 70 ? 'PASSING' : 'FAILING'}`);
}

function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TSiJUKEBOX - Coverage Report</title>
  <style>
    :root {
      --bg-primary: #0a0a0b;
      --bg-secondary: #111113;
      --text-primary: #fafafa;
      --text-secondary: #a1a1aa;
      --accent: #3b82f6;
      --success: #22c55e;
      --warning: #eab308;
      --error: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitle { color: var(--text-secondary); margin-bottom: 2rem; }
    .card {
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .card h2 { font-size: 1.25rem; margin-bottom: 1rem; color: var(--accent); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
    .stat { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary); }
    .good { color: var(--success); }
    .warning { color: var(--warning); }
    .bad { color: var(--error); }
    .badge-container { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
    .badge-warning { background: rgba(234, 179, 8, 0.2); color: var(--warning); }
    .badge-error { background: rgba(239, 68, 68, 0.2); color: var(--error); }
    .footer { margin-top: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.875rem; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 TSiJUKEBOX Coverage Report</h1>
    <p class="subtitle">Generated at ${report.timestamp}</p>
    
    ${report.unitTestCoverage ? `
    <div class="card">
      <h2>🧪 Unit Test Coverage</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value ${getColorClass(report.unitTestCoverage.lines)}">${report.unitTestCoverage.lines}%</div>
          <div class="stat-label">Lines</div>
        </div>
        <div class="stat">
          <div class="stat-value ${getColorClass(report.unitTestCoverage.statements)}">${report.unitTestCoverage.statements}%</div>
          <div class="stat-label">Statements</div>
        </div>
        <div class="stat">
          <div class="stat-value ${getColorClass(report.unitTestCoverage.functions)}">${report.unitTestCoverage.functions}%</div>
          <div class="stat-label">Functions</div>
        </div>
        <div class="stat">
          <div class="stat-value ${getColorClass(report.unitTestCoverage.branches)}">${report.unitTestCoverage.branches}%</div>
          <div class="stat-label">Branches</div>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${report.e2eTestResults ? `
    <div class="card">
      <h2>🎭 E2E Test Results</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${report.e2eTestResults.total}</div>
          <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat">
          <div class="stat-value good">${report.e2eTestResults.passed}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value ${report.e2eTestResults.failed > 0 ? 'bad' : 'good'}">${report.e2eTestResults.failed}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat">
          <div class="stat-value ${getColorClass(parseFloat(report.e2eTestResults.passRate))}">${report.e2eTestResults.passRate}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
      </div>
    </div>
    ` : ''}
    
    <div class="card">
      <h2>📛 Badges</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">Use these badges in your README:</p>
      <code style="display: block; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-size: 0.75rem; overflow-x: auto;">
![Coverage](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/coverage.json)<br>
![Unit Tests](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/unit-tests.json)<br>
![E2E Tests](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/e2e-tests.json)
      </code>
    </div>
    
    <div class="footer">
      <p>TSiJUKEBOX Enterprise • <a href="https://github.com/B0yZ4kr14/TSiJUKEBOX">GitHub Repository</a></p>
    </div>
  </div>
</body>
</html>`;
}

function getColorClass(value) {
  if (value >= 80) return 'good';
  if (value >= 60) return 'warning';
  return 'bad';
}

generateCoverageReport();
