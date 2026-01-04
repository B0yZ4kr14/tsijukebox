#!/usr/bin/env node

/**
 * TSiJUKEBOX Health Check Script
 * Verifies project integrity and generates a health report
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log('\n' + '═'.repeat(60), 'cyan');
  log(` ${title}`, 'bright');
  log('═'.repeat(60) + '\n', 'cyan');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Track health status
let healthIssues = [];
let healthWarnings = [];
let healthChecks = 0;

// Helper to run commands safely
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (err) {
    return { success: false, error: err.message, output: err.stdout || '' };
  }
}

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

// Check Node.js version
function checkNodeVersion() {
  header('Node.js Environment');
  healthChecks++;

  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  info(`Node.js version: ${nodeVersion}`);

  if (majorVersion >= 20) {
    success('Node.js version is compatible (>= 20)');
  } else if (majorVersion >= 18) {
    warning('Node.js version is older than recommended. Consider upgrading to v20+');
    healthWarnings.push('Node.js version should be >= 20');
  } else {
    error('Node.js version is too old (< 18)');
    healthIssues.push('Node.js version must be >= 18');
  }
}

// Check package.json
function checkPackageJson() {
  header('Package Configuration');
  healthChecks++;

  if (fileExists('package.json')) {
    success('package.json found');
    
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
      info(`Project: ${pkg.name} v${pkg.version}`);
      
      // Check for required scripts
      const requiredScripts = ['build', 'lint', 'test'];
      const missingScripts = requiredScripts.filter(script => !pkg.scripts?.[script]);
      
      if (missingScripts.length === 0) {
        success('All required scripts are defined');
      } else {
        warning(`Missing scripts: ${missingScripts.join(', ')}`);
        healthWarnings.push(`Missing scripts: ${missingScripts.join(', ')}`);
      }
    } catch (err) {
      error(`Failed to parse package.json: ${err.message}`);
      healthIssues.push('Invalid package.json');
    }
  } else {
    error('package.json not found');
    healthIssues.push('package.json is missing');
  }
}

// Check dependencies
function checkDependencies() {
  header('Dependencies');
  healthChecks++;

  info('Checking node_modules...');
  
  if (fileExists('node_modules')) {
    success('node_modules directory exists');
    
    // Check if package-lock.json or other lock files exist
    const lockFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'];
    const existingLockFiles = lockFiles.filter(file => fileExists(file));
    
    if (existingLockFiles.length > 0) {
      success(`Lock file found: ${existingLockFiles.join(', ')}`);
    } else {
      warning('No lock file found. Run npm install to generate one.');
      healthWarnings.push('Missing package lock file');
    }
  } else {
    error('node_modules not found. Run npm install');
    healthIssues.push('Dependencies not installed');
  }
}

// Check TypeScript configuration
function checkTypeScript() {
  header('TypeScript Configuration');
  healthChecks++;

  if (fileExists('tsconfig.json')) {
    success('tsconfig.json found');
    
    info('Running TypeScript type check...');
    // Try npm run typecheck first, then fallback to npx tsc
    let result = runCommand('npm run typecheck', { silent: true });
    if (!result.success) {
      result = runCommand('npx tsc --noEmit', { silent: true });
    }
    
    if (result.success || result.output.includes('Found 0 errors')) {
      success('TypeScript type check passed');
    } else {
      warning('TypeScript type check found issues');
      healthWarnings.push('TypeScript has type errors');
    }
  } else {
    warning('tsconfig.json not found');
    healthWarnings.push('TypeScript not configured');
  }
}

// Check linting
function checkLinting() {
  header('Code Quality (Linting)');
  healthChecks++;

  if (fileExists('eslint.config.js') || fileExists('.eslintrc.json') || fileExists('.eslintrc.js')) {
    success('ESLint configuration found');
    
    info('Running ESLint...');
    const result = runCommand('npm run lint', { silent: true });
    
    if (result.success) {
      success('ESLint passed with no errors');
    } else {
      warning('ESLint found issues (run "npm run lint" for details)');
      healthWarnings.push('ESLint has warnings or errors');
    }
  } else {
    warning('ESLint not configured');
    healthWarnings.push('ESLint not configured');
  }
}

// Check build
function checkBuild() {
  header('Build System');
  healthChecks++;

  info('Checking if project can build...');
  const result = runCommand('npm run build', { silent: true });
  
  if (result.success) {
    success('Build succeeded');
    
    // Check build output
    if (fileExists('dist') || fileExists('build')) {
      success('Build output directory exists');
    } else {
      warning('Build output directory not found');
    }
  } else {
    error('Build failed (run "npm run build" for details)');
    healthIssues.push('Build is failing');
  }
}

// Check Git configuration
function checkGit() {
  header('Git Configuration');
  healthChecks++;

  if (fileExists('.git')) {
    success('Git repository initialized');
    
    const result = runCommand('git status --porcelain', { silent: true });
    if (result.success) {
      const changes = result.output.trim();
      if (changes) {
        info('Working directory has uncommitted changes');
      } else {
        success('Working directory is clean');
      }
    }
  } else {
    warning('Not a git repository');
    healthWarnings.push('Not in a git repository');
  }

  // Check for Husky
  if (fileExists('.husky')) {
    success('Husky git hooks configured');
  } else {
    info('Husky not installed (optional)');
  }
}

// Check configuration files
function checkConfigFiles() {
  header('Configuration Files');
  healthChecks++;

  const configFiles = {
    '.nvmrc': 'Node version specification',
    '.prettierrc': 'Prettier configuration',
    '.editorconfig': 'EditorConfig',
    'renovate.json': 'Renovate Bot configuration',
    '.vscode/settings.json': 'VS Code settings',
  };

  for (const [file, description] of Object.entries(configFiles)) {
    if (fileExists(file)) {
      success(`${description}: ${file}`);
    } else {
      info(`${description} not found: ${file} (optional)`);
    }
  }
}

// Generate health report
function generateReport() {
  header('Health Report Summary');

  log(`\nTotal checks performed: ${healthChecks}`, 'bright');
  
  if (healthIssues.length === 0 && healthWarnings.length === 0) {
    log('\n🎉 PROJECT HEALTH: EXCELLENT', 'green');
    log('All checks passed! Your project is in great shape.', 'green');
    return 0;
  } else if (healthIssues.length === 0) {
    log('\n⚠️  PROJECT HEALTH: GOOD', 'yellow');
    log(`Found ${healthWarnings.length} warnings (but no critical issues)`, 'yellow');
    
    if (healthWarnings.length > 0) {
      log('\nWarnings:', 'yellow');
      healthWarnings.forEach(w => log(`  • ${w}`, 'yellow'));
    }
    return 0;
  } else {
    log('\n❌ PROJECT HEALTH: NEEDS ATTENTION', 'red');
    log(`Found ${healthIssues.length} critical issues and ${healthWarnings.length} warnings`, 'red');
    
    if (healthIssues.length > 0) {
      log('\nCritical Issues:', 'red');
      healthIssues.forEach(i => log(`  • ${i}`, 'red'));
    }
    
    if (healthWarnings.length > 0) {
      log('\nWarnings:', 'yellow');
      healthWarnings.forEach(w => log(`  • ${w}`, 'yellow'));
    }
    
    return 1;
  }
}

// Main execution
async function main() {
  log('\n🏥 TSiJUKEBOX Health Check', 'bright');
  log('════════════════════════════════════════════════════════════\n', 'cyan');

  checkNodeVersion();
  checkPackageJson();
  checkDependencies();
  checkTypeScript();
  checkLinting();
  checkGit();
  checkConfigFiles();
  checkBuild();

  const exitCode = generateReport();
  
  log('\n' + '═'.repeat(60) + '\n', 'cyan');
  
  process.exit(exitCode);
}

main().catch((err) => {
  error(`Health check failed with error: ${err.message}`);
  process.exit(1);
});
