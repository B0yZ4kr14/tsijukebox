# TSiJUKEBOX API Reference

Complete reference for all APIs, hooks, and edge functions.

---

## 📋 Table of Contents

1. [React Hooks](#react-hooks)
2. [API Clients](#api-clients)
3. [Edge Functions](#edge-functions)
4. [Type Definitions](#type-definitions)

---

## React Hooks

### Authentication Hooks

#### `useAuthConfig`

Manages authentication provider configuration.

```typescript
import { useAuthConfig } from '@/hooks/auth';

const {
  provider,        // 'supabase' | 'local'
  setProvider,     // (provider: AuthProvider) => void
  isSupabase,      // boolean
  isLocal,         // boolean
} = useAuthConfig();
```

#### `useLocalAuth`

Local authentication without Supabase.

```typescript
import { useLocalAuth } from '@/hooks/auth';

const {
  user,            // LocalUser | null
  isAuthenticated, // boolean
  login,           // (username: string, password: string) => Promise<boolean>
  logout,          // () => void
  register,        // (userData: RegisterData) => Promise<boolean>
} = useLocalAuth();
```

#### `useSupabaseAuth`

Supabase-based authentication.

```typescript
import { useSupabaseAuth } from '@/hooks/auth';

const {
  user,            // User | null
  session,         // Session | null
  isLoading,       // boolean
  signIn,          // (email: string, password: string) => Promise<void>
  signUp,          // (email: string, password: string) => Promise<void>
  signOut,         // () => Promise<void>
} = useSupabaseAuth();
```

---

### Player Hooks

#### `usePlayer`

Core music player state and controls.

```typescript
import { usePlayer } from '@/hooks/player';

const {
  // State
  currentTrack,    // Track | null
  isPlaying,       // boolean
  progress,        // number (0-100)
  duration,        // number (seconds)
  
  // Actions
  play,            // (track: Track) => void
  pause,           // () => void
  resume,          // () => void
  seek,            // (position: number) => void
  next,            // () => void
  previous,        // () => void
} = usePlayer();
```

#### `useVolume`

Volume control hook.

```typescript
import { useVolume } from '@/hooks/player';

const {
  volume,          // number (0-100)
  isMuted,         // boolean
  setVolume,       // (volume: number) => void
  mute,            // () => void
  unmute,          // () => void
  toggleMute,      // () => void
} = useVolume();
```

#### `useLyrics`

Synchronized lyrics fetching and display.

```typescript
import { useLyrics } from '@/hooks/player';

const {
  lyrics,          // LyricLine[] | null
  currentLine,     // number
  isLoading,       // boolean
  error,           // Error | null
  fetchLyrics,     // (track: Track) => Promise<void>
} = useLyrics(currentTrack);
```

#### `useLibrary`

Music library management.

```typescript
import { useLibrary } from '@/hooks/player';

const {
  tracks,          // Track[]
  albums,          // Album[]
  artists,         // Artist[]
  isLoading,       // boolean
  search,          // (query: string) => Track[]
  addFolder,       // (path: string) => Promise<void>
  rescan,          // () => Promise<void>
} = useLibrary();
```

---

### Spotify Hooks

#### `useSpotifyPlayer`

Spotify playback control.

```typescript
import { useSpotifyPlayer } from '@/hooks/spotify';

const {
  isConnected,     // boolean
  currentTrack,    // SpotifyTrack | null
  isPlaying,       // boolean
  play,            // (uri: string) => Promise<void>
  pause,           // () => Promise<void>
  next,            // () => Promise<void>
  previous,        // () => Promise<void>
  seek,            // (positionMs: number) => Promise<void>
} = useSpotifyPlayer();
```

#### `useSpotifySearch`

Search Spotify catalog.

```typescript
import { useSpotifySearch } from '@/hooks/spotify';

const {
  results,         // SearchResults
  isLoading,       // boolean
  error,           // Error | null
  search,          // (query: string, types?: string[]) => Promise<void>
  clear,           // () => void
} = useSpotifySearch();
```

#### `useSpotifyLibrary`

Access user's Spotify library.

```typescript
import { useSpotifyLibrary } from '@/hooks/spotify';

const {
  savedTracks,     // SpotifyTrack[]
  playlists,       // SpotifyPlaylist[]
  isLoading,       // boolean
  refresh,         // () => Promise<void>
} = useSpotifyLibrary();
```

---

### System Hooks

#### `useStatus`

System status monitoring.

```typescript
import { useStatus } from '@/hooks/system';

const {
  cpu,             // number (0-100)
  memory,          // number (0-100)
  temp,            // number (celsius)
  disk,            // number (0-100)
  uptime,          // number (seconds)
  isOnline,        // boolean
} = useStatus();
```

#### `useWeather`

Weather information.

```typescript
import { useWeather } from '@/hooks/system';

const {
  current,         // WeatherData | null
  forecast,        // ForecastData[] | null
  isLoading,       // boolean
  error,           // Error | null
  refresh,         // () => Promise<void>
} = useWeather();
```

#### `useNetworkStatus`

Network connectivity status.

```typescript
import { useNetworkStatus } from '@/hooks/system';

const {
  isOnline,        // boolean
  connectionType,  // 'wifi' | 'ethernet' | 'cellular' | 'unknown'
  effectiveType,   // 'slow-2g' | '2g' | '3g' | '4g'
  downlink,        // number (Mbps)
  rtt,             // number (ms)
} = useNetworkStatus();
```

---

### Common Hooks

#### `useTranslation`

Internationalization hook.

```typescript
import { useTranslation } from '@/hooks/common';

const {
  t,               // (key: string, params?: object) => string
  locale,          // 'en' | 'es' | 'pt-BR'
  setLocale,       // (locale: string) => void
  locales,         // string[]
} = useTranslation();
```

#### `useDebounce`

Debounce value changes.

```typescript
import { useDebounce } from '@/hooks/common';

const debouncedValue = useDebounce(value, 300);
```

#### `useTouchGestures`

Touch gesture detection.

```typescript
import { useTouchGestures } from '@/hooks/common';

const { ref } = useTouchGestures({
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeUp: () => console.log('Swiped up'),
  onSwipeDown: () => console.log('Swiped down'),
  onLongPress: () => console.log('Long press'),
});
```

---

## API Clients

### Spotify API Client

```typescript
import { spotifyApi } from '@/lib/api/spotify';

// Search
const results = await spotifyApi.search('query', ['track', 'album']);

// Get track
const track = await spotifyApi.getTrack('trackId');

// Get user playlists
const playlists = await spotifyApi.getUserPlaylists();

// Create playlist
const playlist = await spotifyApi.createPlaylist('Name', 'Description');

// Add tracks to playlist
await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
```

### YouTube Music API Client

```typescript
import { youtubeMusicApi } from '@/lib/api/youtubeMusic';

// Search
const results = await youtubeMusicApi.search('query');

// Get library
const library = await youtubeMusicApi.getLibrary();

// Get playlist
const playlist = await youtubeMusicApi.getPlaylist(playlistId);
```

### Local Music API Client

```typescript
import { localMusicApi } from '@/lib/api/localMusic';

// Get all tracks
const tracks = await localMusicApi.getTracks();

// Get track by ID
const track = await localMusicApi.getTrack(id);

// Scan folder
await localMusicApi.scanFolder('/path/to/music');

// Get audio file URL
const url = localMusicApi.getAudioUrl(trackId);
```

---

## Edge Functions

### `spotify-auth`

Handles Spotify OAuth flow.

**Endpoint**: `/functions/v1/spotify-auth`

```typescript
// Request
POST /functions/v1/spotify-auth
{
  "action": "authorize" | "callback" | "refresh",
  "code": "authorization_code",  // for callback
  "refresh_token": "token"       // for refresh
}

// Response
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

### `youtube-music-auth`

Handles YouTube Music OAuth flow.

**Endpoint**: `/functions/v1/youtube-music-auth`

```typescript
// Request
POST /functions/v1/youtube-music-auth
{
  "action": "authorize" | "callback" | "refresh",
  "code": "authorization_code"
}

// Response
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

### `lyrics-search`

Searches for song lyrics.

**Endpoint**: `/functions/v1/lyrics-search`

```typescript
// Request
POST /functions/v1/lyrics-search
{
  "title": "Song Title",
  "artist": "Artist Name"
}

// Response
{
  "lyrics": [
    { "time": 0, "text": "First line" },
    { "time": 5.2, "text": "Second line" }
  ],
  "source": "lrclib"
}
```

### `github-repo`

GitHub repository information.

**Endpoint**: `/functions/v1/github-repo`

```typescript
// Request
GET /functions/v1/github-repo?owner=user&repo=repo

// Response
{
  "name": "repo",
  "description": "...",
  "stars": 100,
  "forks": 25,
  "lastUpdate": "2024-01-01T00:00:00Z"
}
```

---

## Type Definitions

### Track Types

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  albumArt?: string;
  source: 'local' | 'spotify' | 'youtube';
  uri?: string;
}

interface SpotifyTrack extends Track {
  spotifyId: string;
  previewUrl?: string;
  popularity: number;
}

interface LyricLine {
  time: number;
  text: string;
}
```

### User Types

```typescript
interface User {
  id: string;
  email?: string;
  username?: string;
  role: 'admin' | 'user' | 'newbie';
  createdAt: string;
}

interface LocalUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  permissions: string[];
}
```

### Playlist Types

```typescript
interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  owner: string;
  isPublic: boolean;
  coverArt?: string;
}
```

### System Types

```typescript
interface SystemStatus {
  cpu: number;
  memory: number;
  temp: number;
  disk: number;
  uptime: number;
  playing: boolean;
  track?: Track;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}
```

---

## Error Handling

All API methods can throw errors. Handle them appropriately:

```typescript
try {
  const track = await spotifyApi.getTrack(id);
} catch (error) {
  if (error instanceof SpotifyApiError) {
    if (error.status === 401) {
      // Token expired, refresh
    } else if (error.status === 404) {
      // Track not found
    }
  }
  throw error;
}
```

---

## Rate Limiting

| API | Rate Limit |
|-----|------------|
| Spotify | 100 requests/minute |
| YouTube Music | 60 requests/minute |
| Lyrics | 30 requests/minute |

---

<p align="center">
  Questions? Check the <a href="DEVELOPER-GUIDE.md">Developer Guide</a>.
</p>
