import type {
  SpotifyApiTrack,
  SpotifyApiAlbum,
  SpotifyApiArtist,
  SpotifyApiPlaylist,
} from '@/types/spotify-api';
import type {
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
} from './types';

/**
 * Maps a Spotify API track to our internal format
 */
export const mapTrack = (track: SpotifyApiTrack): SpotifyTrack => ({
  id: track.id,
  uri: track.uri,
  name: track.name,
  artist: track.artists?.map((a) => a.name).join(', ') || '',
  artists: track.artists?.map((a) => ({ id: a.id, name: a.name })) || [],
  album: track.album?.name || '',
  albumId: track.album?.id || '',
  albumImageUrl: track.album?.images?.[0]?.url || null,
  durationMs: track.duration_ms,
  previewUrl: track.preview_url,
  popularity: track.popularity || 0,
  explicit: track.explicit || false,
});

/**
 * Maps a Spotify API album to our internal format
 */
export const mapAlbum = (album: SpotifyApiAlbum): SpotifyAlbum => ({
  id: album.id,
  uri: album.uri,
  name: album.name,
  artist: album.artists?.map((a) => a.name).join(', ') || '',
  artists: album.artists?.map((a) => ({ id: a.id, name: a.name })) || [],
  imageUrl: album.images?.[0]?.url || null,
  releaseDate: album.release_date || '',
  totalTracks: album.total_tracks || 0,
  albumType: album.album_type || 'album',
});

/**
 * Maps a Spotify API artist to our internal format
 */
export const mapArtist = (artist: SpotifyApiArtist): SpotifyArtist => ({
  id: artist.id,
  uri: artist.uri,
  name: artist.name,
  imageUrl: artist.images?.[0]?.url || null,
  followers: artist.followers?.total || 0,
  popularity: artist.popularity || 0,
  genres: artist.genres || [],
});

/**
 * Maps a Spotify API playlist to our internal format
 */
export const mapPlaylist = (playlist: SpotifyApiPlaylist): SpotifyPlaylist => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description,
  imageUrl: playlist.images?.[0]?.url || null,
  tracksTotal: playlist.tracks?.total || 0,
  owner: playlist.owner?.display_name || '',
  ownerId: playlist.owner?.id || '',
  isPublic: playlist.public ?? true,
  collaborative: playlist.collaborative || false,
  snapshotId: playlist.snapshot_id || '',
});
