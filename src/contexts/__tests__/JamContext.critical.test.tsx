/**
 * @fileoverview Testes Críticos para JamContext
 * @description 5 cenários de teste mais críticos para sessões colaborativas Jam
 * @version 1.0.0
 * @author Manus AI
 * 
 * Cenários Críticos:
 * 1. Criação e gerenciamento de sessão Jam
 * 2. Sistema de votação e ordenação de fila
 * 3. Sincronização em tempo real entre participantes
 * 4. Tratamento de desconexões e reconexões
 * 5. Permissões e controle de acesso (host vs participante)
 */

import React, { ReactNode } from 'react';
import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { JamProvider, useJam } from '@/contexts/JamContext';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO E MOCKS
// ============================================================================

// Mock do Supabase
const mockSupabaseClient = {
  from: vi.fn(),
  channel: vi.fn(),
  removeChannel: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock de canal Realtime
const mockRealtimeChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  send: vi.fn(),
  unsubscribe: vi.fn()
};

// Dados de teste
const TEST_HOST_USER = {
  id: 'host-user-123',
  email: 'host@example.com',
  username: 'HostUser'
};

const TEST_PARTICIPANT_USER = {
  id: 'participant-user-456',
  email: 'participant@example.com',
  username: 'ParticipantUser'
};

const MOCK_SESSION = {
  id: 'session-abc-123',
  name: 'Friday Night Jam',
  code: 'JAM123',
  host_id: TEST_HOST_USER.id,
  is_active: true,
  max_participants: 10,
  allow_guest_votes: true,
  created_at: new Date().toISOString()
};

const MOCK_TRACKS = [
  {
    id: 'track-1',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration_ms: 354000,
    uri: 'spotify:track:track-1',
    added_by: TEST_HOST_USER.id,
    votes: 0
  },
  {
    id: 'track-2',
    name: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration_ms: 482000,
    uri: 'spotify:track:track-2',
    added_by: TEST_PARTICIPANT_USER.id,
    votes: 0
  },
  {
    id: 'track-3',
    name: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration_ms: 391000,
    uri: 'spotify:track:track-3',
    added_by: TEST_HOST_USER.id,
    votes: 0
  }
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Wrapper para renderizar hooks com JamProvider
 */
const createWrapper = (initialUser = TEST_HOST_USER) => {
  return ({ children }: { children: ReactNode }) => (
    <JamProvider initialUser={initialUser}>
      {children}
    </JamProvider>
  );
};

/**
 * Configura mock do Supabase para operações de banco
 */
function setupDatabaseMock(data: any, error: any = null) {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis()
  };
  
  mockSupabaseClient.from.mockReturnValue(mockQuery);
  return mockQuery;
}

/**
 * Configura mock do canal Realtime
 */
function setupRealtimeMock() {
  mockSupabaseClient.channel.mockReturnValue(mockRealtimeChannel);
  return mockRealtimeChannel;
}

/**
 * Simula evento Realtime
 */
function simulateRealtimeEvent(event: string, payload: any) {
  const callback = mockRealtimeChannel.on.mock.calls.find(
    (call: any[]) => call[1]?.event === event
  )?.[2];
  
  if (callback) {
    callback({ payload });
  }
}

/**
 * Limpa todos os mocks
 */
function resetMocks() {
  vi.clearAllMocks();
  mockRealtimeChannel.on.mockReturnThis();
}

// ============================================================================
// CENÁRIO CRÍTICO 1: CRIAÇÃO E GERENCIAMENTO DE SESSÃO JAM
// ============================================================================

describe('Cenário Crítico 1: Criação e Gerenciamento de Sessão Jam', () => {
  beforeEach(() => {
    resetMocks();
    setupRealtimeMock();
  });

  describe('1.1 Criação de Nova Sessão', () => {
    it('deve criar uma nova sessão Jam com código único', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      // Act
      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({
          name: 'Friday Night Jam',
          maxParticipants: 10,
          allowGuestVotes: true
        });
      });

      // Assert
      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.currentSession?.name).toBe('Friday Night Jam');
      expect(result.current.currentSession?.code).toBeDefined();
      expect(result.current.currentSession?.code.length).toBe(6);
      expect(result.current.isHost).toBe(true);
    });

    it('deve gerar código de sessão único e válido', async () => {
      // Arrange
      const generatedCodes: string[] = [];
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      // Act - Criar múltiplas sessões
      for (let i = 0; i < 5; i++) {
        const { result } = renderHook(() => useJam(), { wrapper });
        
        await act(async () => {
          await result.current.createSession({ name: `Session ${i}` });
        });
        
        if (result.current.currentSession?.code) {
          generatedCodes.push(result.current.currentSession.code);
        }
      }

      // Assert - Todos os códigos devem ser únicos
      const uniqueCodes = new Set(generatedCodes);
      expect(uniqueCodes.size).toBe(generatedCodes.length);
      
      // Códigos devem ser alfanuméricos maiúsculos
      generatedCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{6}$/);
      });
    });

    it('deve configurar canal Realtime ao criar sessão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      // Act
      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test Session' });
      });

      // Assert
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
        expect.stringContaining('jam-session-')
      );
      expect(mockRealtimeChannel.on).toHaveBeenCalled();
      expect(mockRealtimeChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('1.2 Entrada em Sessão Existente', () => {
    it('deve permitir entrada em sessão com código válido', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      // Act
      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
      });

      // Assert
      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.currentSession?.code).toBe('JAM123');
      expect(result.current.isHost).toBe(false);
    });

    it('deve rejeitar código de sessão inválido', async () => {
      // Arrange
      setupDatabaseMock(null, { message: 'Session not found' });
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      // Act
      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('INVALID');
      });

      // Assert
      expect(result.current.currentSession).toBeNull();
      expect(result.current.error).toContain('not found');
    });

    it('deve rejeitar entrada em sessão lotada', async () => {
      // Arrange
      const fullSession = {
        ...MOCK_SESSION,
        max_participants: 2,
        current_participants: 2
      };
      setupDatabaseMock(fullSession);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      // Act
      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
      });

      // Assert
      expect(result.current.currentSession).toBeNull();
      expect(result.current.error).toContain('full');
    });
  });

  describe('1.3 Encerramento de Sessão', () => {
    it('deve permitir que host encerre a sessão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act
      await act(async () => {
        await result.current.endSession();
      });

      // Assert
      expect(result.current.currentSession).toBeNull();
      expect(mockRealtimeChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'session_ended',
        payload: expect.any(Object)
      });
    });

    it('deve impedir que participante encerre a sessão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
      });

      // Act
      await act(async () => {
        await result.current.endSession();
      });

      // Assert
      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.error).toContain('permission');
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 2: SISTEMA DE VOTAÇÃO E ORDENAÇÃO DE FILA
// ============================================================================

describe('Cenário Crítico 2: Sistema de Votação e Ordenação de Fila', () => {
  beforeEach(() => {
    resetMocks();
    setupRealtimeMock();
  });

  describe('2.1 Adição de Músicas à Fila', () => {
    it('deve adicionar música à fila da sessão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act
      await act(async () => {
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Assert
      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].name).toBe('Bohemian Rhapsody');
      expect(result.current.queue[0].added_by).toBe(TEST_HOST_USER.id);
      expect(result.current.queue[0].votes).toBe(0);
    });

    it('deve impedir duplicatas na fila', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Act - Tentar adicionar a mesma música
      await act(async () => {
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Assert
      expect(result.current.queue).toHaveLength(1);
      expect(result.current.error).toContain('already in queue');
    });

    it('deve broadcast adição de música para outros participantes', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act
      await act(async () => {
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Assert
      expect(mockRealtimeChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'track_added',
        payload: expect.objectContaining({
          track: expect.objectContaining({ id: 'track-1' })
        })
      });
    });
  });

  describe('2.2 Sistema de Votação', () => {
    it('deve permitir votar em uma música', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Act
      await act(async () => {
        await result.current.voteForTrack('track-1');
      });

      // Assert
      expect(result.current.queue[0].votes).toBe(1);
    });

    it('deve impedir voto duplicado do mesmo usuário', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
        await result.current.voteForTrack('track-1');
      });

      // Act - Tentar votar novamente
      await act(async () => {
        await result.current.voteForTrack('track-1');
      });

      // Assert
      expect(result.current.queue[0].votes).toBe(1); // Não deve aumentar
      expect(result.current.error).toContain('already voted');
    });

    it('deve permitir remover voto', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
        await result.current.voteForTrack('track-1');
      });

      // Act
      await act(async () => {
        await result.current.removeVote('track-1');
      });

      // Assert
      expect(result.current.queue[0].votes).toBe(0);
    });
  });

  describe('2.3 Ordenação por Votos', () => {
    it('deve ordenar fila por número de votos (decrescente)', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        
        // Adicionar 3 músicas
        for (const track of MOCK_TRACKS) {
          await result.current.addToQueue(track);
        }
        
        // Votar: track-3 (2 votos), track-1 (1 voto), track-2 (0 votos)
        await result.current.voteForTrack('track-3');
        await result.current.voteForTrack('track-3'); // Simular outro usuário
        await result.current.voteForTrack('track-1');
      });

      // Assert - Ordenação por votos
      const sortedQueue = result.current.getSortedQueue();
      
      expect(sortedQueue[0].id).toBe('track-3'); // 2 votos
      expect(sortedQueue[1].id).toBe('track-1'); // 1 voto
      expect(sortedQueue[2].id).toBe('track-2'); // 0 votos
    });

    it('deve usar ordem de adição como desempate', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        
        // Adicionar músicas em ordem
        await result.current.addToQueue(MOCK_TRACKS[0]); // Primeiro
        await result.current.addToQueue(MOCK_TRACKS[1]); // Segundo
        await result.current.addToQueue(MOCK_TRACKS[2]); // Terceiro
      });

      // Assert - Sem votos, deve manter ordem de adição
      const sortedQueue = result.current.getSortedQueue();
      
      expect(sortedQueue[0].id).toBe('track-1');
      expect(sortedQueue[1].id).toBe('track-2');
      expect(sortedQueue[2].id).toBe('track-3');
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 3: SINCRONIZAÇÃO EM TEMPO REAL
// ============================================================================

describe('Cenário Crítico 3: Sincronização em Tempo Real', () => {
  beforeEach(() => {
    resetMocks();
    setupRealtimeMock();
  });

  describe('3.1 Sincronização de Participantes', () => {
    it('deve atualizar lista de participantes quando alguém entra', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act - Simular entrada de novo participante
      await act(async () => {
        simulateRealtimeEvent('participant_joined', {
          user: TEST_PARTICIPANT_USER,
          timestamp: new Date().toISOString()
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.participants).toHaveLength(2);
        expect(result.current.participants.some(p => p.id === TEST_PARTICIPANT_USER.id)).toBe(true);
      });
    });

    it('deve atualizar lista quando participante sai', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        
        // Simular entrada
        simulateRealtimeEvent('participant_joined', {
          user: TEST_PARTICIPANT_USER
        });
      });

      // Act - Simular saída
      await act(async () => {
        simulateRealtimeEvent('participant_left', {
          userId: TEST_PARTICIPANT_USER.id
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.participants).toHaveLength(1);
        expect(result.current.participants.some(p => p.id === TEST_PARTICIPANT_USER.id)).toBe(false);
      });
    });
  });

  describe('3.2 Sincronização de Fila', () => {
    it('deve sincronizar adição de música de outro participante', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act - Simular adição de música por outro participante
      await act(async () => {
        simulateRealtimeEvent('track_added', {
          track: {
            ...MOCK_TRACKS[1],
            added_by: TEST_PARTICIPANT_USER.id
          }
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.queue).toHaveLength(1);
        expect(result.current.queue[0].added_by).toBe(TEST_PARTICIPANT_USER.id);
      });
    });

    it('deve sincronizar votos de outros participantes', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Act - Simular voto de outro participante
      await act(async () => {
        simulateRealtimeEvent('vote_updated', {
          trackId: 'track-1',
          votes: 1,
          votedBy: TEST_PARTICIPANT_USER.id
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.queue[0].votes).toBe(1);
      });
    });
  });

  describe('3.3 Sincronização de Playback', () => {
    it('deve sincronizar estado de reprodução entre participantes', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Act - Simular início de reprodução pelo host
      await act(async () => {
        simulateRealtimeEvent('playback_started', {
          trackId: 'track-1',
          position: 0,
          timestamp: Date.now()
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.currentlyPlaying?.id).toBe('track-1');
        expect(result.current.isPlaying).toBe(true);
      });
    });

    it('deve sincronizar posição de reprodução', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act - Simular atualização de posição
      await act(async () => {
        simulateRealtimeEvent('playback_position', {
          position: 60000, // 1 minuto
          timestamp: Date.now()
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.playbackPosition).toBeGreaterThanOrEqual(60000);
      });
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 4: TRATAMENTO DE DESCONEXÕES E RECONEXÕES
// ============================================================================

describe('Cenário Crítico 4: Tratamento de Desconexões e Reconexões', () => {
  beforeEach(() => {
    resetMocks();
    setupRealtimeMock();
  });

  describe('4.1 Detecção de Desconexão', () => {
    it('deve detectar perda de conexão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act - Simular desconexão
      await act(async () => {
        simulateRealtimeEvent('system', {
          type: 'disconnected'
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('disconnected');
      });
    });

    it('deve mostrar indicador de reconexão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act - Simular tentativa de reconexão
      await act(async () => {
        simulateRealtimeEvent('system', { type: 'disconnected' });
        simulateRealtimeEvent('system', { type: 'reconnecting' });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('reconnecting');
        expect(result.current.isReconnecting).toBe(true);
      });
    });
  });

  describe('4.2 Reconexão Automática', () => {
    it('deve reconectar automaticamente após perda de conexão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act - Simular desconexão e reconexão
      await act(async () => {
        simulateRealtimeEvent('system', { type: 'disconnected' });
      });

      await act(async () => {
        simulateRealtimeEvent('system', { type: 'connected' });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
        expect(result.current.isReconnecting).toBe(false);
      });
    });

    it('deve sincronizar estado após reconexão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
      });

      // Simular desconexão
      await act(async () => {
        simulateRealtimeEvent('system', { type: 'disconnected' });
      });

      // Simular mudanças enquanto desconectado
      const updatedQueue = [
        { ...MOCK_TRACKS[0], votes: 5 },
        { ...MOCK_TRACKS[1], votes: 3 }
      ];

      // Act - Reconectar e sincronizar
      await act(async () => {
        simulateRealtimeEvent('system', { type: 'connected' });
        simulateRealtimeEvent('full_sync', {
          queue: updatedQueue,
          participants: [TEST_HOST_USER, TEST_PARTICIPANT_USER]
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.queue).toHaveLength(2);
        expect(result.current.queue[0].votes).toBe(5);
        expect(result.current.participants).toHaveLength(2);
      });
    });
  });

  describe('4.3 Transferência de Host', () => {
    it('deve transferir host quando host original desconecta', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
      });

      // Act - Simular desconexão do host
      await act(async () => {
        simulateRealtimeEvent('host_disconnected', {
          previousHost: TEST_HOST_USER.id,
          newHost: TEST_PARTICIPANT_USER.id
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isHost).toBe(true);
      });
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 5: PERMISSÕES E CONTROLE DE ACESSO
// ============================================================================

describe('Cenário Crítico 5: Permissões e Controle de Acesso', () => {
  beforeEach(() => {
    resetMocks();
    setupRealtimeMock();
  });

  describe('5.1 Permissões de Host', () => {
    it('host deve poder pular música atual', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
        await result.current.addToQueue(MOCK_TRACKS[1]);
        await result.current.startPlayback();
      });

      // Act
      await act(async () => {
        await result.current.skipTrack();
      });

      // Assert
      expect(result.current.currentlyPlaying?.id).toBe('track-2');
    });

    it('host deve poder remover música da fila', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        await result.current.addToQueue(MOCK_TRACKS[0]);
        await result.current.addToQueue(MOCK_TRACKS[1]);
      });

      // Act
      await act(async () => {
        await result.current.removeFromQueue('track-1');
      });

      // Assert
      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].id).toBe('track-2');
    });

    it('host deve poder expulsar participante', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
        
        // Simular entrada de participante
        simulateRealtimeEvent('participant_joined', {
          user: TEST_PARTICIPANT_USER
        });
      });

      // Act
      await act(async () => {
        await result.current.kickParticipant(TEST_PARTICIPANT_USER.id);
      });

      // Assert
      expect(mockRealtimeChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'participant_kicked',
        payload: expect.objectContaining({
          userId: TEST_PARTICIPANT_USER.id
        })
      });
    });
  });

  describe('5.2 Restrições de Participante', () => {
    it('participante não deve poder pular música', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
      });

      // Act
      await act(async () => {
        await result.current.skipTrack();
      });

      // Assert
      expect(result.current.error).toContain('permission');
    });

    it('participante não deve poder remover música de outro', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
        
        // Simular música adicionada pelo host
        simulateRealtimeEvent('track_added', {
          track: { ...MOCK_TRACKS[0], added_by: TEST_HOST_USER.id }
        });
      });

      // Act
      await act(async () => {
        await result.current.removeFromQueue('track-1');
      });

      // Assert
      expect(result.current.queue).toHaveLength(1); // Não removeu
      expect(result.current.error).toContain('permission');
    });

    it('participante pode remover apenas sua própria música', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_PARTICIPANT_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
        await result.current.addToQueue(MOCK_TRACKS[0]); // Própria música
      });

      // Act
      await act(async () => {
        await result.current.removeFromQueue('track-1');
      });

      // Assert
      expect(result.current.queue).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('5.3 Configurações de Sessão', () => {
    it('deve respeitar configuração de votos de convidados', async () => {
      // Arrange
      const sessionNoGuestVotes = {
        ...MOCK_SESSION,
        allow_guest_votes: false
      };
      setupDatabaseMock(sessionNoGuestVotes);
      
      const guestUser = { id: 'guest-123', username: 'Guest', isGuest: true };
      const wrapper = createWrapper(guestUser);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.joinSession('JAM123');
        
        // Simular música na fila
        simulateRealtimeEvent('track_added', {
          track: MOCK_TRACKS[0]
        });
      });

      // Act
      await act(async () => {
        await result.current.voteForTrack('track-1');
      });

      // Assert
      expect(result.current.queue[0].votes).toBe(0);
      expect(result.current.error).toContain('guests cannot vote');
    });

    it('host deve poder alterar configurações da sessão', async () => {
      // Arrange
      setupDatabaseMock(MOCK_SESSION);
      const wrapper = createWrapper(TEST_HOST_USER);

      const { result } = renderHook(() => useJam(), { wrapper });

      await act(async () => {
        await result.current.createSession({ name: 'Test' });
      });

      // Act
      await act(async () => {
        await result.current.updateSessionSettings({
          allow_guest_votes: false,
          max_participants: 5
        });
      });

      // Assert
      expect(result.current.currentSession?.allow_guest_votes).toBe(false);
      expect(result.current.currentSession?.max_participants).toBe(5);
    });
  });
});

// ============================================================================
// TESTES DE INTEGRAÇÃO END-TO-END
// ============================================================================

describe('Integração E2E: Fluxo Completo de Sessão Jam', () => {
  beforeEach(() => {
    resetMocks();
    setupRealtimeMock();
  });

  it('deve completar fluxo completo: criar -> participar -> votar -> tocar -> encerrar', async () => {
    // PASSO 1: Host cria sessão
    setupDatabaseMock(MOCK_SESSION);
    const hostWrapper = createWrapper(TEST_HOST_USER);
    const { result: hostResult } = renderHook(() => useJam(), { wrapper: hostWrapper });

    await act(async () => {
      await hostResult.current.createSession({
        name: 'Friday Night Jam',
        maxParticipants: 10
      });
    });

    expect(hostResult.current.currentSession).not.toBeNull();
    expect(hostResult.current.isHost).toBe(true);

    // PASSO 2: Participante entra na sessão
    const participantWrapper = createWrapper(TEST_PARTICIPANT_USER);
    const { result: participantResult } = renderHook(() => useJam(), { wrapper: participantWrapper });

    await act(async () => {
      await participantResult.current.joinSession('JAM123');
    });

    expect(participantResult.current.currentSession).not.toBeNull();
    expect(participantResult.current.isHost).toBe(false);

    // PASSO 3: Ambos adicionam músicas
    await act(async () => {
      await hostResult.current.addToQueue(MOCK_TRACKS[0]);
      await participantResult.current.addToQueue(MOCK_TRACKS[1]);
    });

    // PASSO 4: Votação
    await act(async () => {
      await hostResult.current.voteForTrack('track-2');
      await participantResult.current.voteForTrack('track-2');
    });

    // PASSO 5: Host inicia reprodução
    await act(async () => {
      await hostResult.current.startPlayback();
    });

    expect(hostResult.current.isPlaying).toBe(true);

    // PASSO 6: Host encerra sessão
    await act(async () => {
      await hostResult.current.endSession();
    });

    expect(hostResult.current.currentSession).toBeNull();
  });
});
