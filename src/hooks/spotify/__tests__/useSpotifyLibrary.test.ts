import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSpotifyLibrary } from '../useSpotifyLibrary';
import { spotifyClient } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockSpotifyTrack, mockSpotifyAlbum, mockSpotifyArtist, createPaginatedResponse } from '@/test/mocks/spotifyMocks';

vi.mock('@/lib/api/spotify', () => ({
  spotifyClient: {
    isAuthenticated: vi.fn(),
    getLikedTracks: vi.fn(),
    getSavedAlbums: vi.fn(),
    getFollowedArtists: vi.fn(),
    getRecentlyPlayed: vi.fn(),
    getTopTracks: vi.fn(),
    likeTrack: vi.fn(),
    unlikeTrack: vi.fn(),
    saveAlbum: vi.fn(),
    removeAlbum: vi.fn(),
  },
}));

describe('useSpotifyLibrary', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: true },
    } as ReturnType<typeof useSettings>);
  });

  it('returns empty arrays when not connected', () => {
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: false },
    } as ReturnType<typeof useSettings>);
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useSpotifyLibrary(), { wrapper });

    expect(result.current.likedTracks).toEqual([]);
    expect(result.current.albums).toEqual([]);
    expect(result.current.artists).toEqual([]);
    expect(result.current.isConnected).toBe(false);
  });

  it('fetches library data when connected', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.getLikedTracks).mockResolvedValue(
      createPaginatedResponse([mockSpotifyTrack], 1)
    );
    vi.mocked(spotifyClient.getSavedAlbums).mockResolvedValue(
      createPaginatedResponse([mockSpotifyAlbum], 1)
    );
    vi.mocked(spotifyClient.getFollowedArtists).mockResolvedValue({
      items: [mockSpotifyArtist],
      cursors: { after: '' },
    });
    vi.mocked(spotifyClient.getRecentlyPlayed).mockResolvedValue([mockSpotifyTrack]);
    vi.mocked(spotifyClient.getTopTracks).mockResolvedValue([mockSpotifyTrack]);

    const { result } = renderHook(() => useSpotifyLibrary(), { wrapper });

    await waitFor(() => {
      expect(result.current.likedTracks).toHaveLength(1);
    });

    expect(result.current.albums).toHaveLength(1);
    expect(result.current.artists).toHaveLength(1);
    expect(result.current.isConnected).toBe(true);
  });

  it('tracks loading state correctly', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.getLikedTracks).mockResolvedValue(
      createPaginatedResponse([mockSpotifyTrack])
    );
    vi.mocked(spotifyClient.getSavedAlbums).mockResolvedValue(
      createPaginatedResponse([mockSpotifyAlbum])
    );
    vi.mocked(spotifyClient.getFollowedArtists).mockResolvedValue({
      items: [mockSpotifyArtist],
      cursors: { after: '' },
    });

    const { result } = renderHook(() => useSpotifyLibrary(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('provides likeTrack mutation', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.likeTrack).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSpotifyLibrary(), { wrapper });

    expect(typeof result.current.likeTrack).toBe('function');
  });

  it('provides unlikeTrack mutation', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.unlikeTrack).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSpotifyLibrary(), { wrapper });

    expect(typeof result.current.unlikeTrack).toBe('function');
  });
});
