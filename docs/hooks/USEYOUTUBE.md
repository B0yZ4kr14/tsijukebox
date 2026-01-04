# useYouTube

**Tipo:** React Hook  
**Localização:** `src/hooks/youtube/`  
**Versão:** 1.0.0  
**Categoria:** Music Streaming Integration

---

## Descrição

O hook `useYouTube` é um conjunto de hooks especializados para integração completa com o **YouTube Music**. Fornece funcionalidades para busca, reprodução, gerenciamento de playlists e biblioteca através da API não-oficial do YouTube Music.

**Principais recursos:**
- Busca de músicas, álbuns e playlists
- Controle completo de reprodução (play, pause, next, seek)
- Gerenciamento de fila de reprodução
- Navegação por categorias e gêneros
- Sistema de recomendações
- Controle de volume integrado

---

## Hooks Disponíveis

| Hook | Descrição | Arquivo |
|------|-----------|---------|
| `useYouTubeMusicSearch` | Busca no YouTube Music | `useYouTubeMusicSearch.ts` |
| `useYouTubeMusicPlayer` | Controle de reprodução | `useYouTubeMusicPlayer.ts` |
| `useYouTubeMusicPlaylists` | Gerenciamento de playlists | `useYouTubeMusicPlaylists.ts` |
| `useYouTubeMusicLibrary` | Biblioteca do usuário | `useYouTubeMusicLibrary.ts` |
| `useYouTubeMusicBrowse` | Navegação e descoberta | `useYouTubeMusicBrowse.ts` |
| `useYouTubeMusicRecommendations` | Recomendações | `useYouTubeMusicRecommendations.ts` |

---

## useYouTubeMusicSearch

### Descrição

Hook para busca no catálogo do YouTube Music com suporte a múltiplos tipos de conteúdo.

### Uso Básico

```typescript
import { useYouTubeMusicSearch } from '@/hooks/youtube/useYouTubeMusicSearch';

function YouTubeSearchBar() {
  const {
    query,
    results,
    isSearching,
    search,
    clearResults
  } = useYouTubeMusicSearch();

  return (
    <div>
      <input 
        onChange={(e) => search(e.target.value)}
        placeholder="Buscar no YouTube Music..."
      />
      
      {isSearching && <p>Buscando...</p>}
      
      {results.tracks.length > 0 && (
        <div>
          <h3>Músicas ({results.tracks.length})</h3>
          {results.tracks.map(track => (
            <div key={track.videoId}>{track.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Retorno

#### `query`: `string`
Query de busca atual.

#### `results`: `SearchResults`
Resultados da busca organizados por tipo.

```typescript
interface SearchResults {
  tracks: YouTubeMusicTrack[];
  albums: YouTubeMusicAlbum[];
  playlists: YouTubeMusicPlaylist[];
}
```

#### `isSearching`: `boolean`
Indica se há uma busca em andamento.

#### `search`: `(query: string, type?: SearchType) => Promise<void>`
Executa uma busca no YouTube Music.

**Parâmetros:**
- `query`: Termo de busca
- `type`: Tipo de conteúdo (opcional)

**Tipos disponíveis:**
```typescript
type SearchType = 'song' | 'video' | 'album' | 'playlist';
```

**Exemplo:**
```typescript
// Buscar tudo
await search('The Beatles');

// Buscar apenas músicas
await search('Yesterday', 'song');

// Buscar apenas álbuns
await search('Abbey Road', 'album');
```

#### `clearResults`: `() => void`
Limpa os resultados e a query.

---

## useYouTubeMusicPlayer

### Descrição

Hook para controle completo de reprodução do YouTube Music.

### Uso Básico

```typescript
import { useYouTubeMusicPlayer } from '@/hooks/youtube/useYouTubeMusicPlayer';

function YouTubeControls() {
  const {
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    addToQueue
  } = useYouTubeMusicPlayer();

  return (
    <div>
      <button onClick={() => play('dQw4w9WgXcQ')}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={previous}>Previous</button>
      <button onClick={next}>Next</button>
      <input 
        type="range" 
        onChange={(e) => setVolume(Number(e.target.value))}
        min="0"
        max="100"
      />
    </div>
  );
}
```

### Retorno

#### `play`: `(videoId?: string) => Promise<void>`
Inicia ou retoma a reprodução.

**Parâmetros:**
- `videoId`: ID do vídeo do YouTube (opcional)

**Exemplo:**
```typescript
// Retomar reprodução atual
await play();

// Reproduzir vídeo específico
await play('dQw4w9WgXcQ');
```

#### `pause`: `() => Promise<void>`
Pausa a reprodução atual.

#### `next`: `() => Promise<void>`
Avança para a próxima música da fila.

#### `previous`: `() => Promise<void>`
Volta para a música anterior.

#### `seek`: `(positionMs: number) => Promise<void>`
Busca uma posição específica na música.

**Parâmetros:**
- `positionMs`: Posição em milissegundos

**Exemplo:**
```typescript
// Ir para 1 minuto e 30 segundos
await seek(90000);
```

#### `setVolume`: `(percent: number) => Promise<void>`
Ajusta o volume da reprodução.

**Parâmetros:**
- `percent`: Volume de 0 a 100

**Exemplo:**
```typescript
// Volume 50%
await setVolume(50);
```

#### `addToQueue`: `(videoId: string) => Promise<void>`
Adiciona uma música à fila de reprodução.

**Parâmetros:**
- `videoId`: ID do vídeo do YouTube

**Exemplo:**
```typescript
await addToQueue('dQw4w9WgXcQ');
```

---

## Exemplo Completo: Player Integrado

```typescript
import { useState, useEffect } from 'react';
import { useYouTubeMusicSearch } from '@/hooks/youtube/useYouTubeMusicSearch';
import { useYouTubeMusicPlayer } from '@/hooks/youtube/useYouTubeMusicPlayer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Search,
  Volume2,
  Plus
} from 'lucide-react';

function YouTubeMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    results,
    isSearching,
    search,
    clearResults
  } = useYouTubeMusicSearch();

  const {
    play,
    pause,
    next,
    previous,
    setVolume: setPlayerVolume,
    addToQueue
  } = useYouTubeMusicPlayer();

  // Atualizar volume
  useEffect(() => {
    setPlayerVolume(volume);
  }, [volume, setPlayerVolume]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pause();
      setIsPlaying(false);
    } else {
      await play();
      setIsPlaying(true);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search(searchQuery);
  };

  const handlePlayTrack = async (videoId: string) => {
    await play(videoId);
    setIsPlaying(true);
  };

  const handleAddToQueue = async (videoId: string) => {
    await addToQueue(videoId);
  };

  return (
    <div className="space-y-6">
      {/* Player Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={previous}
              variant="outline"
              size="icon"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              size="icon"
              className="w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={next}
              variant="outline"
              size="icon"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {volume}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no YouTube Music..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.tracks.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Resultados ({results.tracks.length})
            </h3>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Limpar
            </Button>
          </div>

          <div className="grid gap-2">
            {results.tracks.map(track => (
              <Card key={track.videoId}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={track.thumbnails[0]?.url}
                      alt={track.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {track.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artists?.map(a => a.name).join(', ')}
                      </p>
                      {track.duration && (
                        <p className="text-xs text-muted-foreground">
                          {track.duration}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlayTrack(track.videoId)}
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleAddToQueue(track.videoId)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default YouTubeMusicPlayer;
```

---

## Configuração

### Requisitos

1. **YouTube Music** - Conta ativa (gratuita ou Premium)
2. **API não-oficial** - Biblioteca `ytmusicapi` no backend
3. **Cookies de autenticação** - Extraídos do navegador

### Configuração do Backend

```bash
# Instalar ytmusicapi
pip install ytmusicapi

# Configurar autenticação
ytmusicapi oauth
```

### Variáveis de Ambiente

```bash
VITE_YOUTUBE_MUSIC_ENABLED=true
YOUTUBE_MUSIC_OAUTH_FILE=/path/to/oauth.json
```

---

## Tipos TypeScript

```typescript
interface YouTubeMusicTrack {
  videoId: string;
  title: string;
  artists: Array<{
    name: string;
    id: string;
  }>;
  album?: {
    name: string;
    id: string;
  };
  duration?: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

interface YouTubeMusicAlbum {
  browseId: string;
  title: string;
  artist: string;
  year?: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

interface YouTubeMusicPlaylist {
  playlistId: string;
  title: string;
  author: string;
  trackCount: number;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}
```

---

## Integração com useQueue

```typescript
const { results } = useYouTubeMusicSearch();
const { addToQueue } = useQueue(sessionId, participantId, nickname);

const addYouTubeTrackToQueue = async (track: YouTubeMusicTrack) => {
  await addToQueue({
    trackId: `youtube:${track.videoId}`,
    trackName: track.title,
    artistName: track.artists?.map(a => a.name).join(', ') || 'Unknown',
    albumArt: track.thumbnails[0]?.url,
    durationMs: parseDuration(track.duration)
  });
};

// Helper para converter duração
function parseDuration(duration?: string): number {
  if (!duration) return 0;
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }
  if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  return 0;
}
```

---

## Tratamento de Erros

```typescript
// Erros comuns
toast({ 
  title: 'Erro', 
  description: 'Falha ao reproduzir', 
  variant: 'destructive' 
});

toast({ 
  title: 'Erro', 
  description: 'Falha ao adicionar à fila', 
  variant: 'destructive' 
});

// Sucesso
toast({ title: 'Adicionado à fila' });
```

---

## Performance

### Otimizações

1. **useCallback** - Todas as funções são memoizadas
2. **Lazy loading** - Thumbnails carregadas sob demanda
3. **Debounce** - Recomendado para buscas (implementar externamente)
4. **Cache** - Resultados podem ser cacheados com React Query

### Recomendações

```typescript
import { useDebounce } from '@/hooks/common';

const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  if (debouncedQuery) {
    search(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

## Limitações

- ⚠️ API **não-oficial** (pode quebrar com atualizações do YouTube)
- ⚠️ Requer **cookies válidos** (expiram periodicamente)
- ⚠️ Sem suporte a **Web Playback SDK** (reprodução via backend)
- ⚠️ Rate limiting do YouTube pode causar bloqueios temporários

---

## Acessibilidade

- ✅ Toasts com mensagens descritivas
- ✅ Estados de loading visíveis
- ✅ Suporte a navegação por teclado
- ✅ Alt text em todas as imagens
- ✅ ARIA labels em controles de player

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { useYouTubeMusicSearch } from '@/hooks/youtube/useYouTubeMusicSearch';

describe('useYouTubeMusicSearch', () => {
  it('should search tracks', async () => {
    const { result } = renderHook(() => useYouTubeMusicSearch());

    await act(async () => {
      await result.current.search('The Beatles');
    });

    expect(result.current.results.tracks.length).toBeGreaterThan(0);
  });

  it('should clear results', () => {
    const { result } = renderHook(() => useYouTubeMusicSearch());

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results.tracks).toEqual([]);
    expect(result.current.query).toBe('');
  });
});
```

---

## Notas

- Requer **ytmusicapi** no backend
- Cookies devem ser **renovados periodicamente**
- Suporta **contas gratuitas** (sem Premium)
- **Sem DRM** - Reprodução direta via backend
- Ideal para **uso pessoal** (não comercial)

---

## Relacionados

- [useQueue](./USEQUEUE.md) - Hook de fila de reprodução
- [usePlayer](./USEPLAYER.md) - Hook do player principal
- [useSpotify](./USESPOTIFY.md) - Hook do Spotify
- [ytmusicapi Documentation](https://ytmusicapi.readthedocs.io/)
- [Guia de Integração YouTube Music](../guides/YOUTUBE_INTEGRATION.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação de busca
- ✅ Controle completo de reprodução
- ✅ Suporte a fila de reprodução
- ✅ Controle de volume
- ✅ Documentação completa
