// Re-export all types
export * from './types';

// Re-export mappers for testing
export { mapTrack, mapAlbum, mapArtist, mapPlaylist } from './mappers';

// Re-export client singleton for backward compatibility
export { spotifyClient } from '../spotify';
