import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManusSearchRequest {
  query: string;
  type?: 'artist' | 'track' | 'documentation' | 'general';
  limit?: number;
}

interface ManusSearchResult {
  title: string;
  description: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY');
    if (!MANUS_API_KEY) {
      throw new Error('MANUS_API_KEY is not configured');
    }

    const { query, type = 'general', limit = 5 } = await req.json() as ManusSearchRequest;

    console.log(`[manus-search] Query: "${query}", Type: ${type}, Limit: ${limit}`);

    // Manus API for documentation and research
    const response = await fetch('https://api.manus.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANUS_API_KEY}`,
      },
      body: JSON.stringify({
        query: type === 'artist' 
          ? `music artist "${query}" biography discography`
          : type === 'track'
          ? `song "${query}" lyrics meaning history`
          : type === 'documentation'
          ? `API documentation ${query}`
          : query,
        max_results: limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[manus-search] API error: ${response.status}`, errorText);
      
      // Fallback: return empty results instead of failing
      return new Response(JSON.stringify({ 
        results: [],
        query,
        type,
        error: 'Manus API unavailable, using fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    const results: ManusSearchResult[] = (data.results || []).map((item: any) => ({
      title: item.title || 'Untitled',
      description: item.snippet || item.description || '',
      url: item.url,
      metadata: item.metadata,
    }));

    console.log(`[manus-search] Found ${results.length} results`);

    return new Response(JSON.stringify({ results, query, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[manus-search] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
