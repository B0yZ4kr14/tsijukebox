import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPO_OWNER = 'thugzook';
const REPO_NAME = 'TSiJUKEBOX';

interface FileRequest {
  paths: string[];
  branch?: string;
}

interface FileResult {
  path: string;
  content: string;
}

interface ReadResult {
  files: FileResult[];
  errors: string[];
  notFound: string[];
}

async function getFileContent(
  token: string, 
  path: string, 
  branch: string
): Promise<{ content: string | null; error: string | null }> {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${branch}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TSiJUKEBOX-Sync'
      }
    });

    if (response.status === 404) {
      return { content: null, error: null }; // File doesn't exist
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[read-project-files] Error fetching ${path}:`, response.status, errorText);
      return { content: null, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    
    if (data.type !== 'file') {
      return { content: null, error: 'Not a file' };
    }

    // Decode base64 content
    const content = atob(data.content.replace(/\n/g, ''));
    return { content, error: null };
  } catch (error) {
    console.error(`[read-project-files] Exception for ${path}:`, error);
    return { content: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!token) {
      console.error('[read-project-files] GITHUB_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'GitHub token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: FileRequest = await req.json();
    const { paths, branch = 'main' } = body;

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No file paths provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[read-project-files] Reading ${paths.length} files from ${branch}`);

    const result: ReadResult = {
      files: [],
      errors: [],
      notFound: []
    };

    // Process files in parallel (batches of 5 to avoid rate limits)
    const batchSize = 5;
    for (let i = 0; i < paths.length; i += batchSize) {
      const batch = paths.slice(i, i + batchSize);
      const promises = batch.map(async (path) => {
        const { content, error } = await getFileContent(token, path, branch);
        
        if (error) {
          result.errors.push(`${path}: ${error}`);
        } else if (content === null) {
          result.notFound.push(path);
        } else {
          result.files.push({ path, content });
        }
      });
      
      await Promise.all(promises);
    }

    console.log(`[read-project-files] Result: ${result.files.length} files, ${result.notFound.length} not found, ${result.errors.length} errors`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[read-project-files] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
