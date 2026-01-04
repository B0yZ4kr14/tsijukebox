# PlayerContext

**Tipo:** React Context  
**Localização:** `src/contexts/PlayerContext.tsx` (planejado)  
**Hook Principal:** `usePlayer` (`src/hooks/player/usePlayer.ts`)  
**Versão:** 1.0.0  
**Categoria:** State Management

---

## Descrição

O `PlayerContext` gerencia o estado global do player de música do TSiJUKEBOX. Ele fornece o estado atual da reprodução (tocando, pausado, música atual, progresso, etc.) e as funções para controlar o player (play, pause, next, prev, etc.) para todos os componentes da aplicação.

**Principais recursos:**
- Estado global de reprodução
- Controle centralizado do player
- Integração com a API do backend (via `usePlayer`)
- Sincronização de estado entre componentes
- Suporte a múltiplos provedores de música

---

## Uso Básico

```typescript
import { usePlayerContext } from '@/contexts/PlayerContext';

function PlayerControls() {
  const {
    isPlaying,
    currentTrack,
    play,
    pause,
    next,
    prev
  } = usePlayerContext();

  return (
    <div>
      <p>Tocando agora: {currentTrack?.name || 'Nenhuma'}</p>
      
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pausar' : 'Tocar'}
      </button>
      
      <button onClick={prev}>Anterior</button>
      <button onClick={next}>Próxima</button>
    </div>
  );
}
```

---

## Estado do Contexto (`PlayerContextType`)

### `isPlaying`: `boolean`

Indica se uma música está sendo reproduzida.

---

### `isPaused`: `boolean`

Indica se a reprodução está pausada.

---

### `isStopped`: `boolean`

Indica se o player está parado (sem música na fila).

---

### `isLoading`: `boolean`

Indica se uma ação do player está em andamento (ex: carregando próxima música).

---

### `currentTrack`: `Track | null`

Objeto com os dados da música atual.

**Tipo `Track`:**
```typescript
interface Track {
  id: string;                  // ID (Spotify, YouTube, etc.)
  provider: 'spotify' | 'youtube' | 'local';
  name: string;
  artist: string;
  album: string;
  albumArt: string;            // URL da capa do álbum
  duration: number;            // Duração em milissegundos
  uri: string;                 // URI para reprodução
}
```

---

### `position`: `number`

Posição atual da reprodução em milissegundos.

---

### `volume`: `number`

Volume atual do player (0 a 100).

---

### `isMuted`: `boolean`

Indica se o player está sem som.

---

### `shuffle`: `boolean`

Indica se o modo aleatório está ativo.

---

### `repeat`: `'none' | 'one' | 'all'`

Indica o modo de repetição.

---

## Funções do Contexto

### `play`: `(track?: Track) => void`

Inicia ou retoma a reprodução. Se um `track` for fornecido, inicia a reprodução dessa música.

**Exemplo:**
```typescript
// Retomar reprodução
play();

// Tocar uma música específica
play({ id: '...', name: '...', ... });
```

---

### `pause`: `() => void`

Pausa a reprodução.

---

### `stop`: `() => void`

Para a reprodução e limpa o estado do player.

---

### `next`: `() => void`

Avança para a próxima música da fila.

---

### `prev`: `() => void`

Volta para a música anterior.

---

### `seek`: `(position: number) => void`

Busca uma posição específica na música.

**Parâmetros:**
- `position`: Posição em milissegundos

**Exemplo:**
```typescript
// Ir para 1 minuto
seek(60000);
```

---

### `setVolume`: `(volume: number) => void`

Ajusta o volume do player.

**Parâmetros:**
- `volume`: Volume de 0 a 100

---

### `toggleMute`: `() => void`

Alterna o modo mudo.

---

### `toggleShuffle`: `() => void`

Alterna o modo aleatório.

---

### `toggleRepeat`: `() => void`

Alterna entre os modos de repetição (`none` -> `all` -> `one` -> `none`).

---

## Exemplo Completo: Mini Player

```typescript
import { usePlayerContext } from '@/contexts/PlayerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2,
  Shuffle,
  Repeat
} from 'lucide-react';

function MiniPlayer() {
  const {
    isPlaying,
    currentTrack,
    position,
    volume,
    shuffle,
    repeat,
    play,
    pause,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat
  } = usePlayerContext();

  if (!currentTrack) {
    return null; // Não renderiza nada se não houver música
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl shadow-lg z-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Album Art */}
          <img 
            src={currentTrack.albumArt}
            alt={currentTrack.name}
            className="w-16 h-16 rounded-md"
          />

          {/* Track Info & Controls */}
          <div className="flex-1 space-y-2">
            {/* Info */}
            <div>
              <p className="font-bold truncate">{currentTrack.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs w-10">
                {formatTime(position)}
              </span>
              <Slider
                value={[position]}
                max={currentTrack.duration}
                onValueChange={(value) => seek(value[0])}
                className="flex-1"
              />
              <span className="text-xs w-10">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-2">
            <Button onClick={prev} variant="ghost" size="icon">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button onClick={isPlaying ? pause : play} size="icon" className="w-12 h-12">
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            <Button onClick={next} variant="ghost" size="icon">
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Extra Controls */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={toggleShuffle} 
              variant="ghost" 
              size="icon"
              className={shuffle ? 'text-primary' : ''}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button 
              onClick={toggleRepeat} 
              variant="ghost" 
              size="icon"
              className={repeat !== 'none' ? 'text-primary' : ''}
            >
              <Repeat className="w-4 h-4" />
            </Button>
            <Volume2 className="w-4 h-4 ml-2" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              className="w-24"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MiniPlayer;
```

---

## Integração com `usePlayer` Hook

O `PlayerContext` utiliza o hook `usePlayer` internamente para se comunicar com a API do backend. Todas as ações de controle (play, pause, etc.) são, na verdade, mutações do React Query gerenciadas pelo `usePlayer`.

**Fluxo de Dados:**

1. **Componente** chama `play()` do `PlayerContext`.
2. **PlayerContext** chama `play()` do `usePlayer`.
3. **usePlayer** executa a mutação `api.controlPlayback({ action: 'play' })`.
4. **API Backend** envia o comando para o player (Spotify, MPD, etc.).
5. **usePlayer** (onSuccess) invalida a query `['status']`.
6. **Hook de Status** (ex: `useStatus`) busca o novo estado do player.
7. **PlayerContext** é atualizado com o novo estado (isPlaying, currentTrack, etc.).
8. **Componente** re-renderiza com o novo estado.

```typescript
// src/hooks/player/usePlayer.ts
export function usePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (action: PlaybackAction) => api.controlPlayback(action),
    onSuccess: () => {
      // Invalida o cache para buscar o novo estado
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
  });

  return {
    play: () => mutation.mutate({ action: 'play' }),
    pause: () => mutation.mutate({ action: 'pause' }),
    // ...outras ações
  };
}
```

---

## Estrutura do Provider

O `PlayerProvider` é o componente que provê o contexto para a aplicação.

```typescript
// src/contexts/PlayerContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useStatus } from '@/hooks/system/useStatus'; // Hook que busca o estado do player
import { usePlayer } from '@/hooks/player/usePlayer';

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }) {
  const { data: status } = useStatus(); // Busca o estado do player periodicamente
  const playerControls = usePlayer();

  const [volume, setVolume] = useState(100);
  // ... outros estados locais

  const value = {
    // Estado do 'status'
    isPlaying: status?.isPlaying || false,
    currentTrack: status?.currentTrack || null,
    position: status?.position || 0,
    
    // Ações do 'usePlayer'
    play: playerControls.play,
    pause: playerControls.pause,
    next: playerControls.next,
    prev: playerControls.prev,

    // Estado local
    volume,
    setVolume,
    // ...
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}
```

---

## Performance

### Otimizações

1. **Contexto Otimizado:** O valor do contexto é memoizado para evitar re-renders desnecessários.
2. **Seletores:** Use seletores para consumir apenas a parte do estado que seu componente precisa.
3. **React Query:** A comunicação com o backend é gerenciada pelo React Query, com cache e invalidação automática.

### Recomendações

```typescript
// ❌ Evitar
function Component() {
  const player = usePlayerContext();
  // Re-renderiza em qualquer mudança no player
}

// ✅ Preferir
function Component() {
  const isPlaying = usePlayerContext(state => state.isPlaying);
  // Re-renderiza apenas quando isPlaying muda
}
```

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { PlayerProvider, usePlayerContext } from '@/contexts/PlayerContext';

describe('usePlayerContext', () => {
  it('should toggle play/pause state', () => {
    const { result } = renderHook(() => usePlayerContext(), {
      wrapper: PlayerProvider
    });

    // Mock da API e do estado inicial
    // ...

    act(() => {
      result.current.play();
    });

    // Verificar se o estado isPlaying mudou para true
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });
});
```

---

## Relacionados

- [usePlayer](./hooks/USEPLAYER.md) - Hook de controle do player
- [useQueue](./hooks/USEQUEUE.md) - Hook da fila de reprodução
- [QueueContext](./QUEUECONTEXT.md) - Contexto da fila
- [Guia do Player](../guides/PLAYER_GUIDE.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação inicial do contexto
- ✅ Integração com `usePlayer` e `useStatus`
- ✅ Estado global de reprodução
- ✅ Funções de controle centralizadas
- ✅ Documentação completa
