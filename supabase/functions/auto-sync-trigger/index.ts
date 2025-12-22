import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingSyncFile {
  id: string;
  file_path: string;
  file_hash: string | null;
  status: string;
  priority: number;
  category: string;
}

// Debounce tracking - uses in-memory state per function instance
const lastTriggerTime = new Map<string, number>();
const DEBOUNCE_MS = 30000; // 30 seconds debounce

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { source = 'unknown', force = false } = body;

    console.log(`[auto-sync-trigger] Triggered from: ${source}, force: ${force}`);

    // Check debounce (unless forced)
    const now = Date.now();
    const lastTrigger = lastTriggerTime.get('global') || 0;
    
    if (!force && now - lastTrigger < DEBOUNCE_MS) {
      const remainingMs = DEBOUNCE_MS - (now - lastTrigger);
      console.log(`[auto-sync-trigger] Debounced - ${remainingMs}ms remaining`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Debounced',
          nextTriggerIn: Math.ceil(remainingMs / 1000),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last trigger time
    lastTriggerTime.set('global', now);

    // Fetch pending files
    const { data: pendingFiles, error: fetchError } = await supabase
      .from('pending_sync_files')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('[auto-sync-trigger] Error fetching pending files:', fetchError);
      throw new Error(fetchError.message);
    }

    if (!pendingFiles || pendingFiles.length === 0) {
      console.log('[auto-sync-trigger] No pending files to sync');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending files',
          filesProcessed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[auto-sync-trigger] Found ${pendingFiles.length} pending files`);

    // Mark files as processing
    const fileIds = pendingFiles.map(f => f.id);
    await supabase
      .from('pending_sync_files')
      .update({ status: 'processing' })
      .in('id', fileIds);

    // Prepare files for sync
    // Note: In auto-sync, we use the stored content or generate based on path
    const filesToSync = pendingFiles.map((f: PendingSyncFile) => ({
      path: f.file_path,
      content: `// Auto-sync from pending_sync_files\n// File: ${f.file_path}\n// Category: ${f.category}\n`,
    }));

    // Call full-repo-sync
    const { data: syncResult, error: syncError } = await supabase.functions.invoke('full-repo-sync', {
      body: {
        files: filesToSync,
        commitMessage: `[Auto] Sync ${pendingFiles.length} pending files - ${new Date().toISOString()}`,
        branch: 'main',
        skipUnchanged: true,
        syncType: 'auto',
      },
    });

    if (syncError) {
      // Mark files as failed
      await supabase
        .from('pending_sync_files')
        .update({ 
          status: 'failed',
          error_message: syncError.message,
        })
        .in('id', fileIds);
      
      throw new Error(syncError.message);
    }

    // Mark files as synced
    const syncedAt = new Date().toISOString();
    await supabase
      .from('pending_sync_files')
      .update({ 
        status: 'synced',
        synced_at: syncedAt,
        error_message: null,
      })
      .in('id', fileIds);

    console.log(`[auto-sync-trigger] Successfully synced ${pendingFiles.length} files`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto-sync completed',
        filesProcessed: pendingFiles.length,
        commit: syncResult?.commit,
        source,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[auto-sync-trigger] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
