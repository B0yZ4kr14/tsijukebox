# 🔌 API Reference

## Hooks

### useSpotify

```tsx
const {
  player,
  isPlaying,
  currentTrack,
  queue,
  play,
  pause,
  next,
  previous,
  seek,
  setVolume,
  addToQueue,
} = useSpotify();
```

### useSettings

```tsx
const {
  settings,
  updateSettings,
  resetSettings,
} = useSettings();
```

### useDesignTokens

```tsx
const {
  colors,
  typography,
  spacing,
  shadows,
} = useDesignTokens();
```

## Contextos

### SpotifyContext

```tsx
<SpotifyProvider>
  <App />
</SpotifyProvider>
```

### ThemeContext

```tsx
<ThemeProvider defaultTheme="dark">
  <App />
</ThemeProvider>
```

## Componentes

### Player

```tsx
<Player
  track={currentTrack}
  isPlaying={isPlaying}
  onPlay={handlePlay}
  onPause={handlePause}
  onNext={handleNext}
  onPrevious={handlePrevious}
/>
```

### VolumeSlider

```tsx
<VolumeSlider
  volume={volume}
  onVolumeChange={handleVolumeChange}
  onMuteToggle={handleMuteToggle}
/>
```

### QueuePanel

```tsx
<QueuePanel
  queue={queue}
  onRemove={handleRemove}
  onReorder={handleReorder}
/>
```

## Edge Functions

### /api/spotify/token

```bash
POST /api/spotify/token
Content-Type: application/json

{
  "code": "authorization_code"
}
```

### /api/spotify/refresh

```bash
POST /api/spotify/refresh
Content-Type: application/json

{
  "refresh_token": "token"
}
```
