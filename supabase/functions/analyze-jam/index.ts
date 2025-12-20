import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JamTrack {
  trackName: string;
  artistName: string;
  albumArt?: string;
  durationMs?: number;
}

interface AnalyzeJamRequest {
  action: 'suggest-tracks' | 'analyze-mood' | 'get-similar';
  queue: JamTrack[];
  currentTrack?: JamTrack;
  sessionName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { action, queue, currentTrack, sessionName } = await req.json() as AnalyzeJamRequest;

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

    console.log(`[analyze-jam] Calling Claude Opus 4...`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[analyze-jam] Anthropic API error: ${response.status}`, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '{}';

    console.log(`[analyze-jam] Response received, parsing...`);

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      result = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error(`[analyze-jam] JSON parse error:`, parseError);
      result = { error: 'Failed to parse AI response', raw: content };
    }

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
