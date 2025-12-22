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
    'deploy-keys', 'create-deploy-key', 'delete-deploy-key', 'gpg-keys', 'ssh-keys',
    'validate-token', 'save-token'
  ]).default('contents'),
  title: z.string().max(200).optional(),
  key: z.string().max(5000).optional(),
  read_only: z.boolean().optional(),
  keyId: z.number().int().positive().optional(),
  custom_token: z.string().max(100).optional(),
  token_name: z.string().max(100).optional(),
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

// Error response helper with structured error codes
function createErrorResponse(
  message: string, 
  status: number = 500, 
  code?: string,
  details?: unknown
) {
  console.error(`[github-repo] Error (${status}): ${message}`, details || '');
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      code: code || 'UNKNOWN_ERROR',
      details: details || null 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Parse GitHub API error messages
function parseGitHubError(status: number, errorBody: string): { message: string; code: string } {
  try {
    const parsed = JSON.parse(errorBody);
    const message = parsed.message || errorBody;
    
    // Map known error patterns
    if (message.includes('key is already in use')) {
      return { message: 'Esta chave SSH já está em uso em outro repositório.', code: 'KEY_ALREADY_IN_USE' };
    }
    if (message.includes('key_already_exists')) {
      return { message: 'Esta chave SSH já existe no repositório.', code: 'KEY_ALREADY_EXISTS' };
    }
    if (message.includes('Bad credentials')) {
      return { message: 'Token de acesso inválido ou expirado.', code: 'BAD_CREDENTIALS' };
    }
    if (message.includes('Not Found')) {
      return { message: 'Repositório não encontrado ou sem permissão.', code: 'NOT_FOUND' };
    }
    if (status === 401) {
      return { message: 'Autenticação falhou. Verifique o token.', code: 'UNAUTHORIZED' };
    }
    if (status === 403) {
      return { message: 'Sem permissão para esta operação.', code: 'FORBIDDEN' };
    }
    if (status === 422) {
      return { message: parsed.message || 'Dados inválidos na requisição.', code: 'VALIDATION_FAILED' };
    }
    
    return { message, code: `HTTP_${status}` };
  } catch {
    return { message: errorBody || `HTTP Error ${status}`, code: `HTTP_${status}` };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!GITHUB_TOKEN) {
      console.error('[github-repo] GITHUB_ACCESS_TOKEN not configured');
      return createErrorResponse('GITHUB_ACCESS_TOKEN not configured', 500, 'TOKEN_NOT_CONFIGURED');
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
          code: 'VALIDATION_ERROR',
          details: parseResult.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { path, action, title, key, read_only, keyId, custom_token, token_name } = parseResult.data;
    const repo = 'B0yZ4kr14/TSiJUKEBOX';
    
    // Use custom token if provided for validation, otherwise use default
    const tokenToUse = custom_token || GITHUB_TOKEN;
    
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
      case 'validate-token':
        // Validate a custom token by fetching user info
        url = `https://api.github.com/user`;
        console.log('[github-repo] Validating custom token...');
        break;
      case 'save-token':
        // For now, just validate the token - actual secret storage would require
        // Supabase Vault or external secret management
        console.log(`[github-repo] Token validated. Name: ${token_name}`);
        // Validate the token first
        url = `https://api.github.com/user`;
        break;
      default:
        url = `https://api.github.com/repos/${repo}/contents/${path}`;
    }

    console.log(`[github-repo] Action: ${action}, Method: ${method}, URL: ${url}`);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${tokenToUse}`,
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
      
      const { message, code } = parseGitHubError(response.status, errorText);
      return createErrorResponse(message, response.status, code, { 
        originalStatus: response.status,
        action 
      });
    }

    const data = action === 'raw' ? await response.text() : await response.json();

    console.log(`[github-repo] Success: ${action}`);

    // For save-token, include additional metadata
    if (action === 'save-token') {
      return new Response(JSON.stringify({ 
        success: true, 
        data,
        message: 'Token validated successfully. Configure secret storage for production use.',
        token_name: token_name || 'default'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[github-repo] Error: ${errorMessage}`);
    return createErrorResponse(errorMessage, 500, 'INTERNAL_ERROR');
  }
});
