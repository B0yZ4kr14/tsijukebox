import { create } from 'zustand';

/**
 * Interface para informações de uma faixa
 */
export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt?: string;
  duration: number; // em segundos
  uri?: string; // URI do Spotify
  source: 'spotify' | 'local' | 'youtube';
}

/**
 * Tipos de qualidade de áudio
 */
export type AudioQuality = 'low' | 'normal' | 'high' | 'lossless';

/**
 * Estados de reprodução
 */
export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'loading' | 'buffering';

/**
 * Interface para o estado do player
 */
interface PlayerState {
  // Faixa atual
  currentTrack: Track | null;
  
  // Estado de reprodução
  playbackState: PlaybackState;
  isPlaying: boolean;
  
  // Progresso
  currentTime: number; // em segundos
  duration: number; // em segundos
  
  // Volume
  volume: number; // 0-100
  isMuted: boolean;
  previousVolume: number;
  
  // Configurações
  shuffle: boolean;
  repeat: 'off' | 'track' | 'queue';
  audioQuality: AudioQuality;
  
  // Erro
  error: string | null;
  
  // Ações de reprodução
  play: (track?: Track) => void;
  pause: () => void;
  stop: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  
  // Navegação
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  
  // Volume
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Configurações
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setAudioQuality: (quality: AudioQuality) => void;
  
  // Estado
  setCurrentTrack: (track: Track | null) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setError: (error: string | null) => void;
}

/**
 * Store Zustand para gerenciamento do estado do player
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Estado inicial
  currentTrack: null,
  playbackState: 'stopped',
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 75,
  isMuted: false,
  previousVolume: 75,
  shuffle: false,
  repeat: 'off',
  audioQuality: 'high',
  error: null,

  /**
   * Inicia a reprodução de uma faixa
   */
  play: (track?: Track) => {
    if (track) {
      set({
        currentTrack: track,
        playbackState: 'loading',
        isPlaying: true,
        currentTime: 0,
        duration: track.duration,
        error: null,
      });
    } else {
      const { currentTrack } = get();
      if (currentTrack) {
        set({
          playbackState: 'playing',
          isPlaying: true,
        });
      }
    }
  },

  /**
   * Pausa a reprodução
   */
  pause: () => {
    set({
      playbackState: 'paused',
      isPlaying: false,
    });
  },

  /**
   * Para a reprodução
   */
  stop: () => {
    set({
      playbackState: 'stopped',
      isPlaying: false,
      currentTime: 0,
    });
  },

  /**
   * Retoma a reprodução
   */
  resume: () => {
    const { currentTrack } = get();
    if (currentTrack) {
      set({
        playbackState: 'playing',
        isPlaying: true,
      });
    }
  },

  /**
   * Alterna entre play e pause
   */
  togglePlayPause: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    
    if (isPlaying) {
      get().pause();
    } else {
      get().resume();
    }
  },

  /**
   * Avança para a próxima faixa
   */
  next: () => {
    // Implementação será feita em conjunto com useQueueStore
    console.log('Next track');
  },

  /**
   * Volta para a faixa anterior
   */
  previous: () => {
    const { currentTime } = get();
    
    // Se passou mais de 3 segundos, volta para o início da música
    if (currentTime > 3) {
      get().seek(0);
    } else {
      // Senão, vai para a música anterior
      console.log('Previous track');
    }
  },

  /**
   * Navega para um ponto específico da faixa
   */
  seek: (time: number) => {
    const { duration } = get();
    const clampedTime = Math.max(0, Math.min(time, duration));
    set({ currentTime: clampedTime });
  },

  /**
   * Define o volume
   */
  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    set({ 
      volume: clampedVolume,
      isMuted: clampedVolume === 0,
    });
  },

  /**
   * Alterna mudo
   */
  toggleMute: () => {
    const { isMuted, volume, previousVolume } = get();
    
    if (isMuted) {
      // Desmuta e restaura volume anterior
      set({
        isMuted: false,
        volume: previousVolume > 0 ? previousVolume : 75,
      });
    } else {
      // Muta e salva volume atual
      set({
        isMuted: true,
        previousVolume: volume,
        volume: 0,
      });
    }
  },

  /**
   * Alterna modo aleatório
   */
  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  /**
   * Alterna modo de repetição
   */
  toggleRepeat: () => {
    set((state) => {
      const modes: Array<'off' | 'track' | 'queue'> = ['off', 'queue', 'track'];
      const currentIndex = modes.indexOf(state.repeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { repeat: modes[nextIndex] };
    });
  },

  /**
   * Define a qualidade do áudio
   */
  setAudioQuality: (quality: AudioQuality) => {
    set({ audioQuality: quality });
  },

  /**
   * Define a faixa atual
   */
  setCurrentTrack: (track: Track | null) => {
    set({ 
      currentTrack: track,
      currentTime: 0,
      duration: track?.duration || 0,
    });
  },

  /**
   * Define o estado de reprodução
   */
  setPlaybackState: (state: PlaybackState) => {
    set({ 
      playbackState: state,
      isPlaying: state === 'playing' || state === 'buffering',
    });
  },

  /**
   * Atualiza o tempo atual
   */
  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  /**
   * Define a duração total
   */
  setDuration: (duration: number) => {
    set({ duration });
  },

  /**
   * Define uma mensagem de erro
   */
  setError: (error: string | null) => {
    set({ error });
  },
}));
