import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYouTubeMusicSearch } from '../useYouTubeMusicSearch';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockYouTubeTrack, mockYouTubeAlbum, mockYouTubePlaylist } from '@/test/mocks/youtubeMocks';

vi.mock('@/lib/api/youtubeMusic', () => ({
  youtubeMusicClient: {
    search: vi.fn(),
  },
}));

describe('useYouTubeMusicSearch', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty results', () => {
    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    expect(result.current.results.tracks).toEqual([]);
    expect(result.current.results.albums).toEqual([]);
    expect(result.current.results.playlists).toEqual([]);
    expect(result.current.query).toBe('');
    expect(result.current.isSearching).toBe(false);
  });

  it('does not search with empty query', async () => {
    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    await act(async () => {
      await result.current.search('');
    });

    expect(youtubeMusicClient.search).not.toHaveBeenCalled();
    expect(result.current.results.tracks).toEqual([]);
  });

  it('does not search with whitespace-only query', async () => {
    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    await act(async () => {
      await result.current.search('   ');
    });

    expect(youtubeMusicClient.search).not.toHaveBeenCalled();
  });

  it('searches with valid query', async () => {
    vi.mocked(youtubeMusicClient.search).mockResolvedValue({
      tracks: [mockYouTubeTrack],
      albums: [mockYouTubeAlbum],
      playlists: [mockYouTubePlaylist],
    });

    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    await act(async () => {
      await result.current.search('test query');
    });

    await waitFor(() => {
      expect(result.current.results.tracks).toHaveLength(1);
    });

    expect(result.current.results.albums).toHaveLength(1);
    expect(result.current.results.playlists).toHaveLength(1);
    expect(result.current.query).toBe('test query');
  });

  it('searches with type filter', async () => {
    vi.mocked(youtubeMusicClient.search).mockResolvedValue({
      tracks: [mockYouTubeTrack],
      albums: [],
      playlists: [],
    });

    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    await act(async () => {
      await result.current.search('test query', 'song');
    });

    expect(youtubeMusicClient.search).toHaveBeenCalledWith('test query', 'song');
  });

  it('handles search errors gracefully', async () => {
    vi.mocked(youtubeMusicClient.search).mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    await act(async () => {
      await result.current.search('test query');
    });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    expect(result.current.results.tracks).toEqual([]);
    expect(result.current.results.albums).toEqual([]);
    expect(result.current.results.playlists).toEqual([]);
  });

  it('provides clearResults function', async () => {
    vi.mocked(youtubeMusicClient.search).mockResolvedValue({
      tracks: [mockYouTubeTrack],
      albums: [mockYouTubeAlbum],
      playlists: [mockYouTubePlaylist],
    });

    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    await act(async () => {
      await result.current.search('test');
    });

    await waitFor(() => {
      expect(result.current.results.tracks).toHaveLength(1);
    });

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results.tracks).toEqual([]);
    expect(result.current.results.albums).toEqual([]);
    expect(result.current.results.playlists).toEqual([]);
    expect(result.current.query).toBe('');
  });

  it('tracks isSearching state during search', async () => {
    let resolveSearch: (value: unknown) => void;
    const searchPromise = new Promise((resolve) => {
      resolveSearch = resolve;
    });

    vi.mocked(youtubeMusicClient.search).mockReturnValue(searchPromise as Promise<{
      tracks: typeof mockYouTubeTrack[];
      albums: typeof mockYouTubeAlbum[];
      playlists: typeof mockYouTubePlaylist[];
    }>);

    const { result } = renderHook(() => useYouTubeMusicSearch(), { wrapper });

    const searchPromiseAct = act(async () => {
      result.current.search('test');
    });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(true);
    });

    await act(async () => {
      resolveSearch!({
        tracks: [mockYouTubeTrack],
        albums: [],
        playlists: [],
      });
    });

    await searchPromiseAct;

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });
});
