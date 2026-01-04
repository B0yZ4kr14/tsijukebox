# YouTube Music Context

## Overview
React Context for managing YouTube Music integration state, authentication, token refresh, and API client configuration.

## Import

```typescript
import { YouTubeMusicProvider, useYouTubeMusic } from '@/contexts/YouTubeMusicContext';
```

## Type Definitions

```typescript
interface YouTubeMusicSettings {
  clientId: string;
  clientSecret: string;
  tokens: YouTubeMusicTokens | null;
  user: YouTubeMusicUser | null;
  isConnected: boolean;
}

interface YouTubeMusicContextType {
  youtubeMusic: YouTubeMusicSettings;
  setYouTubeMusicCredentials: (clientId: string, clientSecret: string) => void;
  setYouTubeMusicTokens: (tokens: YouTubeMusicTokens | null) => void;
  setYouTubeMusicUser: (user: YouTubeMusicUser | null) => void;
  clearYouTubeMusicAuth: () => void;
}
```

## Provider Usage

```typescript
import { YouTubeMusicProvider } from '@/contexts/YouTubeMusicContext';

function App() {
  return (
    <YouTubeMusicProvider>
      <YourApp />
    </YouTubeMusicProvider>
  );
}
```

## Hook Usage

```typescript
function YouTubeMusicIntegration() {
  const {
    youtubeMusic,
    setYouTubeMusicCredentials,
    setYouTubeMusicTokens,
    setYouTubeMusicUser,
    clearYouTubeMusicAuth
  } = useYouTubeMusic();

  const handleConnect = () => {
    setYouTubeMusicCredentials('client-id', 'client-secret');
  };

  return (
    <div>
      {youtubeMusic.isConnected ? (
        <>
          <p>Connected as: {youtubeMusic.user?.name}</p>
          <button onClick={clearYouTubeMusicAuth}>Disconnect</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect YouTube Music</button>
      )}
    </div>
  );
}
```

## State Management

### Storage
- **Key**: `tsi_jukebox_youtube_music`
- **Location**: localStorage
- **Persistence**: Automatic on state change

### Default State
```typescript
{
  clientId: '',
  clientSecret: '',
  tokens: null,
  user: null,
  isConnected: false
}
```

## Methods

### setYouTubeMusicCredentials(clientId, clientSecret)
Sets YouTube Music OAuth credentials.

**Parameters:**
- `clientId: string` - YouTube Music OAuth Client ID
- `clientSecret: string` - YouTube Music OAuth Client Secret

**Side Effects:**
- Updates youtubeMusicClient credentials
- Persists to localStorage

### setYouTubeMusicTokens(tokens)
Sets or clears authentication tokens.

**Parameters:**
- `tokens: YouTubeMusicTokens | null` - OAuth tokens or null to clear

**Token Structure:**
```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

**Side Effects:**
- Syncs with youtubeMusicClient
- Updates isConnected status
- Persists to localStorage

### setYouTubeMusicUser(user)
Updates current YouTube Music user.

**Parameters:**
- `user: YouTubeMusicUser | null` - User profile data

### clearYouTubeMusicAuth()
Clears all authentication data.

**Side Effects:**
- Clears client tokens
- Resets user data
- Sets isConnected to false
- Updates localStorage

## Token Management Features

### Automatic Token Validation
On app load, validates saved tokens:

```typescript
useEffect(() => {
  validateSavedToken();
}, [settings.tokens, settings.isConnected]);
```

### Expiration Check
```typescript
if (settings.tokens.expiresAt < Date.now()) {
  // Token expired - attempt refresh
  const newTokens = await youtubeMusicClient.refreshTokens();
  setYouTubeMusicTokens(newTokens);
}
```

### Automatic Token Refresh
If token is expired or invalid:
1. Attempts refresh using refreshToken
2. Updates tokens on success
3. Clears auth and shows toast on failure

### Token Validation
Makes API call to validate token:

```typescript
const user = await youtubeMusicClient.validateToken();
if (!user) {
  // Token invalid - try refresh or clear
}
```

## Notifications

Uses Sonner toast for user feedback:

```typescript
toast.warning('Sessão do YouTube Music expirada. Por favor, reconecte sua conta.');
toast.warning('Token do YouTube Music inválido. Por favor, reconecte sua conta.');
```

## Example: Complete Auth Flow

```typescript
function YouTubeMusicAuth() {
  const {
    youtubeMusic,
    setYouTubeMusicCredentials,
    setYouTubeMusicTokens,
    clearYouTubeMusicAuth
  } = useYouTubeMusic();

  // Step 1: Initialize credentials
  const startAuth = () => {
    setYouTubeMusicCredentials(
      import.meta.env.VITE_YOUTUBE_CLIENT_ID,
      import.meta.env.VITE_YOUTUBE_CLIENT_SECRET
    );
    // Redirect to OAuth URL
    window.location.href = getYouTubeAuthUrl();
  };

  // Step 2: Handle callback
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code && !youtubeMusic.isConnected) {
      exchangeCodeForTokens(code).then(setYouTubeMusicTokens);
    }
  }, []);

  // Step 3: Automatic token refresh handled by context

  return (
    <div>
      {youtubeMusic.isConnected ? (
        <button onClick={clearYouTubeMusicAuth}>Disconnect</button>
      ) : (
        <button onClick={startAuth}>Connect YouTube Music</button>
      )}
    </div>
  );
}
```

## Error Handling

```typescript
try {
  const user = await youtubeMusicClient.validateToken();
  if (!user) {
    // Try refresh before clearing
    if (tokens.refreshToken) {
      const newTokens = await youtubeMusicClient.refreshTokens();
      setYouTubeMusicTokens(newTokens);
    } else {
      clearYouTubeMusicAuth();
    }
  }
} catch (error) {
  console.warn('Token validation failed:', error);
  clearYouTubeMusicAuth();
}
```

## Lifecycle

1. **Mount**: Load settings from localStorage
2. **Sync**: Sync tokens and credentials with client
3. **Validate**: Validate token on first load (once)
4. **Refresh**: Auto-refresh expired tokens
5. **Persist**: Save state changes to localStorage
6. **Unmount**: No cleanup needed (persisted)

## See Also
- [SpotifyContext](/docs/contexts/SPOTIFY_CONTEXT.md)
- [YouTube Music API Integration](/docs/integrations/YOUTUBE_API.md)
- [OAuth Flow Documentation](/docs/guides/OAUTH_FLOW.md)
