# useKaraoke

**Tipo:** React Hook  
**Localização:** `src/hooks/player/useLyrics.ts` (base), `src/hooks/karaoke/` (planejado)  
**Versão:** 1.0.0  
**Categoria:** Karaoke & Lyrics

---

## Descrição

O hook `useKaraoke` gerencia o modo karaokê do TSiJUKEBOX, incluindo busca e exibição de letras sincronizadas, controle de visualização, efeitos visuais e recursos de karaokê profissional. Atualmente implementado como `useLyrics` com funcionalidades básicas, com expansão planejada para modo karaokê completo.

**Principais recursos:**
- Busca automática de letras via múltiplas fontes
- Cache inteligente de letras (localStorage)
- Sincronização com reprodução de música
- Modo karaokê com destaque de linha atual (planejado)
- Controle de fonte e visualização (planejado)
- Suporte a múltiplos idiomas (planejado)

---

## Uso Básico

```typescript
import { useLyrics } from '@/hooks/player/useLyrics';

function KaraokeDisplay() {
  const { 
    data: lyrics, 
    isLoading, 
    error 
  } = useLyrics('Bohemian Rhapsody', 'Queen');

  if (isLoading) return <p>Carregando letras...</p>;
  if (error) return <p>Letras não encontradas</p>;

  return (
    <div className="lyrics-container">
      <h3>{lyrics.trackName} - {lyrics.artistName}</h3>
      <pre className="whitespace-pre-wrap">{lyrics.lyrics}</pre>
      <p className="text-sm text-muted-foreground">
        Fonte: {lyrics.source}
      </p>
    </div>
  );
}
```

---

## Parâmetros

### `trackName`: `string | undefined`

Nome da música para buscar letras.

**Exemplo:**
```typescript
const lyrics = useLyrics('Bohemian Rhapsody', 'Queen');
```

---

### `artistName`: `string | undefined`

Nome do artista para buscar letras.

**Exemplo:**
```typescript
const lyrics = useLyrics('Imagine', 'John Lennon');
```

---

## Retorno

### `UseLyricsReturn`

O hook retorna um objeto `UseQueryResult` do React Query com os seguintes campos principais:

#### `data`: `LyricsData | undefined`

Dados das letras encontradas.

**Tipo `LyricsData`:**
```typescript
interface LyricsData {
  trackName: string;      // Nome da música
  artistName: string;     // Nome do artista
  lyrics: string;         // Letras completas
  source: LyricsSource;   // Fonte das letras
  syncedLyrics?: string;  // Letras sincronizadas (LRC format)
  language?: string;      // Idioma das letras
  duration?: number;      // Duração da música (ms)
}

type LyricsSource = 
  | 'genius'      // Genius.com
  | 'musixmatch'  // Musixmatch
  | 'lrclib'      // LRCLIB (letras sincronizadas)
  | 'local'       // Banco de dados local
  | 'none';       // Não encontrado
```

---

#### `isLoading`: `boolean`

Indica se as letras estão sendo carregadas pela primeira vez.

---

#### `isFetching`: `boolean`

Indica se há uma busca em andamento (incluindo refetch).

---

#### `error`: `Error | null`

Erro da busca, se houver.

---

#### `refetch`: `() => Promise<QueryObserverResult>`

Força uma nova busca das letras.

---

## Exemplo Completo: Modo Karaokê

```typescript
import { useState, useEffect, useRef } from 'react';
import { useLyrics } from '@/hooks/player/useLyrics';
import { usePlayer } from '@/hooks/player/usePlayer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Mic, 
  Type, 
  Maximize, 
  Minimize,
  Languages
} from 'lucide-react';

function KaraokeMode() {
  const { currentTrack, position } = usePlayer();
  const { data: lyrics, isLoading } = useLyrics(
    currentTrack?.name,
    currentTrack?.artist
  );

  const [fontSize, setFontSize] = useState(24);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar linha atual com posição da música
  useEffect(() => {
    if (!lyrics?.syncedLyrics) return;

    // Parse LRC format e encontrar linha atual
    const lines = parseLRC(lyrics.syncedLyrics);
    const line = lines.findIndex(l => l.time > position);
    setCurrentLine(Math.max(0, line - 1));
  }, [position, lyrics]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!currentTrack) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Selecione uma música para iniciar o karaokê</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Carregando letras...</p>
        </CardContent>
      </Card>
    );
  }

  if (!lyrics || lyrics.source === 'none') {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Letras não disponíveis para esta música</p>
        </CardContent>
      </Card>
    );
  }

  const lyricsLines = lyrics.lyrics.split('\n');

  return (
    <div 
      ref={containerRef}
      className={`space-y-4 ${isFullscreen ? 'bg-black p-8' : ''}`}
    >
      {/* Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Tamanho da Fonte */}
            <div className="flex items-center gap-2 flex-1">
              <Type className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={16}
                max={48}
                step={2}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {fontSize}px
              </span>
            </div>

            {/* Fullscreen */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>

            {/* Idioma */}
            <Button variant="outline" size="sm">
              <Languages className="w-4 h-4 mr-2" />
              {lyrics.language || 'EN'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Música */}
      <Card className="bg-gradient-to-r from-accent-magenta/20 to-accent-cyan/20">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {currentTrack.name}
          </h2>
          <p className="text-lg text-muted-foreground">
            {currentTrack.artist}
          </p>
        </CardContent>
      </Card>

      {/* Letras */}
      <Card className="min-h-[400px]">
        <CardContent className="p-8">
          <div 
            className="space-y-4 text-center"
            style={{ fontSize: `${fontSize}px` }}
          >
            {lyricsLines.map((line, index) => (
              <p
                key={index}
                className={`
                  transition-all duration-300
                  ${index === currentLine 
                    ? 'text-accent-cyan font-bold scale-110 glow-cyan' 
                    : 'text-muted-foreground opacity-60'
                  }
                  ${Math.abs(index - currentLine) > 2 ? 'hidden' : ''}
                `}
              >
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fonte */}
      <p className="text-xs text-center text-muted-foreground">
        Letras fornecidas por {lyrics.source}
      </p>
    </div>
  );
}

// Helper para parsear formato LRC
function parseLRC(lrc: string): Array<{ time: number; text: string }> {
  const lines = lrc.split('\n');
  const parsed: Array<{ time: number; text: string }> = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = parseInt(match[3]);
      const time = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
      const text = match[4].trim();
      parsed.push({ time, text });
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

export default KaraokeMode;
```

---

## Sistema de Cache

### Estratégia de Cache

As letras são cacheadas em **localStorage** para reduzir requisições à API.

**Chave do cache:**
```typescript
const cacheKey = `lyrics:${trackName}:${artistName}`;
```

**Estrutura do cache:**
```typescript
interface CachedLyrics {
  data: LyricsData;
  timestamp: number;
  expiresAt: number;
}
```

### Funções de Cache

#### `getCachedLyrics(trackName, artistName)`

Recupera letras do cache se disponíveis e válidas.

#### `setCachedLyrics(trackName, artistName, data)`

Armazena letras no cache com timestamp.

**Implementação:**
```typescript
// lib/lyricsCache.ts
export function getCachedLyrics(
  trackName: string, 
  artistName: string
): LyricsData | null {
  const key = `lyrics:${trackName}:${artistName}`;
  const cached = localStorage.getItem(key);
  
  if (!cached) return null;
  
  try {
    const parsed: CachedLyrics = JSON.parse(cached);
    
    // Verificar expiração (7 dias)
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  } catch {
    return null;
  }
}

export function setCachedLyrics(
  trackName: string,
  artistName: string,
  data: LyricsData
): void {
  const key = `lyrics:${trackName}:${artistName}`;
  const cached: CachedLyrics = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
  };
  
  localStorage.setItem(key, JSON.stringify(cached));
}
```

---

## Fontes de Letras

### Prioridade de Busca

1. **Cache Local** - Verificado primeiro
2. **LRCLIB** - Letras sincronizadas (preferencial)
3. **Genius** - Letras completas com anotações
4. **Musixmatch** - Letras oficiais
5. **Banco Local** - Letras armazenadas no Supabase

### Formato LRC (Letras Sincronizadas)

```lrc
[00:12.00]Line 1 lyrics
[00:17.20]Line 2 lyrics
[00:21.10]Line 3 lyrics
```

**Parsing:**
```typescript
function parseLRC(lrc: string) {
  const regex = /\[(\d{2}):(\d{2})\.(\d{2})\](.*)/;
  return lrc.split('\n')
    .map(line => {
      const match = line.match(regex);
      if (!match) return null;
      
      const [, min, sec, cs, text] = match;
      const time = (parseInt(min) * 60 + parseInt(sec)) * 1000 + parseInt(cs) * 10;
      
      return { time, text: text.trim() };
    })
    .filter(Boolean);
}
```

---

## Integração com usePlayer

```typescript
import { usePlayer } from '@/hooks/player/usePlayer';
import { useLyrics } from '@/hooks/player/useLyrics';

function SyncedLyrics() {
  const { currentTrack, position, isPlaying } = usePlayer();
  const { data: lyrics } = useLyrics(
    currentTrack?.name,
    currentTrack?.artist
  );

  // Encontrar linha atual baseada na posição
  const currentLine = useMemo(() => {
    if (!lyrics?.syncedLyrics) return 0;
    
    const lines = parseLRC(lyrics.syncedLyrics);
    const index = lines.findIndex(l => l.time > position);
    
    return Math.max(0, index - 1);
  }, [lyrics, position]);

  return (
    <div>
      {/* Renderizar letras com destaque */}
    </div>
  );
}
```

---

## Recursos Avançados (Planejados)

### Modo Dueto

```typescript
interface DuetLyrics {
  voice1: LyricsLine[];
  voice2: LyricsLine[];
  both: LyricsLine[];
}

function DuetMode() {
  const [activeVoice, setActiveVoice] = useState<'voice1' | 'voice2' | 'both'>('both');
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={activeVoice === 'voice1' ? 'opacity-100' : 'opacity-40'}>
        {/* Voice 1 lyrics */}
      </div>
      <div className={activeVoice === 'voice2' ? 'opacity-100' : 'opacity-40'}>
        {/* Voice 2 lyrics */}
      </div>
    </div>
  );
}
```

### Controle de Pitch

```typescript
function PitchControl() {
  const [pitch, setPitch] = useState(0); // -12 a +12 semitons
  
  return (
    <Slider
      value={[pitch]}
      onValueChange={(value) => setPitch(value[0])}
      min={-12}
      max={12}
      step={1}
    />
  );
}
```

### Score System

```typescript
interface KaraokeScore {
  accuracy: number;    // 0-100%
  timing: number;      // 0-100%
  pitch: number;       // 0-100%
  total: number;       // 0-100%
  stars: number;       // 1-5
}

function calculateScore(
  userPerformance: AudioData,
  originalTrack: AudioData
): KaraokeScore {
  // Implementação de análise de áudio
}
```

---

## Tratamento de Erros

```typescript
const { data: lyrics, error } = useLyrics(trackName, artistName);

if (error) {
  console.error('[Lyrics] Error:', error.message);
  
  // Exibir mensagem amigável
  return (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">
        <p>Letras não disponíveis</p>
        <p className="text-sm mt-2">
          Tente outra música ou verifique a conexão
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## Performance

### Otimizações

1. **Cache infinito** - Letras não mudam (`staleTime: Infinity`)
2. **localStorage** - Cache persistente entre sessões
3. **Lazy loading** - Letras carregadas apenas quando necessário
4. **Retry limitado** - Apenas 1 tentativa para evitar spam

### React Query Config

```typescript
{
  queryKey: ['lyrics', trackName, artistName],
  staleTime: Infinity,        // Nunca considera stale
  gcTime: 1000 * 60 * 60,     // Cache por 1 hora na memória
  retry: 1,                    // Apenas 1 retry
  enabled: !!trackName && !!artistName
}
```

---

## Acessibilidade

- ✅ Alto contraste para linha atual
- ✅ Tamanho de fonte ajustável
- ✅ Suporte a screen readers
- ✅ Modo fullscreen para melhor visualização
- ✅ Indicadores visuais claros

---

## Testes

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useLyrics } from '@/hooks/player/useLyrics';

describe('useLyrics', () => {
  it('should fetch lyrics', async () => {
    const { result } = renderHook(() => 
      useLyrics('Bohemian Rhapsody', 'Queen')
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.lyrics).toBeTruthy();
    });
  });

  it('should use cache', async () => {
    // First fetch
    const { result: result1 } = renderHook(() => 
      useLyrics('Imagine', 'John Lennon')
    );

    await waitFor(() => {
      expect(result1.current.data).toBeDefined();
    });

    // Second fetch (should use cache)
    const { result: result2 } = renderHook(() => 
      useLyrics('Imagine', 'John Lennon')
    );

    expect(result2.current.data).toEqual(result1.current.data);
  });
});
```

---

## Notas

- Requer **Supabase Edge Function** para busca de letras
- Cache em **localStorage** (limite de ~5MB)
- Letras sincronizadas requerem **formato LRC**
- Suporta **múltiplas fontes** com fallback automático
- Modo karaokê completo em **desenvolvimento**

---

## Relacionados

- [usePlayer](./USEPLAYER.md) - Hook do player principal
- [useVoiceControl](./USEVOICECONTROL.md) - Controle por voz
- [Guia de Karaokê](../guides/KARAOKE_MODE.md)
- [LRCLIB API](https://lrclib.net/)
- [Genius API](https://docs.genius.com/)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Busca de letras com múltiplas fontes
- ✅ Sistema de cache inteligente
- ✅ Integração com React Query
- ✅ Suporte a letras sincronizadas (LRC)
- ✅ Documentação completa
- 🚧 Modo karaokê completo (planejado)
- 🚧 Sistema de score (planejado)
- 🚧 Modo dueto (planejado)
