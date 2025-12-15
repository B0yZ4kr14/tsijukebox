import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_ACCESS_TOKEN not configured');
    }

    const { path = '', action = 'contents' } = await req.json();
    const repo = 'B0yZ4kr14/Jukebox';
    
    let url = '';
    if (action === 'contents') {
      url = `https://api.github.com/repos/${repo}/contents/${path}`;
    } else if (action === 'tree') {
      url = `https://api.github.com/repos/${repo}/git/trees/main?recursive=1`;
    } else if (action === 'raw') {
      url = `https://raw.githubusercontent.com/${repo}/main/${path}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': action === 'raw' ? 'text/plain' : 'application/vnd.github.v3+json',
        'User-Agent': 'Lovable-Jukebox-App'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = action === 'raw' ? await response.text() : await response.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
