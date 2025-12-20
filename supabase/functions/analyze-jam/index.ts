import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schemas for request validation
const JamTrackSchema = z.object({
  trackName: z.string().min(1).max(500),
  artistName: z.string().min(1).max(500),
  albumArt: z.string().url().optional().or(z.literal('')),
  durationMs: z.number().int().positive().optional(),
});

const AnalyzeJamRequestSchema = z.object({
  action: z.enum(['suggest-tracks', 'analyze-mood', 'get-similar']),
  queue: z.array(JamTrackSchema).max(100),
  currentTrack: JamTrackSchema.optional(),
  sessionName: z.string().max(200).optional(),
});

type JamTrack = z.infer<typeof JamTrackSchema>;
type AnalyzeJamRequest = z.infer<typeof AnalyzeJamRequestSchema>;

// Lovable AI Gateway configuration
const LOVABLE_AI_GATEWAY = 'https://ai.lovable.dev/api/chat';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Lovable API key (auto-configured in Lovable Cloud)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[analyze-jam] LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const parseResult = AnalyzeJamRequestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error('[analyze-jam] Validation error:', parseResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request parameters',
          details: parseResult.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, queue, currentTrack, sessionName } = parseResult.data;

    console.log(`[analyze-jam] Action: ${action}, Queue size: ${queue?.length || 0}`);

    const queueContext = queue?.length > 0 
      ? queue.map((t, i) => `${i + 1}. "${t.trackName}" - ${t.artistName}`).join('\n')
      : 'Fila vazia';

    const currentContext = currentTrack 
      ? `Tocando agora: "${currentTrack.trackName}" - ${currentTrack.artistName}`
      : 'Nenhuma música tocando';

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'suggest-tracks':
        systemPrompt = `Você é um DJ especialista em curadoria musical. Analise a fila de músicas e sugira 5 músicas que combinem com o estilo e mood da sessão.
        
Retorne APENAS um JSON válido no formato:
{
  "suggestions": [
    {"trackName": "nome", "artistName": "artista", "reason": "motivo curto"}
  ],
  "mood": "descrição do mood detectado",
  "genre": "gênero predominante"
}`;
        userPrompt = `Sessão: ${sessionName || 'JAM Session'}

${currentContext}

Fila atual:
${queueContext}

Sugira 5 músicas que complementem esta seleção.`;
        break;

      case 'analyze-mood':
        systemPrompt = `Você é um especialista em análise musical. Analise as músicas e identifique o mood, energia e gênero predominante.

Retorne APENAS um JSON válido no formato:
{
  "mood": "descrição do mood",
  "energy": "low" | "medium" | "high",
  "genres": ["gênero1", "gênero2"],
  "vibe": "descrição da vibe em uma frase"
}`;
        userPrompt = `Analise o mood desta sessão:

${currentContext}

Músicas na fila:
${queueContext}`;
        break;

      case 'get-similar':
        systemPrompt = `Você é um especialista em descoberta musical. Com base na música atual, sugira músicas similares.

Retorne APENAS um JSON válido no formato:
{
  "similar": [
    {"trackName": "nome", "artistName": "artista", "similarity": "motivo da similaridade"}
  ]
}`;
        userPrompt = `Encontre 5 músicas similares a:
${currentContext}

Considere o contexto da fila:
${queueContext}`;
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    console.log('[analyze-jam] Calling Lovable AI Gateway (gemini-2.5-flash)...');

    // Use Lovable AI Gateway instead of direct Anthropic API
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[analyze-jam] Lovable AI Gateway error: ${response.status}`, errorText);
      throw new Error(`Lovable AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    console.log('[analyze-jam] Response received, parsing...');

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      result = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error('[analyze-jam] JSON parse error:', parseError);
      // Try parsing the entire content as JSON
      try {
        result = JSON.parse(content);
      } catch {
        result = { error: 'Failed to parse AI response', raw: content };
      }
    }

    console.log('[analyze-jam] Successfully processed response');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[analyze-jam] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
