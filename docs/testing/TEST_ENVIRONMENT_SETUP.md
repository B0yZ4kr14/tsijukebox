# Test Environment Setup

## Overview
Guide for setting up local and CI test environments for TSiJUKEBOX.

## Prerequisites

### Node.js & Package Manager
```bash
node --version  # v20+
npm --version   # 10+
```

### Supabase CLI
```bash
npm install -g supabase
supabase --version
```

### Playwright (for E2E)
```bash
npx playwright install
```

## Local Environment

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.test`:
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_TEST_MODE=true
```

### 3. Start Supabase Local
```bash
supabase start
```

### 4. Run Tests
```bash
npm test            # Unit tests
npm test:e2e        # E2E tests
npm test:coverage   # Coverage report
```

## CI Environment (GitHub Actions)

### Workflow Configuration
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
```

## Test Database

### Reset Database
```bash
supabase db reset
```

### Seed Test Data
```bash
supabase seed
```

## Mock Services

### MSW (Mock Service Worker)
Used for API mocking in tests.

### Vitest Mocks
Used for module mocking.

## See Also
- [Unit Tests](/docs/testing/UNIT_TESTS.md)
- [E2E Tests](/docs/testing/E2E_TESTS.md)
- [CI/CD](/docs/CI-CD.md)
