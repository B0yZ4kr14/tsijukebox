# useSpotify

**Tipo:** React Hook  
**Localização:** `src/hooks/spotify/`  
**Versão:** 1.0.0  
**Categoria:** Music Streaming Integration

---

## Descrição

O hook `useSpotify` é um conjunto de hooks especializados para integração completa com o **Spotify**. Fornece funcionalidades para busca, reprodução, gerenciamento de playlists, biblioteca e recomendações musicais através da API do Spotify e controle via playerctl.

**Principais recursos:**
- Busca de músicas, álbuns, artistas e playlists
- Reprodução via Spotify Desktop (playerctl backend)
- Gerenciamento de biblioteca pessoal
- Navegação por categorias e gêneros
- Sistema de recomendações personalizadas
- Cache inteligente com React Query

---

## Hooks Disponíveis

| Hook | Descrição | Arquivo |
|------|-----------|---------|
| `useSpotifySearch` | Busca no catálogo do Spotify | `useSpotifySearch.ts` |
| `useSpotifyPlayer` | Controle de reprodução | `useSpotifyPlayer.ts` |
| `useSpotifyPlaylists` | Gerenciamento de playlists | `useSpotifyPlaylists.ts` |
| `useSpotifyLibrary` | Biblioteca do usuário | `useSpotifyLibrary.ts` |
| `useSpotifyBrowse` | Navegação e descoberta | `useSpotifyBrowse.ts` |
| `useSpotifyRecommendations` | Recomendações personalizadas | `useSpotifyRecommendations.ts` |

---

## useSpotifySearch

### Descrição

Hook para busca no catálogo do Spotify com suporte a múltiplos tipos de conteúdo e debounce automático.

### Uso Básico

```typescript
import { useSpotifySearch } from '@/hooks/spotify/useSpotifySearch';

function SpotifySearchBar() {
  const {
    query,
    setQuery,
    results,
    hasResults,
    isSearching,
    clearSearch
  } = useSpotifySearch();

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar no Spotify..."
      />
      
      {isSearching && <p>Buscando...</p>}
      
      {hasResults && (
        <div>
          <h3>Músicas ({results.tracks.length})</h3>
          {results.tracks.map(track => (
            <div key={track.id}>{track.name}</div>
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

#### `setQuery`: `(query: string) => void`
Define a query de busca (com debounce de 300ms).

#### `types`: `SearchType[]`
Tipos de conteúdo sendo buscados.

**Tipos disponíveis:**
```typescript
type SearchType = 'track' | 'album' | 'artist' | 'playlist';
```

#### `setTypes`: `(types: SearchType[]) => void`
Define quais tipos buscar.

**Exemplo:**
```typescript
// Buscar apenas músicas e álbuns
setTypes(['track', 'album']);
```

#### `results`: `SpotifySearchResults`
Resultados da busca organizados por tipo.

```typescript
interface SpotifySearchResults {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
  playlists: SpotifyPlaylist[];
}
```

#### `hasResults`: `boolean`
Indica se há resultados em qualquer categoria.

#### `isLoading`: `boolean`
Indica se a primeira busca está carregando.

#### `isSearching`: `boolean`
Indica se há uma busca em andamento (incluindo refetch).

#### `error`: `Error | null`
Erro da busca, se houver.

#### `clearSearch`: `() => void`
Limpa a query e resultados.

#### `isConnected`: `boolean`
Indica se o Spotify está conectado e autenticado.

---

## useSpotifyPlayer

### Descrição

Hook para controle de reprodução do Spotify via playerctl (backend).

### Uso Básico

```typescript
import { useSpotifyPlayer } from '@/hooks/spotify/useSpotifyPlayer';

function SpotifyControls() {
  const {
    playTrack,
    playPlaylist,
    playAlbum,
    playArtist,
    isPlaying
  } = useSpotifyPlayer();

  return (
    <div>
      <button 
        onClick={() => playTrack('spotify:track:3n3Ppam7vgaVa1iaRUc9Lp')}
        disabled={isPlaying}
      >
        Tocar Música
      </button>
      
      <button 
        onClick={() => playPlaylist('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M')}
        disabled={isPlaying}
      >
        Tocar Playlist
      </button>
    </div>
  );
}
```

### Retorno

#### `playTrack`: `(trackUri: string) => void`
Reproduz uma música específica.

**Parâmetros:**
- `trackUri`: URI do Spotify no formato `spotify:track:ID`

**Exemplo:**
```typescript
playTrack('spotify:track:3n3Ppam7vgaVa1iaRUc9Lp');
```

#### `playPlaylist`: `(playlistUri: string) => void`
Reproduz uma playlist.

**Parâmetros:**
- `playlistUri`: URI do Spotify no formato `spotify:playlist:ID`

**Exemplo:**
```typescript
playPlaylist('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M');
```

#### `playAlbum`: `(albumUri: string) => void`
Reproduz um álbum.

**Parâmetros:**
- `albumUri`: URI do Spotify no formato `spotify:album:ID`

**Exemplo:**
```typescript
playAlbum('spotify:album:2noRn2Aes5aoNVsU6iWThc');
```

#### `playArtist`: `(artistUri: string) => void`
Reproduz músicas de um artista.

**Parâmetros:**
- `artistUri`: URI do Spotify no formato `spotify:artist:ID`

**Exemplo:**
```typescript
playArtist('spotify:artist:0OdUWJ0sBjDrqHygGUXeCF');
```

#### `isPlaying`: `boolean`
Indica se há uma operação de reprodução em andamento.

---

## Exemplo Completo: Busca e Reprodução

```typescript
import { useState } from 'react';
import { useSpotifySearch } from '@/hooks/spotify/useSpotifySearch';
import { useSpotifyPlayer } from '@/hooks/spotify/useSpotifyPlayer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Search, X } from 'lucide-react';

function SpotifyIntegration() {
  const {
    query,
    setQuery,
    results,
    hasResults,
    isSearching,
    clearSearch,
    isConnected
  } = useSpotifySearch();

  const {
    playTrack,
    playAlbum,
    isPlaying
  } = useSpotifyPlayer();

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Conecte sua conta Spotify nas configurações
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar músicas, álbuns, artistas..."
                className="pl-10 pr-10"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {isSearching && (
            <p className="text-sm text-muted-foreground mt-2">
              Buscando...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {hasResults && (
        <>
          {/* Músicas */}
          {results.tracks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Músicas ({results.tracks.length})
              </h3>
              <div className="grid gap-2">
                {results.tracks.map(track => (
                  <Card key={track.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={track.album.images[0]?.url}
                          alt={track.name}
                          className="w-12 h-12 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {track.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artists.map(a => a.name).join(', ')}
                          </p>
                        </div>
                        <Button
                          onClick={() => playTrack(track.uri)}
                          disabled={isPlaying}
                          size="sm"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Álbuns */}
          {results.albums.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Álbuns ({results.albums.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.albums.map(album => (
                  <Card key={album.id} className="overflow-hidden">
                    <img
                      src={album.images[0]?.url}
                      alt={album.name}
                      className="w-full aspect-square object-cover"
                    />
                    <CardContent className="p-3">
                      <p className="font-medium truncate text-sm">
                        {album.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {album.artists.map(a => a.name).join(', ')}
                      </p>
                      <Button
                        onClick={() => playAlbum(album.uri)}
                        disabled={isPlaying}
                        size="sm"
                        className="w-full mt-2"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Tocar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Artistas */}
          {results.artists.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Artistas ({results.artists.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {results.artists.map(artist => (
                  <Card key={artist.id} className="text-center">
                    <CardContent className="p-3">
                      <img
                        src={artist.images[0]?.url || '/placeholder.png'}
                        alt={artist.name}
                        className="w-full aspect-square object-cover rounded-full mb-2"
                      />
                      <p className="font-medium text-sm truncate">
                        {artist.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sem Resultados */}
      {query && !isSearching && !hasResults && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum resultado encontrado para "{query}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SpotifyIntegration;
```

---

## Configuração

### Requisitos

1. **Spotify Premium** - Necessário para controle de reprodução
2. **Spotify Desktop App** - Instalado e em execução
3. **playerctl** - Instalado no sistema (CachyOS)
4. **Credenciais OAuth** - Client ID e Secret configurados

### Variáveis de Ambiente

```bash
VITE_SPOTIFY_CLIENT_ID=seu_client_id
VITE_SPOTIFY_CLIENT_SECRET=seu_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### Autenticação

```typescript
import { spotifyClient } from '@/lib/api/spotify';

// Iniciar fluxo OAuth
const authUrl = spotifyClient.getAuthUrl();
window.location.href = authUrl;

// No callback
const code = new URLSearchParams(window.location.search).get('code');
await spotifyClient.authenticate(code);
```

---

## Cache e Performance

### Estratégia de Cache

O hook utiliza **React Query** com as seguintes configurações:

| Operação | Stale Time | Cache Time |
|----------|-----------|------------|
| Busca | 30s | 5min |
| Playlists | 5min | 30min |
| Biblioteca | 10min | 1h |
| Recomendações | 1h | 24h |

### Otimizações

1. **Debounce** - 300ms para buscas
2. **Query mínima** - 2 caracteres para iniciar busca
3. **Memoização** - Resultados memoizados com `useMemo`
4. **Prefetch** - Dados antecipados em hover

---

## Tratamento de Erros

```typescript
// Erros comuns
toast.error('Erro ao reproduzir. Verifique se o Spotify está aberto.');
toast.error('Spotify não conectado. Configure nas opções.');
toast.error('Erro na busca. Tente novamente.');

// Verificação de conexão
if (!isConnected) {
  return <p>Conecte sua conta Spotify</p>;
}
```

---

## Integração com useQueue

```typescript
const { results } = useSpotifySearch();
const { addToQueue } = useQueue(sessionId, participantId, nickname);

const addSpotifyTrackToQueue = async (track: SpotifyTrack) => {
  await addToQueue({
    trackId: track.uri,
    trackName: track.name,
    artistName: track.artists.map(a => a.name).join(', '),
    albumArt: track.album.images[0]?.url,
    durationMs: track.duration_ms
  });
};
```

---

## Tipos TypeScript

```typescript
interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
}

interface SpotifyAlbum {
  id: string;
  uri: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
}

interface SpotifyArtist {
  id: string;
  uri: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
}

interface SpotifyPlaylist {
  id: string;
  uri: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  owner: {
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}
```

---

## Acessibilidade

- ✅ Toasts com mensagens descritivas
- ✅ Estados de loading visíveis
- ✅ Suporte a navegação por teclado
- ✅ Alt text em todas as imagens
- ✅ ARIA labels em botões

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSpotifySearch } from '@/hooks/spotify/useSpotifySearch';

describe('useSpotifySearch', () => {
  it('should search tracks', async () => {
    const { result } = renderHook(() => useSpotifySearch());

    act(() => {
      result.current.setQuery('The Killers');
    });

    await waitFor(() => {
      expect(result.current.results.tracks.length).toBeGreaterThan(0);
    });
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useSpotifySearch());

    act(() => {
      result.current.setQuery('test');
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
  });
});
```

---

## Notas

- Requer **Spotify Premium** para reprodução
- Controle via **playerctl** (não Web Playback SDK)
- Suporta **offline mode** com cache
- Rate limit: **10 requisições/segundo**
- Token expira em **1 hora** (refresh automático)

---

## Relacionados

- [useQueue](./USEQUEUE.md) - Hook de fila de reprodução
- [usePlayer](./USEPLAYER.md) - Hook do player principal
- [useYouTube](./USEYOUTUBE.md) - Hook do YouTube Music
- [Spotify API Documentation](https://developer.spotify.com/documentation/web-api)
- [Guia de Integração Spotify](../guides/SPOTIFY_INTEGRATION.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação de busca com debounce
- ✅ Controle de reprodução via playerctl
- ✅ Sistema de cache com React Query
- ✅ Suporte a múltiplos tipos de conteúdo
- ✅ Documentação completa
