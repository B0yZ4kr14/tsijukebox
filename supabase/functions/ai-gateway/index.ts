import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProvider {
  name: string;
  secretKey: string;
  priority: number;
  model: string;
  endpoint: string;
}

interface ProviderStatus {
  name: string;
  available: boolean;
  needsCredits?: boolean;
  error?: string;
}

interface AIGatewayRequest {
  action?: 'chat' | 'status';
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  preferredProvider?: string;
}

// Ordered by priority (lower = higher priority)
const AI_PROVIDERS: AIProvider[] = [
  { 
    name: 'anthropic', 
    secretKey: 'ANTHROPIC_CLAUDE_OPUS', 
    priority: 1, 
    model: 'claude-sonnet-4-20250514',
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  { 
    name: 'openai', 
    secretKey: 'OPENAI_API_KEY', 
    priority: 2, 
    model: 'gpt-5',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  { 
    name: 'gemini', 
    secretKey: 'GEMINI_API_KEY', 
    priority: 3, 
    model: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  { 
    name: 'groq', 
    secretKey: 'GROQ_API_KEY', 
    priority: 4, 
    model: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
];

function isRateLimitOrCreditsError(status: number, errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return status === 402 || 
         status === 429 ||
         lowerMessage.includes('credit') ||
         lowerMessage.includes('balance') ||
         lowerMessage.includes('billing') ||
         lowerMessage.includes('quota') ||
         lowerMessage.includes('exceeded') ||
         lowerMessage.includes('limit');
}

async function callAnthropic(apiKey: string, messages: Array<{ role: string; content: string }>, systemPrompt: string, maxTokens: number): Promise<{ success: boolean; content?: string; error?: string; needsCredits?: boolean }> {
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
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system')
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, content: data.content[0].text };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;

    if (isRateLimitOrCreditsError(response.status, errorMessage)) {
      return { success: false, error: errorMessage, needsCredits: true };
    }

    return { success: false, error: errorMessage };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function callOpenAI(apiKey: string, messages: Array<{ role: string; content: string }>, systemPrompt: string, maxTokens: number): Promise<{ success: boolean; content?: string; error?: string; needsCredits?: boolean }> {
  try {
    const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: allMessages,
        max_completion_tokens: maxTokens
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, content: data.choices[0].message.content };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;

    if (isRateLimitOrCreditsError(response.status, errorMessage)) {
      return { success: false, error: errorMessage, needsCredits: true };
    }

    return { success: false, error: errorMessage };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function callGemini(apiKey: string, messages: Array<{ role: string; content: string }>, systemPrompt: string, maxTokens: number): Promise<{ success: boolean; content?: string; error?: string; needsCredits?: boolean }> {
  try {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: maxTokens }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;

    if (isRateLimitOrCreditsError(response.status, errorMessage)) {
      return { success: false, error: errorMessage, needsCredits: true };
    }

    return { success: false, error: errorMessage };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function callGroq(apiKey: string, messages: Array<{ role: string; content: string }>, systemPrompt: string, maxTokens: number): Promise<{ success: boolean; content?: string; error?: string; needsCredits?: boolean }> {
  try {
    const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: allMessages,
        max_tokens: maxTokens
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, content: data.choices[0].message.content };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;

    if (isRateLimitOrCreditsError(response.status, errorMessage)) {
      return { success: false, error: errorMessage, needsCredits: true };
    }

    return { success: false, error: errorMessage };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function callWithFallback(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  maxTokens: number,
  preferredProvider?: string
): Promise<{ success: boolean; content?: string; provider?: string; error?: string; triedProviders: string[] }> {
  const triedProviders: string[] = [];
  
  // Sort providers by priority, but prefer the specified one if provided
  let sortedProviders = [...AI_PROVIDERS].sort((a, b) => a.priority - b.priority);
  
  if (preferredProvider) {
    const preferred = sortedProviders.find(p => p.name === preferredProvider);
    if (preferred) {
      sortedProviders = [preferred, ...sortedProviders.filter(p => p.name !== preferredProvider)];
    }
  }

  for (const provider of sortedProviders) {
    const apiKey = Deno.env.get(provider.secretKey);
    
    if (!apiKey) {
      console.log(`[ai-gateway] ${provider.name}: No API key configured`);
      continue;
    }

    triedProviders.push(provider.name);
    console.log(`[ai-gateway] Trying ${provider.name}...`);

    let result: { success: boolean; content?: string; error?: string; needsCredits?: boolean };

    switch (provider.name) {
      case 'anthropic':
        result = await callAnthropic(apiKey, messages, systemPrompt, maxTokens);
        break;
      case 'openai':
        result = await callOpenAI(apiKey, messages, systemPrompt, maxTokens);
        break;
      case 'gemini':
        result = await callGemini(apiKey, messages, systemPrompt, maxTokens);
        break;
      case 'groq':
        result = await callGroq(apiKey, messages, systemPrompt, maxTokens);
        break;
      default:
        continue;
    }

    if (result.success) {
      console.log(`[ai-gateway] Success with ${provider.name}`);
      return { 
        success: true, 
        content: result.content, 
        provider: provider.name,
        triedProviders 
      };
    }

    console.log(`[ai-gateway] ${provider.name} failed: ${result.error}`);

    // If it's a credits/rate limit error, try next provider
    if (result.needsCredits) {
      console.log(`[ai-gateway] ${provider.name} needs credits, trying next provider...`);
      continue;
    }

    // For other errors, also try next provider
    continue;
  }

  return { 
    success: false, 
    error: 'All AI providers failed or are unconfigured',
    triedProviders 
  };
}

async function getProvidersStatus(): Promise<ProviderStatus[]> {
  const statuses: ProviderStatus[] = [];

  for (const provider of AI_PROVIDERS) {
    const apiKey = Deno.env.get(provider.secretKey);
    
    if (!apiKey) {
      statuses.push({ name: provider.name, available: false, error: 'Not configured' });
      continue;
    }

    // Quick check without actual API call
    statuses.push({ name: provider.name, available: true });
  }

  return statuses;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AIGatewayRequest = await req.json();
    const { action = 'chat', prompt, messages, systemPrompt = 'You are a helpful AI assistant.', maxTokens = 2048, preferredProvider } = body;

    // Status check
    if (action === 'status') {
      const providers = await getProvidersStatus();
      return new Response(
        JSON.stringify({ 
          providers,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chat action
    if (!prompt && (!messages || messages.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'prompt or messages is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert prompt to messages format if needed
    const chatMessages = messages || [{ role: 'user', content: prompt! }];

    const result = await callWithFallback(chatMessages, systemPrompt, maxTokens, preferredProvider);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          content: result.content,
          provider: result.provider,
          triedProviders: result.triedProviders,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: result.error,
        triedProviders: result.triedProviders,
        timestamp: new Date().toISOString()
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ai-gateway] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
