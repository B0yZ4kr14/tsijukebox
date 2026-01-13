# Edge Functions Unit Tests

## Overview
Unit tests for individual Supabase Edge Functions to ensure isolated functionality.

## Test Categories

### Input Validation
- Request schema validation
- Parameter sanitization
- Type checking
- Boundary conditions

### Business Logic
- Core function behavior
- Error conditions
- Edge cases
- Return values

### Utilities
- Helper functions
- Data transformations
- Format conversions

## Test Framework
- **Framework**: Vitest
- **Location**: `src/test/edge-functions/__tests__/`
- **Mocking**: VI Mock, MSW

## Running Tests

```bash
npm test edge-functions:unit
```

## Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('lyrics-search validation', () => {
  it('should reject empty trackName', async () => {
    const result = validateRequest({
      trackName: '',
      artistName: 'Artist'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('trackName is required');
  });
});
```

## Mocking External Services

```typescript
vi.mock('https://lrclib.net/api/get', () => ({
  fetch: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ syncedLyrics: '[00:00.00]Test' })
  })
}));
```

## See Also
- [Integration Tests](/docs/testing/EDGE_FUNCTIONS_INTEGRATION_TESTS.md)
- [Test Coverage](/docs/testing/TEST_COVERAGE_90_ACTION_PLAN.md)
