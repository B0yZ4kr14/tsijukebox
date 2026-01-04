import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestKeyRequest {
  keyName: string;
}

interface TestResult {
  valid: boolean;
  message: string;
  needsCredits?: boolean;
}

async function testAnthropicKey(apiKey: string): Promise<TestResult> {
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
      return { valid: true, message: 'Claude API key válida e funcionando' };
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || '';
    
    // Check for credit/billing issues
    if (response.status === 402 || 
        errorMessage.toLowerCase().includes('credit') || 
        errorMessage.toLowerCase().includes('balance') ||
        errorMessage.toLowerCase().includes('billing') ||
        errorMessage.toLowerCase().includes('payment')) {
      return { 
        valid: true, 
        message: 'Chave válida, mas conta sem créditos suficientes',
        needsCredits: true 
      };
    }
    
    if (response.status === 401) {
      return { valid: false, message: 'Chave inválida - autenticação falhou' };
    }
    if (response.status === 403) {
      return { valid: false, message: 'Chave sem permissões necessárias' };
    }
    if (response.status === 429) {
      return { valid: true, message: 'Chave válida (rate limited, mas autenticada)' };
    }
    
    return { 
      valid: false, 
      message: `Erro da API: ${errorMessage || response.statusText}` 
    };
  } catch (error) {
    return { 
      valid: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}` 
    };
  }
}

async function testOpenAIKey(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true, message: 'OpenAI API key válida e funcionando' };
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || '';
    
    // Check for billing issues
    if (response.status === 402 || 
        response.status === 429 && errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('billing') ||
        errorMessage.toLowerCase().includes('exceeded')) {
      return { 
        valid: true, 
        message: 'Chave válida, mas limite de uso excedido',
        needsCredits: true 
      };
    }
    
    if (response.status === 401) {
      return { valid: false, message: 'Chave OpenAI inválida' };
    }
    
    return { 
      valid: false, 
      message: `Erro da API: ${errorMessage || response.statusText}` 
    };
  } catch (error) {
    return { 
      valid: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}` 
    };
  }
}

async function testGeminiKey(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true, message: 'Google Gemini API key válida e funcionando' };
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || '';
    
    // Check for quota issues
    if (response.status === 429 || 
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('limit')) {
      return { 
        valid: true, 
        message: 'Chave válida, mas limite de requisições atingido',
        needsCredits: true 
      };
    }
    
    if (response.status === 400 || response.status === 403) {
      return { valid: false, message: 'Chave Gemini inválida ou sem permissões' };
    }
    
    return { 
      valid: false, 
      message: `Erro da API: ${errorMessage || response.statusText}` 
    };
  } catch (error) {
    return { 
      valid: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}` 
    };
  }
}

async function testGroqKey(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true, message: 'Groq API key válida e funcionando' };
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || '';
    
    // Check for rate limit
    if (response.status === 429) {
      return { 
        valid: true, 
        message: 'Chave válida (rate limited temporariamente)' 
      };
    }
    
    if (response.status === 401) {
      return { valid: false, message: 'Chave Groq inválida' };
    }
    
    return { 
      valid: false, 
      message: `Erro da API: ${errorMessage || response.statusText}` 
    };
  } catch (error) {
    return { 
      valid: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}` 
    };
  }
}

async function testManusKey(apiKey: string): Promise<TestResult> {
  // Validate key format first
  if (!apiKey || apiKey.length < 20) {
    return { valid: false, message: 'Formato de chave inválido - muito curta' };
  }
  
  // Check for common Manus.im key prefixes
  const validPrefixes = ['manus_', 'mk_', 'manus-'];
  const hasValidPrefix = validPrefixes.some(prefix => apiKey.toLowerCase().startsWith(prefix));
  
  if (!hasValidPrefix) {
    return { 
      valid: false, 
      message: 'Formato de chave inválido - deve começar com "manus_", "mk_" ou "manus-"' 
    };
  }

  try {
    // Try to validate with Manus.im API
    const response = await fetch('https://api.manus.im/v1/user/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true, message: 'Manus.im API key válida e funcionando' };
    }
    
    if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Chave Manus.im inválida ou expirada' };
    }
    
    // If endpoint doesn't exist or returns 404, validate format only
    if (response.status === 404) {
      return { 
        valid: true, 
        message: 'Formato da chave Manus.im válido (endpoint de verificação indisponível)' 
      };
    }
    
    return { 
      valid: false, 
      message: `Manus.im retornou status ${response.status}` 
    };
  } catch (error) {
    // If we can't connect, accept valid format
    console.log('[test-api-key] Manus.im connection error, accepting valid format:', error);
    return { 
      valid: true, 
      message: 'Formato da chave válido (verificação de conexão falhou)' 
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

    let result: TestResult;

    switch (keyName) {
      case 'ANTHROPIC_CLAUDE_OPUS':
      case 'ANTHROPIC_API_KEY': {
        const apiKey = Deno.env.get(keyName);
        if (!apiKey) {
          result = { valid: false, message: `${keyName} não está configurada` };
        } else {
          console.log(`[test-api-key] Testing ${keyName}...`);
          result = await testAnthropicKey(apiKey);
        }
        break;
      }

      case 'OPENAI_API_KEY': {
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
          result = { valid: false, message: 'OPENAI_API_KEY não está configurada' };
        } else {
          console.log('[test-api-key] Testing OPENAI_API_KEY...');
          result = await testOpenAIKey(apiKey);
        }
        break;
      }

      case 'GEMINI_API_KEY':
      case 'GEMINI_GOOGLE_API_KEY': {
        const apiKey = Deno.env.get(keyName) || Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GEMINI_GOOGLE_API_KEY');
        if (!apiKey) {
          result = { valid: false, message: 'GEMINI_API_KEY não está configurada' };
        } else {
          console.log('[test-api-key] Testing GEMINI_API_KEY...');
          result = await testGeminiKey(apiKey);
        }
        break;
      }

      case 'GROQ_API_KEY': {
        const apiKey = Deno.env.get('GROQ_API_KEY');
        if (!apiKey) {
          result = { valid: false, message: 'GROQ_API_KEY não está configurada' };
        } else {
          console.log('[test-api-key] Testing GROQ_API_KEY...');
          result = await testGroqKey(apiKey);
        }
        break;
      }

      case 'MANUS_API_KEY': {
        const apiKey = Deno.env.get('MANUS_API_KEY');
        if (!apiKey) {
          result = { valid: false, message: 'MANUS_API_KEY não está configurada' };
        } else {
          console.log('[test-api-key] Testing MANUS_API_KEY...');
          result = await testManusKey(apiKey);
        }
        break;
      }

      default:
        result = { valid: false, message: `Tipo de chave desconhecido: ${keyName}` };
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
