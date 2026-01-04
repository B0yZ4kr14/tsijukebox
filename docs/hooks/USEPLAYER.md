# usePlayer

**Tipo:** React Hook  
**Localização:** `src/hooks/usePlayer.ts`  
**Versão:** 1.0.0

---

## Descrição

Hook para controlar o player de música do TSiJUKEBOX. Gerencia reprodução, pausa, volume, progresso e fila de reprodução.

---

## Uso

```typescript
import { usePlayer } from '@/hooks/usePlayer';

function MyComponent() {
  const player = usePlayer();
  
  return (
    <div>
      {/* Use player here */}
    </div>
  );
}
```

---

## Parâmetros



---

## Retorno

### `player`: `PlayerState & PlayerActions`

Objeto com estado e ações do player

**Propriedades:**

- **`currentTrack`**: `Track | null` - Faixa atual em reprodução
- **`isPlaying`**: `boolean` - Se está tocando
- **`volume`**: `number` - Volume (0-100)
- **`progress`**: `number` - Progresso (0-100)
- **`play`**: `() => void` - Inicia reprodução
- **`pause`**: `() => void` - Pausa reprodução
- **`next`**: `() => void` - Próxima faixa
- **`previous`**: `() => void` - Faixa anterior
- **`seek`**: `(position: number) => void` - Busca posição
- **`setVolume`**: `(volume: number) => void` - Define volume

---

## Exemplo Completo

```typescript
import { usePlayer } from '@/hooks/usePlayer';

function PlayerControls() {
  const { 
    currentTrack, 
    isPlaying, 
    play, 
    pause, 
    next, 
    previous 
  } = usePlayer();

  return (
    <div>
      <h3>{currentTrack?.title}</h3>
      <button onClick={previous}>⏮️</button>
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <button onClick={next}>⏭️</button>
    </div>
  );
}
```

---

## Notas

- Este hook utiliza React Context internamente
- Certifique-se de que o Provider correspondente está configurado
- Suporta TypeScript com tipagem completa

---

## Relacionados

- [Documentação de Hooks](../HOOKS-ARCHITECTURE.md)
- [Guia de Desenvolvimento](../guides/GETTING_STARTED_DEV.md)
