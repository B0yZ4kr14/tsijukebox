import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface JamSession {
  id: string;
  code: string;
  name: string;
  host_id: string | null;
  host_nickname: string | null;
  privacy: 'public' | 'private' | 'code';
  access_code: string | null;
  playlist_id: string | null;
  playlist_name: string | null;
  current_track: CurrentTrack | null;
  playback_state: PlaybackState;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

export interface CurrentTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_art: string | null;
  duration_ms: number;
}

export interface PlaybackState {
  is_playing: boolean;
  position_ms: number;
  updated_at?: string;
}

export interface CreateJamConfig {
  name: string;
  privacy: 'public' | 'private' | 'code';
  accessCode?: string;
  playlistId?: string;
  playlistName?: string;
  hostNickname: string;
}

function generateJamCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateAvatarColor(): string {
  const colors = [
    '#00d4ff', '#ff6b6b', '#4ecdc4', '#ffe66d', 
    '#95e1d3', '#f38181', '#aa96da', '#fcbad3',
    '#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function useJamSession() {
  const [session, setSession] = useState<JamSession | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new JAM session
  const createSession = useCallback(async (config: CreateJamConfig): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const code = generateJamCode();
      
      // Create the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('jam_sessions')
        .insert({
          code,
          name: config.name,
          host_nickname: config.hostNickname,
          privacy: config.privacy,
          access_code: config.accessCode || null,
          playlist_id: config.playlistId || null,
          playlist_name: config.playlistName || null,
          playback_state: { is_playing: false, position_ms: 0 },
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add host as first participant
      const { data: participantData, error: participantError } = await supabase
        .from('jam_participants')
        .insert({
          session_id: sessionData.id,
          nickname: config.hostNickname,
          avatar_color: generateAvatarColor(),
          is_host: true,
          is_active: true,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      setSession(sessionData as unknown as JamSession);
      setParticipantId(participantData.id);
      setIsHost(true);

      console.log('[JAM] Session created:', code);
      return code;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar sessão';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join an existing JAM session
  const joinSession = useCallback(async (code: string, nickname: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Find the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('jam_sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          throw new Error('Sessão não encontrada ou inativa');
        }
        throw sessionError;
      }

      // Check nickname uniqueness in session
      const { data: existingParticipant } = await supabase
        .from('jam_participants')
        .select('id')
        .eq('session_id', sessionData.id)
        .eq('nickname', nickname)
        .eq('is_active', true)
        .single();

      if (existingParticipant) {
        throw new Error('Este nome já está em uso nesta sessão');
      }

      // Join as participant
      const { data: participantData, error: participantError } = await supabase
        .from('jam_participants')
        .insert({
          session_id: sessionData.id,
          nickname,
          avatar_color: generateAvatarColor(),
          is_host: false,
          is_active: true,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      setSession(sessionData as unknown as JamSession);
      setParticipantId(participantData.id);
      setIsHost(false);

      console.log('[JAM] Joined session:', code);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao entrar na sessão';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leave the current session
  const leaveSession = useCallback(async () => {
    if (!session || !participantId) return;

    try {
      // Mark participant as inactive
      await supabase
        .from('jam_participants')
        .update({ is_active: false })
        .eq('id', participantId);

      // If host, end the session
      if (isHost) {
        await supabase
          .from('jam_sessions')
          .update({ is_active: false })
          .eq('id', session.id);
      }

      console.log('[JAM] Left session:', session.code);
    } catch (err) {
      console.error('[JAM] Error leaving session:', err);
    } finally {
      setSession(null);
      setParticipantId(null);
      setIsHost(false);
    }
  }, [session, participantId, isHost]);

  // Update playback state (host only)
  const updatePlaybackState = useCallback(async (state: Partial<PlaybackState>) => {
    if (!session || !isHost) return;

    try {
      const newState = {
        ...session.playback_state,
        ...state,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('jam_sessions')
        .update({ playback_state: newState })
        .eq('id', session.id);
    } catch (err) {
      console.error('[JAM] Error updating playback:', err);
    }
  }, [session, isHost]);

  // Update current track (host only)
  const updateCurrentTrack = useCallback(async (track: CurrentTrack | null) => {
    if (!session || !isHost) return;

    try {
      await supabase
        .from('jam_sessions')
        .update({ 
          current_track: track as unknown as Json,
          playback_state: { is_playing: !!track, position_ms: 0, updated_at: new Date().toISOString() }
        })
        .eq('id', session.id);
    } catch (err) {
      console.error('[JAM] Error updating track:', err);
    }
  }, [session, isHost]);

  // Subscribe to session changes
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`jam-session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jam_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          console.log('[JAM] Session updated:', payload);
          setSession(payload.new as unknown as JamSession);
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
    isHost,
    isLoading,
    error,
    createSession,
    joinSession,
    leaveSession,
    updatePlaybackState,
    updateCurrentTrack,
  };
}
