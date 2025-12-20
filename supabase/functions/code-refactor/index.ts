import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lovable AI Gateway
const AI_MODEL = 'google/gemini-2.5-flash';
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface RefactorRequest {
  code: string;
  fileName: string;
  language: 'python' | 'dockerfile' | 'yaml' | 'shell' | 'auto';
}

interface RefactorSuggestion {
  type: 'security' | 'performance' | 'readability' | 'best-practice';
  original: string;
  suggested: string;
  explanation: string;
  priority: 'high' | 'medium' | 'low';
  lineStart?: number;
  lineEnd?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { code, fileName, language = 'auto' }: RefactorRequest = await req.json();

    if (!code || code.trim().length === 0) {
      throw new Error('Code content is required');
    }

    console.log(`[code-refactor] Starting refactor for: ${fileName} (${language})`);

    // Detect language if auto
    let detectedLanguage = language;
    if (language === 'auto') {
      if (fileName.endsWith('.py')) detectedLanguage = 'python';
      else if (fileName.toLowerCase().includes('dockerfile')) detectedLanguage = 'dockerfile';
      else if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) detectedLanguage = 'yaml';
      else if (fileName.endsWith('.sh')) detectedLanguage = 'shell';
    }

    const systemPrompt = `Você é um especialista em refatoração de código ${detectedLanguage}. Analise o código fornecido e:

1. Identifique problemas de:
   - Segurança (credenciais hardcoded, permissões excessivas, vulnerabilidades)
   - Performance (operações ineficientes, recursos desperdiçados)
   - Legibilidade (nomes ruins, código confuso, falta de documentação)
   - Boas práticas (violações de padrões, anti-patterns)

2. Para cada problema, forneça:
   - O código original problemático
   - O código sugerido melhorado
   - Uma explicação clara da melhoria
   - A prioridade (high/medium/low)

3. Ao final, forneça o código COMPLETO refatorado com TODAS as melhorias aplicadas.

${detectedLanguage === 'python' ? `
Para Python, preste atenção especial a:
- Type hints e docstrings
- Context managers (with statements)
- List comprehensions vs loops
- Exception handling específico
- Imports organizados
- PEP 8 compliance
` : ''}

${detectedLanguage === 'dockerfile' ? `
Para Dockerfile, preste atenção especial a:
- Multi-stage builds para reduzir tamanho
- Camadas de cache otimizadas (COPY antes de RUN)
- Imagens base slim/alpine
- USER não-root
- HEALTHCHECK
- .dockerignore
- Labels e metadata
` : ''}

${detectedLanguage === 'yaml' ? `
Para Docker Compose/YAML, preste atenção a:
- Versão do compose file
- Healthchecks
- Resource limits
- Restart policies
- Networks e volumes nomeados
- Environment variables vs .env
` : ''}

Responda em JSON com este formato:
{
  "suggestions": [
    {
      "type": "security|performance|readability|best-practice",
      "original": "código original",
      "suggested": "código melhorado",
      "explanation": "explicação da melhoria",
      "priority": "high|medium|low",
      "lineStart": número ou null,
      "lineEnd": número ou null
    }
  ],
  "refactoredCode": "código completo refatorado",
  "summary": "resumo das melhorias em 2-3 frases",
  "improvementScore": número de 0-100 indicando grau de melhoria
}`;

    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Refatore o seguinte código ${detectedLanguage} do arquivo "${fileName}":\n\n\`\`\`${detectedLanguage}\n${code}\n\`\`\`` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[code-refactor] Lovable AI error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ success: false, error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    console.log(`[code-refactor] Raw response received, parsing...`);

    let refactorResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        refactorResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error(`[code-refactor] Failed to parse response: ${parseError}`);
      refactorResult = {
        suggestions: [],
        refactoredCode: code,
        summary: 'Análise não disponível',
        improvementScore: 0,
      };
    }

    console.log(`[code-refactor] Refactor complete for ${fileName}: ${refactorResult.suggestions?.length || 0} suggestions`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        fileName,
        language: detectedLanguage,
        originalCode: code,
        ...refactorResult,
        refactoredAt: new Date().toISOString(),
        model: AI_MODEL,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[code-refactor] Error: ${errorMessage}`);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
