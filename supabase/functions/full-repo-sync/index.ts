import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPO_OWNER = 'B0yZ4kr14';
const REPO_NAME = 'TSiJUKEBOX';

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
  skippedFiles?: string[];
  syncedFiles?: string[];
}

// Compute simple hash for content comparison
function computeHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function getExistingFileContent(token: string, path: string, branch: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TSiJUKEBOX-FullSync',
        },
      }
    );
    
    if (response.status === 404) return null;
    if (!response.ok) return null;
    
    const data = await response.json();
    return atob(data.content.replace(/\n/g, ''));
  } catch {
    return null;
  }
}

async function createMultiFileCommit(
  token: string,
  files: FileToSync[],
  message: string,
  branch: string
): Promise<{ sha: string; url: string; filesChanged: number }> {
  console.log(`[full-repo-sync] Creating commit with ${files.length} files`);
  
  // Get the reference for the branch
  const refResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${branch}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TSiJUKEBOX-FullSync',
      },
    }
  );
  
  if (!refResponse.ok) throw new Error(`Failed to get branch ref: ${await refResponse.text()}`);
  const refData = await refResponse.json();
  const latestCommitSha = refData.object.sha;
  
  // Get the tree of the latest commit
  const commitResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${latestCommitSha}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TSiJUKEBOX-FullSync',
      },
    }
  );
  
  if (!commitResponse.ok) throw new Error(`Failed to get commit: ${await commitResponse.text()}`);
  const commitData = await commitResponse.json();
  const baseTreeSha = commitData.tree.sha;
  
  // Create blobs for each file (batch processing)
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const blobResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'TSiJUKEBOX-FullSync',
          },
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        }
      );
      
      if (!blobResponse.ok) {
        console.error(`[full-repo-sync] Failed to create blob for ${file.path}`);
        throw new Error(`Failed to create blob for ${file.path}`);
      }
      const blobData = await blobResponse.json();
      
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobData.sha,
      };
    })
  );
  
  // Create a new tree
  const treeResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TSiJUKEBOX-FullSync',
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    }
  );
  
  if (!treeResponse.ok) throw new Error(`Failed to create tree: ${await treeResponse.text()}`);
  const treeData = await treeResponse.json();
  
  // Create the commit
  const newCommitResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TSiJUKEBOX-FullSync',
      },
      body: JSON.stringify({
        message,
        tree: treeData.sha,
        parents: [latestCommitSha],
        author: {
          name: 'TSiJUKEBOX Bot',
          email: 'bot@tsijukebox.local',
          date: new Date().toISOString(),
        },
      }),
    }
  );
  
  if (!newCommitResponse.ok) throw new Error(`Failed to create commit: ${await newCommitResponse.text()}`);
  const newCommitData = await newCommitResponse.json();
  
  // Update the reference
  const updateRefResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TSiJUKEBOX-FullSync',
      },
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    }
  );
  
  if (!updateRefResponse.ok) throw new Error(`Failed to update ref: ${await updateRefResponse.text()}`);
  
  console.log(`[full-repo-sync] Commit created: ${newCommitData.sha}`);
  
  return {
    sha: newCommitData.sha,
    url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${newCommitData.sha}`,
    filesChanged: files.length,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN_FULL') || Deno.env.get('GITHUB_ACCESS_TOKEN');
    
    if (!GITHUB_TOKEN) {
      console.error('[full-repo-sync] GITHUB_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'GitHub access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    const { files, commitMessage, branch = 'main', skipUnchanged = true, syncType = 'manual' } = await req.json() as {
      files: FileToSync[];
      commitMessage?: string;
      branch?: string;
      skipUnchanged?: boolean;
      syncType?: 'manual' | 'auto' | 'webhook';
    };

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No files provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[full-repo-sync] Processing ${files.length} files for sync`);

    // Filter unchanged files if skipUnchanged is true
    let filesToSync: FileToSync[] = files;
    const skippedFiles: string[] = [];
    
    if (skipUnchanged) {
      const checkResults = await Promise.all(
        files.map(async (file) => {
          const existingContent = await getExistingFileContent(GITHUB_TOKEN, file.path, branch);
          if (existingContent !== null) {
            const existingHash = computeHash(existingContent);
            const newHash = computeHash(file.content);
            return { file, changed: existingHash !== newHash };
          }
          return { file, changed: true }; // New file
        })
      );
      
      filesToSync = checkResults.filter(r => r.changed).map(r => r.file);
      checkResults.filter(r => !r.changed).forEach(r => skippedFiles.push(r.file.path));
      
      console.log(`[full-repo-sync] ${filesToSync.length} files changed, ${skippedFiles.length} skipped`);
    }

    if (filesToSync.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No changes detected',
          skippedFiles,
          syncedFiles: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = commitMessage || `[TSiJUKEBOX] Full sync - ${filesToSync.length} files - ${new Date().toISOString()}`;
    
    const commitResult = await createMultiFileCommit(GITHUB_TOKEN, filesToSync, message, branch);

    // Create notification in database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('notifications').insert({
        type: 'task_complete',
        severity: 'success',
        title: '🚀 Full Repository Sync',
        message: `${commitResult.filesChanged} files synced to GitHub`,
        metadata: {
          sha: commitResult.sha,
          url: commitResult.url,
          branch,
          filesChanged: commitResult.filesChanged,
          skippedFiles: skippedFiles.length,
        },
      });
      
      // Save sync history
      await supabase.from('sync_history').insert({
        commit_sha: commitResult.sha,
        commit_url: commitResult.url,
        commit_message: message,
        branch,
        files_synced: commitResult.filesChanged,
        files_skipped: skippedFiles.length,
        synced_files: filesToSync.map(f => f.path),
        skipped_files: skippedFiles,
        sync_type: syncType,
        duration_ms: Date.now() - startTime,
        status: 'success',
      });
      
      console.log('[full-repo-sync] Sync history saved');
    } catch (notifError) {
      console.error('[full-repo-sync] Failed to create notification/history:', notifError);
    }

    const result: SyncResult = {
      success: true,
      commit: {
        sha: commitResult.sha,
        url: commitResult.url,
        message,
        filesChanged: commitResult.filesChanged,
      },
      skippedFiles,
      syncedFiles: filesToSync.map(f => f.path),
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[full-repo-sync] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

