// Spotify API types and client

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
  isPublic: boolean;
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artist: string;
  album: string;
  albumImageUrl: string | null;
  durationMs: number;
  previewUrl: string | null;
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
    // Consider token expired 5 minutes before actual expiration
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
    // Prevent concurrent refresh requests
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
        // Try to refresh
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

  // Spotify Web API methods
  async getPlaylists(): Promise<SpotifyPlaylist[]> {
    const token = await this.getValidToken();
    
    const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch playlists");
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.images?.[0]?.url || null,
      tracksTotal: item.tracks.total,
      owner: item.owner.display_name,
      isPublic: item.public,
    }));
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const token = await this.getValidToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch playlist tracks");
    }

    const data = await response.json();
    
    return data.items
      .filter((item: any) => item.track)
      .map((item: any) => ({
        id: item.track.id,
        uri: item.track.uri,
        name: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(", "),
        album: item.track.album.name,
        albumImageUrl: item.track.album.images?.[0]?.url || null,
        durationMs: item.track.duration_ms,
        previewUrl: item.track.preview_url,
      }));
  }

  async search(query: string, types: string[] = ["track"]): Promise<SpotifyTrack[]> {
    const token = await this.getValidToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${types.join(",")}&limit=20`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new Error("Failed to search");
    }

    const data = await response.json();
    
    return (data.tracks?.items || []).map((track: any) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album.name,
      albumImageUrl: track.album.images?.[0]?.url || null,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
    }));
  }
}

export const spotifyClient = new SpotifyClient();
