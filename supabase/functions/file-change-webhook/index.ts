import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileChange {
  path: string;
  content?: string;
  hash?: string;
}

interface WebhookRequest {
  files: FileChange[];
  source?: string; // 'hmr', 'manual', 'build'
}

// File categorization based on path patterns
function categorizeFile(filePath: string): { category: string; priority: number } {
  const patterns = {
    critical: {
      regex: /^(src\/App\.tsx|src\/main\.tsx|src\/index\.tsx|package\.json|vite\.config|tsconfig)/i,
      priority: 1
    },
    important: {
      regex: /^src\/(pages|components|hooks|contexts|lib)\/.+\.(tsx?|jsx?)$/i,
      priority: 2
    },
    docs: {
      regex: /\.(md|mdx|txt|rst)$/i,
      priority: 4
    },
    config: {
      regex: /\.(json|ya?ml|toml|env|config\.[jt]s)$/i,
      priority: 3
    }
  };

  for (const [category, { regex, priority }] of Object.entries(patterns)) {
    if (regex.test(filePath)) {
      return { category, priority };
    }
  }

  return { category: 'other', priority: 10 };
}

// Simple hash function for content comparison
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { files, source = 'manual' }: WebhookRequest = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[file-change-webhook] Received ${files.length} files from ${source}`);

    const processedFiles: Array<{ path: string; status: string }> = [];
    const now = new Date().toISOString();

    for (const file of files) {
      const { category, priority } = categorizeFile(file.path);
      const fileHash = file.hash || (file.content ? simpleHash(file.content) : null);

      // Check if file already exists in pending_sync_files
      const { data: existing } = await supabase
        .from('pending_sync_files')
        .select('id, file_hash, status')
        .eq('file_path', file.path)
        .maybeSingle();

      if (existing) {
        // File exists - check if content changed
        if (existing.status === 'synced' || (fileHash && existing.file_hash !== fileHash)) {
          // Update existing record - mark as pending again
          const { error: updateError } = await supabase
            .from('pending_sync_files')
            .update({
              file_hash: fileHash,
              category,
              priority,
              status: 'pending',
              detected_at: now,
              synced_at: null,
              error_message: null
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`[file-change-webhook] Error updating ${file.path}:`, updateError);
            processedFiles.push({ path: file.path, status: 'error' });
          } else {
            console.log(`[file-change-webhook] Updated: ${file.path} (${category})`);
            processedFiles.push({ path: file.path, status: 'updated' });
          }
        } else {
          // No change needed
          processedFiles.push({ path: file.path, status: 'unchanged' });
        }
      } else {
        // Insert new pending file
        const { error: insertError } = await supabase
          .from('pending_sync_files')
          .insert({
            file_path: file.path,
            file_hash: fileHash,
            category,
            priority,
            status: 'pending',
            detected_at: now
          });

        if (insertError) {
          console.error(`[file-change-webhook] Error inserting ${file.path}:`, insertError);
          processedFiles.push({ path: file.path, status: 'error' });
        } else {
          console.log(`[file-change-webhook] Added: ${file.path} (${category})`);
          processedFiles.push({ path: file.path, status: 'added' });
        }
      }
    }

    const added = processedFiles.filter(f => f.status === 'added').length;
    const updated = processedFiles.filter(f => f.status === 'updated').length;
    const unchanged = processedFiles.filter(f => f.status === 'unchanged').length;

    console.log(`[file-change-webhook] Summary: ${added} added, ${updated} updated, ${unchanged} unchanged`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: { added, updated, unchanged, total: files.length },
        files: processedFiles
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[file-change-webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
