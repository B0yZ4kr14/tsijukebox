// Spotify credentials and tokens
export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// User types
export interface SpotifyUser {
  id: string;
  displayName: string;
  email?: string;
  imageUrl?: string;
  product: 'premium' | 'free' | 'open';
}

// Artist simple reference
export interface SpotifyArtistSimple {
  id: string;
  name: string;
}

// Track
export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artist: string;
  artists: SpotifyArtistSimple[];
  album: string;
  albumId: string;
  albumImageUrl: string | null;
  durationMs: number;
  previewUrl: string | null;
  popularity: number;
  explicit: boolean;
  isLiked?: boolean;
  addedAt?: string;
}

// Album
export interface SpotifyAlbum {
  id: string;
  uri: string;
  name: string;
  artist: string;
  artists: SpotifyArtistSimple[];
  imageUrl: string | null;
  releaseDate: string;
  totalTracks: number;
  albumType: 'album' | 'single' | 'compilation';
}

// Artist
export interface SpotifyArtist {
  id: string;
  uri: string;
  name: string;
  imageUrl: string | null;
  followers: number;
  popularity: number;
  genres: string[];
}

// Playlist
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  tracksTotal: number;
  owner: string;
  ownerId: string;
  isPublic: boolean;
  collaborative: boolean;
  snapshotId: string;
}

// Category
export interface SpotifyCategory {
  id: string;
  name: string;
  imageUrl: string | null;
}

// Device
export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volumePercent: number;
}

// Playback state
export interface SpotifyPlaybackState {
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  track: SpotifyTrack | null;
  device: SpotifyDevice | null;
  shuffleState: boolean;
  repeatState: 'off' | 'context' | 'track';
}

// Search results
export interface SpotifySearchResults {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
  playlists: SpotifyPlaylist[];
}

// Pagination
export interface SpotifyPagination<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Create playlist params
export interface CreatePlaylistParams {
  name: string;
  description?: string;
  isPublic?: boolean;
}

// Play options
export interface PlayOptions {
  deviceId?: string;
  contextUri?: string;
  uris?: string[];
  positionMs?: number;
  offset?: { position?: number; uri?: string };
}

// Recommendation params
export interface RecommendationParams {
  seedTracks?: string[];
  seedArtists?: string[];
  seedGenres?: string[];
  limit?: number;
}
