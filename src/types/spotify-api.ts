// Raw Spotify API response types for type-safe API calls
// These represent the actual JSON structure returned by Spotify's API

export interface SpotifyApiImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyApiArtistSimple {
  id: string;
  name: string;
  uri?: string;
}

export interface SpotifyApiAlbumSimple {
  id: string;
  name: string;
  images: SpotifyApiImage[];
  uri?: string;
}

export interface SpotifyApiTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  artists: SpotifyApiArtistSimple[];
  album: SpotifyApiAlbumSimple;
}

export interface SpotifyApiAlbum {
  id: string;
  uri: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string;
  total_tracks: number;
  images: SpotifyApiImage[];
  artists: SpotifyApiArtistSimple[];
}

export interface SpotifyApiArtist {
  id: string;
  uri: string;
  name: string;
  images: SpotifyApiImage[];
  followers: { total: number };
  popularity: number;
  genres: string[];
}

export interface SpotifyApiPlaylistOwner {
  id: string;
  display_name: string;
}

export interface SpotifyApiPlaylist {
  id: string;
  name: string;
  description: string | null;
  public: boolean;
  collaborative: boolean;
  snapshot_id: string;
  images: SpotifyApiImage[];
  tracks: { total: number };
  owner: SpotifyApiPlaylistOwner;
}

export interface SpotifyApiCategory {
  id: string;
  name: string;
  icons: SpotifyApiImage[];
}

export interface SpotifyApiDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number;
}

// Paginated responses
export interface SpotifyApiPaginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Specific endpoint responses
export interface SpotifyApiPlaylistsResponse extends SpotifyApiPaginated<SpotifyApiPlaylist> {}

export interface SpotifyApiPlaylistTracksResponse extends SpotifyApiPaginated<{
  track: SpotifyApiTrack | null;
  added_at: string;
}> {}

export interface SpotifyApiSavedTracksResponse extends SpotifyApiPaginated<{
  track: SpotifyApiTrack;
  added_at: string;
}> {}

export interface SpotifyApiSavedAlbumsResponse extends SpotifyApiPaginated<{
  album: SpotifyApiAlbum;
  added_at: string;
}> {}

export interface SpotifyApiAlbumTracksResponse extends SpotifyApiPaginated<
  Omit<SpotifyApiTrack, 'album'>
> {}

export interface SpotifyApiFollowedArtistsResponse {
  artists: {
    items: SpotifyApiArtist[];
    cursors: { after: string | null };
  };
}

export interface SpotifyApiSearchResponse {
  tracks?: SpotifyApiPaginated<SpotifyApiTrack>;
  albums?: SpotifyApiPaginated<SpotifyApiAlbum>;
  artists?: SpotifyApiPaginated<SpotifyApiArtist>;
  playlists?: SpotifyApiPaginated<SpotifyApiPlaylist>;
}

export interface SpotifyApiRecentlyPlayedResponse {
  items: Array<{
    track: SpotifyApiTrack;
    played_at: string;
  }>;
}

export interface SpotifyApiTopItemsResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SpotifyApiFeaturedPlaylistsResponse {
  playlists: SpotifyApiPaginated<SpotifyApiPlaylist>;
}

export interface SpotifyApiNewReleasesResponse {
  albums: SpotifyApiPaginated<SpotifyApiAlbum>;
}

export interface SpotifyApiCategoriesResponse {
  categories: SpotifyApiPaginated<SpotifyApiCategory>;
}

export interface SpotifyApiCategoryPlaylistsResponse {
  playlists: SpotifyApiPaginated<SpotifyApiPlaylist | null>;
}

export interface SpotifyApiPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyApiTrack | null;
  device: SpotifyApiDevice | null;
  shuffle_state: boolean;
  repeat_state: 'off' | 'context' | 'track';
}

export interface SpotifyApiDevicesResponse {
  devices: SpotifyApiDevice[];
}

export interface SpotifyApiQueueResponse {
  currently_playing: SpotifyApiTrack | null;
  queue: SpotifyApiTrack[];
}

export interface SpotifyApiRecommendationsResponse {
  tracks: SpotifyApiTrack[];
}

export interface SpotifyApiArtistTopTracksResponse {
  tracks: SpotifyApiTrack[];
}

// LRCLIB API types (for lyrics edge function)
export interface LRCLIBResult {
  id: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}
