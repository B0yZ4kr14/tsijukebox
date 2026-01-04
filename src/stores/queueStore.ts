import { create } from 'zustand';
import { Track } from './playerStore';

/**
 * Interface para histórico de reprodução
 */
interface HistoryEntry {
  track: Track;
  playedAt: Date;
}

/**
 * Interface para o estado da fila
 */
interface QueueState {
  // Fila de reprodução
  queue: Track[];
  history: HistoryEntry[];
  
  // Índice atual
  currentIndex: number;
  
  // Fila original (antes do shuffle)
  originalQueue: Track[];
  
  // Ações da fila
  addToQueue: (track: Track, position?: 'next' | 'end') => void;
  addMultipleToQueue: (tracks: Track[], position?: 'next' | 'end') => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  
  // Navegação
  getNextTrack: () => Track | null;
  getPreviousTrack: () => Track | null;
  moveToIndex: (index: number) => void;
  
  // Reordenação
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  unshuffleQueue: () => void;
  
  // Histórico
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
  
  // Utilitários
  getQueueLength: () => number;
  isQueueEmpty: () => boolean;
}

/**
 * Função auxiliar para embaralhar array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Store Zustand para gerenciamento da fila de reprodução
 */
export const useQueueStore = create<QueueState>((set, get) => ({
  // Estado inicial
  queue: [],
  history: [],
  currentIndex: -1,
  originalQueue: [],

  /**
   * Adiciona uma faixa à fila
   */
  addToQueue: (track: Track, position: 'next' | 'end' = 'end') => {
    set((state) => {
      const newQueue = [...state.queue];
      
      if (position === 'next') {
        // Adiciona após a música atual
        const insertIndex = state.currentIndex + 1;
        newQueue.splice(insertIndex, 0, track);
      } else {
        // Adiciona no final
        newQueue.push(track);
      }
      
      return { 
        queue: newQueue,
        originalQueue: state.originalQueue.length === 0 ? newQueue : state.originalQueue,
      };
    });
  },

  /**
   * Adiciona múltiplas faixas à fila
   */
  addMultipleToQueue: (tracks: Track[], position: 'next' | 'end' = 'end') => {
    set((state) => {
      const newQueue = [...state.queue];
      
      if (position === 'next') {
        // Adiciona após a música atual
        const insertIndex = state.currentIndex + 1;
        newQueue.splice(insertIndex, 0, ...tracks);
      } else {
        // Adiciona no final
        newQueue.push(...tracks);
      }
      
      return { 
        queue: newQueue,
        originalQueue: state.originalQueue.length === 0 ? newQueue : state.originalQueue,
      };
    });
  },

  /**
   * Remove uma faixa da fila
   */
  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      
      // Ajusta o índice atual se necessário
      let newIndex = state.currentIndex;
      if (index < state.currentIndex) {
        newIndex--;
      } else if (index === state.currentIndex) {
        newIndex = -1; // Música atual foi removida
      }
      
      return { 
        queue: newQueue,
        currentIndex: newIndex,
      };
    });
  },

  /**
   * Limpa toda a fila
   */
  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      originalQueue: [],
    });
  },

  /**
   * Obtém a próxima faixa da fila
   */
  getNextTrack: () => {
    const { queue, currentIndex } = get();
    
    if (queue.length === 0) return null;
    
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      return null; // Fim da fila
    }
    
    set({ currentIndex: nextIndex });
    return queue[nextIndex];
  },

  /**
   * Obtém a faixa anterior da fila
   */
  getPreviousTrack: () => {
    const { queue, currentIndex } = get();
    
    if (queue.length === 0 || currentIndex <= 0) return null;
    
    const prevIndex = currentIndex - 1;
    set({ currentIndex: prevIndex });
    return queue[prevIndex];
  },

  /**
   * Move para um índice específico da fila
   */
  moveToIndex: (index: number) => {
    const { queue } = get();
    
    if (index < 0 || index >= queue.length) return;
    
    set({ currentIndex: index });
  },

  /**
   * Reordena a fila (drag and drop)
   */
  reorderQueue: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      
      // Ajusta o índice atual se necessário
      let newIndex = state.currentIndex;
      if (fromIndex === state.currentIndex) {
        newIndex = toIndex;
      } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
        newIndex--;
      } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
        newIndex++;
      }
      
      return {
        queue: newQueue,
        currentIndex: newIndex,
      };
    });
  },

  /**
   * Embaralha a fila
   */
  shuffleQueue: () => {
    set((state) => {
      // Salva a fila original
      const originalQueue = state.originalQueue.length > 0 
        ? state.originalQueue 
        : [...state.queue];
      
      // Pega a música atual
      const currentTrack = state.queue[state.currentIndex];
      
      // Embaralha todas as músicas exceto a atual
      const otherTracks = state.queue.filter((_, i) => i !== state.currentIndex);
      const shuffledOthers = shuffleArray(otherTracks);
      
      // Monta nova fila com música atual no início
      const newQueue = currentTrack 
        ? [currentTrack, ...shuffledOthers]
        : shuffleArray(state.queue);
      
      return {
        queue: newQueue,
        currentIndex: currentTrack ? 0 : -1,
        originalQueue,
      };
    });
  },

  /**
   * Restaura a ordem original da fila
   */
  unshuffleQueue: () => {
    set((state) => {
      if (state.originalQueue.length === 0) return state;
      
      return {
        queue: [...state.originalQueue],
        originalQueue: [],
        currentIndex: 0,
      };
    });
  },

  /**
   * Adiciona uma faixa ao histórico
   */
  addToHistory: (track: Track) => {
    set((state) => {
      const newHistory: HistoryEntry[] = [
        { track, playedAt: new Date() },
        ...state.history,
      ];
      
      // Mantém apenas as últimas 50 músicas no histórico
      return {
        history: newHistory.slice(0, 50),
      };
    });
  },

  /**
   * Limpa o histórico
   */
  clearHistory: () => {
    set({ history: [] });
  },

  /**
   * Retorna o tamanho da fila
   */
  getQueueLength: () => {
    return get().queue.length;
  },

  /**
   * Verifica se a fila está vazia
   */
  isQueueEmpty: () => {
    return get().queue.length === 0;
  },
}));
