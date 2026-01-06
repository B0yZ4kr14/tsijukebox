# AppSettings Context

## Overview
React Context for managing application-wide settings including demo mode, API configuration, music providers, weather, and Spicetify integration.

## Import

```typescript
import { AppSettingsProvider, useAppSettings } from '@/contexts/AppSettingsContext';
```

## Type Definitions

```typescript
type MusicProvider = 'spotify' | 'spicetify' | 'youtube-music' | 'local';

interface SpicetifySettings {
  isInstalled: boolean;
  currentTheme: string;
  version: string;
}

interface WeatherSettings {
  apiKey: string;
  city: string;
  isEnabled: boolean;
}

interface AppSettingsContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  useWebSocket: boolean;
  setUseWebSocket: (value: boolean) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  spicetify: SpicetifySettings;
  setSpicetifyConfig: (config: Partial<SpicetifySettings>) => void;
  musicProvider: MusicProvider;
  setMusicProvider: (provider: MusicProvider) => void;
  weather: WeatherSettings;
  setWeatherConfig: (config: Partial<WeatherSettings>) => void;
}
```

## Provider Usage

```typescript
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';

function App() {
  return (
    <AppSettingsProvider>
      <YourApp />
    </AppSettingsProvider>
  );
}
```

## Hook Usage

```typescript
function Settings() {
  const {
    isDemoMode,
    setDemoMode,
    apiUrl,
    setApiUrl,
    musicProvider,
    setMusicProvider,
    weather,
    setWeatherConfig
  } = useAppSettings();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isDemoMode}
          onChange={(e) => setDemoMode(e.target.checked)}
        />
        Demo Mode
      </label>
      
      <select value={musicProvider} onChange={(e) => setMusicProvider(e.target.value)}>
        <option value="spotify">Spotify</option>
        <option value="youtube-music">YouTube Music</option>
        <option value="local">Local Files</option>
      </select>
    </div>
  );
}
```

## Storage Keys

| Setting | Storage Key | Location |
|---------|------------|----------|
| General Settings | `tsi_jukebox_settings` | localStorage |
| Weather Config | `tsi_jukebox_weather` | localStorage |
| Music Provider | `tsi_jukebox_music_provider` | localStorage |

## Default Values

### General Settings
```typescript
{
  isDemoMode: import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true',
  apiUrl: import.meta.env.VITE_API_URL || 'https://midiaserver.local/api',
  useWebSocket: true,
  pollingInterval: 2000
}
```

### Weather Settings
```typescript
{
  apiKey: '',
  city: 'Montes Claros, MG',
  isEnabled: false
}
```

### Spicetify Settings
```typescript
{
  isInstalled: false,
  currentTheme: '',
  version: ''
}
```

## Settings Methods

### Demo Mode

**setDemoMode(value: boolean)**

Toggles demo mode for development/testing.

```typescript
setDemoMode(true);  // Enable demo mode
setDemoMode(false); // Disable demo mode
```

### API Configuration

**setApiUrl(value: string)**

Sets the backend API URL.

```typescript
setApiUrl('https://api.example.com');
```

**setUseWebSocket(value: boolean)**

Enables/disables WebSocket connection.

```typescript
setUseWebSocket(true);
```

**setPollingInterval(value: number)**

Sets polling interval in milliseconds.

```typescript
setPollingInterval(5000); // Poll every 5 seconds
```

### Music Provider

**setMusicProvider(provider: MusicProvider)**

Switches active music provider.

```typescript
setMusicProvider('spotify');
setMusicProvider('youtube-music');
setMusicProvider('local');
setMusicProvider('spicetify');
```

### Spicetify Integration

**setSpicetifyConfig(config: Partial<SpicetifySettings>)**

Updates Spicetify configuration.

```typescript
setSpicetifyConfig({
  isInstalled: true,
  currentTheme: 'Dribbblish',
  version: '2.36.0'
});
```

### Weather Configuration

**setWeatherConfig(config: Partial<WeatherSettings>)**

Updates weather widget settings.

```typescript
setWeatherConfig({
  apiKey: 'your-api-key',
  city: 'São Paulo, SP',
  isEnabled: true
});
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://midiaserver.local/api` | Backend API URL |
| `VITE_DEMO_MODE` | `false` | Force demo mode |
| `DEV` | Auto-detected | Development mode |

## Performance Optimization

Context value is memoized to prevent unnecessary re-renders:

```typescript
const value = useMemo<AppSettingsContextType>(() => ({
  isDemoMode,
  setDemoMode,
  // ... other values
}), [isDemoMode, setDemoMode, /* dependencies */]);
```

## Example: Complete Settings Panel

```typescript
function SettingsPanel() {
  const {
    isDemoMode,
    setDemoMode,
    apiUrl,
    setApiUrl,
    useWebSocket,
    setUseWebSocket,
    pollingInterval,
    setPollingInterval,
    musicProvider,
    setMusicProvider,
    weather,
    setWeatherConfig,
    spicetify,
    setSpicetifyConfig
  } = useAppSettings();

  return (
    <div>
      <h2>Application Settings</h2>
      
      {/* Demo Mode */}
      <label>
        <input
          type="checkbox"
          checked={isDemoMode}
          onChange={(e) => setDemoMode(e.target.checked)}
        />
        Demo Mode
      </label>

      {/* API Configuration */}
      <div>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="API URL"
        />
        <label>
          <input
            type="checkbox"
            checked={useWebSocket}
            onChange={(e) => setUseWebSocket(e.target.checked)}
          />
          Use WebSocket
        </label>
        <input
          type="number"
          value={pollingInterval}
          onChange={(e) => setPollingInterval(Number(e.target.value))}
          min={1000}
          max={10000}
        />
      </div>

      {/* Music Provider */}
      <select
        value={musicProvider}
        onChange={(e) => setMusicProvider(e.target.value as MusicProvider)}
      >
        <option value="spotify">Spotify</option>
        <option value="spicetify">Spicetify</option>
        <option value="youtube-music">YouTube Music</option>
        <option value="local">Local Files</option>
      </select>

      {/* Weather */}
      <div>
        <input
          value={weather.apiKey}
          onChange={(e) => setWeatherConfig({ apiKey: e.target.value })}
          placeholder="Weather API Key"
        />
        <input
          value={weather.city}
          onChange={(e) => setWeatherConfig({ city: e.target.value })}
          placeholder="City"
        />
        <label>
          <input
            type="checkbox"
            checked={weather.isEnabled}
            onChange={(e) => setWeatherConfig({ isEnabled: e.target.checked })}
          />
          Enable Weather
        </label>
      </div>

      {/* Spicetify */}
      {spicetify.isInstalled && (
        <div>
          <p>Spicetify {spicetify.version}</p>
          <p>Theme: {spicetify.currentTheme}</p>
        </div>
      )}
    </div>
  );
}
```

## Persistence

All settings are automatically persisted to localStorage:
- General settings saved on any change
- Weather settings saved immediately on update
- Music provider saved immediately on change

## Error Handling

```typescript
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
} catch (e) {
  console.error('Failed to save settings:', e);
  // Continues without saving (e.g., private browsing)
}
```

## See Also
- [ThemeContext](/docs/contexts/THEMECONTEXT.md)
- [Configuration Guide](/docs/CONFIGURATION.md)
- [Developer Guide](/docs/guides/DEVELOPER_GUIDE.md)
