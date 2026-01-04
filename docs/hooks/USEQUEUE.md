# useQueue

**Tipo:** React Hook  
**Localização:** `src/hooks/jam/useJamQueue.ts`  
**Versão:** 1.0.0  
**Categoria:** Player & Queue Management

---

## Descrição

O hook `useQueue` (implementado como `useJamQueue`) gerencia a fila de reprodução de músicas em sessões colaborativas do TSiJUKEBOX. Fornece funcionalidades completas para adicionar, remover, votar e reordenar músicas na fila, com sincronização em tempo real via Supabase Realtime.

**Principais recursos:**
- Gerenciamento de fila de reprodução colaborativa
- Sistema de votação para reordenação democrática
- Sincronização em tempo real entre participantes
- Controle de músicas já reproduzidas
- Suporte a múltiplas sessões simultâneas

---

## Uso Básico

```typescript
import { useJamQueue } from '@/hooks/jam/useJamQueue';

function QueueManager() {
  const {
    queue,
    queueLength,
    isLoading,
    addToQueue,
    voteTrack,
    removeFromQueue,
    getNextTrack
  } = useJamQueue(sessionId, participantId, nickname);

  return (
    <div>
      <h3>Fila ({queueLength} músicas)</h3>
      {queue.map(item => (
        <div key={item.id}>
          <span>{item.track_name} - {item.artist_name}</span>
          <button onClick={() => voteTrack(item.id)}>
            👍 {item.votes}
          </button>
          <button onClick={() => removeFromQueue(item.id)}>
            ❌
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Parâmetros

### `sessionId`: `string | null`

ID da sessão colaborativa atual. Necessário para todas as operações de fila.

**Padrão:** `null`

**Exemplo:**
```typescript
const sessionId = "550e8400-e29b-41d4-a716-446655440000";
```

---

### `participantId`: `string | null`

ID do participante atual. Usado para rastrear quem adicionou cada música.

**Padrão:** `null`

**Exemplo:**
```typescript
const participantId = "user-123";
```

---

### `nickname`: `string | null`

Apelido do participante para exibição na fila.

**Padrão:** `null`

**Exemplo:**
```typescript
const nickname = "DJ Master";
```

---

## Retorno

### `UseJamQueueReturn`

O hook retorna um objeto com o estado da fila e funções de controle.

**Propriedades:**

#### `queue`: `JamQueueItem[]`

Array de itens na fila, ordenados por votos (descendente) e posição (ascendente).

**Tipo `JamQueueItem`:**
```typescript
interface JamQueueItem {
  id: string;                      // ID único do item na fila
  session_id: string;              // ID da sessão
  track_id: string;                // ID da música (Spotify/YouTube)
  track_name: string;              // Nome da música
  artist_name: string;             // Nome do artista
  album_art: string | null;        // URL da capa do álbum
  duration_ms: number | null;      // Duração em milissegundos
  added_by: string | null;         // ID de quem adicionou
  added_by_nickname: string | null;// Apelido de quem adicionou
  position: number;                // Posição original na fila
  votes: number;                   // Número de votos
  is_played: boolean;              // Se já foi reproduzida
  created_at: string;              // Data de criação
}
```

---

#### `queueLength`: `number`

Número total de músicas na fila.

---

#### `isLoading`: `boolean`

Indica se a fila está sendo carregada.

---

#### `addToQueue`: `(track: AddTrackParams) => Promise<boolean>`

Adiciona uma música à fila.

**Parâmetros:**
```typescript
interface AddTrackParams {
  trackId: string;      // ID da música
  trackName: string;    // Nome da música
  artistName: string;   // Nome do artista
  albumArt?: string;    // URL da capa (opcional)
  durationMs?: number;  // Duração em ms (opcional)
}
```

**Retorno:** `Promise<boolean>` - `true` se adicionado com sucesso

**Exemplo:**
```typescript
const success = await addToQueue({
  trackId: 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp',
  trackName: 'Mr. Brightside',
  artistName: 'The Killers',
  albumArt: 'https://i.scdn.co/image/...',
  durationMs: 222973
});

if (success) {
  console.log('Música adicionada!');
}
```

---

#### `voteTrack`: `(queueItemId: string) => Promise<void>`

Adiciona um voto a uma música na fila. Músicas com mais votos sobem na fila.

**Exemplo:**
```typescript
await voteTrack('queue-item-123');
```

---

#### `removeFromQueue`: `(queueItemId: string) => Promise<void>`

Remove uma música da fila.

**Exemplo:**
```typescript
await removeFromQueue('queue-item-123');
```

---

#### `markAsPlayed`: `(queueItemId: string) => Promise<void>`

Marca uma música como já reproduzida. Músicas marcadas são removidas da fila automaticamente.

**Exemplo:**
```typescript
await markAsPlayed('queue-item-123');
```

---

#### `getNextTrack`: `() => JamQueueItem | null`

Retorna a próxima música a ser reproduzida (primeira da fila).

**Retorno:** `JamQueueItem | null` - Próxima música ou `null` se a fila estiver vazia

**Exemplo:**
```typescript
const nextTrack = getNextTrack();
if (nextTrack) {
  console.log(`Próxima: ${nextTrack.track_name}`);
}
```

---

#### `refetch`: `() => Promise<void>`

Recarrega a fila do servidor.

**Exemplo:**
```typescript
await refetch();
```

---

## Exemplo Completo

```typescript
import { useState } from 'react';
import { useJamQueue } from '@/hooks/jam/useJamQueue';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ThumbsUp, Trash2 } from 'lucide-react';

function CollaborativeQueue() {
  const sessionId = "550e8400-e29b-41d4-a716-446655440000";
  const participantId = "user-123";
  const nickname = "DJ Master";

  const {
    queue,
    queueLength,
    isLoading,
    addToQueue,
    voteTrack,
    removeFromQueue,
    getNextTrack,
    markAsPlayed
  } = useJamQueue(sessionId, participantId, nickname);

  const handleAddTrack = async () => {
    await addToQueue({
      trackId: 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp',
      trackName: 'Mr. Brightside',
      artistName: 'The Killers',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273ccdddd46119a4ff53eaf1f5d',
      durationMs: 222973
    });
  };

  const handlePlayNext = async () => {
    const nextTrack = getNextTrack();
    if (nextTrack) {
      // Iniciar reprodução
      console.log(`Playing: ${nextTrack.track_name}`);
      
      // Marcar como reproduzida
      await markAsPlayed(nextTrack.id);
    }
  };

  if (isLoading) {
    return <div>Carregando fila...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Fila Colaborativa ({queueLength} músicas)
        </h2>
        <Button onClick={handleAddTrack}>
          Adicionar Música
        </Button>
      </div>

      {queueLength === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            A fila está vazia. Adicione músicas para começar!
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Próxima música */}
          <Card className="border-accent-cyan">
            <CardHeader>
              <h3 className="text-lg font-semibold">Tocando Agora</h3>
            </CardHeader>
            <CardContent>
              {queue[0] && (
                <div className="flex items-center gap-4">
                  <img 
                    src={queue[0].album_art || '/placeholder.png'} 
                    alt={queue[0].track_name}
                    className="w-16 h-16 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{queue[0].track_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {queue[0].artist_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Adicionada por {queue[0].added_by_nickname}
                    </p>
                  </div>
                  <Button onClick={handlePlayNext} size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Tocar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Restante da fila */}
          <div className="space-y-2">
            {queue.slice(1).map((item, index) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground w-8">
                      #{index + 2}
                    </span>
                    <img 
                      src={item.album_art || '/placeholder.png'} 
                      alt={item.track_name}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.track_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.artist_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => voteTrack(item.id)}
                        variant="outline"
                        size="sm"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {item.votes}
                      </Button>
                      <Button 
                        onClick={() => removeFromQueue(item.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CollaborativeQueue;
```

---

## Sincronização em Tempo Real

O hook utiliza **Supabase Realtime** para sincronizar a fila entre todos os participantes da sessão.

### Eventos Sincronizados

| Evento | Descrição |
|--------|-----------|
| **INSERT** | Nova música adicionada à fila |
| **UPDATE** | Música votada ou marcada como reproduzida |
| **DELETE** | Música removida da fila |

### Ordenação Automática

A fila é automaticamente reordenada quando:
1. Uma música recebe novos votos
2. Uma nova música é adicionada
3. Uma música é marcada como reproduzida (removida)

**Critérios de ordenação:**
1. **Votos** (descendente) - Músicas com mais votos primeiro
2. **Posição** (ascendente) - Em caso de empate, ordem de adição

---

## Tratamento de Erros

O hook trata erros automaticamente e exibe toasts informativos:

```typescript
// Sucesso
toast.success('"Mr. Brightside" adicionada à fila!');
toast.success('Voto registrado!');
toast.success('Música removida da fila');

// Erro
toast.error('Você precisa estar em uma sessão para adicionar músicas');
toast.error('Erro ao adicionar música');
```

**Erros são logados no console:**
```typescript
console.error('[JAM] Error fetching queue:', err);
console.error('[JAM] Error adding to queue:', err);
console.error('[JAM] Error voting:', err);
```

---

## Performance

### Otimizações Implementadas

1. **useCallback** - Todas as funções são memoizadas
2. **Ordenação eficiente** - Sort apenas quando necessário
3. **Filtragem de músicas reproduzidas** - Removidas automaticamente da UI
4. **Subscription cleanup** - Canal Realtime limpo no unmount

### Recomendações

- Limite a fila a **50-100 músicas** para melhor performance
- Use virtualização para listas muito grandes
- Implemente debounce em votações rápidas

---

## Integração com Outros Hooks

### usePlayer

```typescript
const { play } = usePlayer();
const { getNextTrack, markAsPlayed } = useQueue(sessionId, participantId, nickname);

const playNextInQueue = async () => {
  const next = getNextTrack();
  if (next) {
    await play(next.track_id);
    await markAsPlayed(next.id);
  }
};
```

### useSpotify / useYouTube

```typescript
const { searchTracks } = useSpotify();
const { addToQueue } = useQueue(sessionId, participantId, nickname);

const searchAndAdd = async (query: string) => {
  const results = await searchTracks(query);
  if (results.length > 0) {
    await addToQueue({
      trackId: results[0].id,
      trackName: results[0].name,
      artistName: results[0].artists[0].name,
      albumArt: results[0].album.images[0].url,
      durationMs: results[0].duration_ms
    });
  }
};
```

---

## Acessibilidade

- ✅ Toasts com mensagens descritivas
- ✅ Botões com labels semânticos
- ✅ Suporte a navegação por teclado
- ✅ Estados de loading visíveis

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { useJamQueue } from '@/hooks/jam/useJamQueue';

describe('useJamQueue', () => {
  it('should add track to queue', async () => {
    const { result } = renderHook(() => 
      useJamQueue('session-1', 'user-1', 'DJ')
    );

    await act(async () => {
      const success = await result.current.addToQueue({
        trackId: 'track-1',
        trackName: 'Test Song',
        artistName: 'Test Artist'
      });
      expect(success).toBe(true);
    });

    expect(result.current.queueLength).toBeGreaterThan(0);
  });

  it('should vote for track', async () => {
    const { result } = renderHook(() => 
      useJamQueue('session-1', 'user-1', 'DJ')
    );

    await act(async () => {
      await result.current.voteTrack('queue-item-1');
    });

    const item = result.current.queue.find(q => q.id === 'queue-item-1');
    expect(item?.votes).toBeGreaterThan(0);
  });
});
```

---

## Notas

- Requer **Supabase configurado** com tabela `jam_queue`
- Requer **autenticação ativa** para operações de escrita
- Suporta **múltiplas sessões simultâneas**
- Fila é **específica por sessão** (isolamento completo)

---

## Relacionados

- [usePlayer](./USEPLAYER.md) - Hook do player de música
- [useJamSession](./USEJAMSESSION.md) - Hook de sessões colaborativas
- [useSpotify](./USESPOTIFY.md) - Hook do Spotify
- [useYouTube](./USEYOUTUBE.md) - Hook do YouTube Music
- [Documentação de Hooks](../HOOKS-ARCHITECTURE.md)
- [Guia de Desenvolvimento](../guides/GETTING_STARTED_DEV.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação inicial
- ✅ Sistema de votação
- ✅ Sincronização em tempo real
- ✅ Suporte a múltiplas sessões
- ✅ Documentação completa
