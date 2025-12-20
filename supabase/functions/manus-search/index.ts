import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schema for request validation
const ManusSearchRequestSchema = z.object({
  query: z.string()
    .min(1, 'query is required')
    .max(1000, 'query must be less than 1000 characters')
    .trim(),
  type: z.enum(['artist', 'track', 'documentation', 'general']).default('general'),
  limit: z.number().int().min(1).max(50).default(5),
});

type ManusSearchRequest = z.infer<typeof ManusSearchRequestSchema>;

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
      console.error('[manus-search] MANUS_API_KEY is not configured');
      throw new Error('MANUS_API_KEY is not configured');
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const parseResult = ManusSearchRequestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error('[manus-search] Validation error:', parseResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request parameters',
          details: parseResult.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
          results: []
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, type, limit } = parseResult.data;

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
