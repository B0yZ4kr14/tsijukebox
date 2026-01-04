# QueueContext

**Tipo:** React Context  
**Localização:** `src/contexts/QueueContext.tsx` (planejado)  
**Hook Principal:** `useQueue` (`src/hooks/jam/useJamQueue.ts`)  
**Versão:** 1.0.0  
**Categoria:** State Management

---

## Descrição

O `QueueContext` gerencia o estado da fila de reprodução colaborativa do TSiJUKEBOX. Ele fornece o estado atual da fila (lista de músicas, ordem, votos) e as funções para manipular a fila (adicionar, remover, votar) para todos os componentes da aplicação, com sincronização em tempo real via Supabase.

**Principais recursos:**
- Estado global da fila de reprodução
- Sincronização em tempo real entre múltiplos usuários
- Sistema de votação para reordenar a fila
- Funções para adicionar, remover e marcar músicas como tocadas
- Integração com o `PlayerContext` para reprodução sequencial

---

## Uso Básico

```typescript
import { useQueueContext } from '@/contexts/QueueContext';

function QueueDisplay() {
  const {
    queue,
    queueLength,
    addToQueue,
    voteTrack,
    removeFromQueue
  } = useQueueContext();

  return (
    <div>
      <h3>Fila de Reprodução ({queueLength} músicas)</h3>
      <ul>
        {queue.map(item => (
          <li key={item.id}>
            {item.track_name} - {item.artist_name} ({item.votes} votos)
            <button onClick={() => voteTrack(item.id)}>Votar</button>
            <button onClick={() => removeFromQueue(item.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Estado do Contexto (`QueueContextType`)

### `queue`: `JamQueueItem[]`

Array de itens na fila, ordenados por votos (descendente) e depois por posição de adição (ascendente).

**Tipo `JamQueueItem`:**
```typescript
interface JamQueueItem {
  id: string;                      // ID único do item na fila
  session_id: string;              // ID da sessão colaborativa
  track_id: string;                // ID da música (Spotify, YouTube, etc.)
  track_name: string;              // Nome da música
  artist_name: string;             // Nome do artista
  album_art: string | null;        // URL da capa do álbum
  duration_ms: number | null;      // Duração em milissegundos
  added_by: string | null;         // ID do usuário que adicionou
  added_by_nickname: string | null;// Apelido do usuário que adicionou
  position: number;                // Posição original na fila
  votes: number;                   // Número de votos recebidos
  is_played: boolean;              // Flag se a música já foi tocada
  created_at: string;              // Timestamp de quando foi adicionada
}
```

---

### `queueLength`: `number`

O número total de músicas na fila.

---

### `isLoading`: `boolean`

Indica se a fila está sendo carregada do servidor.

---

### `sessionId`: `string | null`

O ID da sessão de Jam atual. O contexto só funciona se um `sessionId` estiver ativo.

---

## Funções do Contexto

### `addToQueue`: `(track: AddTrackParams) => Promise<boolean>`

Adiciona uma nova música à fila de reprodução.

**Parâmetros `AddTrackParams`:**
```typescript
interface AddTrackParams {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  durationMs?: number;
}
```

**Retorno:** `Promise<boolean>` - `true` se a música for adicionada com sucesso.

**Exemplo:**
```typescript
const trackToAdd = {
  trackId: 'spotify:track:123',
  trackName: 'Bohemian Rhapsody',
  artistName: 'Queen',
};
const success = await addToQueue(trackToAdd);
```

---

### `voteTrack`: `(queueItemId: string) => Promise<void>`

Registra um voto para uma música específica na fila, fazendo-a subir na ordem de reprodução.

**Exemplo:**
```typescript
await voteTrack('queue-item-id-456');
```

---

### `removeFromQueue`: `(queueItemId: string) => Promise<void>`

Remove uma música da fila. Geralmente disponível para o usuário que adicionou a música ou para administradores.

**Exemplo:**
```typescript
await removeFromQueue('queue-item-id-789');
```

---

### `markAsPlayed`: `(queueItemId: string) => Promise<void>`

Marca uma música como tocada. Isso a remove da visualização da fila principal.

**Exemplo:**
```typescript
const nextTrack = getNextTrack();
if (nextTrack) {
  // ...tocar a música...
  await markAsPlayed(nextTrack.id);
}
```

---

### `getNextTrack`: `() => JamQueueItem | null`

Retorna o próximo item da fila (o primeiro do array `queue`).

**Retorno:** `JamQueueItem | null` - O próximo item da fila ou `null` se a fila estiver vazia.

---

### `refetch`: `() => Promise<void>`

Força a recarga da fila a partir do servidor.

---

## Exemplo Completo: Painel da Fila Colaborativa

```typescript
import { useQueueContext } from '@/contexts/QueueContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Trash2, Music } from 'lucide-react';

function JamQueuePanel() {
  const { 
    queue, 
    queueLength, 
    isLoading, 
    voteTrack, 
    removeFromQueue 
  } = useQueueContext();
  const { user, hasPermission } = useUser();

  if (isLoading) {
    return <p>Carregando fila...</p>;
  }

  if (queueLength === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>A fila está vazia. Adicione músicas para começar a festa!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Fila da Sessão ({queueLength})</h2>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {queue.map((item, index) => (
            <li key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-bold text-muted-foreground w-6">
                {index + 1}
              </span>
              <img 
                src={item.album_art || '/placeholder.png'} 
                alt={item.track_name} 
                className="w-12 h-12 rounded-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.track_name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {item.artist_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Adicionada por: {item.added_by_nickname}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => voteTrack(item.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{item.votes}</span>
                </Button>
                {(item.added_by === user?.id || hasPermission('canRemoveFromQueue')) && (
                  <Button 
                    onClick={() => removeFromQueue(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

---

## Sincronização em Tempo Real

O `QueueContext` utiliza o **Supabase Realtime** para manter a fila sincronizada entre todos os participantes da sessão. Ele se inscreve a eventos de `INSERT`, `UPDATE` e `DELETE` na tabela `jam_queue`.

- **INSERT:** Quando uma nova música é adicionada, ela aparece instantaneamente para todos.
- **UPDATE:** Votos e outras atualizações são refletidos em tempo real, reordenando a fila se necessário.
- **DELETE:** Músicas removidas desaparecem da fila de todos os participantes.

O estado local (`queue`) é atualizado automaticamente em resposta a esses eventos, garantindo uma experiência colaborativa fluida.

---

## Estrutura do Provider

O `QueueProvider` utiliza o hook `useJamQueue` internamente para gerenciar a lógica e a comunicação com o backend.

```typescript
// src/contexts/QueueContext.tsx
import { createContext, useContext } from 'react';
import { useJamQueue } from '@/hooks/jam/useJamQueue';
import { useUser } from './UserContext'; // Para obter sessionId e participantId

const QueueContext = createContext<QueueContextType | null>(null);

export function QueueProvider({ children }) {
  const { user, jamSession } = useUser(); // Exemplo de como obter os IDs
  
  const queueState = useJamQueue(
    jamSession?.id || null,
    user?.id || null,
    user?.nickname || null
  );

  return (
    <QueueContext.Provider value={queueState}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueueContext() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueueContext must be used within a QueueProvider');
  }
  return context;
}
```

---

## Integração com `PlayerContext`

O `PlayerContext` consome o `QueueContext` para saber qual música tocar em seguida.

```typescript
// Dentro do PlayerContext

const { getNextTrack, markAsPlayed } = useQueueContext();

const handleTrackEnd = async () => {
  const nextTrack = getNextTrack();
  if (nextTrack) {
    // 1. Marcar a música atual como tocada
    await markAsPlayed(currentTrack.id);
    
    // 2. Iniciar a reprodução da próxima música
    play(nextTrack);
  } else {
    // Fila terminou
    stop();
  }
};
```

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { QueueProvider, useQueueContext } from '@/contexts/QueueContext';

// Mock do hook useJamQueue
jest.mock('@/hooks/jam/useJamQueue', () => ({
  useJamQueue: () => ({
    queue: [],
    queueLength: 0,
    isLoading: false,
    addToQueue: jest.fn().mockResolvedValue(true),
    voteTrack: jest.fn().mockResolvedValue(undefined),
    // ... mock de outras funções
  }),
}));

describe('useQueueContext', () => {
  it('should add a track to the queue', async () => {
    const { result } = renderHook(() => useQueueContext(), {
      wrapper: QueueProvider
    });

    await act(async () => {
      const success = await result.current.addToQueue({ 
        trackId: 'test-id', 
        trackName: 'Test Track', 
        artistName: 'Test Artist' 
      });
      expect(success).toBe(true);
    });

    expect(result.current.addToQueue).toHaveBeenCalledWith(expect.any(Object));
  });
});
```

---

## Relacionados

- [useQueue (Hook)](./hooks/USEQUEUE.md) - Lógica principal da fila
- [PlayerContext](./PLAYERCONTEXT.md) - Contexto do player
- [AuthContext](./AUTHCONTEXT.md) - Contexto de autenticação e sessão
- [Guia de Sessões Colaborativas](../guides/JAM_SESSIONS.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação inicial do contexto
- ✅ Integração com o hook `useJamQueue`
- ✅ Sincronização em tempo real com Supabase
- ✅ Sistema de votação
- ✅ Documentação completa
