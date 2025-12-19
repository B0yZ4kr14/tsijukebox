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
    const repo = 'B0yZ4kr14/TSiJUKEBOX';
    
    let url = '';
    let accept = 'application/vnd.github.v3+json';
    
    switch (action) {
      case 'contents':
        url = `https://api.github.com/repos/${repo}/contents/${path}`;
        break;
      case 'tree':
        url = `https://api.github.com/repos/${repo}/git/trees/main?recursive=1`;
        break;
      case 'raw':
        url = `https://raw.githubusercontent.com/${repo}/main/${path}`;
        accept = 'text/plain';
        break;
      case 'repo-info':
        url = `https://api.github.com/repos/${repo}`;
        break;
      case 'commits':
        url = `https://api.github.com/repos/${repo}/commits?per_page=10`;
        break;
      case 'releases':
        url = `https://api.github.com/repos/${repo}/releases`;
        break;
      case 'branches':
        url = `https://api.github.com/repos/${repo}/branches`;
        break;
      case 'contributors':
        url = `https://api.github.com/repos/${repo}/contributors`;
        break;
      case 'languages':
        url = `https://api.github.com/repos/${repo}/languages`;
        break;
      default:
        url = `https://api.github.com/repos/${repo}/contents/${path}`;
    }

    console.log(`[github-repo] Action: ${action}, Path: ${path}, URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': accept,
        'User-Agent': 'TSiJUKEBOX-App'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[github-repo] GitHub API error: ${response.status} - ${errorText}`);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = action === 'raw' ? await response.text() : await response.json();

    console.log(`[github-repo] Success: ${action}`);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[github-repo] Error: ${errorMessage}`);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
