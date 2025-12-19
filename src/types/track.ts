/**
 * Unified track type definitions
 */

export type MusicGenre = 'rock' | 'pop' | 'soul' | 'hip-hop' | 'ballad' | 'classic-rock';

/**
 * Base track information shared across all track types
 */
export interface BaseTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  duration: number;
}

/**
 * Track information for now playing / status
 */
export interface TrackInfo extends Partial<BaseTrack> {
  id?: string;
  albumId?: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  duration?: number;
  position?: number;
  genre?: MusicGenre;
}

/**
 * Track in the playback queue
 */
export interface QueueTrack extends BaseTrack {
  uri?: string;
  addedAt?: Date;
  addedBy?: string;
}

/**
 * Spotify-specific track information
 */
export interface SpotifyTrack extends BaseTrack {
  uri: string;
  albumId: string;
  artistId?: string;
  popularity?: number;
  explicit?: boolean;
  previewUrl?: string | null;
}

/**
 * YouTube Music-specific track information
 */
export interface YouTubeMusicTrack extends BaseTrack {
  videoId: string;
  channelId?: string;
  thumbnailUrl?: string;
}

/**
 * Local music track
 */
export interface LocalTrack extends BaseTrack {
  filename: string;
  path: string;
  plays: number;
  addedAt: string;
}

/**
 * Current track with playback state
 */
export interface CurrentTrack extends TrackInfo {
  isPlaying: boolean;
}

/**
 * Type guard for QueueTrack
 */
export function isQueueTrack(track: unknown): track is QueueTrack {
  return (
    typeof track === 'object' &&
    track !== null &&
    'id' in track &&
    'title' in track &&
    'artist' in track &&
    'duration' in track
  );
}

/**
 * Type guard for SpotifyTrack
 */
export function isSpotifyTrack(track: unknown): track is SpotifyTrack {
  return (
    typeof track === 'object' &&
    track !== null &&
    'uri' in track &&
    typeof (track as SpotifyTrack).uri === 'string'
  );
}
