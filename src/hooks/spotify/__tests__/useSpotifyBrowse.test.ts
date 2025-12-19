import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSpotifyBrowse } from '../useSpotifyBrowse';
import { spotifyClient } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockSpotifyPlaylist, mockSpotifyAlbum, mockSpotifyCategory, mockSpotifyTrack, mockSpotifyArtist } from '@/test/mocks/spotifyMocks';

vi.mock('@/lib/api/spotify', () => ({
  spotifyClient: {
    getFeaturedPlaylists: vi.fn(),
    getNewReleases: vi.fn(),
    getCategories: vi.fn(),
    getTopTracks: vi.fn(),
    getTopArtists: vi.fn(),
  },
}));

describe('useSpotifyBrowse', () => {
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

    const { result } = renderHook(() => useSpotifyBrowse(), { wrapper });

    expect(result.current.featuredPlaylists).toEqual([]);
    expect(result.current.newReleases).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.topTracks).toEqual([]);
    expect(result.current.topArtists).toEqual([]);
  });

  it('fetches browse data when connected', async () => {
    vi.mocked(spotifyClient.getFeaturedPlaylists).mockResolvedValue([mockSpotifyPlaylist]);
    vi.mocked(spotifyClient.getNewReleases).mockResolvedValue([mockSpotifyAlbum]);
    vi.mocked(spotifyClient.getCategories).mockResolvedValue([mockSpotifyCategory]);
    vi.mocked(spotifyClient.getTopTracks).mockResolvedValue([mockSpotifyTrack]);
    vi.mocked(spotifyClient.getTopArtists).mockResolvedValue([mockSpotifyArtist]);

    const { result } = renderHook(() => useSpotifyBrowse(), { wrapper });

    await waitFor(() => {
      expect(result.current.featuredPlaylists).toHaveLength(1);
    });

    expect(result.current.newReleases).toHaveLength(1);
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.topTracks).toHaveLength(1);
    expect(result.current.topArtists).toHaveLength(1);
  });

  it('handles partial failures gracefully', async () => {
    vi.mocked(spotifyClient.getFeaturedPlaylists).mockResolvedValue([mockSpotifyPlaylist]);
    vi.mocked(spotifyClient.getNewReleases).mockRejectedValue(new Error('Failed'));
    vi.mocked(spotifyClient.getCategories).mockResolvedValue([mockSpotifyCategory]);
    vi.mocked(spotifyClient.getTopTracks).mockResolvedValue([mockSpotifyTrack]);
    vi.mocked(spotifyClient.getTopArtists).mockResolvedValue([mockSpotifyArtist]);

    const { result } = renderHook(() => useSpotifyBrowse(), { wrapper });

    await waitFor(() => {
      expect(result.current.featuredPlaylists).toHaveLength(1);
    });

    // Failed request should leave empty array
    expect(result.current.newReleases).toEqual([]);
    // Successful requests should have data
    expect(result.current.categories).toHaveLength(1);
  });

  it('provides refresh function', () => {
    const { result } = renderHook(() => useSpotifyBrowse(), { wrapper });

    expect(typeof result.current.refresh).toBe('function');
  });

  it('tracks loading state', async () => {
    vi.mocked(spotifyClient.getFeaturedPlaylists).mockResolvedValue([mockSpotifyPlaylist]);
    vi.mocked(spotifyClient.getNewReleases).mockResolvedValue([mockSpotifyAlbum]);
    vi.mocked(spotifyClient.getCategories).mockResolvedValue([mockSpotifyCategory]);
    vi.mocked(spotifyClient.getTopTracks).mockResolvedValue([mockSpotifyTrack]);
    vi.mocked(spotifyClient.getTopArtists).mockResolvedValue([mockSpotifyArtist]);

    const { result } = renderHook(() => useSpotifyBrowse(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
