import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY_ADMIN');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY_ADMIN not configured');
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: `Refatore o seguinte código ${detectedLanguage} do arquivo "${fileName}":\n\n\`\`\`${detectedLanguage}\n${code}\n\`\`\``,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[code-refactor] Anthropic API error: ${response.status} - ${errorText}`);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const anthropicData = await response.json();
    const content = anthropicData.content?.[0]?.text || '';

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
