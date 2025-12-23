import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestKeyRequest {
  keyName: string;
}

async function testAnthropicKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "ok"' }]
      })
    });

    if (response.ok) {
      return { valid: true, message: 'Claude API key is valid and working' };
    }
    
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      return { valid: false, message: 'Invalid API key - authentication failed' };
    }
    if (response.status === 403) {
      return { valid: false, message: 'API key lacks required permissions' };
    }
    if (response.status === 429) {
      return { valid: true, message: 'API key is valid (rate limited, but authenticated)' };
    }
    
    return { 
      valid: false, 
      message: `API error: ${errorData.error?.message || response.statusText}` 
    };
  } catch (error) {
    return { 
      valid: false, 
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

async function testManusKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    // Manus.im API health check
    const response = await fetch('https://api.manus.im/v1/health', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true, message: 'Manus.im API key is valid and working' };
    }
    
    if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Invalid Manus.im API key' };
    }
    
    // Try alternative endpoint if health check not available
    const altResponse = await fetch('https://api.manus.im/v1/agents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (altResponse.ok || altResponse.status === 200) {
      return { valid: true, message: 'Manus.im API key is valid' };
    }
    
    return { valid: false, message: `Manus.im API returned status ${altResponse.status}` };
  } catch (error) {
    // If we can't connect, assume key format is valid but service unreachable
    return { 
      valid: false, 
      message: `Could not connect to Manus.im: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyName }: TestKeyRequest = await req.json();

    if (!keyName) {
      return new Response(
        JSON.stringify({ valid: false, error: 'keyName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: { valid: boolean; message: string };

    switch (keyName) {
      case 'ANTHROPIC_CLAUDE_OPUS':
      case 'ANTHROPIC_API_KEY': {
        const apiKey = Deno.env.get(keyName);
        if (!apiKey) {
          result = { valid: false, message: `${keyName} is not configured` };
        } else {
          console.log(`[test-api-key] Testing ${keyName}...`);
          result = await testAnthropicKey(apiKey);
        }
        break;
      }

      case 'MANUS_API_KEY': {
        const apiKey = Deno.env.get('MANUS_API_KEY');
        if (!apiKey) {
          result = { valid: false, message: 'MANUS_API_KEY is not configured' };
        } else {
          console.log('[test-api-key] Testing MANUS_API_KEY...');
          result = await testManusKey(apiKey);
        }
        break;
      }

      default:
        result = { valid: false, message: `Unknown key type: ${keyName}` };
    }

    console.log(`[test-api-key] Result for ${keyName}:`, result);

    return new Response(
      JSON.stringify({ 
        keyName,
        ...result,
        testedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[test-api-key] Error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
