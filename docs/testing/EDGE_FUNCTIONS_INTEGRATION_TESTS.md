# Edge Functions Integration Tests

## Overview
Integration tests for Supabase Edge Functions to ensure end-to-end functionality.

## Test Categories

### API Integration
- Request/response validation
- Error handling
- CORS functionality
- Authentication flows

### Database Integration
- Data persistence
- Query performance
- Transaction handling
- RLS policies

### External Services
- Third-party API calls
- Webhook delivery
- File storage operations
- Email sending

## Test Framework
- **Framework**: Vitest / Playwright
- **Location**: `src/test/edge-functions/`
- **Tools**: Supabase CLI, Mock services

## Running Tests

```bash
npm test edge-functions:integration
```

## Example Test

```typescript
describe('lyrics-search integration', () => {
  it('should fetch lyrics from LRCLIB', async () => {
    const response = await fetch('/functions/v1/lyrics-search', {
      method: 'POST',
      body: JSON.stringify({
        trackName: 'Test Track',
        artistName: 'Test Artist'
      })
    });
    
    const data = await response.json();
    expect(data.source).toBe('lrclib');
  });
});
```

## See Also
- [Unit Tests](/docs/testing/EDGE_FUNCTIONS_UNIT_TESTS.md)
- [Test Environment](/docs/testing/TEST_ENVIRONMENT_SETUP.md)
