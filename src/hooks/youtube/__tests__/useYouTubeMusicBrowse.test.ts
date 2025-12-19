import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useYouTubeMusicBrowse } from '../useYouTubeMusicBrowse';

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
    getAlbums: vi.fn().mockResolvedValue([]),
    getRecentlyPlayed: vi.fn().mockResolvedValue([]),
    getPlaylists: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useYouTubeMusicBrowse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default categories', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(result.current.categories).toBeDefined();
    expect(Array.isArray(result.current.categories)).toBe(true);
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  it('should have newReleases array', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(result.current.newReleases).toBeDefined();
    expect(Array.isArray(result.current.newReleases)).toBe(true);
  });

  it('should have topTracks array', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(result.current.topTracks).toBeDefined();
    expect(Array.isArray(result.current.topTracks)).toBe(true);
  });

  it('should have featuredPlaylists array', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(result.current.featuredPlaylists).toBeDefined();
    expect(Array.isArray(result.current.featuredPlaylists)).toBe(true);
  });

  it('should have isLoading state', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should have error state', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    // Initially null or string after fetch
    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
  });

  it('should have required methods', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(typeof result.current.fetchBrowseData).toBe('function');
    expect(typeof result.current.fetchNewReleases).toBe('function');
    expect(typeof result.current.fetchTopTracks).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should have categories with correct structure', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    result.current.categories.forEach((category) => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('title');
      expect(typeof category.id).toBe('string');
      expect(typeof category.title).toBe('string');
    });
  });

  it('should return correct interface shape', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    expect(result.current).toHaveProperty('categories');
    expect(result.current).toHaveProperty('newReleases');
    expect(result.current).toHaveProperty('topTracks');
    expect(result.current).toHaveProperty('featuredPlaylists');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('fetchBrowseData');
    expect(result.current).toHaveProperty('fetchNewReleases');
    expect(result.current).toHaveProperty('fetchTopTracks');
    expect(result.current).toHaveProperty('refresh');
  });

  it('should handle fetchBrowseData return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    const fetchPromise = result.current.fetchBrowseData();
    expect(fetchPromise).toBeInstanceOf(Promise);
  });

  it('should handle fetchNewReleases return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    const fetchPromise = result.current.fetchNewReleases();
    expect(fetchPromise).toBeInstanceOf(Promise);
  });

  it('should handle fetchTopTracks return type', async () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    const fetchPromise = result.current.fetchTopTracks();
    expect(fetchPromise).toBeInstanceOf(Promise);
  });

  it('should have default categories for music genres', () => {
    const { result } = renderHook(() => useYouTubeMusicBrowse());

    const categoryIds = result.current.categories.map(c => c.id);
    expect(categoryIds).toContain('pop');
    expect(categoryIds).toContain('rock');
  });
});
