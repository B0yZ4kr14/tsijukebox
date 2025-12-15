import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Spotify OAuth endpoints
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// Required scopes for full playlist/library access
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-library-modify",
  "user-top-read",
  "user-read-recently-played",
].join(" ");

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    
    // Get credentials from request body for token operations
    let credentials: SpotifyCredentials | null = null;
    
    if (req.method === "POST") {
      const body = await req.json();
      credentials = {
        clientId: body.clientId,
        clientSecret: body.clientSecret,
        redirectUri: body.redirectUri || `${url.origin}/functions/v1/spotify-auth?action=callback`,
      };
    }

    switch (action) {
      case "login": {
        // Generate authorization URL
        if (!credentials?.clientId) {
          return new Response(
            JSON.stringify({ error: "Client ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const state = crypto.randomUUID();
        const authUrl = new URL(SPOTIFY_AUTH_URL);
        authUrl.searchParams.set("client_id", credentials.clientId);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("redirect_uri", credentials.redirectUri);
        authUrl.searchParams.set("scope", SCOPES);
        authUrl.searchParams.set("state", state);
        authUrl.searchParams.set("show_dialog", "true");

        return new Response(
          JSON.stringify({ 
            authUrl: authUrl.toString(),
            state,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "callback": {
        // Handle OAuth callback - exchange code for tokens
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          // Redirect to frontend with error
          return new Response(null, {
            status: 302,
            headers: {
              ...corsHeaders,
              "Location": `/settings?spotify_error=${encodeURIComponent(error)}`,
            },
          });
        }

        if (!code) {
          return new Response(
            JSON.stringify({ error: "Authorization code is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // For callback, we need stored credentials - return code to frontend
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            "Location": `/settings?spotify_code=${encodeURIComponent(code)}`,
          },
        });
      }

      case "exchange": {
        // Exchange authorization code for tokens
        if (!credentials?.clientId || !credentials?.clientSecret) {
          return new Response(
            JSON.stringify({ error: "Client credentials are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const body = await req.clone().json();
        const code = body.code;

        if (!code) {
          return new Response(
            JSON.stringify({ error: "Authorization code is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: credentials.redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error("Token exchange failed:", error);
          return new Response(
            JSON.stringify({ error: "Failed to exchange code for tokens" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokens: TokenResponse = await tokenResponse.json();
        const expiresAt = Date.now() + tokens.expires_in * 1000;

        return new Response(
          JSON.stringify({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            scope: tokens.scope,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "refresh": {
        // Refresh access token
        if (!credentials?.clientId || !credentials?.clientSecret) {
          return new Response(
            JSON.stringify({ error: "Client credentials are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const body = await req.clone().json();
        const refreshToken = body.refreshToken;

        if (!refreshToken) {
          return new Response(
            JSON.stringify({ error: "Refresh token is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error("Token refresh failed:", error);
          return new Response(
            JSON.stringify({ error: "Failed to refresh token", needsReauth: true }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokens: TokenResponse = await tokenResponse.json();
        const expiresAt = Date.now() + tokens.expires_in * 1000;

        return new Response(
          JSON.stringify({
            accessToken: tokens.access_token,
            // Spotify may return a new refresh token
            refreshToken: tokens.refresh_token || refreshToken,
            expiresAt,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "validate": {
        // Validate current token by fetching user profile
        const body = await req.clone().json();
        const accessToken = body.accessToken;

        if (!accessToken) {
          return new Response(
            JSON.stringify({ valid: false, error: "No access token" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: { "Authorization": `Bearer ${accessToken}` },
        });

        if (!profileResponse.ok) {
          return new Response(
            JSON.stringify({ valid: false, error: "Invalid or expired token" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const profile = await profileResponse.json();

        return new Response(
          JSON.stringify({
            valid: true,
            user: {
              id: profile.id,
              displayName: profile.display_name,
              email: profile.email,
              imageUrl: profile.images?.[0]?.url,
              product: profile.product, // 'premium' or 'free'
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: login, callback, exchange, refresh, validate" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Spotify auth error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
