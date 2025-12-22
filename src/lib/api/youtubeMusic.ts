import { API_BASE_URL, ApiError } from './client';
import { supabase } from '@/integrations/supabase/client';

export interface YouTubeMusicTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface YouTubeMusicUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
}

export interface YouTubeMusicTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string | null;
  durationMs: number;
  isLiked?: boolean;
}

export interface YouTubeMusicPlaylist {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  trackCount: number;
  privacy: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
}

export interface YouTubeMusicAlbum {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
  year: number;
  trackCount: number;
}

interface YouTubeMusicCredentials {
  clientId: string;
  clientSecret: string;
}

class YouTubeMusicClient {
  private tokens: YouTubeMusicTokens | null = null;
  private credentials: YouTubeMusicCredentials | null = null;
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  setCredentials(credentials: YouTubeMusicCredentials) {
    this.credentials = credentials;
  }

  getCredentials(): YouTubeMusicCredentials | null {
    return this.credentials;
  }

  clearCredentials() {
    this.credentials = null;
  }

  setTokens(tokens: YouTubeMusicTokens | null) {
    this.tokens = tokens;
  }

  clearTokens() {
    this.tokens = null;
  }

  getTokens(): YouTubeMusicTokens | null {
    return this.tokens;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (this.tokens?.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, 'server', response.status);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 'timeout');
      }
      throw new ApiError('Network error', 'network');
    }
  }

  // OAuth via Edge Function
  async getAuthUrl(redirectUri: string): Promise<{ authUrl: string }> {
    if (!this.credentials?.clientId) {
      throw new ApiError('Client ID não configurado. Configure as credenciais primeiro.', 'unknown');
    }
    
    const { data, error } = await supabase.functions.invoke('youtube-music-auth', {
      body: { 
        action: 'getAuthUrl', 
        redirectUri,
        clientId: this.credentials.clientId,
      },
    });
    if (error) throw new ApiError(error.message, 'server');
    if (data?.error) throw new ApiError(data.error, 'server');
    return data;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<YouTubeMusicTokens> {
    if (!this.credentials?.clientId || !this.credentials?.clientSecret) {
      throw new ApiError('Credenciais não configuradas', 'unknown');
    }
    
    const { data, error } = await supabase.functions.invoke('youtube-music-auth', {
      body: { 
        action: 'exchangeCode', 
        code, 
        redirectUri,
        clientId: this.credentials.clientId,
        clientSecret: this.credentials.clientSecret,
      },
    });
    if (error) throw new ApiError(error.message, 'server');
    if (data?.error) throw new ApiError(data.error, 'server');
    this.tokens = data;
    return data;
  }

  async refreshTokens(): Promise<YouTubeMusicTokens> {
    if (!this.tokens?.refreshToken) {
      throw new ApiError('No refresh token available', 'unknown');
    }
    if (!this.credentials?.clientId || !this.credentials?.clientSecret) {
      throw new ApiError('Credenciais não configuradas', 'unknown');
    }
    
    const { data, error } = await supabase.functions.invoke('youtube-music-auth', {
      body: { 
        action: 'refreshToken', 
        refreshToken: this.tokens.refreshToken,
        clientId: this.credentials.clientId,
        clientSecret: this.credentials.clientSecret,
      },
    });
    if (error) throw new ApiError(error.message, 'server');
    if (data?.error) throw new ApiError(data.error, 'server');
    this.tokens = data;
    return data;
  }

  async getCurrentUser(): Promise<YouTubeMusicUser | null> {
    try {
      return await this.request<YouTubeMusicUser>('/youtube-music/me');
    } catch {
      return null;
    }
  }

  /**
   * Validates the current access token by making a lightweight API call.
   * Returns the user info if valid, null otherwise.
   */
  async validateToken(): Promise<YouTubeMusicUser | null> {
    if (!this.tokens?.accessToken) {
      return null;
    }
    
    try {
      // Make a direct call to YouTube API to check token validity
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        {
          headers: {
            'Authorization': `Bearer ${this.tokens.accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        console.warn('YouTube Music token validation failed:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        return {
          id: channel.id,
          name: channel.snippet.title,
          email: '',
          imageUrl: channel.snippet.thumbnails?.default?.url || null,
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Error validating YouTube Music token:', error);
      return null;
    }
  }

  /**
   * Checks if the current token is expired based on expiresAt timestamp.
   */
  isTokenExpired(): boolean {
    if (!this.tokens?.expiresAt) {
      return true;
    }
    // Add 5 minute buffer
    return Date.now() >= this.tokens.expiresAt - 5 * 60 * 1000;
  }

  // Library
  async getPlaylists(): Promise<YouTubeMusicPlaylist[]> {
    return this.request<YouTubeMusicPlaylist[]>('/youtube-music/playlists');
  }

  async getPlaylistTracks(playlistId: string): Promise<YouTubeMusicTrack[]> {
    return this.request<YouTubeMusicTrack[]>(`/youtube-music/playlists/${playlistId}/tracks`);
  }

  async getLikedSongs(): Promise<YouTubeMusicTrack[]> {
    return this.request<YouTubeMusicTrack[]>('/youtube-music/liked');
  }

  async getRecentlyPlayed(): Promise<YouTubeMusicTrack[]> {
    return this.request<YouTubeMusicTrack[]>('/youtube-music/recent');
  }

  async getAlbums(): Promise<YouTubeMusicAlbum[]> {
    return this.request<YouTubeMusicAlbum[]>('/youtube-music/albums');
  }

  async getAlbumTracks(albumId: string): Promise<YouTubeMusicTrack[]> {
    return this.request<YouTubeMusicTrack[]>(`/youtube-music/albums/${albumId}/tracks`);
  }

  // Playlist management
  async createPlaylist(title: string, description?: string): Promise<YouTubeMusicPlaylist> {
    return this.request<YouTubeMusicPlaylist>('/youtube-music/playlists', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async addToPlaylist(playlistId: string, videoId: string): Promise<{ success: boolean }> {
    return this.request(`/youtube-music/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
  }

  async removeFromPlaylist(playlistId: string, videoId: string): Promise<{ success: boolean }> {
    return this.request(`/youtube-music/playlists/${playlistId}/tracks/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Search
  async search(query: string, type?: 'song' | 'video' | 'album' | 'playlist'): Promise<{
    tracks: YouTubeMusicTrack[];
    albums: YouTubeMusicAlbum[];
    playlists: YouTubeMusicPlaylist[];
  }> {
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    return this.request(`/youtube-music/search?${params}`);
  }

  // Playback (via backend playerctl/ytmdesktop)
  async play(videoId?: string): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/play', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
  }

  async pause(): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/pause', { method: 'POST' });
  }

  async next(): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/next', { method: 'POST' });
  }

  async previous(): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/previous', { method: 'POST' });
  }

  async seek(positionMs: number): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/seek', {
      method: 'POST',
      body: JSON.stringify({ position: positionMs }),
    });
  }

  async setVolume(percent: number): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/volume', {
      method: 'POST',
      body: JSON.stringify({ volume: percent }),
    });
  }

  async addToQueue(videoId: string): Promise<{ success: boolean }> {
    return this.request('/youtube-music/player/queue', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
  }
}

export const youtubeMusicClient = new YouTubeMusicClient();
