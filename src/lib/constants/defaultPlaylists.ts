/**
 * Default playlists configuration for TSiJUKEBOX
 */

export const DEFAULT_PLAYLISTS = {
  grooveInside: {
    id: '0zzabncKBoIuFedycHOkzo',
    uri: 'spotify:playlist:0zzabncKBoIuFedycHOkzo',
    name: 'Groove Inside',
    description: 'Playlist padrão do TSiJUKEBOX com as melhores faixas para animar qualquer ambiente',
    imageUrl: 'https://i.scdn.co/image/ab67706c0000da84d99f5e38a67d8f37f3d0eae7',
    isDefault: true,
  }
} as const;

export const GROOVE_INSIDE_PLAYLIST_ID = '0zzabncKBoIuFedycHOkzo';
export const GROOVE_INSIDE_PLAYLIST_URI = 'spotify:playlist:0zzabncKBoIuFedycHOkzo';

export type DefaultPlaylistKey = keyof typeof DEFAULT_PLAYLISTS;
