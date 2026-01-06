# useAuthConfig Hook

## Overview
React hook for managing authentication provider configuration with persistent storage.

## Import

```typescript
import { useAuthConfig } from '@/hooks/auth';
```

## Type Definitions

```typescript
interface AuthConfig {
  provider: AuthProvider;  // 'local' | 'supabase'
}

interface AuthConfigResult {
  authConfig: AuthConfig;
  setProvider: (provider: AuthProvider) => void;
}
```

## Usage

```typescript
function AuthSettings() {
  const { authConfig, setProvider } = useAuthConfig();

  const handleProviderChange = (provider: 'local' | 'supabase') => {
    setProvider(provider);
  };

  return (
    <div>
      <h2>Current Provider: {authConfig.provider}</h2>
      <button onClick={() => handleProviderChange('local')}>
        Use Local Auth
      </button>
      <button onClick={() => handleProviderChange('supabase')}>
        Use Supabase Auth
      </button>
    </div>
  );
}
```

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `authConfig` | `AuthConfig` | Current auth configuration |
| `setProvider` | `(provider) => void` | Update auth provider |

## Features

### Persistent Storage
- Configuration saved to `localStorage`
- Survives page refreshes
- Auto-loads on mount

### Default Configuration
```typescript
{
  provider: 'local'  // Default to local auth
}
```

### Storage Key
```typescript
'auth_config'  // localStorage key
```

## Provider Types

### Local Provider
- Development/demo authentication
- No external dependencies
- Session-based storage

### Supabase Provider
- Production authentication
- Database-backed users
- Full auth features

## Example: Dynamic Auth Switch

```typescript
function App() {
  const { authConfig, setProvider } = useAuthConfig();
  const isProduction = import.meta.env.PROD;

  useEffect(() => {
    // Auto-select provider based on environment
    if (isProduction) {
      setProvider('supabase');
    } else {
      setProvider('local');
    }
  }, [isProduction]);

  return <AuthProvider config={authConfig} />;
}
```

## Example: Provider Toggle

```typescript
function AuthToggle() {
  const { authConfig, setProvider } = useAuthConfig();

  const toggleProvider = () => {
    const newProvider = authConfig.provider === 'local' 
      ? 'supabase' 
      : 'local';
    setProvider(newProvider);
  };

  return (
    <button onClick={toggleProvider}>
      {authConfig.provider === 'local' ? '🔓 Local' : '🔐 Supabase'}
    </button>
  );
}
```

## Error Handling

### Storage Errors
- `loadAuthConfig()`: Returns default on parse error
- `saveAuthConfig()`: Silently ignores storage errors
- No exceptions thrown

### Missing Storage
- Falls back to default configuration
- Safe for incognito/private browsing

## Best Practices

1. **Set once at app startup**
   ```typescript
   useEffect(() => {
     setProvider('supabase');
   }, []);
   ```

2. **Check before auth operations**
   ```typescript
   const { authConfig } = useAuthConfig();
   if (authConfig.provider === 'supabase') {
     // Use Supabase auth
   } else {
     // Use local auth
   }
   ```

3. **Combine with other auth hooks**
   ```typescript
   const { authConfig } = useAuthConfig();
   const localAuth = useLocalAuth();
   const supabaseAuth = useSupabaseAuth();
   
   const auth = authConfig.provider === 'local' ? localAuth : supabaseAuth;
   ```

## See Also
- [useLocalAuth](/docs/hooks/USE_LOCAL_AUTH.md)
- [useSupabaseAuth](/docs/hooks/USE_SUPABASE_AUTH.md)
