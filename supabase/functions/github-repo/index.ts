import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schema for request validation
const GitHubRepoRequestSchema = z.object({
  path: z.string().max(500).default(''),
  action: z.enum([
    'contents', 'tree', 'raw', 'repo-info', 'commits', 'last-commit',
    'sync-status', 'releases', 'branches', 'contributors', 'languages',
    'deploy-keys', 'create-deploy-key', 'delete-deploy-key', 'gpg-keys', 'ssh-keys'
  ]).default('contents'),
  title: z.string().max(200).optional(),
  key: z.string().max(5000).optional(),
  read_only: z.boolean().optional(),
  keyId: z.number().int().positive().optional(),
}).refine(
  (data) => {
    // Validate that keyId is present when action is 'delete-deploy-key'
    if (data.action === 'delete-deploy-key' && !data.keyId) {
      return false;
    }
    return true;
  },
  { message: 'keyId is required for delete-deploy-key action' }
);

type GitHubRepoRequest = z.infer<typeof GitHubRepoRequestSchema>;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!GITHUB_TOKEN) {
      console.error('[github-repo] GITHUB_ACCESS_TOKEN not configured');
      throw new Error('GITHUB_ACCESS_TOKEN not configured');
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const parseResult = GitHubRepoRequestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error('[github-repo] Validation error:', parseResult.error.issues);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request parameters',
          details: parseResult.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { path, action, title, key, read_only, keyId } = parseResult.data;
    const repo = 'B0yZ4kr14/TSiJUKEBOX';
    
    let url = '';
    let accept = 'application/vnd.github.v3+json';
    let method = 'GET';
    let requestBody: string | null = null;
    
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
      case 'last-commit':
        url = `https://api.github.com/repos/${repo}/commits?per_page=1`;
        break;
      case 'sync-status':
        url = `https://api.github.com/repos/${repo}`;
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
      case 'deploy-keys':
        url = `https://api.github.com/repos/${repo}/keys`;
        break;
      case 'create-deploy-key':
        url = `https://api.github.com/repos/${repo}/keys`;
        method = 'POST';
        requestBody = JSON.stringify({ title, key, read_only: read_only ?? true });
        break;
      case 'delete-deploy-key':
        url = `https://api.github.com/repos/${repo}/keys/${keyId}`;
        method = 'DELETE';
        break;
      case 'gpg-keys':
        url = `https://api.github.com/user/gpg_keys`;
        break;
      case 'ssh-keys':
        url = `https://api.github.com/user/keys`;
        break;
      default:
        url = `https://api.github.com/repos/${repo}/contents/${path}`;
    }

    console.log(`[github-repo] Action: ${action}, Method: ${method}, URL: ${url}`);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': accept,
        'User-Agent': 'TSiJUKEBOX-App',
        ...(requestBody && { 'Content-Type': 'application/json' }),
      },
      ...(requestBody && { body: requestBody }),
    };

    const response = await fetch(url, fetchOptions);

    // DELETE returns 204 No Content on success
    if (method === 'DELETE' && response.status === 204) {
      console.log(`[github-repo] Success: ${action} (deleted)`);
      return new Response(JSON.stringify({ success: true, data: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
