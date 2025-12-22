import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileToSync {
  path: string;
  content: string;
}

interface SyncResult {
  success: boolean;
  commit?: {
    sha: string;
    url: string;
    message: string;
    filesChanged: number;
  };
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[auto-sync-repository][${requestId}] Request received`);

  try {
    const body = await req.json();
    const { files, commitMessage, branch = 'main' } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.warn(`[auto-sync-repository][${requestId}] No files provided`);
      return new Response(
        JSON.stringify({ success: false, error: 'No files provided for sync' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[auto-sync-repository][${requestId}] Processing ${files.length} files for branch ${branch}`);

    // Call the consolidated github-sync-export function with create-commit action
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use the existing github-sync-export function via internal call
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN_FULL');
    
    if (!GITHUB_TOKEN) {
      console.error(`[auto-sync-repository][${requestId}] GITHUB_ACCESS_TOKEN_FULL not configured`);
      return new Response(
        JSON.stringify({ success: false, error: 'GitHub access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call github-sync-export internally
    const message = commitMessage || `[TSiJUKEBOX] Auto-sync ${files.length} files - ${new Date().toISOString()}`;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/github-sync-export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create-commit',
        files,
        commitMessage: message,
        branch,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[auto-sync-repository][${requestId}] github-sync-export error:`, response.status, errorText);
      
      return new Response(
        JSON.stringify({ success: false, error: `Sync failed: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[auto-sync-repository][${requestId}] Sync failed:`, data.error);
      return new Response(
        JSON.stringify({ success: false, error: data.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification
    await supabase.from('notifications').insert({
      type: 'task_complete',
      severity: 'info',
      title: '🔄 Auto-Sync Complete',
      message: `${data.commit.filesChanged} files synced to ${branch}`,
      metadata: { 
        requestId,
        sha: data.commit.sha, 
        url: data.commit.url, 
        branch,
        filesChanged: data.commit.filesChanged,
        autoSync: true,
      },
    });

    console.log(`[auto-sync-repository][${requestId}] SUCCESS: ${data.commit.filesChanged} files synced`);

    const result: SyncResult = {
      success: true,
      commit: data.commit,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[auto-sync-repository][${requestId}] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
