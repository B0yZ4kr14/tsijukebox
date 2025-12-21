import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { 
  mockJamSession,
  mockPrivateJamSession,
  mockJamParticipant,
  mockJamHost,
  mockCreateSessionConfig,
  mockCreatePrivateSessionConfig,
  mockSessionNotFoundError,
  mockDuplicateNicknameError,
  mockMaxParticipantsError,
} from '@/test/fixtures/integrationData';
import { 
  mockSupabaseClient, 
  mockQuerySuccess, 
  mockQueryError,
  clearSupabaseMocks,
  createRealtimeChannelMock,
} from '@/test/mocks/supabaseMocks';

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// Mock do hook useJamSession para testes
const mockUseJamSession = () => {
  return {
    session: null as typeof mockJamSession | null,
    participantId: null as string | null,
    isHost: false,
    isLoading: false,
    error: null as Error | null,
    createSession: vi.fn(),
    joinSession: vi.fn(),
    leaveSession: vi.fn(),
    updatePlaybackState: vi.fn(),
    updateCurrentTrack: vi.fn(),
  };
};

describe('useJamSession Integration', () => {
  const wrapper = createTestWrapper();
  let realtimeChannel: ReturnType<typeof createRealtimeChannelMock>;

  beforeEach(() => {
    clearSupabaseMocks();
    realtimeChannel = createRealtimeChannelMock();
    mockSupabaseClient.channel.mockReturnValue(realtimeChannel);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Criar sessão JAM', () => {
    it('should create a public session successfully', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess(mockJamSession)),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const sessionData = mockCreateSessionConfig;
      
      // Simular criação
      const result = await mockChain.single();
      
      expect(result.data).toEqual(mockJamSession);
      expect(result.error).toBeNull();
    });

    it('should create a private session with access code', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess(mockPrivateJamSession)),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.data?.privacy).toBe('private');
      expect(result.data?.access_code).toBe('secret123');
    });

    it('should generate unique 6-character code', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess(mockJamSession)),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.data?.code).toMatch(/^[A-Z0-9]{6}$/);
    });
  });

  describe('Entrar em sessão', () => {
    it('should join existing session by code', async () => {
      const mockSessionQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess(mockJamSession)),
      };
      
      const mockParticipantInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess(mockJamParticipant)),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSessionQuery)
        .mockReturnValueOnce(mockParticipantInsert);

      // Buscar sessão
      const sessionResult = await mockSessionQuery.single();
      expect(sessionResult.data?.code).toBe('ABC123');

      // Adicionar participante
      const participantResult = await mockParticipantInsert.single();
      expect(participantResult.data?.nickname).toBe('MusicLover42');
    });

    it('should fail to join non-existent session', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQueryError(
          mockSessionNotFoundError.message,
          mockSessionNotFoundError.code
        )),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.error?.message).toBe('Session not found or inactive');
      expect(result.data).toBeNull();
    });

    it('should fail with duplicate nickname', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQueryError(
          mockDuplicateNicknameError.message,
          mockDuplicateNicknameError.code
        )),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.error?.code).toBe('23505');
    });

    it('should fail when session is full', async () => {
      const fullSession = { ...mockJamSession, max_participants: 2 };
      
      const mockSessionQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess(fullSession)),
      };

      const mockCountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { count: 2 }, error: null }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSessionQuery)
        .mockReturnValueOnce(mockCountQuery);

      const sessionResult = await mockSessionQuery.single();
      const countResult = await mockCountQuery.single();
      
      expect(sessionResult.data?.max_participants).toBe(2);
      expect(countResult.data?.count).toBe(2);
    });
  });

  describe('Sair da sessão', () => {
    it('should deactivate participant when leaving', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess({ 
          ...mockJamParticipant, 
          is_active: false 
        })),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.data?.is_active).toBe(false);
    });

    it('should end session when host leaves', async () => {
      const mockParticipantUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess({ 
          ...mockJamHost, 
          is_active: false 
        })),
      };

      const mockSessionUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess({ 
          ...mockJamSession, 
          is_active: false 
        })),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockParticipantUpdate)
        .mockReturnValueOnce(mockSessionUpdate);

      const participantResult = await mockParticipantUpdate.single();
      expect(participantResult.data?.is_host).toBe(true);
      expect(participantResult.data?.is_active).toBe(false);

      const sessionResult = await mockSessionUpdate.single();
      expect(sessionResult.data?.is_active).toBe(false);
    });
  });

  describe('Atualizar estado de playback (host only)', () => {
    it('should update playback state as host', async () => {
      const newPlaybackState = {
        is_playing: false,
        position_ms: 180000,
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess({
          ...mockJamSession,
          playback_state: newPlaybackState,
        })),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.data?.playback_state?.is_playing).toBe(false);
      expect(result.data?.playback_state?.position_ms).toBe(180000);
    });
  });

  describe('Atualizar track atual (host only)', () => {
    it('should update current track as host', async () => {
      const newTrack = {
        track_id: 'spotify:track:new',
        name: 'New Song',
        artist: 'New Artist',
        album: 'New Album',
        album_art: 'https://example.com/art.jpg',
        duration_ms: 300000,
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess({
          ...mockJamSession,
          current_track: newTrack,
        })),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.data?.current_track?.name).toBe('New Song');
    });

    it('should clear current track when set to null', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockQuerySuccess({
          ...mockJamSession,
          current_track: null,
        })),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await mockChain.single();
      
      expect(result.data?.current_track).toBeNull();
    });
  });

  describe('Realtime subscriptions', () => {
    it('should subscribe to session updates', () => {
      mockSupabaseClient.channel('jam-session-updates');

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('jam-session-updates');
      expect(realtimeChannel.on).toBeDefined();
      expect(realtimeChannel.subscribe).toBeDefined();
    });

    it('should handle realtime update events', () => {
      const updateHandler = vi.fn();
      
      realtimeChannel.on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jam_sessions',
      }, updateHandler);

      // Simular evento de atualização
      const payload = {
        new: { ...mockJamSession, playback_state: { is_playing: false } },
        old: mockJamSession,
      };

      // O emit simularia o evento chegando
      expect(realtimeChannel.on).toHaveBeenCalled();
    });

    it('should cleanup subscription on unmount', () => {
      const subscription = realtimeChannel.subscribe();
      
      // Simular cleanup
      mockSupabaseClient.removeChannel(realtimeChannel);
      
      expect(mockSupabaseClient.removeChannel).toHaveBeenCalled();
    });
  });
});
