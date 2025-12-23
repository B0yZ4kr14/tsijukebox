import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveKeyRequest {
  keyName: string;
  keyValue: string;
}

const KEY_CONFIGS: Record<string, { prefix?: string; envName: string }> = {
  'ANTHROPIC_CLAUDE_OPUS': { prefix: 'sk-ant-', envName: 'ANTHROPIC_CLAUDE_OPUS' },
  'MANUS_API_KEY': { envName: 'MANUS_API_KEY' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyName, keyValue }: SaveKeyRequest = await req.json();

    // Validate input
    if (!keyName || !keyValue) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'keyName and keyValue are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if key config exists
    const config = KEY_CONFIGS[keyName];
    if (!config) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unknown key type: ${keyName}. Supported: ${Object.keys(KEY_CONFIGS).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate prefix if required
    if (config.prefix && !keyValue.startsWith(config.prefix)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid key format. ${keyName} should start with "${config.prefix}"` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate key length
    if (keyValue.length < 20) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key seems too short. Please check if you copied the full key.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: In a production environment, you would use Supabase Vault or 
    // the Supabase Management API to store secrets securely.
    // For this implementation, we'll validate and confirm the key format,
    // then instruct the user to configure via Lovable UI.
    
    console.log(`[save-api-key] Validated key format for ${keyName}`);
    console.log(`[save-api-key] Key length: ${keyValue.length} characters`);
    console.log(`[save-api-key] Key prefix: ${keyValue.substring(0, 10)}...`);

    // Return success with instructions
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Key format validated successfully for ${keyName}`,
        instructions: 'Key has been validated. Use Lovable secrets management to store it securely.',
        keyInfo: {
          name: keyName,
          length: keyValue.length,
          hasValidPrefix: config.prefix ? keyValue.startsWith(config.prefix) : true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[save-api-key] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
