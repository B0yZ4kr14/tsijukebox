# Contexts Tests

## Overview
Testing suite for React Contexts used throughout the TSiJUKEBOX application.

## Test Coverage

### Authentication Context
- User state management
- Login/logout flows
- Session persistence
- Role-based access

### Theme Context
- Theme switching
- Dark/light modes
- Custom themes
- Persistence

### Settings Context
- Configuration management
- User preferences
- Local storage sync

### Player Context
- Playback state
- Queue management
- Track metadata

## Test Framework
- **Framework**: Vitest
- **Location**: `src/test/contexts/`
- **Utilities**: React Testing Library

## Running Tests

```bash
npm test contexts
```

## Example Test

```typescript
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';

describe('AuthContext', () => {
  it('should provide auth state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeDefined();
  });
});
```

## See Also
- [Testing Guide](/docs/testing/UNIT_TESTS.md)
- [Integration Tests](/docs/testing/INTEGRATION_TESTS.md)
