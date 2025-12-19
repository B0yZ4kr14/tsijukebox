import { vi } from 'vitest';
import type { YouTubeMusicTrack, YouTubeMusicAlbum, YouTubeMusicPlaylist } from '@/lib/api/youtubeMusic';

// Mock data
export const mockYouTubeTrack: YouTubeMusicTrack = {
  id: 'yt-track-1',
  videoId: 'video-1',
  title: 'Test Track',
  artist: 'Test Artist',
  album: 'Test Album',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  durationMs: 180000,
  isLiked: false,
};

export const mockYouTubeAlbum: YouTubeMusicAlbum = {
  id: 'yt-album-1',
  title: 'Test Album',
  artist: 'Test Artist',
  thumbnailUrl: 'https://example.com/album.jpg',
  year: 2024,
  trackCount: 12,
};

export const mockYouTubePlaylist: YouTubeMusicPlaylist = {
  id: 'yt-playlist-1',
  title: 'Test Playlist',
  description: 'A test playlist',
  thumbnailUrl: 'https://example.com/playlist.jpg',
  trackCount: 25,
  privacy: 'PUBLIC',
};

export function createMockYouTubeMusicClient() {
  return {
    getPlaylists: vi.fn().mockResolvedValue([mockYouTubePlaylist]),
    getPlaylistTracks: vi.fn().mockResolvedValue([mockYouTubeTrack]),
    getLikedSongs: vi.fn().mockResolvedValue([mockYouTubeTrack]),
    getRecentlyPlayed: vi.fn().mockResolvedValue([mockYouTubeTrack]),
    getAlbums: vi.fn().mockResolvedValue([mockYouTubeAlbum]),
    getAlbumTracks: vi.fn().mockResolvedValue([mockYouTubeTrack]),
    createPlaylist: vi.fn().mockResolvedValue(mockYouTubePlaylist),
    addToPlaylist: vi.fn().mockResolvedValue({ success: true }),
    removeFromPlaylist: vi.fn().mockResolvedValue({ success: true }),
    search: vi.fn().mockResolvedValue({
      tracks: [mockYouTubeTrack],
      albums: [mockYouTubeAlbum],
      playlists: [mockYouTubePlaylist],
    }),
    play: vi.fn().mockResolvedValue({ success: true }),
    pause: vi.fn().mockResolvedValue({ success: true }),
    next: vi.fn().mockResolvedValue({ success: true }),
    previous: vi.fn().mockResolvedValue({ success: true }),
    seek: vi.fn().mockResolvedValue({ success: true }),
    setVolume: vi.fn().mockResolvedValue({ success: true }),
    addToQueue: vi.fn().mockResolvedValue({ success: true }),
  };
}
