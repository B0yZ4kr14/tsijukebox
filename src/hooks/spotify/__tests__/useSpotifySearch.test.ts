import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpotifySearch } from '../useSpotifySearch';
import { spotifyClient } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockSpotifyTrack, mockSpotifyAlbum, mockSpotifyArtist, mockSpotifyPlaylist } from '@/test/mocks/spotifyMocks';

vi.mock('@/lib/api/spotify', () => ({
  spotifyClient: {
    isAuthenticated: vi.fn(),
    search: vi.fn(),
  },
}));

describe('useSpotifySearch', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: true },
    } as ReturnType<typeof useSettings>);
  });

  it('initializes with empty query and results', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifySearch(), { wrapper });

    expect(result.current.query).toBe('');
    expect(result.current.results.tracks).toEqual([]);
    expect(result.current.results.albums).toEqual([]);
    expect(result.current.results.artists).toEqual([]);
    expect(result.current.results.playlists).toEqual([]);
    expect(result.current.hasResults).toBe(false);
  });

  it('does not search with query less than 2 characters', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifySearch(), { wrapper });

    act(() => {
      result.current.setQuery('a');
    });

    await waitFor(() => {
      expect(spotifyClient.search).not.toHaveBeenCalled();
    });
  });

  it('searches when query has 2+ characters', async () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);
    vi.mocked(spotifyClient.search).mockResolvedValue({
      tracks: [mockSpotifyTrack],
      albums: [mockSpotifyAlbum],
      artists: [mockSpotifyArtist],
      playlists: [mockSpotifyPlaylist],
    });

    const { result } = renderHook(() => useSpotifySearch(), { wrapper });

    act(() => {
      result.current.setQuery('test');
    });

    await waitFor(() => {
      expect(result.current.results.tracks).toHaveLength(1);
    });

    expect(result.current.hasResults).toBe(true);
  });

  it('provides clearSearch function', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifySearch(), { wrapper });

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
  });

  it('allows setting search types', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(true);

    const { result } = renderHook(() => useSpotifySearch(), { wrapper });

    expect(result.current.types).toEqual(['track', 'album', 'artist', 'playlist']);

    act(() => {
      result.current.setTypes(['track']);
    });

    expect(result.current.types).toEqual(['track']);
  });

  it('tracks connection state', () => {
    vi.mocked(spotifyClient.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useSpotifySearch(), { wrapper });

    expect(result.current.isConnected).toBe(false);
  });
});
