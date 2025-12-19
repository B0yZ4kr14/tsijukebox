import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSpotifyPlaylists, useSpotifyPlaylist } from '../useSpotifyPlaylists';
import { spotifyClient } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockSpotifyPlaylist, mockSpotifyTrack, createPaginatedResponse } from '@/test/mocks/spotifyMocks';

vi.mock('@/lib/api/spotify', () => ({
  spotifyClient: {
    isAuthenticated: vi.fn(),
    getPlaylists: vi.fn(),
    getPlaylist: vi.fn(),
    getPlaylistTracks: vi.fn(),
    createPlaylist: vi.fn(),
    followPlaylist: vi.fn(),
    unfollowPlaylist: vi.fn(),
    addTracksToPlaylist: vi.fn(),
    removeTracksFromPlaylist: vi.fn(),
  },
}));

describe('useSpotifyPlaylists', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: true },
    } as ReturnType<typeof useSettings>);
  });

  it('returns empty array when not connected', () => {
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: false },
    } as ReturnType<typeof useSettings>);
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useSpotifyPlaylists(), { wrapper });

    expect(result.current.playlists).toEqual([]);
    expect(result.current.isConnected).toBe(false);
  });

  it('fetches playlists when connected', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.getPlaylists).mockResolvedValue(
      createPaginatedResponse([mockSpotifyPlaylist], 1)
    );

    const { result } = renderHook(() => useSpotifyPlaylists(), { wrapper });

    await waitFor(() => {
      expect(result.current.playlists).toHaveLength(1);
    });

    expect(result.current.total).toBe(1);
    expect(result.current.isConnected).toBe(true);
  });

  it('provides createPlaylist mutation', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifyPlaylists(), { wrapper });

    expect(typeof result.current.createPlaylist).toBe('function');
    expect(typeof result.current.followPlaylist).toBe('function');
    expect(typeof result.current.unfollowPlaylist).toBe('function');
  });

  it('tracks creating state', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifyPlaylists(), { wrapper });

    expect(result.current.isCreating).toBe(false);
  });
});

describe('useSpotifyPlaylist', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: true },
    } as ReturnType<typeof useSettings>);
  });

  it('does not fetch without playlistId', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifyPlaylist(undefined), { wrapper });

    expect(result.current.playlist).toBeUndefined();
    expect(spotifyClient.getPlaylist).not.toHaveBeenCalled();
  });

  it('fetches playlist and tracks with playlistId', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.getPlaylist).mockResolvedValue(mockSpotifyPlaylist);
    vi.mocked(spotifyClient.getPlaylistTracks).mockResolvedValue(
      createPaginatedResponse([mockSpotifyTrack], 1)
    );

    const { result } = renderHook(() => useSpotifyPlaylist('playlist-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.playlist).toEqual(mockSpotifyPlaylist);
    });

    expect(result.current.tracks).toHaveLength(1);
    expect(result.current.tracksTotal).toBe(1);
  });

  it('provides track management mutations', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifyPlaylist('playlist-1'), { wrapper });

    expect(typeof result.current.addTracks).toBe('function');
    expect(typeof result.current.removeTracks).toBe('function');
  });
});
