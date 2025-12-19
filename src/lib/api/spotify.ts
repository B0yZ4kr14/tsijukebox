// Spotify API types and client
import type {
  SpotifyApiTrack,
  SpotifyApiAlbum,
  SpotifyApiArtist,
  SpotifyApiPlaylist,
  SpotifyApiPlaylistsResponse,
  SpotifyApiPlaylistTracksResponse,
  SpotifyApiSavedTracksResponse,
  SpotifyApiSavedAlbumsResponse,
  SpotifyApiAlbumTracksResponse,
  SpotifyApiFollowedArtistsResponse,
  SpotifyApiSearchResponse,
  SpotifyApiRecentlyPlayedResponse,
  SpotifyApiTopItemsResponse,
  SpotifyApiFeaturedPlaylistsResponse,
  SpotifyApiNewReleasesResponse,
  SpotifyApiCategoriesResponse,
  SpotifyApiCategoryPlaylistsResponse,
  SpotifyApiPlaybackState,
  SpotifyApiDevicesResponse,
  SpotifyApiQueueResponse,
  SpotifyApiRecommendationsResponse,
  SpotifyApiArtistTopTracksResponse,
  SpotifyApiCategory,
  SpotifyApiDevice,
} from '@/types/spotify-api';

export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SpotifyUser {
  id: string;
  displayName: string;
  email?: string;
  imageUrl?: string;
  product: 'premium' | 'free' | 'open';
}

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

export interface SpotifyArtistSimple {
  id: string;
  name: string;
}

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

export interface SpotifyArtist {
  id: string;
  uri: string;
  name: string;
  imageUrl: string | null;
  followers: number;
  popularity: number;
  genres: string[];
}

export interface SpotifySearchResults {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
  playlists: SpotifyPlaylist[];
}

export interface CreatePlaylistParams {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface SpotifyPagination<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SpotifyCategory {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volumePercent: number;
}

export interface SpotifyPlaybackState {
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  track: SpotifyTrack | null;
  device: SpotifyDevice | null;
  shuffleState: boolean;
  repeatState: 'off' | 'context' | 'track';
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-auth`;

class SpotifyClient {
  private credentials: SpotifyCredentials | null = null;
  private tokens: SpotifyTokens | null = null;
  private refreshPromise: Promise<SpotifyTokens> | null = null;

  setCredentials(credentials: SpotifyCredentials) {
    this.credentials = credentials;
  }

  setTokens(tokens: SpotifyTokens) {
    this.tokens = tokens;
  }

  getTokens(): SpotifyTokens | null {
    return this.tokens;
  }

  clearTokens() {
    this.tokens = null;
  }

  isAuthenticated(): boolean {
    return !!this.tokens?.accessToken;
  }

  isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expiresAt - 5 * 60 * 1000;
  }

  async getAuthUrl(): Promise<{ authUrl: string; state: string }> {
    if (!this.credentials?.clientId) {
      throw new Error("Spotify credentials not configured");
    }

    const redirectUri = `${window.location.origin}/settings`;
    
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: this.credentials.clientId,
        clientSecret: this.credentials.clientSecret,
        redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate auth URL");
    }

    return response.json();
  }

  async exchangeCode(code: string): Promise<SpotifyTokens> {
    if (!this.credentials) {
      throw new Error("Spotify credentials not configured");
    }

    const redirectUri = `${window.location.origin}/settings`;

    const response = await fetch(`${EDGE_FUNCTION_URL}?action=exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: this.credentials.clientId,
        clientSecret: this.credentials.clientSecret,
        redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to exchange code");
    }

    const tokens = await response.json();
    this.tokens = tokens;
    return tokens;
  }

  async refreshTokens(): Promise<SpotifyTokens> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.credentials || !this.tokens?.refreshToken) {
      throw new Error("Cannot refresh: missing credentials or refresh token");
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${EDGE_FUNCTION_URL}?action=refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: this.credentials!.clientId,
            clientSecret: this.credentials!.clientSecret,
            refreshToken: this.tokens!.refreshToken,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.needsReauth) {
            this.tokens = null;
            throw new Error("REAUTH_REQUIRED");
          }
          throw new Error(error.error || "Failed to refresh token");
        }

        const tokens = await response.json();
        this.tokens = tokens;
        return tokens;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async getValidToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error("Not authenticated");
    }

    if (this.isTokenExpired()) {
      await this.refreshTokens();
    }

    return this.tokens!.accessToken;
  }

  async validateToken(): Promise<SpotifyUser | null> {
    if (!this.tokens?.accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${EDGE_FUNCTION_URL}?action=validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: this.tokens.accessToken }),
      });

      const data = await response.json();
      
      if (!data.valid) {
        if (this.tokens.refreshToken) {
          await this.refreshTokens();
          return this.validateToken();
        }
        return null;
      }

      return data.user;
    } catch {
      return null;
    }
  }

  private async apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = await this.getValidToken();
    
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Spotify API error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== Playlists ====================

  async getPlaylists(limit = 50, offset = 0): Promise<SpotifyPagination<SpotifyPlaylist>> {
    const data = await this.apiRequest<SpotifyApiPlaylistsResponse>(`/me/playlists?limit=${limit}&offset=${offset}`);
    
    return {
      items: data.items.map(this.mapPlaylist),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.offset + data.items.length < data.total,
    };
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    const data = await this.apiRequest<SpotifyApiPlaylist>(`/playlists/${playlistId}`);
    return this.mapPlaylist(data);
  }

  async getPlaylistTracks(playlistId: string, limit = 100, offset = 0): Promise<SpotifyPagination<SpotifyTrack>> {
    const data = await this.apiRequest<SpotifyApiPlaylistTracksResponse>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
    );

    return {
      items: data.items
        .filter((item) => item.track)
        .map((item) => ({
          ...this.mapTrack(item.track!),
          addedAt: item.added_at,
        })),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.offset + data.items.length < data.total,
    };
  }

  async createPlaylist(params: CreatePlaylistParams): Promise<SpotifyPlaylist> {
    const user = await this.validateToken();
    if (!user) throw new Error("Not authenticated");

    const data = await this.apiRequest<SpotifyApiPlaylist>(`/users/${user.id}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name: params.name,
        description: params.description || "",
        public: params.isPublic ?? false,
      }),
    });

    return this.mapPlaylist(data);
  }

  async updatePlaylist(playlistId: string, params: Partial<CreatePlaylistParams>): Promise<void> {
    await this.apiRequest(`/playlists/${playlistId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        public: params.isPublic,
      }),
    });
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[], position?: number): Promise<void> {
    await this.apiRequest(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({
        uris: trackUris,
        position,
      }),
    });
  }

  async removeTracksFromPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    await this.apiRequest(`/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      body: JSON.stringify({
        tracks: trackUris.map(uri => ({ uri })),
      }),
    });
  }

  async reorderPlaylistTracks(
    playlistId: string, 
    rangeStart: number, 
    insertBefore: number, 
    rangeLength = 1
  ): Promise<void> {
    await this.apiRequest(`/playlists/${playlistId}/tracks`, {
      method: "PUT",
      body: JSON.stringify({
        range_start: rangeStart,
        insert_before: insertBefore,
        range_length: rangeLength,
      }),
    });
  }

  async followPlaylist(playlistId: string): Promise<void> {
    await this.apiRequest(`/playlists/${playlistId}/followers`, {
      method: "PUT",
    });
  }

  async unfollowPlaylist(playlistId: string): Promise<void> {
    await this.apiRequest(`/playlists/${playlistId}/followers`, {
      method: "DELETE",
    });
  }

  // ==================== Library (Liked Songs) ====================

  async getLikedTracks(limit = 50, offset = 0): Promise<SpotifyPagination<SpotifyTrack>> {
    const data = await this.apiRequest<SpotifyApiSavedTracksResponse>(`/me/tracks?limit=${limit}&offset=${offset}`);

    return {
      items: data.items.map((item) => ({
        ...this.mapTrack(item.track),
        isLiked: true,
        addedAt: item.added_at,
      })),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.offset + data.items.length < data.total,
    };
  }

  async likeTrack(trackId: string): Promise<void> {
    await this.apiRequest(`/me/tracks?ids=${trackId}`, {
      method: "PUT",
    });
  }

  async unlikeTrack(trackId: string): Promise<void> {
    await this.apiRequest(`/me/tracks?ids=${trackId}`, {
      method: "DELETE",
    });
  }

  async checkLikedTracks(trackIds: string[]): Promise<boolean[]> {
    const data = await this.apiRequest<boolean[]>(`/me/tracks/contains?ids=${trackIds.join(",")}`);
    return data;
  }

  // ==================== Albums ====================

  async getSavedAlbums(limit = 50, offset = 0): Promise<SpotifyPagination<SpotifyAlbum>> {
    const data = await this.apiRequest<SpotifyApiSavedAlbumsResponse>(`/me/albums?limit=${limit}&offset=${offset}`);

    return {
      items: data.items.map((item) => this.mapAlbum(item.album)),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.offset + data.items.length < data.total,
    };
  }

  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const data = await this.apiRequest<SpotifyApiAlbum>(`/albums/${albumId}`);
    return this.mapAlbum(data);
  }

  async getAlbumTracks(albumId: string, limit = 50, offset = 0): Promise<SpotifyPagination<SpotifyTrack>> {
    const album = await this.getAlbum(albumId);
    const data = await this.apiRequest<SpotifyApiAlbumTracksResponse>(`/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`);

    return {
      items: data.items.map((track) => 
        this.mapTrack({ 
          ...track, 
          album: { id: albumId, name: album.name, images: [{ url: album.imageUrl || '' }] } 
        })
      ),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.offset + data.items.length < data.total,
    };
  }

  async saveAlbum(albumId: string): Promise<void> {
    await this.apiRequest(`/me/albums?ids=${albumId}`, { method: "PUT" });
  }

  async removeAlbum(albumId: string): Promise<void> {
    await this.apiRequest(`/me/albums?ids=${albumId}`, { method: "DELETE" });
  }

  // ==================== Artists ====================

  async getFollowedArtists(limit = 50, after?: string): Promise<{ items: SpotifyArtist[]; cursors: { after: string | null } }> {
    const params = new URLSearchParams({ type: "artist", limit: String(limit) });
    if (after) params.set("after", after);

    const data = await this.apiRequest<SpotifyApiFollowedArtistsResponse>(`/me/following?${params}`);

    return {
      items: data.artists.items.map(this.mapArtist),
      cursors: data.artists.cursors,
    };
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    const data = await this.apiRequest<SpotifyApiArtist>(`/artists/${artistId}`);
    return this.mapArtist(data);
  }

  async getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest<SpotifyApiArtistTopTracksResponse>(`/artists/${artistId}/top-tracks?market=from_token`);
    return data.tracks.map(this.mapTrack);
  }

  async getArtistAlbums(artistId: string, limit = 50, offset = 0): Promise<SpotifyPagination<SpotifyAlbum>> {
    const data = await this.apiRequest<SpotifyApiSavedAlbumsResponse>(
      `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&offset=${offset}`
    );

    return {
      items: data.items.map((item) => this.mapAlbum(item.album)),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.offset + data.items.length < data.total,
    };
  }

  async followArtist(artistId: string): Promise<void> {
    await this.apiRequest(`/me/following?type=artist&ids=${artistId}`, { method: "PUT" });
  }

  async unfollowArtist(artistId: string): Promise<void> {
    await this.apiRequest(`/me/following?type=artist&ids=${artistId}`, { method: "DELETE" });
  }

  // ==================== Search ====================

  async search(query: string, types: ('track' | 'album' | 'artist' | 'playlist')[] = ["track"], limit = 20): Promise<SpotifySearchResults> {
    const data = await this.apiRequest<SpotifyApiSearchResponse>(
      `/search?q=${encodeURIComponent(query)}&type=${types.join(",")}&limit=${limit}`
    );

    return {
      tracks: (data.tracks?.items || []).map(this.mapTrack),
      albums: (data.albums?.items || []).map(this.mapAlbum),
      artists: (data.artists?.items || []).map(this.mapArtist),
      playlists: (data.playlists?.items || []).map(this.mapPlaylist),
    };
  }

  async searchTracks(query: string, limit = 20, offset = 0): Promise<SpotifyPagination<SpotifyTrack>> {
    const data = await this.apiRequest<SpotifyApiSearchResponse>(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`
    );

    const tracks = data.tracks!;
    return {
      items: tracks.items.map(this.mapTrack),
      total: tracks.total,
      limit: tracks.limit,
      offset: tracks.offset,
      hasMore: tracks.offset + tracks.items.length < tracks.total,
    };
  }

  // ==================== Personalization ====================

  async getRecentlyPlayed(limit = 50): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest<SpotifyApiRecentlyPlayedResponse>(`/me/player/recently-played?limit=${limit}`);
    return data.items.map((item) => this.mapTrack(item.track));
  }

  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 50): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest<SpotifyApiTopItemsResponse<SpotifyApiTrack>>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
    return data.items.map(this.mapTrack);
  }

  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 50): Promise<SpotifyArtist[]> {
    const data = await this.apiRequest<SpotifyApiTopItemsResponse<SpotifyApiArtist>>(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
    return data.items.map(this.mapArtist);
  }

  // ==================== Browse ====================

  async getFeaturedPlaylists(limit = 20): Promise<SpotifyPlaylist[]> {
    const data = await this.apiRequest<SpotifyApiFeaturedPlaylistsResponse>(`/browse/featured-playlists?limit=${limit}`);
    return data.playlists.items.map(this.mapPlaylist);
  }

  async getNewReleases(limit = 20): Promise<SpotifyAlbum[]> {
    const data = await this.apiRequest<SpotifyApiNewReleasesResponse>(`/browse/new-releases?limit=${limit}`);
    return data.albums.items.map(this.mapAlbum);
  }

  async getCategories(limit = 50): Promise<SpotifyCategory[]> {
    const data = await this.apiRequest<SpotifyApiCategoriesResponse>(`/browse/categories?limit=${limit}`);
    return data.categories.items.map((cat: SpotifyApiCategory) => ({
      id: cat.id,
      name: cat.name,
      imageUrl: cat.icons?.[0]?.url || null,
    }));
  }

  async getCategoryPlaylists(categoryId: string, limit = 20): Promise<SpotifyPlaylist[]> {
    const data = await this.apiRequest<SpotifyApiCategoryPlaylistsResponse>(`/browse/categories/${categoryId}/playlists?limit=${limit}`);
    return data.playlists.items
      .filter((item): item is SpotifyApiPlaylist => item !== null)
      .map(this.mapPlaylist);
  }

  // ==================== Player ====================

  async getPlaybackState(): Promise<SpotifyPlaybackState | null> {
    try {
      const data = await this.apiRequest<SpotifyApiPlaybackState>("/me/player");
      if (!data || !data.item) return null;

      return {
        isPlaying: data.is_playing,
        progressMs: data.progress_ms,
        durationMs: data.item.duration_ms,
        track: this.mapTrack(data.item),
        device: data.device ? {
          id: data.device.id,
          name: data.device.name,
          type: data.device.type,
          isActive: data.device.is_active,
          volumePercent: data.device.volume_percent,
        } : null,
        shuffleState: data.shuffle_state,
        repeatState: data.repeat_state,
      };
    } catch {
      return null;
    }
  }

  async getDevices(): Promise<SpotifyDevice[]> {
    const data = await this.apiRequest<SpotifyApiDevicesResponse>("/me/player/devices");
    return data.devices.map((device: SpotifyApiDevice) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      isActive: device.is_active,
      volumePercent: device.volume_percent,
    }));
  }

  async transferPlayback(deviceId: string, play = false): Promise<void> {
    await this.apiRequest("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
  }

  // ==================== Playback Controls ====================

  async play(options?: { 
    deviceId?: string; 
    contextUri?: string; 
    uris?: string[]; 
    positionMs?: number;
    offset?: { position?: number; uri?: string };
  }): Promise<void> {
    const params = options?.deviceId ? `?device_id=${options.deviceId}` : '';
    const body: Record<string, unknown> = {};
    
    if (options?.contextUri) body.context_uri = options.contextUri;
    if (options?.uris) body.uris = options.uris;
    if (options?.positionMs !== undefined) body.position_ms = options.positionMs;
    if (options?.offset) body.offset = options.offset;

    await this.apiRequest(`/me/player/play${params}`, {
      method: "PUT",
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  }

  async pause(deviceId?: string): Promise<void> {
    const params = deviceId ? `?device_id=${deviceId}` : '';
    await this.apiRequest(`/me/player/pause${params}`, { method: "PUT" });
  }

  async skipToNext(deviceId?: string): Promise<void> {
    const params = deviceId ? `?device_id=${deviceId}` : '';
    await this.apiRequest(`/me/player/next${params}`, { method: "POST" });
  }

  async skipToPrevious(deviceId?: string): Promise<void> {
    const params = deviceId ? `?device_id=${deviceId}` : '';
    await this.apiRequest(`/me/player/previous${params}`, { method: "POST" });
  }

  async seek(positionMs: number, deviceId?: string): Promise<void> {
    const params = new URLSearchParams({ position_ms: String(positionMs) });
    if (deviceId) params.set('device_id', deviceId);
    await this.apiRequest(`/me/player/seek?${params}`, { method: "PUT" });
  }

  async setVolume(volumePercent: number, deviceId?: string): Promise<void> {
    const volume = Math.max(0, Math.min(100, Math.round(volumePercent)));
    const params = new URLSearchParams({ volume_percent: String(volume) });
    if (deviceId) params.set('device_id', deviceId);
    await this.apiRequest(`/me/player/volume?${params}`, { method: "PUT" });
  }

  async setShuffle(state: boolean, deviceId?: string): Promise<void> {
    const params = new URLSearchParams({ state: String(state) });
    if (deviceId) params.set('device_id', deviceId);
    await this.apiRequest(`/me/player/shuffle?${params}`, { method: "PUT" });
  }

  async setRepeat(state: 'track' | 'context' | 'off', deviceId?: string): Promise<void> {
    const params = new URLSearchParams({ state });
    if (deviceId) params.set('device_id', deviceId);
    await this.apiRequest(`/me/player/repeat?${params}`, { method: "PUT" });
  }

  async addToQueue(uri: string, deviceId?: string): Promise<void> {
    const params = new URLSearchParams({ uri });
    if (deviceId) params.set('device_id', deviceId);
    await this.apiRequest(`/me/player/queue?${params}`, { method: "POST" });
  }

  async getCurrentQueue(): Promise<{ currentlyPlaying: SpotifyTrack | null; queue: SpotifyTrack[] }> {
    try {
      const data = await this.apiRequest<SpotifyApiQueueResponse>("/me/player/queue");
      return {
        currentlyPlaying: data.currently_playing ? this.mapTrack(data.currently_playing) : null,
        queue: (data.queue || []).map(this.mapTrack),
      };
    } catch {
      return { currentlyPlaying: null, queue: [] };
    }
  }

  // ==================== Recommendations ====================

  async getRecommendations(params: {
    seedTracks?: string[];
    seedArtists?: string[];
    seedGenres?: string[];
    limit?: number;
  }): Promise<SpotifyTrack[]> {
    const searchParams = new URLSearchParams();
    if (params.seedTracks?.length) searchParams.set("seed_tracks", params.seedTracks.join(","));
    if (params.seedArtists?.length) searchParams.set("seed_artists", params.seedArtists.join(","));
    if (params.seedGenres?.length) searchParams.set("seed_genres", params.seedGenres.join(","));
    searchParams.set("limit", String(params.limit || 20));

    const data = await this.apiRequest<SpotifyApiRecommendationsResponse>(`/recommendations?${searchParams}`);
    return data.tracks.map(this.mapTrack);
  }

  // ==================== Mappers ====================

  private mapTrack = (track: SpotifyApiTrack): SpotifyTrack => ({
    id: track.id,
    uri: track.uri,
    name: track.name,
    artist: track.artists?.map((a) => a.name).join(", ") || "",
    artists: track.artists?.map((a) => ({ id: a.id, name: a.name })) || [],
    album: track.album?.name || "",
    albumId: track.album?.id || "",
    albumImageUrl: track.album?.images?.[0]?.url || null,
    durationMs: track.duration_ms,
    previewUrl: track.preview_url,
    popularity: track.popularity || 0,
    explicit: track.explicit || false,
  });

  private mapAlbum = (album: SpotifyApiAlbum): SpotifyAlbum => ({
    id: album.id,
    uri: album.uri,
    name: album.name,
    artist: album.artists?.map((a) => a.name).join(", ") || "",
    artists: album.artists?.map((a) => ({ id: a.id, name: a.name })) || [],
    imageUrl: album.images?.[0]?.url || null,
    releaseDate: album.release_date || "",
    totalTracks: album.total_tracks || 0,
    albumType: album.album_type || "album",
  });

  private mapArtist = (artist: SpotifyApiArtist): SpotifyArtist => ({
    id: artist.id,
    uri: artist.uri,
    name: artist.name,
    imageUrl: artist.images?.[0]?.url || null,
    followers: artist.followers?.total || 0,
    popularity: artist.popularity || 0,
    genres: artist.genres || [],
  });

  private mapPlaylist = (playlist: SpotifyApiPlaylist): SpotifyPlaylist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    imageUrl: playlist.images?.[0]?.url || null,
    tracksTotal: playlist.tracks?.total || 0,
    owner: playlist.owner?.display_name || "",
    ownerId: playlist.owner?.id || "",
    isPublic: playlist.public ?? true,
    collaborative: playlist.collaborative || false,
    snapshotId: playlist.snapshot_id || "",
  });
}

export const spotifyClient = new SpotifyClient();
