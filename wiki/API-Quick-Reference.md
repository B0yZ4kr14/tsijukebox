# API Quick Reference

**Referência rápida das principais APIs do TSiJUKEBOX**

---

## 🎯 Visão Geral

Este guia fornece uma referência rápida para as APIs mais utilizadas do TSiJUKEBOX. Para documentação completa, consulte a [API Reference](../API-REFERENCE.md) oficial.

---

## 📋 Índice

- [Player API](#player-api)
- [Queue API](#queue-api)
- [Spotify API](#spotify-api)
- [YouTube Music API](#youtube-music-api)
- [Karaoke API](#karaoke-api)
- [Settings API](#settings-api)
- [Hooks](#hooks)

---

## Player API

### usePlayer Hook

```typescript
import { usePlayer } from '@/hooks/player/usePlayer';

function MyComponent() {
  const {
    currentTrack,    // Track atual
    isPlaying,       // Estado de reprodução
    volume,          // Volume (0-1)
    progress,        // Progresso (0-1)
    duration,        // Duração total (ms)
    play,            // Função para reproduzir
    pause,           // Função para pausar
    stop,            // Função para parar
    next,            // Próxima música
    previous,        // Música anterior
    seek,            // Buscar posição
    setVolume,       // Definir volume
  } = usePlayer();
  
  return (
    <div>
      <h3>{currentTrack?.name}</h3>
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

### Métodos Principais

#### `play(track?: Track): void`
Reproduz uma música ou retoma a reprodução.

```typescript
play(); // Retoma reprodução atual
play(track); // Reproduz música específica
```

#### `pause(): void`
Pausa a reprodução.

#### `seek(position: number): void`
Busca uma posição específica (em segundos).

```typescript
seek(30); // Pula para 30 segundos
```

#### `setVolume(volume: number): void`
Define o volume (0.0 a 1.0).

```typescript
setVolume(0.5); // 50% de volume
```

---

## Queue API

### useQueue Hook

```typescript
import { useQueue } from '@/hooks/queue/useQueue';

function QueueComponent() {
  const {
    queue,           // Array de músicas na fila
    currentIndex,    // Índice da música atual
    addToQueue,      // Adicionar à fila
    removeFromQueue, // Remover da fila
    clearQueue,      // Limpar fila
    moveTrack,       // Mover música na fila
    shuffle,         // Embaralhar fila
  } = useQueue();
  
  return (
    <ul>
      {queue.map((track, index) => (
        <li key={track.id}>
          {track.name}
          <button onClick={() => removeFromQueue(index)}>×</button>
        </li>
      ))}
    </ul>
  );
}
```

### Métodos Principais

#### `addToQueue(track: Track, position?: number): void`
Adiciona música à fila.

```typescript
addToQueue(track); // Adiciona ao final
addToQueue(track, 0); // Adiciona no início
addToQueue(track, currentIndex + 1); // Próxima música
```

#### `removeFromQueue(index: number): void`
Remove música da fila pelo índice.

#### `moveTrack(fromIndex: number, toIndex: number): void`
Move uma música na fila.

```typescript
moveTrack(5, 1); // Move música do índice 5 para o índice 1
```

#### `shuffle(): void`
Embaralha a fila aleatoriamente.

---

## Spotify API

### useSpotify Hook

```typescript
import { useSpotify } from '@/hooks/integrations/useSpotify';

function SpotifyIntegration() {
  const {
    isConnected,     // Status de conexão
    user,            // Usuário do Spotify
    connect,         // Conectar ao Spotify
    disconnect,      // Desconectar
    search,          // Buscar músicas
    getPlaylists,    // Obter playlists
    getRecommendations, // Obter recomendações
  } = useSpotify();
  
  const handleSearch = async (query: string) => {
    const results = await search(query, { type: 'track', limit: 20 });
    console.log(results);
  };
  
  return (
    <div>
      {isConnected ? (
        <button onClick={disconnect}>Desconectar</button>
      ) : (
        <button onClick={connect}>Conectar Spotify</button>
      )}
    </div>
  );
}
```

### Métodos Principais

#### `search(query: string, options?: SearchOptions): Promise<SearchResults>`
Busca no Spotify.

```typescript
const results = await search('Queen Bohemian Rhapsody', {
  type: 'track',
  limit: 10,
  market: 'BR'
});
```

#### `getPlaylists(userId?: string): Promise<Playlist[]>`
Obtém playlists do usuário.

```typescript
const playlists = await getPlaylists();
```

#### `getRecommendations(seeds: Seeds): Promise<Track[]>`
Obtém recomendações baseadas em seeds.

```typescript
const recommendations = await getRecommendations({
  seed_artists: ['artist_id'],
  seed_tracks: ['track_id'],
  limit: 20
});
```

---

## YouTube Music API

### useYouTube Hook

```typescript
import { useYouTube } from '@/hooks/integrations/useYouTube';

function YouTubeIntegration() {
  const {
    isConnected,
    connect,
    disconnect,
    search,
    getVideo,
    getPlaylist,
  } = useYouTube();
  
  const handleSearch = async (query: string) => {
    const results = await search(query, { maxResults: 20 });
    console.log(results);
  };
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
    </div>
  );
}
```

### Métodos Principais

#### `search(query: string, options?: SearchOptions): Promise<SearchResults>`
Busca no YouTube Music.

```typescript
const results = await search('Adele Hello', {
  maxResults: 10,
  type: 'video'
});
```

#### `getVideo(videoId: string): Promise<VideoDetails>`
Obtém detalhes de um vídeo.

```typescript
const video = await getVideo('dQw4w9WgXcQ');
```

---

## Karaoke API

### useKaraoke Hook

```typescript
import { useKaraoke } from '@/hooks/karaoke/useKaraoke';

function KaraokeMode() {
  const {
    isKaraokeMode,   // Modo karaokê ativo
    lyrics,          // Letras sincronizadas
    currentLine,     // Linha atual
    toggleKaraoke,   // Ativar/desativar
    seekToLine,      // Pular para linha específica
    fontSize,        // Tamanho da fonte
    setFontSize,     // Definir tamanho da fonte
  } = useKaraoke();
  
  return (
    <div className="karaoke-container">
      {isKaraokeMode && lyrics.map((line, index) => (
        <p
          key={index}
          className={index === currentLine ? 'active' : ''}
          style={{ fontSize: `${fontSize}px` }}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}
```

### Métodos Principais

#### `toggleKaraoke(): void`
Ativa/desativa modo karaokê.

#### `seekToLine(lineIndex: number): void`
Pula para uma linha específica das letras.

```typescript
seekToLine(10); // Pula para a linha 10
```

---

## Settings API

### useSettings Hook

```typescript
import { useSettings } from '@/hooks/settings/useSettings';

function SettingsPanel() {
  const {
    settings,        // Todas as configurações
    updateSetting,   // Atualizar configuração
    resetSettings,   // Resetar para padrão
    exportSettings,  // Exportar configurações
    importSettings,  // Importar configurações
  } = useSettings();
  
  const handleThemeChange = (theme: 'dark' | 'light' | 'auto') => {
    updateSetting('appearance.theme', theme);
  };
  
  return (
    <select
      value={settings.appearance.theme}
      onChange={(e) => handleThemeChange(e.target.value)}
    >
      <option value="dark">Escuro</option>
      <option value="light">Claro</option>
      <option value="auto">Auto</option>
    </select>
  );
}
```

### Estrutura de Settings

```typescript
interface Settings {
  appearance: {
    theme: 'dark' | 'light' | 'auto';
    fontSize: number;
    compactMode: boolean;
  };
  audio: {
    volume: number;
    quality: 'low' | 'medium' | 'high';
    normalization: boolean;
  };
  karaoke: {
    fontSize: number;
    showTranslation: boolean;
    autoScroll: boolean;
  };
  advanced: {
    cacheSize: number;
    preloadNextTrack: boolean;
    enableAnalytics: boolean;
  };
}
```

---

## Hooks

### Lifecycle Hooks

#### useMount
Executa callback na montagem do componente.

```typescript
import { useMount } from '@/hooks/common/useMount';

useMount(() => {
  console.log('Component mounted');
  // Initialization code
});
```

#### useUnmount
Executa callback na desmontagem.

```typescript
import { useUnmount } from '@/hooks/common/useUnmount';

useUnmount(() => {
  console.log('Component unmounting');
  // Cleanup code
});
```

### State Hooks

#### useLocalStorage
Persistência automática em localStorage.

```typescript
import { useLocalStorage } from '@/hooks/common/useLocalStorage';

const [user, setUser] = useLocalStorage('user', null);
```

#### useDebounce
Debounce de valores.

```typescript
import { useDebounce } from '@/hooks/common/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500); // 500ms delay
```

---

## Tipos TypeScript Principais

### Track

```typescript
interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: number; // em ms
  artworkUrl?: string;
  provider: 'spotify' | 'youtube' | 'local';
  uri?: string;
}
```

### Playlist

```typescript
interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}
```

### LyricsLine

```typescript
interface LyricsLine {
  time: number; // em segundos
  text: string;
  translation?: string;
}
```

---

## Exemplos Completos

### Player Completo

```typescript
import { usePlayer, useQueue } from '@/hooks';

function MusicPlayer() {
  const { currentTrack, isPlaying, play, pause, next, previous } = usePlayer();
  const { queue, addToQueue } = useQueue();
  
  return (
    <div className="player">
      <div className="current-track">
        {currentTrack && (
          <>
            <img src={currentTrack.artworkUrl} alt={currentTrack.name} />
            <div>
              <h3>{currentTrack.name}</h3>
              <p>{currentTrack.artist}</p>
            </div>
          </>
        )}
      </div>
      
      <div className="controls">
        <button onClick={previous}>⏮️</button>
        <button onClick={isPlaying ? pause : play}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={next}>⏭️</button>
      </div>
      
      <div className="queue">
        <h4>Fila ({queue.length})</h4>
        {queue.map((track, index) => (
          <div key={track.id}>{track.name}</div>
        ))}
      </div>
    </div>
  );
}
```

### Busca com Spotify

```typescript
import { useState } from 'react';
import { useSpotify, useQueue } from '@/hooks';

function SearchAndAdd() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { search } = useSpotify();
  const { addToQueue } = useQueue();
  
  const handleSearch = async () => {
    const searchResults = await search(query, { type: 'track' });
    setResults(searchResults.tracks);
  };
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch}>Buscar</button>
      
      <ul>
        {results.map((track) => (
          <li key={track.id}>
            {track.name} - {track.artist}
            <button onClick={() => addToQueue(track)}>+</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📚 Documentação Completa

- [API Reference Completa](../API-REFERENCE.md)
- [Backend Endpoints](../BACKEND-ENDPOINTS.md)
- [Hooks Architecture](../HOOKS-ARCHITECTURE.md)
- [TypeScript Types Reference](../types/README.md)

---

**Última atualização:** 04/01/2026  
**Versão:** 1.0.0
