import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useYouTubeMusicLibrary } from '../useYouTubeMusicLibrary';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockYouTubePlaylist, mockYouTubeTrack, mockYouTubeAlbum } from '@/test/mocks/youtubeMocks';

vi.mock('@/lib/api/youtubeMusic', () => ({
  youtubeMusicClient: {
    getPlaylists: vi.fn(),
    getLikedSongs: vi.fn(),
    getRecentlyPlayed: vi.fn(),
    getAlbums: vi.fn(),
    getPlaylistTracks: vi.fn(),
    getAlbumTracks: vi.fn(),
    createPlaylist: vi.fn(),
    addToPlaylist: vi.fn(),
    removeFromPlaylist: vi.fn(),
  },
}));

describe('useYouTubeMusicLibrary', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty arrays', () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    expect(result.current.playlists).toEqual([]);
    expect(result.current.likedSongs).toEqual([]);
    expect(result.current.recentlyPlayed).toEqual([]);
    expect(result.current.albums).toEqual([]);
  });

  it('fetches all library data on mount', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([mockYouTubePlaylist]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([mockYouTubeTrack]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([mockYouTubeTrack]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([mockYouTubeAlbum]);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    await waitFor(() => {
      expect(result.current.playlists).toHaveLength(1);
    });

    expect(result.current.likedSongs).toHaveLength(1);
    expect(result.current.recentlyPlayed).toHaveLength(1);
    expect(result.current.albums).toHaveLength(1);
  });

  it('tracks loading state', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles fetch errors gracefully', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockRejectedValue(new Error('Failed'));
    vi.mocked(youtubeMusicClient.getLikedSongs).mockRejectedValue(new Error('Failed'));
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockRejectedValue(new Error('Failed'));
    vi.mocked(youtubeMusicClient.getAlbums).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.playlists).toEqual([]);
    expect(result.current.likedSongs).toEqual([]);
  });

  it('provides getPlaylistTracks function', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getPlaylistTracks).mockResolvedValue([mockYouTubeTrack]);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    const tracks = await result.current.getPlaylistTracks('playlist-1');

    expect(tracks).toHaveLength(1);
    expect(youtubeMusicClient.getPlaylistTracks).toHaveBeenCalledWith('playlist-1');
  });

  it('provides getAlbumTracks function', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbumTracks).mockResolvedValue([mockYouTubeTrack]);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    const tracks = await result.current.getAlbumTracks('album-1');

    expect(tracks).toHaveLength(1);
    expect(youtubeMusicClient.getAlbumTracks).toHaveBeenCalledWith('album-1');
  });

  it('provides createPlaylist function', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.createPlaylist).mockResolvedValue(mockYouTubePlaylist);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const playlist = await result.current.createPlaylist('New Playlist', 'Description');

    expect(playlist).toEqual(mockYouTubePlaylist);
  });

  it('provides addToPlaylist function', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.addToPlaylist).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    await act(async () => {
      await result.current.addToPlaylist('playlist-1', 'video-1');
    });

    expect(youtubeMusicClient.addToPlaylist).toHaveBeenCalledWith('playlist-1', 'video-1');
  });

  it('provides fetchAll function', async () => {
    vi.mocked(youtubeMusicClient.getPlaylists).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getLikedSongs).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(youtubeMusicClient.getAlbums).mockResolvedValue([]);

    const { result } = renderHook(() => useYouTubeMusicLibrary(), { wrapper });

    expect(typeof result.current.fetchAll).toBe('function');
  });
});
