import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google OAuth 2.0 endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// YouTube Music API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri, refreshToken, clientId, clientSecret } = await req.json();

    console.log(`YouTube Music Auth - Action: ${action}`);

    switch (action) {
      case 'getAuthUrl': {
        if (!clientId || !redirectUri) {
          throw new Error('Missing clientId or redirectUri');
        }
        
        const authUrl = new URL(GOOGLE_AUTH_URL);
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', SCOPES);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        
        console.log('Generated auth URL successfully');
        
        return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'exchangeCode': {
        if (!code || !clientId || !clientSecret || !redirectUri) {
          throw new Error('Missing required parameters for code exchange');
        }
        
        console.log('Exchanging authorization code for tokens...');
        
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        const tokens = await tokenResponse.json();
        
        if (tokens.error) {
          console.error('Token exchange error:', tokens.error);
          throw new Error(tokens.error_description || tokens.error);
        }

        console.log('Tokens received, fetching user info...');

        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        console.log(`User authenticated: ${userInfo.email}`);

        return new Response(JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          user: {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            imageUrl: userInfo.picture,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'refreshToken': {
        if (!refreshToken || !clientId || !clientSecret) {
          throw new Error('Missing required parameters for token refresh');
        }
        
        console.log('Refreshing access token...');
        
        const refreshResponse = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          }),
        });

        const newTokens = await refreshResponse.json();
        
        if (newTokens.error) {
          console.error('Token refresh error:', newTokens.error);
          throw new Error(newTokens.error_description || newTokens.error);
        }

        console.log('Token refreshed successfully');

        return new Response(JSON.stringify({
          accessToken: newTokens.access_token,
          expiresIn: newTokens.expires_in,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    console.error('YouTube Music Auth Error:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
