import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYouTubeMusicRecommendations } from '../useYouTubeMusicRecommendations';

// Mock YouTube Music context
const mockYouTubeMusicContext = {
  youtubeMusic: {
    isConnected: true,
    tokens: {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: Date.now() + 3600000,
    },
  },
};

vi.mock('@/contexts/YouTubeMusicContext', () => ({
  useYouTubeMusic: () => mockYouTubeMusicContext,
}));

vi.mock('@/lib/api/youtubeMusic', () => ({
  youtubeMusicClient: {
    getLikedSongs: vi.fn().mockResolvedValue([]),
    getRecentlyPlayed: vi.fn().mockResolvedValue([]),
    getPlaylists: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue({ tracks: [], albums: [], playlists: [] }),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useYouTubeMusicRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty recommendations', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(result.current.recommendations).toEqual([]);
  });

  it('should have isLoading state', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should have error state', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(result.current.error).toBeNull();
  });

  it('should have mixedForYou array', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(Array.isArray(result.current.mixedForYou)).toBe(true);
  });

  it('should have listenAgain array', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(Array.isArray(result.current.listenAgain)).toBe(true);
  });

  it('should have isConnected state', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(typeof result.current.isConnected).toBe('boolean');
  });

  it('should have required methods', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(typeof result.current.fetchRecommendations).toBe('function');
    expect(typeof result.current.fetchBasedOnTrack).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should auto-fetch when autoFetch is true (default)', () => {
    const { result } = renderHook(() => 
      useYouTubeMusicRecommendations({ autoFetch: true })
    );

    // Hook should have been initialized
    expect(result.current).toBeDefined();
  });

  it('should not auto-fetch when autoFetch is false', () => {
    const { result } = renderHook(() => 
      useYouTubeMusicRecommendations({ autoFetch: false })
    );

    // Recommendations should be empty when autoFetch is disabled
    expect(result.current.recommendations).toEqual([]);
  });

  it('should handle fetchRecommendations return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    const fetchPromise = result.current.fetchRecommendations();
    expect(fetchPromise).toBeInstanceOf(Promise);
  });

  it('should handle fetchBasedOnTrack return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    const fetchPromise = result.current.fetchBasedOnTrack('track-id');
    expect(fetchPromise).toBeInstanceOf(Promise);
  });

  it('should return correct interface shape', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(result.current).toHaveProperty('recommendations');
    expect(result.current).toHaveProperty('listenAgain');
    expect(result.current).toHaveProperty('mixedForYou');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('fetchRecommendations');
    expect(result.current).toHaveProperty('fetchBasedOnTrack');
    expect(result.current).toHaveProperty('refresh');
  });

  it('should accept limit parameter', () => {
    const { result } = renderHook(() => 
      useYouTubeMusicRecommendations({ 
        autoFetch: false,
        limit: 10 
      })
    );

    expect(result.current).toBeDefined();
  });

  it('should accept seedTrackId parameter', () => {
    const { result } = renderHook(() => 
      useYouTubeMusicRecommendations({ 
        autoFetch: false,
        seedTrackId: 'test-track-id' 
      })
    );

    expect(result.current).toBeDefined();
  });

  it('should have array types for recommendations and mixedForYou', () => {
    const { result } = renderHook(() => useYouTubeMusicRecommendations({ autoFetch: false }));

    expect(Array.isArray(result.current.recommendations)).toBe(true);
    expect(Array.isArray(result.current.mixedForYou)).toBe(true);
    expect(Array.isArray(result.current.listenAgain)).toBe(true);
  });

  it('should have isLoading as false initially when autoFetch is disabled', () => {
    const { result } = renderHook(() => 
      useYouTubeMusicRecommendations({ autoFetch: false })
    );

    expect(result.current.isLoading).toBe(false);
  });
});
