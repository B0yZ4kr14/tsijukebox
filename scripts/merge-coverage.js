#!/usr/bin/env node
/**
 * Script para combinar relatórios de cobertura Vitest + Playwright
 * Gera relatório unificado em coverage/combined/
 */
const fs = require('fs');
const path = require('path');

const COVERAGE_DIRS = {
  vitest: './coverage/vitest',
  playwright: './coverage/playwright',
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
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
  }
  return null;
}

function generateCoverageReport() {
  console.log('📊 Merging coverage reports...\n');
  
  ensureDir(COVERAGE_DIRS.combined);
  
  // Read Vitest coverage summary
  const vitestSummary = readJsonSafe(path.join(COVERAGE_DIRS.vitest, 'coverage-summary.json'));
  
  // Read Playwright results
  const playwrightResults = readJsonSafe(path.join(COVERAGE_DIRS.playwright, 'results.json'));
  
  const report = {
    generatedAt: new Date().toISOString(),
    vitest: {
      available: !!vitestSummary,
      summary: vitestSummary?.total || null,
    },
    playwright: {
      available: !!playwrightResults,
      stats: playwrightResults?.stats || null,
      passed: playwrightResults?.stats?.expected || 0,
      failed: playwrightResults?.stats?.unexpected || 0,
      skipped: playwrightResults?.stats?.skipped || 0,
    },
  };

  // Calculate combined metrics
  if (vitestSummary?.total) {
    const { lines, statements, functions, branches } = vitestSummary.total;
    report.unitTestCoverage = {
      lines: lines?.pct || 0,
      statements: statements?.pct || 0,
      functions: functions?.pct || 0,
      branches: branches?.pct || 0,
    };
  }

  if (playwrightResults?.stats) {
    const { expected, unexpected, skipped } = playwrightResults.stats;
    const total = expected + unexpected + skipped;
    report.e2eTestResults = {
      total,
      passed: expected,
      failed: unexpected,
      skipped,
      passRate: total > 0 ? ((expected / total) * 100).toFixed(2) : 0,
    };
  }

  // Write combined report
  const reportPath = path.join(COVERAGE_DIRS.combined, 'coverage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML summary
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(path.join(COVERAGE_DIRS.combined, 'index.html'), htmlReport);
  
  // Calculate total coverage for badge
  const totalCoverage = report.unitTestCoverage 
    ? Math.round((report.unitTestCoverage.lines + report.unitTestCoverage.functions + report.unitTestCoverage.branches) / 3)
    : 0;
  
  // Generate badge JSON
  const badgeColor = totalCoverage >= 80 ? 'brightgreen' : totalCoverage >= 60 ? 'yellow' : 'red';
  const badgeData = {
    schemaVersion: 1,
    label: 'coverage',
    message: `${totalCoverage}%`,
    color: badgeColor,
    totalCoverage,
  };
  
  const badgePath = path.join(COVERAGE_DIRS.combined, 'badge.json');
  fs.writeFileSync(badgePath, JSON.stringify(badgeData, null, 2));
  
  // Write summary.json for CI
  const summaryData = {
    totalCoverage,
    unitTests: report.unitTestCoverage || null,
    e2eTests: report.e2eTestResults || null,
  };
  fs.writeFileSync(path.join(COVERAGE_DIRS.combined, 'summary.json'), JSON.stringify(summaryData, null, 2));
  
  console.log('✅ Coverage reports merged successfully!\n');
  console.log(`📁 Combined report: ${COVERAGE_DIRS.combined}/index.html`);
  console.log(`📁 JSON report: ${reportPath}`);
  console.log(`📁 Badge JSON: ${badgePath}\n`);
  
  // Print summary
  if (report.unitTestCoverage) {
    console.log('📈 Unit Test Coverage:');
    console.log(`   Lines: ${report.unitTestCoverage.lines}%`);
    console.log(`   Functions: ${report.unitTestCoverage.functions}%`);
    console.log(`   Branches: ${report.unitTestCoverage.branches}%\n`);
  }
  
  if (report.e2eTestResults) {
    console.log('🧪 E2E Test Results:');
    console.log(`   Passed: ${report.e2eTestResults.passed}/${report.e2eTestResults.total}`);
    console.log(`   Failed: ${report.e2eTestResults.failed}`);
    console.log(`   Pass Rate: ${report.e2eTestResults.passRate}%\n`);
  }
  
  console.log(`📊 Total Coverage: ${totalCoverage}%`);
}

function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TSI Jukebox - Coverage Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #22d3ee; }
    .subtitle { color: #737373; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 0.75rem; padding: 1.5rem; }
    .card h2 { font-size: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .metric { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #262626; }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #a3a3a3; }
    .metric-value { font-weight: 600; }
    .metric-value.good { color: #22c55e; }
    .metric-value.warning { color: #eab308; }
    .metric-value.bad { color: #ef4444; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge.success { background: #22c55e20; color: #22c55e; }
    .badge.error { background: #ef444420; color: #ef4444; }
    .badge.info { background: #3b82f620; color: #3b82f6; }
    .timestamp { text-align: center; margin-top: 2rem; color: #525252; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 TSI Jukebox Coverage Report</h1>
    <p class="subtitle">Relatório combinado de testes unitários e E2E</p>
    
    <div class="grid">
      <div class="card">
        <h2>🧪 Unit Tests (Vitest)</h2>
        ${report.vitest.available ? `
          <div class="metric">
            <span class="metric-label">Lines</span>
            <span class="metric-value ${getColorClass(report.unitTestCoverage?.lines)}">${report.unitTestCoverage?.lines || 0}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Statements</span>
            <span class="metric-value ${getColorClass(report.unitTestCoverage?.statements)}">${report.unitTestCoverage?.statements || 0}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Functions</span>
            <span class="metric-value ${getColorClass(report.unitTestCoverage?.functions)}">${report.unitTestCoverage?.functions || 0}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Branches</span>
            <span class="metric-value ${getColorClass(report.unitTestCoverage?.branches)}">${report.unitTestCoverage?.branches || 0}%</span>
          </div>
        ` : '<p style="color: #737373;">No coverage data available</p>'}
      </div>
      
      <div class="card">
        <h2>🎭 E2E Tests (Playwright)</h2>
        ${report.playwright.available ? `
          <div class="metric">
            <span class="metric-label">Total Tests</span>
            <span class="metric-value">${report.e2eTestResults?.total || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Passed</span>
            <span class="metric-value good">${report.e2eTestResults?.passed || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Failed</span>
            <span class="metric-value ${report.e2eTestResults?.failed > 0 ? 'bad' : 'good'}">${report.e2eTestResults?.failed || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Pass Rate</span>
            <span class="metric-value ${getColorClass(parseFloat(report.e2eTestResults?.passRate))}">${report.e2eTestResults?.passRate || 0}%</span>
          </div>
        ` : '<p style="color: #737373;">No E2E results available</p>'}
      </div>
    </div>
    
    <p class="timestamp">Generated at: ${report.generatedAt}</p>
  </div>
</body>
</html>`;
}

function getColorClass(value) {
  if (value >= 80) return 'good';
  if (value >= 50) return 'warning';
  return 'bad';
}

// Run the script
generateCoverageReport();
