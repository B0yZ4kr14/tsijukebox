import { vi } from 'vitest';
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyCategory, SpotifyPagination } from '@/lib/api/spotify';

// Mock data
export const mockSpotifyTrack: SpotifyTrack = {
  id: 'track-1',
  uri: 'spotify:track:track-1',
  name: 'Test Track',
  artist: 'Test Artist',
  artists: [{ id: 'artist-1', name: 'Test Artist' }],
  album: 'Test Album',
  albumId: 'album-1',
  albumImageUrl: 'https://example.com/album.jpg',
  durationMs: 180000,
  previewUrl: 'https://example.com/preview.mp3',
  popularity: 80,
  explicit: false,
  isLiked: false,
};

export const mockSpotifyAlbum: SpotifyAlbum = {
  id: 'album-1',
  uri: 'spotify:album:album-1',
  name: 'Test Album',
  artist: 'Test Artist',
  artists: [{ id: 'artist-1', name: 'Test Artist' }],
  imageUrl: 'https://example.com/album.jpg',
  releaseDate: '2024-01-01',
  totalTracks: 12,
  albumType: 'album',
};

export const mockSpotifyArtist: SpotifyArtist = {
  id: 'artist-1',
  uri: 'spotify:artist:artist-1',
  name: 'Test Artist',
  imageUrl: 'https://example.com/artist.jpg',
  followers: 1000000,
  popularity: 85,
  genres: ['pop', 'rock'],
};

export const mockSpotifyPlaylist: SpotifyPlaylist = {
  id: 'playlist-1',
  name: 'Test Playlist',
  description: 'A test playlist',
  imageUrl: 'https://example.com/playlist.jpg',
  tracksTotal: 50,
  owner: 'Test User',
  ownerId: 'user-1',
  isPublic: true,
  collaborative: false,
  snapshotId: 'snapshot-1',
};

export const mockSpotifyCategory: SpotifyCategory = {
  id: 'category-1',
  name: 'Pop',
  imageUrl: 'https://example.com/category.jpg',
};

export function createPaginatedResponse<T>(items: T[], total?: number): SpotifyPagination<T> {
  return {
    items,
    total: total ?? items.length,
    limit: 50,
    offset: 0,
    hasMore: false,
  };
}

export function createMockSpotifyClient() {
  return {
    isAuthenticated: vi.fn().mockReturnValue(true),
    getPlaylists: vi.fn().mockResolvedValue(createPaginatedResponse([mockSpotifyPlaylist])),
    getPlaylist: vi.fn().mockResolvedValue(mockSpotifyPlaylist),
    getPlaylistTracks: vi.fn().mockResolvedValue(createPaginatedResponse([mockSpotifyTrack])),
    getLikedTracks: vi.fn().mockResolvedValue(createPaginatedResponse([mockSpotifyTrack])),
    getSavedAlbums: vi.fn().mockResolvedValue(createPaginatedResponse([mockSpotifyAlbum])),
    getFollowedArtists: vi.fn().mockResolvedValue({ items: [mockSpotifyArtist], cursors: { after: '' } }),
    getRecentlyPlayed: vi.fn().mockResolvedValue([mockSpotifyTrack]),
    getTopTracks: vi.fn().mockResolvedValue([mockSpotifyTrack]),
    getTopArtists: vi.fn().mockResolvedValue([mockSpotifyArtist]),
    getFeaturedPlaylists: vi.fn().mockResolvedValue([mockSpotifyPlaylist]),
    getNewReleases: vi.fn().mockResolvedValue([mockSpotifyAlbum]),
    getCategories: vi.fn().mockResolvedValue([mockSpotifyCategory]),
    getRecommendations: vi.fn().mockResolvedValue([mockSpotifyTrack]),
    likeTrack: vi.fn().mockResolvedValue(undefined),
    unlikeTrack: vi.fn().mockResolvedValue(undefined),
    saveAlbum: vi.fn().mockResolvedValue(undefined),
    removeAlbum: vi.fn().mockResolvedValue(undefined),
    createPlaylist: vi.fn().mockResolvedValue(mockSpotifyPlaylist),
    followPlaylist: vi.fn().mockResolvedValue(undefined),
    unfollowPlaylist: vi.fn().mockResolvedValue(undefined),
    addTracksToPlaylist: vi.fn().mockResolvedValue(undefined),
    removeTracksFromPlaylist: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue({
      tracks: [mockSpotifyTrack],
      albums: [mockSpotifyAlbum],
      artists: [mockSpotifyArtist],
      playlists: [mockSpotifyPlaylist],
    }),
  };
}
