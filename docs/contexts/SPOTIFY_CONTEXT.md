# Spotify Context

## Overview
React Context for managing Spotify integration state, authentication, and API client configuration.

## Import

```typescript
import { SpotifyProvider, useSpotify } from '@/contexts/SpotifyContext';
```

## Type Definitions

```typescript
interface SpotifySettings {
  clientId: string;
  clientSecret: string;
  tokens: SpotifyTokens | null;
  user: SpotifyUser | null;
  isConnected: boolean;
}

interface SpotifyContextType {
  spotify: SpotifySettings;
  setSpotifyCredentials: (clientId: string, clientSecret: string) => void;
  setSpotifyTokens: (tokens: SpotifyTokens | null) => void;
  setSpotifyUser: (user: SpotifyUser | null) => void;
  clearSpotifyAuth: () => void;
}
```

## Provider Usage

```typescript
import { SpotifyProvider } from '@/contexts/SpotifyContext';

function App() {
  return (
    <SpotifyProvider>
      <YourApp />
    </SpotifyProvider>
  );
}
```

## Hook Usage

```typescript
function SpotifyIntegration() {
  const {
    spotify,
    setSpotifyCredentials,
    setSpotifyTokens,
    setSpotifyUser,
    clearSpotifyAuth
  } = useSpotify();

  const handleConnect = () => {
    setSpotifyCredentials('client-id', 'client-secret');
  };

  const handleDisconnect = () => {
    clearSpotifyAuth();
  };

  return (
    <div>
      {spotify.isConnected ? (
        <>
          <p>Connected as: {spotify.user?.display_name}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect Spotify</button>
      )}
    </div>
  );
}
```

## State Management

### Storage
- **Key**: `tsi_jukebox_spotify`
- **Location**: localStorage
- **Persistence**: Automatic

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

### setSpotifyCredentials(clientId, clientSecret)
Sets Spotify OAuth credentials.

**Parameters:**
- `clientId: string` - Spotify OAuth Client ID
- `clientSecret: string` - Spotify OAuth Client Secret

**Side Effects:**
- Updates spotifyClient credentials
- Persists to localStorage

### setSpotifyTokens(tokens)
Sets or clears authentication tokens.

**Parameters:**
- `tokens: SpotifyTokens | null` - OAuth tokens or null to clear

**Token Structure:**
```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

### setSpotifyUser(user)
Updates current Spotify user.

**Parameters:**
- `user: SpotifyUser | null` - User profile data

### clearSpotifyAuth()
Clears all authentication data.

**Side Effects:**
- Clears tokens
- Clears user data
- Sets isConnected to false
- Updates localStorage

## Integration with useMediaProviderStorage

Leverages the generic media provider storage hook:

```typescript
useMediaProviderStorage<SpotifySettings, SpotifyTokens, SpotifyUser | null, SpotifyCredentials>({
  storageKey: 'tsi_jukebox_spotify',
  defaultSettings: defaultSpotifySettings,
  client: spotifyClient,
  getTokens: (s) => s.tokens,
  getCredentials: (s) => ({ clientId: s.clientId, clientSecret: s.clientSecret }),
  isConnected: (s) => s.isConnected,
})
```

## Example: Full Authentication Flow

```typescript
function SpotifyAuth() {
  const { spotify, setSpotifyCredentials, setSpotifyTokens } = useSpotify();
  const [authUrl, setAuthUrl] = useState<string>('');

  // Step 1: Set credentials
  const initAuth = () => {
    setSpotifyCredentials(
      import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
    );
    // Generate auth URL and redirect
    const url = generateSpotifyAuthUrl();
    window.location.href = url;
  };

  // Step 2: Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code && !spotify.isConnected) {
      exchangeCodeForTokens(code).then(tokens => {
        setSpotifyTokens(tokens);
      });
    }
  }, []);

  return (
    <button onClick={initAuth} disabled={spotify.isConnected}>
      Connect Spotify
    </button>
  );
}
```

## Error Handling

```typescript
try {
  setSpotifyTokens(tokens);
} catch (error) {
  console.error('Failed to set Spotify tokens:', error);
  // Tokens may fail validation
  clearSpotifyAuth();
}
```

## See Also
- [YouTubeMusicContext](/docs/contexts/YOUTUBE_MUSIC_CONTEXT.md)
- [useMediaProviderStorage](/docs/hooks/USEMEDIAPROVIDER.md)
- [Spotify API Integration](/docs/integrations/SPOTIFY_API.md)
