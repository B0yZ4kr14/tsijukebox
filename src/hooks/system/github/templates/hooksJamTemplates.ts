// Hooks Jam templates - 6 templates for Jam Session-related hooks
// Supports useJamSession, useJamQueue, useJamParticipants, useJamReactions, etc.

export function generateHooksJamContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/jam/index.ts':
      return `export { useJamSession } from './useJamSession';
export type { JamSession, CurrentTrack, PlaybackState, CreateJamConfig } from './useJamSession';

export { useJamParticipants } from './useJamParticipants';
export type { JamParticipant } from './useJamParticipants';

export { useJamQueue } from './useJamQueue';
export type { JamQueueItem, AddTrackParams } from './useJamQueue';

export { useJamMusicSearch } from './useJamMusicSearch';
export type { JamTrack, MusicProvider } from './useJamMusicSearch';

export { useJamReactions, REACTION_EMOJIS } from './useJamReactions';
export type { JamReaction, ReactionEmoji } from './useJamReactions';
`;

    case 'src/hooks/jam/useJamSession.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CurrentTrack {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  duration: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  position: number;
  updatedAt: string;
}

export interface JamSession {
  id: string;
  code: string;
  name: string;
  hostId: string | null;
  hostNickname: string | null;
  isActive: boolean;
  privacy: 'public' | 'private';
  accessCode: string | null;
  maxParticipants: number;
  currentTrack: CurrentTrack | null;
  playbackState: PlaybackState | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJamConfig {
  name: string;
  nickname: string;
  privacy?: 'public' | 'private';
  maxParticipants?: number;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useJamSession() {
  const [session, setSession] = useState<JamSession | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(async (config: CreateJamConfig) => {
    setIsLoading(true);
    try {
      const code = generateCode();
      const accessCode = config.privacy === 'private' ? generateCode() : null;
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('jam_sessions')
        .insert({
          code,
          name: config.name,
          host_nickname: config.nickname,
          privacy: config.privacy ?? 'public',
          access_code: accessCode,
          max_participants: config.maxParticipants ?? 10,
          is_active: true,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { data: participantData, error: participantError } = await supabase
        .from('jam_participants')
        .insert({
          session_id: sessionData.id,
          nickname: config.nickname,
          is_host: true,
          is_active: true,
          avatar_color: \`#\${Math.floor(Math.random()*16777215).toString(16)}\`,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      setSession({
        id: sessionData.id,
        code: sessionData.code,
        name: sessionData.name,
        hostId: participantData.id,
        hostNickname: sessionData.host_nickname,
        isActive: sessionData.is_active,
        privacy: sessionData.privacy,
        accessCode: sessionData.access_code,
        maxParticipants: sessionData.max_participants,
        currentTrack: null,
        playbackState: null,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
      });
      setParticipantId(participantData.id);

      toast.success(\`Jam "\${config.name}" criada! Código: \${code}\`);
      return sessionData;
    } catch (error: any) {
      toast.error('Erro ao criar jam', { description: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinSession = useCallback(async (code: string, nickname: string, accessCode?: string) => {
    setIsLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('jam_sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (sessionError) throw new Error('Jam não encontrada');

      if (sessionData.privacy === 'private' && sessionData.access_code !== accessCode) {
        throw new Error('Código de acesso inválido');
      }

      const { data: participantData, error: participantError } = await supabase
        .from('jam_participants')
        .insert({
          session_id: sessionData.id,
          nickname,
          is_host: false,
          is_active: true,
          avatar_color: \`#\${Math.floor(Math.random()*16777215).toString(16)}\`,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      setSession({
        id: sessionData.id,
        code: sessionData.code,
        name: sessionData.name,
        hostId: null,
        hostNickname: sessionData.host_nickname,
        isActive: sessionData.is_active,
        privacy: sessionData.privacy,
        accessCode: null,
        maxParticipants: sessionData.max_participants,
        currentTrack: sessionData.current_track as CurrentTrack | null,
        playbackState: sessionData.playback_state as PlaybackState | null,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
      });
      setParticipantId(participantData.id);

      toast.success(\`Você entrou na jam "\${sessionData.name}"!\`);
      return sessionData;
    } catch (error: any) {
      toast.error('Erro ao entrar na jam', { description: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveSession = useCallback(async () => {
    if (!session || !participantId) return;

    try {
      await supabase
        .from('jam_participants')
        .update({ is_active: false })
        .eq('id', participantId);

      setSession(null);
      setParticipantId(null);
      toast.info('Você saiu da jam');
    } catch (error: any) {
      toast.error('Erro ao sair da jam', { description: error.message });
    }
  }, [session, participantId]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(\`jam_session_\${session.id}\`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jam_sessions', filter: \`id=eq.\${session.id}\` },
        (payload) => {
          const updated = payload.new as any;
          setSession(prev => prev ? {
            ...prev,
            currentTrack: updated.current_track,
            playbackState: updated.playback_state,
            isActive: updated.is_active,
            updatedAt: updated.updated_at,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  return {
    session,
    participantId,
    isLoading,
    isHost: session?.hostId === participantId,
    createSession,
    joinSession,
    leaveSession,
  };
}
`;

    case 'src/hooks/jam/useJamParticipants.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JamParticipant {
  id: string;
  sessionId: string;
  userId: string | null;
  nickname: string;
  avatarColor: string;
  isHost: boolean;
  isActive: boolean;
  joinedAt: string;
  lastSeenAt: string;
}

export function useJamParticipants(sessionId: string | null) {
  const [participants, setParticipants] = useState<JamParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jam_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      setParticipants(data.map(p => ({
        id: p.id,
        sessionId: p.session_id,
        userId: p.user_id,
        nickname: p.nickname,
        avatarColor: p.avatar_color ?? '#6366f1',
        isHost: p.is_host ?? false,
        isActive: p.is_active ?? true,
        joinedAt: p.joined_at ?? new Date().toISOString(),
        lastSeenAt: p.last_seen_at ?? new Date().toISOString(),
      })));
    } catch (error) {
      console.error('[JamParticipants] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const updatePresence = useCallback(async (participantId: string) => {
    await supabase
      .from('jam_participants')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', participantId);
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(\`jam_participants_\${sessionId}\`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jam_participants', filter: \`session_id=eq.\${sessionId}\` },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchParticipants]);

  const hostParticipant = participants.find(p => p.isHost);
  const guestParticipants = participants.filter(p => !p.isHost);

  return {
    participants,
    hostParticipant,
    guestParticipants,
    participantCount: participants.length,
    isLoading,
    updatePresence,
    refetch: fetchParticipants,
  };
}
`;

    case 'src/hooks/jam/useJamQueue.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JamQueueItem {
  id: string;
  sessionId: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt: string | null;
  durationMs: number | null;
  addedBy: string | null;
  addedByNickname: string | null;
  votes: number;
  isPlayed: boolean;
  position: number;
  createdAt: string;
}

export interface AddTrackParams {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  durationMs?: number;
}

export function useJamQueue(sessionId: string | null, participantId: string | null, nickname: string | null) {
  const [queue, setQueue] = useState<JamQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('jam_queue')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_played', false)
        .order('votes', { ascending: false })
        .order('position', { ascending: true });

      if (error) throw error;

      setQueue(data.map(item => ({
        id: item.id,
        sessionId: item.session_id,
        trackId: item.track_id,
        trackName: item.track_name,
        artistName: item.artist_name,
        albumArt: item.album_art,
        durationMs: item.duration_ms,
        addedBy: item.added_by,
        addedByNickname: item.added_by_nickname,
        votes: item.votes ?? 0,
        isPlayed: item.is_played ?? false,
        position: item.position,
        createdAt: item.created_at ?? new Date().toISOString(),
      })));
    } catch (error) {
      console.error('[JamQueue] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const addToQueue = useCallback(async (track: AddTrackParams) => {
    if (!sessionId || !participantId) return;

    try {
      const nextPosition = queue.length + 1;
      
      const { error } = await supabase
        .from('jam_queue')
        .insert({
          session_id: sessionId,
          track_id: track.trackId,
          track_name: track.trackName,
          artist_name: track.artistName,
          album_art: track.albumArt,
          duration_ms: track.durationMs,
          added_by: participantId,
          added_by_nickname: nickname,
          position: nextPosition,
          votes: 0,
        });

      if (error) throw error;
      toast.success(\`"\${track.trackName}" adicionada à fila\`);
    } catch (error: any) {
      toast.error('Erro ao adicionar à fila', { description: error.message });
    }
  }, [sessionId, participantId, nickname, queue.length]);

  const voteTrack = useCallback(async (queueItemId: string) => {
    try {
      const item = queue.find(q => q.id === queueItemId);
      if (!item) return;

      const { error } = await supabase
        .from('jam_queue')
        .update({ votes: item.votes + 1 })
        .eq('id', queueItemId);

      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro ao votar', { description: error.message });
    }
  }, [queue]);

  const removeFromQueue = useCallback(async (queueItemId: string) => {
    try {
      const { error } = await supabase
        .from('jam_queue')
        .delete()
        .eq('id', queueItemId);

      if (error) throw error;
      toast.success('Música removida da fila');
    } catch (error: any) {
      toast.error('Erro ao remover', { description: error.message });
    }
  }, []);

  const markAsPlayed = useCallback(async (queueItemId: string) => {
    try {
      const { error } = await supabase
        .from('jam_queue')
        .update({ is_played: true })
        .eq('id', queueItemId);

      if (error) throw error;
    } catch (error) {
      console.error('[JamQueue] Error marking as played:', error);
    }
  }, []);

  const getNextTrack = useCallback(() => {
    return queue[0] ?? null;
  }, [queue]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(\`jam_queue_\${sessionId}\`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jam_queue', filter: \`session_id=eq.\${sessionId}\` },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchQueue]);

  return {
    queue,
    queueLength: queue.length,
    isLoading,
    addToQueue,
    voteTrack,
    removeFromQueue,
    markAsPlayed,
    getNextTrack,
    refetch: fetchQueue,
  };
}
`;

    case 'src/hooks/jam/useJamMusicSearch.ts':
      return `import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';

export type MusicProvider = 'spotify' | 'youtube' | 'demo';

export interface JamTrack {
  id: string;
  provider: MusicProvider;
  name: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: number;
}

const DEMO_TRACKS: JamTrack[] = [
  { id: 'demo-1', provider: 'demo', name: 'Bohemian Rhapsody', artist: 'Queen', duration: 354000 },
  { id: 'demo-2', provider: 'demo', name: 'Billie Jean', artist: 'Michael Jackson', duration: 293000 },
  { id: 'demo-3', provider: 'demo', name: 'Sweet Child O Mine', artist: "Guns N' Roses", duration: 356000 },
  { id: 'demo-4', provider: 'demo', name: 'Smells Like Teen Spirit', artist: 'Nirvana', duration: 301000 },
  { id: 'demo-5', provider: 'demo', name: 'Hotel California', artist: 'Eagles', duration: 390000 },
];

export function useJamMusicSearch() {
  const [query, setQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState<MusicProvider>('demo');
  const debouncedQuery = useDebounce(query, 300);

  const { isConnected: spotifyConnected, api: spotifyApi } = useSpotifyContext();
  const { isConnected: youtubeConnected, api: youtubeApi } = useYouTubeMusicContext();

  const spotifyQuery = useQuery({
    queryKey: ['jam-search', 'spotify', debouncedQuery],
    queryFn: async () => {
      if (!spotifyApi) return { tracks: { items: [] } };
      return spotifyApi.searchTracks(debouncedQuery, { limit: 10 });
    },
    enabled: !!debouncedQuery && spotifyConnected && activeProvider === 'spotify',
  });

  const youtubeQuery = useQuery({
    queryKey: ['jam-search', 'youtube', debouncedQuery],
    queryFn: async () => {
      if (!youtubeApi) return [];
      return youtubeApi.search(debouncedQuery, 'songs');
    },
    enabled: !!debouncedQuery && youtubeConnected && activeProvider === 'youtube',
  });

  const spotifyResults = useMemo<JamTrack[]>(() => {
    if (!spotifyQuery.data?.tracks?.items) return [];
    return spotifyQuery.data.tracks.items.map(track => ({
      id: track.id,
      provider: 'spotify' as const,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      duration: track.duration_ms,
    }));
  }, [spotifyQuery.data]);

  const youtubeResults = useMemo<JamTrack[]>(() => {
    if (!Array.isArray(youtubeQuery.data)) return [];
    return youtubeQuery.data.map((track: any) => ({
      id: track.videoId,
      provider: 'youtube' as const,
      name: track.title,
      artist: track.artist,
      album: track.album,
      albumArt: track.thumbnailUrl,
      duration: track.duration * 1000,
    }));
  }, [youtubeQuery.data]);

  const demoResults = useMemo<JamTrack[]>(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return DEMO_TRACKS.filter(t => 
      t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const results = activeProvider === 'spotify' 
    ? spotifyResults 
    : activeProvider === 'youtube' 
      ? youtubeResults 
      : demoResults;

  const isLoading = activeProvider === 'spotify' 
    ? spotifyQuery.isLoading 
    : activeProvider === 'youtube' 
      ? youtubeQuery.isLoading 
      : false;

  return {
    query,
    setQuery,
    activeProvider,
    setActiveProvider,
    results,
    isLoading,
    spotifyConnected,
    youtubeConnected,
    clearSearch: () => setQuery(''),
  };
}
`;

    case 'src/hooks/jam/useJamReactions.ts':
      return `import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ReactionEmoji = '🔥' | '❤️' | '👏' | '🎉' | '😍' | '🤘';

export const REACTION_EMOJIS: ReactionEmoji[] = ['🔥', '❤️', '👏', '🎉', '😍', '🤘'];

export interface JamReaction {
  id: string;
  emoji: ReactionEmoji;
  participantNickname: string;
  createdAt: string;
  position?: { x: number; y: number };
}

const COOLDOWN_MS = 1500;
const DISPLAY_DURATION_MS = 3000;

export function useJamReactions(sessionId: string | null, participantId: string | null, nickname: string | null) {
  const [reactions, setReactions] = useState<JamReaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionEmoji, number>>({
    '🔥': 0, '❤️': 0, '👏': 0, '🎉': 0, '😍': 0, '🤘': 0
  });
  const cooldownRef = useRef<Record<string, number>>({});

  const isOnCooldown = useCallback((emoji: ReactionEmoji) => {
    const lastUsed = cooldownRef.current[emoji];
    if (!lastUsed) return false;
    return Date.now() - lastUsed < COOLDOWN_MS;
  }, []);

  const sendReaction = useCallback(async (emoji: ReactionEmoji, trackId?: string) => {
    if (!sessionId || !participantId || !nickname) return;
    if (isOnCooldown(emoji)) return;

    cooldownRef.current[emoji] = Date.now();

    // Optimistic update
    const tempId = crypto.randomUUID();
    const newReaction: JamReaction = {
      id: tempId,
      emoji,
      participantNickname: nickname,
      createdAt: new Date().toISOString(),
      position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 },
    };
    
    setReactions(prev => [...prev, newReaction]);
    setReactionCounts(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));

    // Remove after display duration
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== tempId));
    }, DISPLAY_DURATION_MS);

    try {
      await supabase
        .from('jam_reactions')
        .insert({
          session_id: sessionId,
          participant_id: participantId,
          participant_nickname: nickname,
          emoji,
          track_id: trackId,
        });
    } catch (error) {
      console.error('[JamReactions] Error:', error);
    }
  }, [sessionId, participantId, nickname, isOnCooldown]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(\`jam_reactions_\${sessionId}\`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jam_reactions', filter: \`session_id=eq.\${sessionId}\` },
        (payload) => {
          const data = payload.new as any;
          
          // Skip own reactions (already handled optimistically)
          if (data.participant_id === participantId) return;

          const reaction: JamReaction = {
            id: data.id,
            emoji: data.emoji as ReactionEmoji,
            participantNickname: data.participant_nickname,
            createdAt: data.created_at,
            position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 },
          };

          setReactions(prev => [...prev, reaction]);
          setReactionCounts(prev => ({ ...prev, [data.emoji]: (prev[data.emoji as ReactionEmoji] || 0) + 1 }));

          setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== data.id));
          }, DISPLAY_DURATION_MS);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, participantId]);

  // Reset counts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setReactionCounts({ '🔥': 0, '❤️': 0, '👏': 0, '🎉': 0, '😍': 0, '🤘': 0 });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    reactions,
    reactionCounts,
    sendReaction,
    isOnCooldown,
    REACTION_EMOJIS,
  };
}
`;

    default:
      return null;
  }
}
