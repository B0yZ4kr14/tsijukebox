// Hooks Player templates - 13 templates for player-related hooks
// Supports usePlayer, useVolume, useLyrics, useVoiceControl, etc.

export function generateHooksPlayerContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/player/index.ts':
      return `// Player hooks barrel export
export { usePlayer } from './usePlayer';
export { usePlaybackControls } from './usePlaybackControls';
export { useVolume } from './useVolume';
export { useLyrics } from './useLyrics';
export { useLibrary } from './useLibrary';
export { useLocalMusic } from './useLocalMusic';
export { useSpicetifyIntegration } from './useSpicetifyIntegration';
export { 
  useVoiceControl, 
  VOICE_COMMANDS, 
  type VoiceLanguage, 
  type VoiceControlSettings, 
  type VoiceCommand,
  type VoiceCommandEvent,
  type CustomVoiceCommand 
} from './useVoiceControl';
export { useVoiceSearch } from './useVoiceSearch';
export { useVolumeNormalization, type NormalizationMode, type VolumeNormalizationSettings } from './useVolumeNormalization';
export { useVoiceCommandHistory, type VoiceCommandHistoryEntry, type VoiceHistoryStats, type HistoryFilter } from './useVoiceCommandHistory';
export { useVoiceTraining, type VoiceTrainingSample, type VoiceTrainingSession, type SavedTrainingPattern, type TrainingStats } from './useVoiceTraining';
`;

    case 'src/hooks/player/usePlayer.ts':
      return `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PlaybackAction } from '@/lib/api/types';
import { toast } from 'sonner';

export function usePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (action: PlaybackAction) => api.controlPlayback(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao controlar player', {
        description: error.message,
      });
    },
  });

  return {
    play: () => mutation.mutate({ action: 'play' }),
    pause: () => mutation.mutate({ action: 'pause' }),
    next: () => mutation.mutate({ action: 'next' }),
    prev: () => mutation.mutate({ action: 'prev' }),
    stop: () => mutation.mutate({ action: 'stop' }),
    isLoading: mutation.isPending,
  };
}
`;

    case 'src/hooks/player/useVolume.ts':
      return `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { VolumeControl } from '@/lib/api/types';
import { toast } from 'sonner';

export function useVolume() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (control: VolumeControl) => api.setVolume(control),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao ajustar volume', {
        description: error.message,
      });
    },
  });

  return {
    setVolume: (level: number) => mutation.mutate({ level }),
    toggleMute: (mute: boolean) => mutation.mutate({ level: 0, mute }),
    isLoading: mutation.isPending,
  };
}
`;

    case 'src/hooks/player/useLyrics.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCachedLyrics, setCachedLyrics } from '@/lib/lyricsCache';
import type { LyricsData } from '@/types/lyrics';

export type { LyricsData } from '@/types/lyrics';

async function fetchLyrics(trackName: string, artistName: string): Promise<LyricsData> {
  const cached = getCachedLyrics(trackName, artistName);
  if (cached) {
    console.log('[Lyrics] Loaded from cache:', trackName);
    return cached;
  }

  const { data, error } = await supabase.functions.invoke('lyrics-search', {
    body: { trackName, artistName },
  });
  
  if (error) {
    console.error('[Lyrics] Error fetching:', error);
    throw new Error(error.message);
  }
  
  const lyricsData = data as LyricsData;
  
  if (lyricsData.source !== 'none') {
    setCachedLyrics(trackName, artistName, lyricsData);
    console.log('[Lyrics] Cached:', trackName);
  }
  
  return lyricsData;
}

export function useLyrics(trackName?: string, artistName?: string) {
  return useQuery({
    queryKey: ['lyrics', trackName, artistName],
    queryFn: () => fetchLyrics(trackName!, artistName!),
    enabled: !!trackName && !!artistName,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
}
`;

    case 'src/hooks/player/usePlaybackControls.ts':
      return `import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

type RepeatMode = 'off' | 'track' | 'context';

export function usePlaybackControls() {
  const queryClient = useQueryClient();
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');

  const queueQuery = useQuery({
    queryKey: ['queue'],
    queryFn: () => api.getQueue(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const shuffleMutation = useMutation({
    mutationFn: (state: boolean) => api.setShuffle(state),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue'] }),
    onError: (error: Error) => toast.error('Erro ao alternar shuffle', { description: error.message }),
  });

  const repeatMutation = useMutation({
    mutationFn: (mode: RepeatMode) => api.setRepeat(mode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue'] }),
    onError: (error: Error) => toast.error('Erro ao alternar repeat', { description: error.message }),
  });

  const toggleShuffle = useCallback(() => {
    const newState = !shuffle;
    setShuffle(newState);
    shuffleMutation.mutate(newState);
  }, [shuffle, shuffleMutation]);

  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'track', 'context'];
    const currentIndex = modes.indexOf(repeat);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeat(nextMode);
    repeatMutation.mutate(nextMode);
  }, [repeat, repeatMutation]);

  return {
    shuffle,
    repeat,
    queue: queueQuery.data ?? [],
    isQueueLoading: queueQuery.isLoading,
    toggleShuffle,
    toggleRepeat,
    refetchQueue: queueQuery.refetch,
  };
}
`;

    case 'src/hooks/player/useLibrary.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface LibraryTrack {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: number;
  path: string;
}

export function useLibrary() {
  const tracksQuery = useQuery({
    queryKey: ['library', 'tracks'],
    queryFn: () => api.getLibraryTracks(),
    staleTime: 1000 * 60 * 5,
  });

  const albumsQuery = useQuery({
    queryKey: ['library', 'albums'],
    queryFn: () => api.getLibraryAlbums(),
    staleTime: 1000 * 60 * 5,
  });

  const artistsQuery = useQuery({
    queryKey: ['library', 'artists'],
    queryFn: () => api.getLibraryArtists(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    tracks: tracksQuery.data ?? [],
    albums: albumsQuery.data ?? [],
    artists: artistsQuery.data ?? [],
    isLoading: tracksQuery.isLoading || albumsQuery.isLoading || artistsQuery.isLoading,
    refetch: () => {
      tracksQuery.refetch();
      albumsQuery.refetch();
      artistsQuery.refetch();
    },
  };
}
`;

    case 'src/hooks/player/useLocalMusic.ts':
      return `import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

export interface LocalTrack {
  id: string;
  path: string;
  name: string;
  artist: string;
  album?: string;
  duration: number;
  format: string;
}

export function useLocalMusic() {
  const queryClient = useQueryClient();
  const [scanProgress, setScanProgress] = useState(0);

  const tracksQuery = useQuery({
    queryKey: ['localMusic', 'tracks'],
    queryFn: () => api.getLocalTracks(),
    staleTime: 1000 * 60 * 10,
  });

  const scanMutation = useMutation({
    mutationFn: (paths: string[]) => api.scanLocalMusic(paths),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['localMusic'] });
      toast.success(\`Scan concluído: \${result.found} músicas encontradas\`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao escanear músicas', { description: error.message });
    },
  });

  const scan = useCallback((paths: string[]) => {
    setScanProgress(0);
    scanMutation.mutate(paths);
  }, [scanMutation]);

  return {
    tracks: tracksQuery.data ?? [],
    isLoading: tracksQuery.isLoading,
    isScanning: scanMutation.isPending,
    scanProgress,
    scan,
    refetch: tracksQuery.refetch,
  };
}
`;

    case 'src/hooks/player/useSpicetifyIntegration.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface SpicetifyStatus {
  installed: boolean;
  version?: string;
  extensions: string[];
  themes: string[];
  currentTheme?: string;
}

export function useSpicetifyIntegration() {
  const [status, setStatus] = useState<SpicetifyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getSpicetifyStatus();
      setStatus(result);
    } catch (error) {
      console.error('[Spicetify] Error checking status:', error);
      setStatus({ installed: false, extensions: [], themes: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyTheme = useCallback(async (themeName: string) => {
    try {
      await api.applySpicetifyTheme(themeName);
      toast.success(\`Tema "\${themeName}" aplicado\`);
      checkStatus();
    } catch (error) {
      toast.error('Erro ao aplicar tema');
    }
  }, [checkStatus]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    isLoading,
    isInstalled: status?.installed ?? false,
    checkStatus,
    applyTheme,
  };
}
`;

    case 'src/hooks/player/useVoiceControl.ts':
      return `import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type VoiceLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export interface VoiceControlSettings {
  enabled: boolean;
  language: VoiceLanguage;
  sensitivity: number;
  wakeWord: string;
}

export interface VoiceCommand {
  pattern: RegExp;
  action: string;
  description: string;
}

export interface VoiceCommandEvent {
  action: string;
  transcript: string;
  confidence: number;
  searchQuery?: string;
}

export interface CustomVoiceCommand {
  id: string;
  phrase: string;
  action: string;
  enabled: boolean;
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  { pattern: /^(tocar|play)/i, action: 'play', description: 'Iniciar reprodução' },
  { pattern: /^(pausar|pause|parar)/i, action: 'pause', description: 'Pausar reprodução' },
  { pattern: /^(próxima|next|skip)/i, action: 'next', description: 'Próxima música' },
  { pattern: /^(anterior|previous|back)/i, action: 'prev', description: 'Música anterior' },
  { pattern: /^(buscar|search|procurar) (.+)/i, action: 'search', description: 'Buscar música' },
];

export function useVoiceControl(settings?: Partial<VoiceControlSettings>) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const defaultSettings: VoiceControlSettings = {
    enabled: true,
    language: 'pt-BR',
    sensitivity: 0.7,
    wakeWord: 'jukebox',
    ...settings,
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Reconhecimento de voz não suportado');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = defaultSettings.language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcriptText = result[0].transcript.toLowerCase().trim();
      setTranscript(transcriptText);

      if (result.isFinal) {
        for (const command of VOICE_COMMANDS) {
          const match = transcriptText.match(command.pattern);
          if (match) {
            const detail: VoiceCommandEvent = {
              action: command.action,
              transcript: transcriptText,
              confidence: result[0].confidence,
              searchQuery: match[2],
            };
            window.dispatchEvent(new CustomEvent('voice-command', { detail }));
            break;
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Voice] Error:', event.error);
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [defaultSettings.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: 'webkitSpeechRecognition' in window,
  };
}
`;

    case 'src/hooks/player/useVoiceSearch.ts':
      return `import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { VoiceCommandEvent } from './useVoiceControl';

interface VoiceSearchOptions {
  autoNavigate?: boolean;
  provider?: 'spotify' | 'youtube' | 'local';
  onSearchTriggered?: (query: string) => void;
}

export function useVoiceSearch(options: VoiceSearchOptions = {}) {
  const navigate = useNavigate();
  const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    autoNavigate = true, 
    provider = 'spotify',
    onSearchTriggered 
  } = options;

  const searchByVoice = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setLastSearchQuery(query);
    setIsSearching(true);
    
    toast.info(\`🔍 Buscando: "\${query}"\`, { duration: 2000 });
    
    if (onSearchTriggered) {
      onSearchTriggered(query);
    }
    
    if (autoNavigate) {
      const searchPath = provider === 'youtube' 
        ? \`/youtube-music/search?q=\${encodeURIComponent(query)}\`
        : \`/spotify/search?q=\${encodeURIComponent(query)}\`;
      
      navigate(searchPath);
    }
    
    setIsSearching(false);
  }, [autoNavigate, provider, navigate, onSearchTriggered]);

  const clearSearch = useCallback(() => {
    setLastSearchQuery(null);
  }, []);

  useEffect(() => {
    const handleVoiceSearch = (event: CustomEvent<VoiceCommandEvent>) => {
      const { action, searchQuery } = event.detail;
      if (action !== 'search' || !searchQuery) return;
      searchByVoice(searchQuery);
    };

    window.addEventListener('voice-command', handleVoiceSearch as EventListener);
    return () => window.removeEventListener('voice-command', handleVoiceSearch as EventListener);
  }, [searchByVoice]);

  return {
    lastSearchQuery,
    isSearching,
    searchByVoice,
    clearSearch
  };
}
`;

    case 'src/hooks/player/useVolumeNormalization.ts':
      return `import { useState, useEffect, useCallback, useMemo } from 'react';

export type NormalizationMode = 'soft' | 'moderate' | 'aggressive';

export interface VolumeNormalizationSettings {
  enabled: boolean;
  mode: NormalizationMode;
  targetLoudness: number;
  peakLimit: number;
}

const STORAGE_KEY = 'volume-normalization-settings';

const defaultSettings: VolumeNormalizationSettings = {
  enabled: false,
  mode: 'moderate',
  targetLoudness: -14,
  peakLimit: -1,
};

const PRESETS = {
  soft: { threshold: -30, ratio: 2, attack: 50, release: 200, knee: 10 },
  moderate: { threshold: -24, ratio: 4, attack: 20, release: 150, knee: 6 },
  aggressive: { threshold: -18, ratio: 8, attack: 5, release: 100, knee: 3 },
};

function loadSettings(): VolumeNormalizationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch (e) {
    console.error('[Normalization] Error loading settings:', e);
  }
  return defaultSettings;
}

export function useVolumeNormalization() {
  const [settings, setSettings] = useState<VolumeNormalizationSettings>(loadSettings);
  const [currentLoudness, setCurrentLoudness] = useState(-23);
  const [gainAdjustment, setGainAdjustment] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const saveSettings = useCallback((newSettings: VolumeNormalizationSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }, []);

  const updateSettings = useCallback((updates: Partial<VolumeNormalizationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  const toggleEnabled = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  const setMode = useCallback((mode: NormalizationMode) => {
    updateSettings({ mode });
  }, [updateSettings]);

  const gainMultiplier = useMemo(() => {
    if (!settings.enabled) return 1;
    const gainDb = settings.targetLoudness - currentLoudness + gainAdjustment;
    const limited = Math.min(gainDb, settings.peakLimit);
    return Math.pow(10, limited / 20);
  }, [settings.enabled, settings.targetLoudness, currentLoudness, gainAdjustment, settings.peakLimit]);

  useEffect(() => {
    if (!settings.enabled) {
      setGainAdjustment(0);
      return;
    }
    
    setIsProcessing(true);
    const timer = setTimeout(() => {
      const diff = settings.targetLoudness - currentLoudness;
      setGainAdjustment(diff * 0.8);
      setIsProcessing(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [settings.enabled, settings.targetLoudness, currentLoudness]);

  return {
    settings,
    updateSettings,
    toggleEnabled,
    setMode,
    currentLoudness,
    gainAdjustment,
    gainMultiplier,
    isProcessing,
    presets: PRESETS,
    resetToDefaults: () => {
      setSettings(defaultSettings);
      saveSettings(defaultSettings);
    },
  };
}
`;

    case 'src/hooks/player/useVoiceCommandHistory.ts':
      return `import { useState, useCallback, useMemo } from 'react';

export interface VoiceCommandHistoryEntry {
  id: string;
  timestamp: Date;
  transcript: string;
  action: string;
  confidence: number;
  success: boolean;
  errorMessage?: string;
}

export interface VoiceHistoryStats {
  totalCommands: number;
  successRate: number;
  avgConfidence: number;
  topActions: { action: string; count: number }[];
}

export interface HistoryFilter {
  action?: string;
  success?: boolean;
  minConfidence?: number;
  dateRange?: { start: Date; end: Date };
}

const STORAGE_KEY = 'voice-command-history';
const MAX_ENTRIES = 100;

export function useVoiceCommandHistory() {
  const [history, setHistory] = useState<VoiceCommandHistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (e) {
      console.error('[VoiceHistory] Error loading:', e);
    }
    return [];
  });

  const saveHistory = useCallback((entries: VoiceCommandHistoryEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  const addEntry = useCallback((entry: Omit<VoiceCommandHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: VoiceCommandHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const stats = useMemo<VoiceHistoryStats>(() => {
    if (history.length === 0) {
      return { totalCommands: 0, successRate: 0, avgConfidence: 0, topActions: [] };
    }

    const successCount = history.filter(h => h.success).length;
    const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / history.length;
    
    const actionCounts: Record<string, number> = {};
    history.forEach(h => {
      actionCounts[h.action] = (actionCounts[h.action] || 0) + 1;
    });
    
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCommands: history.length,
      successRate: (successCount / history.length) * 100,
      avgConfidence: avgConfidence * 100,
      topActions,
    };
  }, [history]);

  const filterHistory = useCallback((filter: HistoryFilter) => {
    return history.filter(entry => {
      if (filter.action && entry.action !== filter.action) return false;
      if (filter.success !== undefined && entry.success !== filter.success) return false;
      if (filter.minConfidence && entry.confidence < filter.minConfidence) return false;
      if (filter.dateRange) {
        if (entry.timestamp < filter.dateRange.start || entry.timestamp > filter.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  }, [history]);

  return {
    history,
    stats,
    addEntry,
    clearHistory,
    filterHistory,
  };
}
`;

    case 'src/hooks/player/useVoiceTraining.ts':
      return `import { useState, useCallback } from 'react';
import type { CustomVoiceCommand } from './useVoiceControl';

export interface VoiceTrainingSample {
  id: string;
  transcript: string;
  confidence: number;
  recordedAt: Date;
  approved: boolean;
}

export interface VoiceTrainingSession {
  id: string;
  targetAction: string;
  targetCommand: string;
  samples: VoiceTrainingSample[];
  status: 'recording' | 'reviewing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface SavedTrainingPattern {
  id: string;
  action: string;
  phrase: string;
  samples: VoiceTrainingSample[];
  avgConfidence: number;
  createdAt: Date;
}

export interface TrainingStats {
  totalPatterns: number;
  totalSamples: number;
  avgConfidence: number;
  actionsConfigured: string[];
}

const STORAGE_KEY = 'voice-training-patterns';
const MIN_SAMPLES = 3;

function loadSavedPatterns(): SavedTrainingPattern[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        samples: p.samples.map((s: any) => ({
          ...s,
          recordedAt: new Date(s.recordedAt),
        })),
      }));
    }
  } catch (e) {
    console.error('[VoiceTraining] Error loading patterns:', e);
  }
  return [];
}

export function useVoiceTraining() {
  const [currentSession, setCurrentSession] = useState<VoiceTrainingSession | null>(null);
  const [savedPatterns, setSavedPatterns] = useState<SavedTrainingPattern[]>(loadSavedPatterns);
  const [isRecording, setIsRecording] = useState(false);

  const savePatternsToStorage = useCallback((patterns: SavedTrainingPattern[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  }, []);

  const startSession = useCallback((targetAction: string, targetCommand: string) => {
    const session: VoiceTrainingSession = {
      id: crypto.randomUUID(),
      targetAction,
      targetCommand,
      samples: [],
      status: 'recording',
      createdAt: new Date(),
    };
    setCurrentSession(session);
    setIsRecording(true);
  }, []);

  const recordSample = useCallback((transcript: string, confidence: number) => {
    if (!currentSession) return;
    
    const sample: VoiceTrainingSample = {
      id: crypto.randomUUID(),
      transcript,
      confidence,
      recordedAt: new Date(),
      approved: false,
    };
    
    setCurrentSession(prev => prev ? {
      ...prev,
      samples: [...prev.samples, sample],
    } : null);
  }, [currentSession]);

  const reviewSample = useCallback((sampleId: string, approved: boolean, editedTranscript?: string) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        samples: prev.samples.map(s => 
          s.id === sampleId 
            ? { ...s, approved, transcript: editedTranscript ?? s.transcript }
            : s
        ),
      };
    });
  }, []);

  const completeSession = useCallback((): CustomVoiceCommand | null => {
    if (!currentSession) return null;
    
    const approvedSamples = currentSession.samples.filter(s => s.approved);
    if (approvedSamples.length < MIN_SAMPLES) {
      return null;
    }

    const avgConfidence = approvedSamples.reduce((sum, s) => sum + s.confidence, 0) / approvedSamples.length;

    const pattern: SavedTrainingPattern = {
      id: crypto.randomUUID(),
      action: currentSession.targetAction,
      phrase: currentSession.targetCommand,
      samples: approvedSamples,
      avgConfidence,
      createdAt: new Date(),
    };

    const updatedPatterns = [...savedPatterns, pattern];
    setSavedPatterns(updatedPatterns);
    savePatternsToStorage(updatedPatterns);

    const customCommand: CustomVoiceCommand = {
      id: pattern.id,
      phrase: pattern.phrase,
      action: pattern.action,
      enabled: true,
    };

    setCurrentSession(null);
    setIsRecording(false);
    
    return customCommand;
  }, [currentSession, savedPatterns, savePatternsToStorage]);

  const cancelSession = useCallback(() => {
    setCurrentSession(null);
    setIsRecording(false);
  }, []);

  const deleteSavedPattern = useCallback((id: string) => {
    const updated = savedPatterns.filter(p => p.id !== id);
    setSavedPatterns(updated);
    savePatternsToStorage(updated);
  }, [savedPatterns, savePatternsToStorage]);

  const getTrainingStats = useCallback((): TrainingStats => {
    const totalSamples = savedPatterns.reduce((sum, p) => sum + p.samples.length, 0);
    const avgConfidence = savedPatterns.length > 0
      ? savedPatterns.reduce((sum, p) => sum + p.avgConfidence, 0) / savedPatterns.length
      : 0;
    
    return {
      totalPatterns: savedPatterns.length,
      totalSamples,
      avgConfidence: avgConfidence * 100,
      actionsConfigured: [...new Set(savedPatterns.map(p => p.action))],
    };
  }, [savedPatterns]);

  return {
    currentSession,
    savedPatterns,
    isRecording,
    startSession,
    recordSample,
    reviewSample,
    completeSession,
    cancelSession,
    deleteSavedPattern,
    getTrainingStats,
    minSamplesRequired: MIN_SAMPLES,
  };
}
`;

    default:
      return null;
  }
}
