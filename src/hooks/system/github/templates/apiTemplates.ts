// API templates - 9 arquivos de clients

const VERSION = '2.0.0';

export function generateApiContent(path: string): string | null {
  const apiMap: Record<string, () => string> = {
    'src/lib/api/client.ts': generateApiClient,
    'src/lib/api/spotify.ts': generateSpotifyApi,
    'src/lib/api/localMusic.ts': generateLocalMusicApi,
    'src/lib/api/youtubeMusic.ts': generateYoutubeMusicApi,
    'src/lib/api/sshSync.ts': generateSshSyncApi,
    'src/lib/api/storj.ts': generateStorjApi,
    'src/lib/api/spicetify.ts': generateSpicetifyApi,
    'src/lib/api/types.ts': generateApiTypes,
    'src/lib/api/index.ts': generateApiIndex,
  };

  const generator = apiMap[path];
  return generator ? generator() : null;
}

function generateApiClient(): string {
  return `// TSiJUKEBOX API Client - v${VERSION}
// Base HTTP client with retry and error handling

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;

/**
 * Create abort controller with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Sleep for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request with retry logic
 */
export async function request<T>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
  } = config;

  let lastError: string = '';
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = createTimeoutController(timeout);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }

      const data = await response.json() as T;
      return { data, error: null, status: response.status };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt < retries) {
        await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
      }
    }
  }

  return { data: null, error: lastError, status: 0 };
}

/**
 * GET request helper
 */
export function get<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'GET', headers });
}

/**
 * POST request helper
 */
export function post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'POST', body, headers });
}

/**
 * PUT request helper
 */
export function put<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'PUT', body, headers });
}

/**
 * DELETE request helper
 */
export function del<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'DELETE', headers });
}

/**
 * Create API client instance with base URL
 */
export function createClient(baseUrl: string, defaultHeaders?: Record<string, string>) {
  return {
    get: <T>(path: string, headers?: Record<string, string>) =>
      get<T>(\`\${baseUrl}\${path}\`, { ...defaultHeaders, ...headers }),
    post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
      post<T>(\`\${baseUrl}\${path}\`, body, { ...defaultHeaders, ...headers }),
    put: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
      put<T>(\`\${baseUrl}\${path}\`, body, { ...defaultHeaders, ...headers }),
    delete: <T>(path: string, headers?: Record<string, string>) =>
      del<T>(\`\${baseUrl}\${path}\`, { ...defaultHeaders, ...headers }),
  };
}
`;
}

function generateSpotifyApi(): string {
  return `// TSiJUKEBOX Spotify API - v${VERSION}
// Spotify Web API client

import { createClient } from './client';
import type { Track, Artist, Album, Playlist } from './types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface SpotifyConfig {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Create Spotify API client
 */
export function createSpotifyClient(config: SpotifyConfig) {
  const client = createClient(SPOTIFY_API_BASE, {
    Authorization: \`Bearer \${config.accessToken}\`,
  });

  return {
    // Player endpoints
    getCurrentPlayback: () => client.get<SpotifyPlaybackState>('/me/player'),
    play: (deviceId?: string) => client.put('/me/player/play', {}, deviceId ? { device_id: deviceId } : {}),
    pause: (deviceId?: string) => client.put('/me/player/pause', {}, deviceId ? { device_id: deviceId } : {}),
    next: () => client.post('/me/player/next', {}),
    previous: () => client.post('/me/player/previous', {}),
    seek: (positionMs: number) => client.put(\`/me/player/seek?position_ms=\${positionMs}\`, {}),
    setVolume: (percent: number) => client.put(\`/me/player/volume?volume_percent=\${percent}\`, {}),
    
    // Search
    search: (query: string, types: string[] = ['track']) =>
      client.get<SpotifySearchResult>(\`/search?q=\${encodeURIComponent(query)}&type=\${types.join(',')}\`),
    
    // Tracks
    getTrack: (id: string) => client.get<Track>(\`/tracks/\${id}\`),
    getTracks: (ids: string[]) => client.get<{ tracks: Track[] }>(\`/tracks?ids=\${ids.join(',')}\`),
    
    // Artists
    getArtist: (id: string) => client.get<Artist>(\`/artists/\${id}\`),
    getArtistTopTracks: (id: string, market = 'BR') =>
      client.get<{ tracks: Track[] }>(\`/artists/\${id}/top-tracks?market=\${market}\`),
    
    // Albums
    getAlbum: (id: string) => client.get<Album>(\`/albums/\${id}\`),
    getAlbumTracks: (id: string) => client.get<{ items: Track[] }>(\`/albums/\${id}/tracks\`),
    
    // Playlists
    getPlaylist: (id: string) => client.get<Playlist>(\`/playlists/\${id}\`),
    getUserPlaylists: () => client.get<{ items: Playlist[] }>('/me/playlists'),
    
    // Library
    getSavedTracks: (limit = 20, offset = 0) =>
      client.get<{ items: Array<{ track: Track }> }>(\`/me/tracks?limit=\${limit}&offset=\${offset}\`),
    checkSavedTracks: (ids: string[]) =>
      client.get<boolean[]>(\`/me/tracks/contains?ids=\${ids.join(',')}\`),
    saveTracks: (ids: string[]) => client.put('/me/tracks', { ids }),
    removeTracks: (ids: string[]) => client.delete('/me/tracks'),
  };
}

interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: Track | null;
  device: {
    id: string;
    name: string;
    volume_percent: number;
  };
}

interface SpotifySearchResult {
  tracks?: { items: Track[] };
  artists?: { items: Artist[] };
  albums?: { items: Album[] };
  playlists?: { items: Playlist[] };
}

export type { SpotifyConfig, SpotifyPlaybackState, SpotifySearchResult };
`;
}

function generateLocalMusicApi(): string {
  return `// TSiJUKEBOX Local Music API - v${VERSION}
// Local music library management

import type { Track, Album, Artist } from './types';

interface LocalMusicConfig {
  basePath: string;
  supportedFormats?: string[];
}

const DEFAULT_FORMATS = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac'];

/**
 * Create local music API client
 */
export function createLocalMusicClient(config: LocalMusicConfig) {
  const { basePath, supportedFormats = DEFAULT_FORMATS } = config;

  return {
    /**
     * Scan directory for music files
     */
    async scanDirectory(path: string = basePath): Promise<Track[]> {
      // Implementation would use File System Access API or backend
      console.log('[LocalMusic] Scanning:', path);
      return [];
    },

    /**
     * Get track metadata
     */
    async getTrackMetadata(filePath: string): Promise<Track | null> {
      // Implementation would parse ID3 tags
      console.log('[LocalMusic] Getting metadata:', filePath);
      return null;
    },

    /**
     * Build library index
     */
    async buildIndex(): Promise<{ tracks: Track[]; albums: Album[]; artists: Artist[] }> {
      const tracks = await this.scanDirectory();
      const albumMap = new Map<string, Album>();
      const artistMap = new Map<string, Artist>();

      for (const track of tracks) {
        // Group by album
        if (track.album) {
          const existing = albumMap.get(track.album);
          if (existing) {
            existing.tracks?.push(track);
          } else {
            albumMap.set(track.album, {
              id: \`album-\${track.album}\`,
              name: track.album,
              tracks: [track],
            } as Album);
          }
        }

        // Group by artist
        if (track.artist) {
          const existing = artistMap.get(track.artist);
          if (!existing) {
            artistMap.set(track.artist, {
              id: \`artist-\${track.artist}\`,
              name: track.artist,
            } as Artist);
          }
        }
      }

      return {
        tracks,
        albums: Array.from(albumMap.values()),
        artists: Array.from(artistMap.values()),
      };
    },

    /**
     * Watch for file changes
     */
    watchChanges(callback: (event: 'add' | 'remove' | 'change', path: string) => void): () => void {
      console.log('[LocalMusic] Watching for changes');
      // Return cleanup function
      return () => console.log('[LocalMusic] Stopped watching');
    },

    /**
     * Get supported formats
     */
    getSupportedFormats(): string[] {
      return supportedFormats;
    },

    /**
     * Check if file is supported
     */
    isSupported(filename: string): boolean {
      const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
      return supportedFormats.includes(ext);
    },
  };
}

export type { LocalMusicConfig };
`;
}

function generateYoutubeMusicApi(): string {
  return `// TSiJUKEBOX YouTube Music API - v${VERSION}
// YouTube Music integration

import { createClient } from './client';
import type { Track, Playlist } from './types';

interface YouTubeMusicConfig {
  apiKey?: string;
  cookie?: string;
}

/**
 * Create YouTube Music API client
 */
export function createYouTubeMusicClient(config: YouTubeMusicConfig = {}) {
  const headers: Record<string, string> = {};
  if (config.cookie) {
    headers['Cookie'] = config.cookie;
  }

  return {
    /**
     * Search for music
     */
    async search(query: string, type: 'song' | 'video' | 'album' | 'playlist' = 'song'): Promise<Track[]> {
      console.log('[YouTubeMusic] Searching:', query, type);
      // Implementation would use YouTube Music API or scraping
      return [];
    },

    /**
     * Get track details
     */
    async getTrack(videoId: string): Promise<Track | null> {
      console.log('[YouTubeMusic] Getting track:', videoId);
      return null;
    },

    /**
     * Get playlist
     */
    async getPlaylist(playlistId: string): Promise<Playlist | null> {
      console.log('[YouTubeMusic] Getting playlist:', playlistId);
      return null;
    },

    /**
     * Get stream URL
     */
    async getStreamUrl(videoId: string): Promise<string | null> {
      console.log('[YouTubeMusic] Getting stream URL:', videoId);
      // Would return audio stream URL
      return null;
    },

    /**
     * Get recommendations
     */
    async getRecommendations(seedVideoId: string): Promise<Track[]> {
      console.log('[YouTubeMusic] Getting recommendations for:', seedVideoId);
      return [];
    },

    /**
     * Get home feed
     */
    async getHomeFeed(): Promise<{ sections: Array<{ title: string; items: Track[] }> }> {
      return { sections: [] };
    },

    /**
     * Get charts
     */
    async getCharts(country = 'BR'): Promise<Track[]> {
      console.log('[YouTubeMusic] Getting charts for:', country);
      return [];
    },
  };
}

export type { YouTubeMusicConfig };
`;
}

function generateSshSyncApi(): string {
  return `// TSiJUKEBOX SSH Sync API - v${VERSION}
// SSH-based file synchronization

interface SSHConfig {
  host: string;
  port?: number;
  username: string;
  privateKey?: string;
  password?: string;
}

interface SyncResult {
  success: boolean;
  filesTransferred: number;
  bytesTransferred: number;
  errors: string[];
  duration: number;
}

/**
 * Create SSH sync client
 * Note: This would require a backend service in production
 */
export function createSSHSyncClient(config: SSHConfig) {
  const { host, port = 22, username } = config;

  return {
    /**
     * Test connection
     */
    async testConnection(): Promise<{ connected: boolean; error?: string }> {
      console.log('[SSHSync] Testing connection to', host);
      // Would test SSH connection
      return { connected: false, error: 'Not implemented - requires backend' };
    },

    /**
     * Sync files from remote
     */
    async syncFromRemote(remotePath: string, localPath: string): Promise<SyncResult> {
      console.log('[SSHSync] Syncing from', \`\${host}:\${remotePath}\`, 'to', localPath);
      return {
        success: false,
        filesTransferred: 0,
        bytesTransferred: 0,
        errors: ['Not implemented - requires backend'],
        duration: 0,
      };
    },

    /**
     * Sync files to remote
     */
    async syncToRemote(localPath: string, remotePath: string): Promise<SyncResult> {
      console.log('[SSHSync] Syncing from', localPath, 'to', \`\${host}:\${remotePath}\`);
      return {
        success: false,
        filesTransferred: 0,
        bytesTransferred: 0,
        errors: ['Not implemented - requires backend'],
        duration: 0,
      };
    },

    /**
     * List remote directory
     */
    async listRemote(remotePath: string): Promise<string[]> {
      console.log('[SSHSync] Listing', \`\${host}:\${remotePath}\`);
      return [];
    },

    /**
     * Execute remote command
     */
    async exec(command: string): Promise<{ stdout: string; stderr: string; code: number }> {
      console.log('[SSHSync] Executing on', host, ':', command);
      return { stdout: '', stderr: 'Not implemented', code: 1 };
    },

    /**
     * Get connection info
     */
    getConnectionInfo() {
      return { host, port, username };
    },
  };
}

export type { SSHConfig, SyncResult };
`;
}

function generateStorjApi(): string {
  return `// TSiJUKEBOX Storj API - v${VERSION}
// Storj decentralized storage integration

interface StorjConfig {
  accessGrant: string;
  bucket?: string;
}

interface UploadResult {
  success: boolean;
  path: string;
  size: number;
  error?: string;
}

interface DownloadResult {
  success: boolean;
  data: Blob | null;
  error?: string;
}

/**
 * Create Storj storage client
 */
export function createStorjClient(config: StorjConfig) {
  const { accessGrant, bucket = 'tsijukebox' } = config;

  return {
    /**
     * Upload file
     */
    async upload(path: string, data: Blob | ArrayBuffer): Promise<UploadResult> {
      console.log('[Storj] Uploading to', \`\${bucket}/\${path}\`);
      // Would use Storj SDK
      return {
        success: false,
        path,
        size: 0,
        error: 'Not implemented - requires Storj SDK',
      };
    },

    /**
     * Download file
     */
    async download(path: string): Promise<DownloadResult> {
      console.log('[Storj] Downloading', \`\${bucket}/\${path}\`);
      return {
        success: false,
        data: null,
        error: 'Not implemented - requires Storj SDK',
      };
    },

    /**
     * Delete file
     */
    async delete(path: string): Promise<{ success: boolean; error?: string }> {
      console.log('[Storj] Deleting', \`\${bucket}/\${path}\`);
      return { success: false, error: 'Not implemented' };
    },

    /**
     * List files in path
     */
    async list(prefix: string = ''): Promise<string[]> {
      console.log('[Storj] Listing', \`\${bucket}/\${prefix}\`);
      return [];
    },

    /**
     * Get file info
     */
    async stat(path: string): Promise<{ size: number; modified: Date } | null> {
      console.log('[Storj] Getting info for', \`\${bucket}/\${path}\`);
      return null;
    },

    /**
     * Get sharing link
     */
    async getShareLink(path: string, expiresIn = 3600): Promise<string | null> {
      console.log('[Storj] Creating share link for', path);
      return null;
    },

    /**
     * Get bucket info
     */
    getBucketInfo() {
      return { bucket, accessGrant: accessGrant.slice(0, 10) + '...' };
    },
  };
}

export type { StorjConfig, UploadResult, DownloadResult };
`;
}

function generateSpicetifyApi(): string {
  return `// TSiJUKEBOX Spicetify API - v${VERSION}
// Spicetify integration for Spotify customization

interface SpicetifyConfig {
  port?: number;
  host?: string;
}

interface SpicetifyTheme {
  name: string;
  path: string;
  colorScheme?: string;
}

interface SpicetifyExtension {
  name: string;
  path: string;
  enabled: boolean;
}

/**
 * Create Spicetify API client
 */
export function createSpicetifyClient(config: SpicetifyConfig = {}) {
  const { port = 8974, host = 'localhost' } = config;
  const baseUrl = \`http://\${host}:\${port}\`;

  return {
    /**
     * Check if Spicetify is available
     */
    async isAvailable(): Promise<boolean> {
      try {
        const response = await fetch(\`\${baseUrl}/health\`, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    },

    /**
     * Get installed themes
     */
    async getThemes(): Promise<SpicetifyTheme[]> {
      console.log('[Spicetify] Getting themes');
      return [];
    },

    /**
     * Apply theme
     */
    async applyTheme(themeName: string, colorScheme?: string): Promise<boolean> {
      console.log('[Spicetify] Applying theme:', themeName, colorScheme);
      return false;
    },

    /**
     * Get installed extensions
     */
    async getExtensions(): Promise<SpicetifyExtension[]> {
      console.log('[Spicetify] Getting extensions');
      return [];
    },

    /**
     * Toggle extension
     */
    async toggleExtension(extensionName: string, enabled: boolean): Promise<boolean> {
      console.log('[Spicetify] Toggle extension:', extensionName, enabled);
      return false;
    },

    /**
     * Run Spicetify apply
     */
    async apply(): Promise<{ success: boolean; output: string }> {
      console.log('[Spicetify] Running apply');
      return { success: false, output: 'Not implemented' };
    },

    /**
     * Run Spicetify update
     */
    async update(): Promise<{ success: boolean; output: string }> {
      console.log('[Spicetify] Running update');
      return { success: false, output: 'Not implemented' };
    },

    /**
     * Backup current config
     */
    async backup(): Promise<{ success: boolean; path?: string }> {
      console.log('[Spicetify] Creating backup');
      return { success: false };
    },

    /**
     * Restore from backup
     */
    async restore(backupPath: string): Promise<boolean> {
      console.log('[Spicetify] Restoring from:', backupPath);
      return false;
    },

    /**
     * Get configuration
     */
    getConfig() {
      return { host, port, baseUrl };
    },
  };
}

export type { SpicetifyConfig, SpicetifyTheme, SpicetifyExtension };
`;
}

function generateApiTypes(): string {
  return `// TSiJUKEBOX API Types - v${VERSION}
// Shared API type definitions

export interface Track {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration_ms: number;
  preview_url?: string;
  album_art?: string;
  external_url?: string;
  uri?: string;
  provider: 'spotify' | 'youtube' | 'local' | 'unknown';
}

export interface Artist {
  id: string;
  name: string;
  image?: string;
  genres?: string[];
  followers?: number;
  popularity?: number;
  external_url?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  release_date?: string;
  total_tracks?: number;
  album_art?: string;
  tracks?: Track[];
  external_url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  image?: string;
  tracks_count?: number;
  tracks?: Track[];
  public?: boolean;
  collaborative?: boolean;
  external_url?: string;
}

export interface PlaybackState {
  is_playing: boolean;
  progress_ms: number;
  duration_ms: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
  current_track: Track | null;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Type guards
export function isTrack(obj: unknown): obj is Track {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'artist' in obj;
}

export function isArtist(obj: unknown): obj is Artist {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && !('artist' in obj);
}

export function isAlbum(obj: unknown): obj is Album {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'artist' in obj && 'tracks' in obj;
}

export function isPlaylist(obj: unknown): obj is Playlist {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'tracks_count' in obj;
}
`;
}

function generateApiIndex(): string {
  return `// TSiJUKEBOX API Index - v${VERSION}
// Export all API clients and types

// Base client
export { request, get, post, put, del, createClient } from './client';

// Service clients
export { createSpotifyClient } from './spotify';
export type { SpotifyConfig, SpotifyPlaybackState, SpotifySearchResult } from './spotify';

export { createLocalMusicClient } from './localMusic';
export type { LocalMusicConfig } from './localMusic';

export { createYouTubeMusicClient } from './youtubeMusic';
export type { YouTubeMusicConfig } from './youtubeMusic';

export { createSSHSyncClient } from './sshSync';
export type { SSHConfig, SyncResult } from './sshSync';

export { createStorjClient } from './storj';
export type { StorjConfig, UploadResult, DownloadResult } from './storj';

export { createSpicetifyClient } from './spicetify';
export type { SpicetifyConfig, SpicetifyTheme, SpicetifyExtension } from './spicetify';

// Types
export type {
  Track,
  Artist,
  Album,
  Playlist,
  PlaybackState,
  SearchResult,
  ApiError,
  PaginationParams,
  SortParams,
} from './types';

export { isTrack, isArtist, isAlbum, isPlaylist } from './types';
`;
}
