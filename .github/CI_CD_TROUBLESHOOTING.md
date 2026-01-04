# CI/CD Troubleshooting Guide

This document provides troubleshooting information for GitHub Actions workflows in the TSiJUKEBOX repository.

## Table of Contents

- [Common Issues](#common-issues)
- [Firewall and Network Issues](#firewall-and-network-issues)
- [Dependency Installation Issues](#dependency-installation-issues)
- [Build Failures](#build-failures)
- [Test Failures](#test-failures)
- [Playwright/E2E Issues](#playwrighte2e-issues)
- [Workflow Configuration](#workflow-configuration)

## Common Issues

### Issue: Workflows failing with "ENOTFOUND googlechromelabs.github.io"

**Symptoms:**
- `npm ci` or `npm install` fails
- Error message mentions `googlechromelabs.github.io`
- Playwright browser download fails

**Root Cause:**
Playwright tries to download Chromium browsers from `googlechromelabs.github.io` during installation, but GitHub Actions firewall may block this.

**Solution:**
All workflows have been updated to skip browser download during `npm install`:

```yaml
- name: Install dependencies
  run: npm ci --legacy-peer-deps
  env:
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1"

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

This separates dependency installation from browser installation, allowing npm to succeed even if external URLs are temporarily blocked.

### Issue: "Missing dependency @radix-ui/react-radio-group"

**Symptoms:**
- Build fails with import errors
- TypeScript errors about missing modules
- Reference to `@radix-ui/react-radio-group`

**Root Cause:**
This was a previous issue (Issue #29) that has been resolved. The dependency is present in package.json at line 40.

**Solution:**
1. Verify package.json contains: `"@radix-ui/react-radio-group": "^1.3.8"`
2. Run `npm install` to sync dependencies
3. Check that package-lock.json is up to date

**Status:** ✅ RESOLVED - Dependency is present and working

## Firewall and Network Issues

### GitHub Actions Firewall Behavior

GitHub Actions Copilot coding agent environment has firewall rules that may block certain external URLs:

**Blocked URLs:**
- `googlechromelabs.github.io` - Playwright browser downloads
- `github.com` (HTTP only) - Git operations fallback

**Workarounds:**

1. **Use HTTPS for Git operations** (default)
2. **Skip browser downloads during npm install** (implemented)
3. **Cache dependencies** to reduce external requests
4. **Configure allowlist** in repository settings (admin only)

### Configuring Allowlist (Admin Only)

Repository administrators can add URLs to the custom allowlist:

1. Go to [Repository Settings > Copilot > Coding Agent](https://github.com/B0yZ4kr14/tsijukebox/settings/copilot/coding_agent)
2. Add required URLs to allowlist:
   - `googlechromelabs.github.io`
   - Any other required external resources

### Actions Setup Steps

For workflows that need external resources, configure setup steps that run BEFORE the firewall is enabled:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Setup steps (run before firewall)
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # Install deps without Playwright browsers
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        env:
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1"
      
      # Cache Playwright browsers
      - uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
      
      # Install browsers separately
      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps chromium
```

## Dependency Installation Issues

### Issue: Peer dependency conflicts

**Symptoms:**
- `npm ci` fails with peer dependency errors
- Warnings about incompatible peer dependencies

**Solution:**
Use the `--legacy-peer-deps` flag:

```bash
npm ci --legacy-peer-deps
```

All workflows have been updated to use this flag.

### Issue: Package lock file out of sync

**Symptoms:**
- `npm ci` fails with "requires a lockfile version"
- Package versions don't match between package.json and package-lock.json

**Solution:**

```bash
# Delete existing lock file and node_modules
rm -rf node_modules package-lock.json

# Regenerate lock file
npm install

# Commit the updated lock file
git add package-lock.json
git commit -m "Update package-lock.json"
```

**Current Status:** ✅ Package-lock.json is in sync (version 4.2.0)

### Issue: npm audit fix --force breaks dependencies

**Problem:**
Running `npm audit fix --force` can upgrade major versions and break the build.

**What Happened (Issues #27, #28, #30):**
- Vite upgraded from 5.4.1 → 7.3.0 (breaking change)
- Vitest upgraded from 2.1.1 → 4.0.16 (breaking change)
- Radix UI components were removed

**Solution:**
1. **NEVER use** `npm audit fix --force`
2. **Use** `npm audit` to review vulnerabilities (read-only)
3. **Update manually** after testing:
   ```bash
   npm install package@specific-version
   npm run build
   npm run test
   ```

**Prevention:**
The `.npmrc` file has been configured to prevent automatic major version upgrades:

```ini
# Limit updates to patch versions only
save-prefix=~

# Require explicit install for security fixes
audit-level=moderate
```

## Build Failures

### Issue: "vite: not found" or build command fails

**Solution:**

```bash
# Clean install
rm -rf node_modules
npm ci --legacy-peer-deps

# Build
npm run build
```

### Issue: TypeScript errors during build

**Common Causes:**
1. Missing type definitions
2. Incorrect TypeScript configuration
3. Outdated dependencies

**Solution:**

```bash
# Check TypeScript without emitting files
npx tsc --noEmit

# Fix common issues
npm install --save-dev @types/node @types/react @types/react-dom
```

## Test Failures

### Issue: Vitest tests fail

**Debugging:**

```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run with UI
npm run test -- --ui
```

### Issue: Coverage threshold not met

**Current Threshold:** 70% minimum

**Check Coverage:**

```bash
npm run test -- --coverage
```

Review the coverage report in `coverage/vitest/index.html`

## Playwright/E2E Issues

### Issue: Playwright browsers not installed

**Symptoms:**
- E2E tests fail with "Browser executable not found"
- Error mentions Chromium not being installed

**Solution:**

```bash
# Install Playwright browsers
npx playwright install --with-deps chromium

# Or install all browsers
npx playwright install --with-deps
```

### Issue: E2E tests fail in headless mode

**Debugging:**

```bash
# Run with headed browser (local only)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Run specific test
npx playwright test tests/example.spec.ts
```

### Issue: Screenshots and artifacts not generated

**Check:**
1. Test is configured to capture screenshots on failure
2. `playwright-report/` directory exists
3. Workflow uploads artifacts correctly

```yaml
- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Workflow Configuration

### Standard Workflow Template

Use this template for new workflows:

```yaml
name: Example Workflow

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        env:
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1"
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm run test
```

### Caching Best Practices

**Node Modules:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**Playwright Browsers:**
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```

### Environment Variables

**Required:**
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` - Skip browser download during npm install
- `CI=true` - Indicate running in CI environment

**Optional:**
- `NODE_ENV=production` - For production builds
- `NODE_OPTIONS=--max-old-space-size=4096` - Increase memory for large builds

## Debugging Workflows

### View Workflow Logs

1. Go to [Actions tab](https://github.com/B0yZ4kr14/tsijukebox/actions)
2. Click on the failing workflow run
3. Click on the failed job
4. Review step-by-step logs

### Enable Debug Logging

Add these secrets to enable debug logging:
- `ACTIONS_RUNNER_DEBUG=true`
- `ACTIONS_STEP_DEBUG=true`

### Test Workflow Locally

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow
act -W .github/workflows/test-pipeline.yml
```

## Getting Help

### Internal Resources
- [Copilot Instructions](.github/copilot-instructions.md)
- [Setup Guide](../SETUP_AND_BUILD.md)
- [Contributing Guide](../CONTRIBUTING.md)

### External Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vitejs.dev/)

### Support Channels
- [GitHub Issues](https://github.com/B0yZ4kr14/tsijukebox/issues)
- [GitHub Discussions](https://github.com/B0yZ4kr14/tsijukebox/discussions)

## Status Dashboard

### Current Workflow Status

| Workflow | Status | Notes |
|----------|--------|-------|
| Deploy Pages | 🔧 Fixed | Now uses npm, skips Playwright during install |
| E2E Tests | 🔧 Fixed | Browser caching implemented |
| Test Pipeline | 🔧 Fixed | Playwright setup separated |
| CI/CD Pipeline | 🔧 Fixed | All dependency issues resolved |
| Coverage Dashboard | 🔧 Fixed | Vitest configured properly |
| Secret Scanning | ✅ Working | No changes needed |
| CodeQL | ✅ Working | No changes needed |
| Accessibility | 🔧 Fixed | Dependencies updated |

### Known Working Configurations

- **Node.js:** v20.x
- **npm:** 10.x
- **Playwright:** Latest (installed via npx)
- **Package Manager:** npm (not pnpm or yarn)

---

**Last Updated:** 2026-01-04  
**Maintained By:** TSiJUKEBOX Development Team
