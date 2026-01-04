import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckKeyRequest {
  keyName: string;
}

const KEY_ENV_MAP: Record<string, string> = {
  'ANTHROPIC_CLAUDE_OPUS': 'ANTHROPIC_CLAUDE_OPUS',
  'MANUS_API_KEY': 'MANUS_API_KEY',
  'ANTHROPIC_API_KEY': 'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY': 'OPENAI_API_KEY',
  'GITHUB_ACCESS_TOKEN': 'GITHUB_ACCESS_TOKEN',
  'GEMINI_API_KEY': 'GEMINI_API_KEY',
  'GROQ_API_KEY': 'GROQ_API_KEY',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyName }: CheckKeyRequest = await req.json();

    if (!keyName) {
      return new Response(
        JSON.stringify({ exists: false, error: 'keyName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const envName = KEY_ENV_MAP[keyName] || keyName;
    const keyValue = Deno.env.get(envName);
    
    const exists = !!keyValue && keyValue.length > 0;
    
    console.log(`[check-api-key] Checking ${keyName} (env: ${envName}): ${exists ? 'EXISTS' : 'NOT FOUND'}`);

    return new Response(
      JSON.stringify({ 
        exists,
        keyName,
        message: exists 
          ? `${keyName} is configured` 
          : `${keyName} is not configured`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[check-api-key] Error:', error);
    return new Response(
      JSON.stringify({ 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
