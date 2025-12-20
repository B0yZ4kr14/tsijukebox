import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubSyncRequest {
  action: 'export-files' | 'sync-status' | 'create-commit' | 'list-files' | 'get-file';
  files?: Array<{
    path: string;
    content: string;
  }>;
  commitMessage?: string;
  branch?: string;
  filePath?: string;
}

interface GitHubFile {
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
}

interface CommitResult {
  sha: string;
  url: string;
  message: string;
  filesChanged: number;
}

const REPO_OWNER = 'B0yZ4kr14';
const REPO_NAME = 'TSiJUKEBOX';
const DEFAULT_BRANCH = 'main';

async function getFileContent(token: string, path: string, branch: string): Promise<{ content: string; sha: string } | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TSiJUKEBOX-Sync',
        },
      }
    );
    
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Failed to get file: ${response.statusText}`);
    
    const data = await response.json();
    const content = atob(data.content.replace(/\n/g, ''));
    return { content, sha: data.sha };
  } catch (error) {
    console.error(`Error getting file ${path}:`, error);
    return null;
  }
}

async function listRepositoryFiles(token: string, path: string = '', branch: string): Promise<GitHubFile[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TSiJUKEBOX-Sync',
        },
      }
    );
    
    if (!response.ok) throw new Error(`Failed to list files: ${response.statusText}`);
    
    const data = await response.json();
    const files: GitHubFile[] = [];
    
    for (const item of data) {
      if (item.type === 'file') {
        files.push({
          path: item.path,
          sha: item.sha,
          size: item.size,
          type: 'file',
        });
      } else if (item.type === 'dir') {
        files.push({
          path: item.path,
          sha: item.sha,
          size: 0,
          type: 'dir',
        });
        // Recursively get files in subdirectory
        const subFiles = await listRepositoryFiles(token, item.path, branch);
        files.push(...subFiles);
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

async function createOrUpdateFile(
  token: string,
  path: string,
  content: string,
  message: string,
  branch: string
): Promise<{ sha: string; created: boolean }> {
  // Check if file exists
  const existingFile = await getFileContent(token, path, branch);
  
  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  
  if (existingFile) {
    body.sha = existingFile.sha;
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TSiJUKEBOX-Sync',
      },
      body: JSON.stringify(body),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update file ${path}: ${error}`);
  }
  
  const data = await response.json();
  return {
    sha: data.content.sha,
    created: !existingFile,
  };
}

async function createMultiFileCommit(
  token: string,
  files: Array<{ path: string; content: string }>,
  message: string,
  branch: string
): Promise<CommitResult> {
  // Get the reference for the branch
  const refResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${branch}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TSiJUKEBOX-Sync',
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
        'User-Agent': 'TSiJUKEBOX-Sync',
      },
    }
  );
  
  if (!commitResponse.ok) throw new Error(`Failed to get commit: ${await commitResponse.text()}`);
  const commitData = await commitResponse.json();
  const baseTreeSha = commitData.tree.sha;
  
  // Create blobs for each file
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
            'User-Agent': 'TSiJUKEBOX-Sync',
          },
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        }
      );
      
      if (!blobResponse.ok) throw new Error(`Failed to create blob for ${file.path}`);
      const blobData = await blobResponse.json();
      
      return {
        path: file.path,
        mode: '100644',
        type: 'blob',
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
        'User-Agent': 'TSiJUKEBOX-Sync',
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
        'User-Agent': 'TSiJUKEBOX-Sync',
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
        'User-Agent': 'TSiJUKEBOX-Sync',
      },
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    }
  );
  
  if (!updateRefResponse.ok) throw new Error(`Failed to update ref: ${await updateRefResponse.text()}`);
  
  return {
    sha: newCommitData.sha,
    url: newCommitData.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${newCommitData.sha}`,
    message,
    filesChanged: files.length,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN');
    
    if (!GITHUB_TOKEN) {
      console.error('GITHUB_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'GitHub access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, files, commitMessage, branch = DEFAULT_BRANCH, filePath } = await req.json() as GitHubSyncRequest;
    console.log(`GitHub sync action: ${action}`);

    switch (action) {
      case 'list-files': {
        const repoFiles = await listRepositoryFiles(GITHUB_TOKEN, filePath || '', branch);
        return new Response(
          JSON.stringify({ success: true, files: repoFiles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-file': {
        if (!filePath) {
          return new Response(
            JSON.stringify({ error: 'filePath is required for get-file action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const fileContent = await getFileContent(GITHUB_TOKEN, filePath, branch);
        return new Response(
          JSON.stringify({ success: true, file: fileContent }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync-status': {
        // Check repository status
        const response = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'TSiJUKEBOX-Sync',
            },
          }
        );
        
        if (!response.ok) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to connect to repository',
              status: 'disconnected'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const repoData = await response.json();
        
        // Get latest commit
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=1`,
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'TSiJUKEBOX-Sync',
            },
          }
        );
        
        const commits = await commitsResponse.json();
        const latestCommit = commits[0];
        
        return new Response(
          JSON.stringify({
            success: true,
            status: 'connected',
            repository: {
              name: repoData.full_name,
              url: repoData.html_url,
              defaultBranch: repoData.default_branch,
              private: repoData.private,
            },
            latestCommit: latestCommit ? {
              sha: latestCommit.sha,
              message: latestCommit.commit.message,
              date: latestCommit.commit.author.date,
              author: latestCommit.commit.author.name,
            } : null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'export-files': {
        if (!files || files.length === 0) {
          return new Response(
            JSON.stringify({ error: 'files array is required for export-files action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const message = commitMessage || `[TSiJUKEBOX] Sync ${files.length} files - ${new Date().toISOString()}`;
        
        // For small number of files, use individual updates
        if (files.length <= 3) {
          const results = await Promise.all(
            files.map(file => 
              createOrUpdateFile(GITHUB_TOKEN, file.path, file.content, message, branch)
            )
          );
          
          const created = results.filter(r => r.created).length;
          const updated = results.length - created;
          
          // Create notification
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase.from('notifications').insert({
            type: 'task_complete',
            severity: 'info',
            title: 'GitHub Sync Completo',
            message: `${created} arquivos criados, ${updated} atualizados`,
            metadata: { filesCount: files.length, branch },
          });
          
          return new Response(
            JSON.stringify({
              success: true,
              created,
              updated,
              files: files.map(f => f.path),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // For larger number of files, use a single commit
        const result = await createMultiFileCommit(GITHUB_TOKEN, files, message, branch);
        
        // Create notification
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from('notifications').insert({
          type: 'task_complete',
          severity: 'info',
          title: 'GitHub Export Completo',
          message: `Commit criado com ${result.filesChanged} arquivos`,
          metadata: { 
            sha: result.sha, 
            url: result.url, 
            branch,
            filesChanged: result.filesChanged 
          },
        });
        
        return new Response(
          JSON.stringify({
            success: true,
            commit: result,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-commit': {
        if (!files || files.length === 0) {
          return new Response(
            JSON.stringify({ error: 'files array is required for create-commit action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const message = commitMessage || `[TSiJUKEBOX] Update ${files.length} files`;
        const result = await createMultiFileCommit(GITHUB_TOKEN, files, message, branch);
        
        return new Response(
          JSON.stringify({ success: true, commit: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in github-sync-export:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
