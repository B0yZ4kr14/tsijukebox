/**
 * @fileoverview Mocks e Fixtures Centralizados para Testes
 * @description Mocks reutilizáveis para Supabase, Spotify, YouTube e outros serviços
 * @version 1.0.0
 * @author Manus AI
 */

import { vi } from 'vitest';

// ============================================================================
// TIPOS
// ============================================================================

export interface MockUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}

export interface MockTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  uri: string;
  image_url?: string;
}

export interface MockSession {
  id: string;
  name: string;
  code: string;
  host_id: string;
  is_active: boolean;
  max_participants: number;
  created_at: string;
}

// ============================================================================
// FIXTURES - DADOS DE TESTE
// ============================================================================

export const FIXTURES = {
  // Usuários
  users: {
    host: {
      id: 'user-host-123',
      email: 'host@example.com',
      username: 'HostUser',
      avatar_url: 'https://example.com/avatar/host.jpg',
      created_at: '2024-01-01T00:00:00Z'
    } as MockUser,
    
    participant: {
      id: 'user-participant-456',
      email: 'participant@example.com',
      username: 'ParticipantUser',
      avatar_url: 'https://example.com/avatar/participant.jpg',
      created_at: '2024-01-02T00:00:00Z'
    } as MockUser,
    
    guest: {
      id: 'user-guest-789',
      email: 'guest@example.com',
      username: 'GuestUser',
      created_at: '2024-01-03T00:00:00Z'
    } as MockUser
  },

  // Tracks
  tracks: {
    bohemianRhapsody: {
      id: 'track-1',
      name: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      duration_ms: 354000,
      uri: 'spotify:track:7tFiyTwD0nx5a1eklYtX2J',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273'
    } as MockTrack,
    
    stairwayToHeaven: {
      id: 'track-2',
      name: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      album: 'Led Zeppelin IV',
      duration_ms: 482000,
      uri: 'spotify:track:5CQ30WqJwcep0pYcV4AMNc',
      image_url: 'https://i.scdn.co/image/ab67616d0000b274'
    } as MockTrack,
    
    hotelCalifornia: {
      id: 'track-3',
      name: 'Hotel California',
      artist: 'Eagles',
      album: 'Hotel California',
      duration_ms: 391000,
      uri: 'spotify:track:40riOy7x9W7GXjyGp4pjAv',
      image_url: 'https://i.scdn.co/image/ab67616d0000b275'
    } as MockTrack
  },

  // Sessões Jam
  sessions: {
    active: {
      id: 'session-abc-123',
      name: 'Friday Night Jam',
      code: 'JAM123',
      host_id: 'user-host-123',
      is_active: true,
      max_participants: 10,
      created_at: '2024-12-24T20:00:00Z'
    } as MockSession,
    
    full: {
      id: 'session-def-456',
      name: 'Full Session',
      code: 'FULL01',
      host_id: 'user-host-123',
      is_active: true,
      max_participants: 2,
      created_at: '2024-12-24T21:00:00Z'
    } as MockSession
  },

  // Tokens OAuth
  tokens: {
    spotify: {
      access_token: 'mock-spotify-access-token-xyz',
      refresh_token: 'mock-spotify-refresh-token-abc',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'user-read-playback-state user-modify-playback-state'
    },
    
    youtube: {
      access_token: 'mock-youtube-access-token-123',
      refresh_token: 'mock-youtube-refresh-token-456',
      expires_in: 3600,
      token_type: 'Bearer'
    }
  }
};

// ============================================================================
// MOCK DO SUPABASE
// ============================================================================

export function createMockSupabaseClient() {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null })
  };

  const mockRealtimeChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    send: vi.fn().mockResolvedValue('ok'),
    unsubscribe: vi.fn(),
    track: vi.fn().mockReturnThis()
  };

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
  };

  const mockFunctions = {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null })
  };

  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file' } }),
      list: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  };

  return {
    from: vi.fn().mockReturnValue(mockQueryBuilder),
    channel: vi.fn().mockReturnValue(mockRealtimeChannel),
    removeChannel: vi.fn(),
    auth: mockAuth,
    functions: mockFunctions,
    storage: mockStorage,
    
    // Helpers para configurar respostas
    __mockQueryBuilder: mockQueryBuilder,
    __mockRealtimeChannel: mockRealtimeChannel,
    __mockAuth: mockAuth,
    __mockFunctions: mockFunctions,
    __mockStorage: mockStorage
  };
}

// ============================================================================
// MOCK DO SPOTIFY API
// ============================================================================

export function createMockSpotifyApi() {
  return {
    // Auth
    getAccessToken: vi.fn().mockResolvedValue(FIXTURES.tokens.spotify.access_token),
    refreshAccessToken: vi.fn().mockResolvedValue(FIXTURES.tokens.spotify),
    
    // Player
    getMyCurrentPlaybackState: vi.fn().mockResolvedValue({
      body: {
        is_playing: false,
        item: null,
        progress_ms: 0,
        device: { id: 'device-123', name: 'Test Device' }
      }
    }),
    play: vi.fn().mockResolvedValue({}),
    pause: vi.fn().mockResolvedValue({}),
    skipToNext: vi.fn().mockResolvedValue({}),
    skipToPrevious: vi.fn().mockResolvedValue({}),
    seek: vi.fn().mockResolvedValue({}),
    setVolume: vi.fn().mockResolvedValue({}),
    
    // Search
    searchTracks: vi.fn().mockResolvedValue({
      body: {
        tracks: {
          items: [FIXTURES.tracks.bohemianRhapsody],
          total: 1
        }
      }
    }),
    
    // Playlists
    getUserPlaylists: vi.fn().mockResolvedValue({
      body: { items: [], total: 0 }
    }),
    getPlaylist: vi.fn().mockResolvedValue({
      body: { id: 'playlist-123', name: 'Test Playlist', tracks: { items: [] } }
    }),
    
    // User
    getMe: vi.fn().mockResolvedValue({
      body: {
        id: 'spotify-user-123',
        display_name: 'Test User',
        email: 'test@example.com'
      }
    })
  };
}

// ============================================================================
// MOCK DO YOUTUBE API
// ============================================================================

export function createMockYouTubeApi() {
  return {
    // Auth
    getAccessToken: vi.fn().mockResolvedValue(FIXTURES.tokens.youtube.access_token),
    refreshAccessToken: vi.fn().mockResolvedValue(FIXTURES.tokens.youtube),
    
    // Search
    search: vi.fn().mockResolvedValue({
      items: [
        {
          id: { videoId: 'dQw4w9WgXcQ' },
          snippet: {
            title: 'Never Gonna Give You Up',
            channelTitle: 'Rick Astley',
            thumbnails: { default: { url: 'https://example.com/thumb.jpg' } }
          }
        }
      ]
    }),
    
    // Videos
    getVideoDetails: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'dQw4w9WgXcQ',
          snippet: { title: 'Never Gonna Give You Up' },
          contentDetails: { duration: 'PT3M33S' }
        }
      ]
    }),
    
    // Playlists
    getPlaylists: vi.fn().mockResolvedValue({ items: [] }),
    getPlaylistItems: vi.fn().mockResolvedValue({ items: [] })
  };
}

// ============================================================================
// MOCK DO FETCH
// ============================================================================

export function createMockFetch() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    // Spotify Token
    if (url.includes('spotify.com/api/token')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(FIXTURES.tokens.spotify)
      });
    }
    
    // YouTube Token
    if (url.includes('oauth2.googleapis.com/token')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(FIXTURES.tokens.youtube)
      });
    }
    
    // Default
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    });
  });
}

// ============================================================================
// MOCK DO REALTIME (WebSocket)
// ============================================================================

export function createMockRealtimeChannel() {
  const listeners: Map<string, Function[]> = new Map();
  
  return {
    on: vi.fn().mockImplementation((event: string, filter: any, callback: Function) => {
      const key = typeof filter === 'string' ? filter : filter?.event || event;
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key)!.push(callback);
      return this;
    }),
    
    subscribe: vi.fn().mockReturnValue({
      unsubscribe: vi.fn()
    }),
    
    send: vi.fn().mockResolvedValue('ok'),
    
    unsubscribe: vi.fn(),
    
    // Helper para simular eventos
    __emit: (event: string, payload: any) => {
      const callbacks = listeners.get(event) || [];
      callbacks.forEach(cb => cb({ payload }));
    },
    
    __getListeners: () => listeners
  };
}

// ============================================================================
// HELPERS DE TESTE
// ============================================================================

/**
 * Aguarda um determinado tempo (para testes assíncronos)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Cria um mock de Response para fetch
 */
export function createMockResponse(data: any, options: { ok?: boolean; status?: number } = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
    headers: new Headers()
  };
}

/**
 * Configura mock do Supabase para retornar dados específicos
 */
export function setupSupabaseMock(
  client: ReturnType<typeof createMockSupabaseClient>,
  table: string,
  data: any,
  error: any = null
) {
  client.__mockQueryBuilder.single.mockResolvedValue({ data, error });
  client.__mockQueryBuilder.then.mockResolvedValue({ data: Array.isArray(data) ? data : [data], error });
  return client;
}

/**
 * Configura mock de autenticação do Supabase
 */
export function setupSupabaseAuth(
  client: ReturnType<typeof createMockSupabaseClient>,
  user: MockUser | null
) {
  client.__mockAuth.getUser.mockResolvedValue({
    data: { user: user ? { id: user.id, email: user.email } : null },
    error: null
  });
  return client;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mocks = {
  createSupabaseClient: createMockSupabaseClient,
  createSpotifyApi: createMockSpotifyApi,
  createYouTubeApi: createMockYouTubeApi,
  createFetch: createMockFetch,
  createRealtimeChannel: createMockRealtimeChannel
};

export default {
  FIXTURES,
  mocks,
  helpers: {
    wait,
    createMockResponse,
    setupSupabaseMock,
    setupSupabaseAuth
  }
};
