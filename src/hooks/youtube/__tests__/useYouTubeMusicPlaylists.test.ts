import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYouTubeMusicPlaylists } from '../useYouTubeMusicPlaylists';

// Mock YouTube Music context
const mockYouTubeMusicContext = {
  youtubeMusic: {
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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useYouTubeMusicPlaylists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    expect(result.current.playlists).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should have required methods', () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    expect(typeof result.current.fetchPlaylists).toBe('function');
    expect(typeof result.current.createPlaylist).toBe('function');
    expect(typeof result.current.getPlaylistTracks).toBe('function');
    expect(typeof result.current.addTrackToPlaylist).toBe('function');
    expect(typeof result.current.removeTrackFromPlaylist).toBe('function');
  });

  it('should return error when not connected', () => {
    // Override mock to simulate disconnected state
    vi.mocked(mockYouTubeMusicContext.youtubeMusic).tokens = null as any;
    
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    expect(result.current.error).toBe('YouTube Music não conectado');
  });

  it('should have correct interface shape', () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    expect(result.current).toHaveProperty('playlists');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('fetchPlaylists');
    expect(result.current).toHaveProperty('createPlaylist');
    expect(result.current).toHaveProperty('getPlaylistTracks');
    expect(result.current).toHaveProperty('addTrackToPlaylist');
    expect(result.current).toHaveProperty('removeTrackFromPlaylist');
  });

  it('should return array types for playlists', () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    expect(Array.isArray(result.current.playlists)).toBe(true);
  });

  it('should have boolean isLoading state', () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should handle createPlaylist return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    // Should return a promise
    const createPromise = result.current.createPlaylist('Test Playlist', 'Description');
    expect(createPromise).toBeInstanceOf(Promise);
  });

  it('should handle getPlaylistTracks return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    // Should return a promise
    const getTracksPromise = result.current.getPlaylistTracks('playlist-id');
    expect(getTracksPromise).toBeInstanceOf(Promise);
  });

  it('should handle addTrackToPlaylist return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    // Should return a promise
    const addPromise = result.current.addTrackToPlaylist('playlist-id', 'track-id');
    expect(addPromise).toBeInstanceOf(Promise);
  });

  it('should handle removeTrackFromPlaylist return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicPlaylists());

    // Should return a promise
    const removePromise = result.current.removeTrackFromPlaylist('playlist-id', 'track-id');
    expect(removePromise).toBeInstanceOf(Promise);
  });
});
