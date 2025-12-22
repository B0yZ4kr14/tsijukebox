import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

const fileSchema = z.object({
  path: z.string().min(1, "File path is required").max(500),
  content: z.string().min(1, "File content is required"),
});

const optionsSchema = z.object({
  includeTests: z.boolean().optional().default(false),
  strictTypeScript: z.boolean().optional().default(true),
  addErrorBoundaries: z.boolean().optional().default(true),
  optimizePerformance: z.boolean().optional().default(true),
  targetCoverage: z.number().min(50).max(100).optional().default(80),
}).optional().default({});

const requestSchema = z.object({
  action: z.enum([
    'refactor-hooks',
    'refactor-components',
    'refactor-pages',
    'refactor-edge-functions',
    'refactor-all',
    'analyze-architecture',
    'generate-tests',
    'validate-config',  // NEW: validate configuration files
  ]),
  files: z.array(fileSchema).min(1, "At least one file is required").max(20, "Maximum 20 files per request"),
  context: z.string().max(5000).optional(),
  options: optionsSchema,
});

type FullstackRefactorRequest = z.infer<typeof requestSchema>;

interface RefactorResult {
  files: Array<{
    path: string;
    originalContent: string;
    refactoredContent: string;
    changes: string[];
    improvements: string[];
    testsGenerated?: string;
  }>;
  summary: string;
  securityNotes: string[];
  performanceGains: string[];
  architectureRecommendations?: string[];
  phase: {
    falsification: string[];
    adversarialTests: string[];
    socraticAnalysis: string[];
    viaNegativa: string[];
    minimalRefactor: string[];
    verification: string[];
  };
}

// Lovable AI Gateway model
const AI_MODEL = 'google/gemini-2.5-pro';
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const KERNEL_REFACTOR_PROTOCOL = `
## KERNEL DE REFATORAÇÃO EM 6 FASES (OBRIGATÓRIO)

FASE 1 - FALSIFICAÇÃO INICIAL:
- Assuma que o código está incorreto ou frágil
- Identifique bugs óbvios, brechas de segurança, violações de contrato
- Classifique por severidade: CRÍTICO, ALTO, MÉDIO, BAIXO

FASE 2 - TESTES ADVERSARIAIS MENTAIS:
- Teste de estresse mental no código
- Considere entradas inesperadas: null, undefined, strings vazias, limites numéricos
- Pense em timeouts, erros de rede, dados corrompidos, concorrência

FASE 3 - ANÁLISE SOCRÁTICA:
- Questione pré-condições, pós-condições, invariantes
- Identifique suposições frágeis no código atual

FASE 4 - VIA NEGATIVA (REMOÇÃO DE RUÍDO):
- Simplifique antes de adicionar
- Remova abstrações desnecessárias, helpers inúteis, duplicação
- Menos código = menos bugs

FASE 5 - REFATORAÇÃO MINIMALISTA:
- Modifique apenas o necessário
- Adicione validações de entrada robustas
- Tratamento explícito de erros
- Gestão clara de estados: loading, error, empty, success
- Mantenha interface pública estável

FASE 6 - TESTES E VERIFICAÇÃO:
- Proponha casos de teste unitário e integração
- Cubra fluxo padrão, cenários de erro, casos de borda
- Confirme comportamento preservado
`;

function buildSystemPrompt(action: string, options: FullstackRefactorRequest['options']): string {
  const basePrompt = `Você é um arquiteto de software sênior especializado em refatoração para o projeto TSiJUKEBOX.
Você está usando o modelo ${AI_MODEL} via Lovable AI Gateway.

PROJETO TSiJUKEBOX:
- Sistema de jukebox kiosk-mode para música
- Stack: React 18 + TypeScript + Tailwind CSS + Supabase
- Target: CachyOS Linux com Openbox
- Edge Functions em Deno

${KERNEL_REFACTOR_PROTOCOL}

DIRETRIZES TYPESCRIPT:
- Use tipos estritos (nunca 'any')
- Prefira interfaces sobre types para objetos
- Use genéricos quando apropriado
- Type guards para runtime safety

DIRETRIZES REACT:
- Componentes funcionais com hooks
- useMemo/useCallback para performance
- Error Boundaries obrigatórios em páginas
- Estados bem definidos: loading | error | empty | success
- Acessibilidade WCAG 2.1 AA

DIRETRIZES EDGE FUNCTIONS:
- Logging estruturado
- CORS headers sempre
- Tratamento de erros específicos
- Validação de entrada com Zod
`;

  const actionPrompts: Record<string, string> = {
    'refactor-hooks': `${basePrompt}

FOCO: REFATORAÇÃO DE HOOKS
1. Extrair lógica complexa para hooks menores
2. Memoização adequada com useCallback/useMemo
3. Cleanup de effects (return cleanup function)
4. Estados derivados com useMemo
5. Custom hooks para lógica reutilizável
6. Type inference correta nos generics
7. Documentação JSDoc completa
8. Testes unitários para cada hook`,

    'refactor-components': `${basePrompt}

FOCO: REFATORAÇÃO DE COMPONENTES
1. Componentização: single responsibility
2. Props typing com interfaces
3. Composition over inheritance
4. Render props / compound components quando apropriado
5. Suspense boundaries para lazy loading
6. Error boundaries para crash recovery
7. Acessibilidade (ARIA, keyboard nav, focus management)
8. Storybook-ready com variants`,

    'refactor-pages': `${basePrompt}

FOCO: REFATORAÇÃO DE PÁGINAS
1. SEO: meta tags, structured data, canonical
2. Loading states com Skeleton/Shimmer
3. Error handling com fallbacks
4. Empty states informativos
5. Lazy loading de componentes pesados
6. Route guards se necessário
7. Data fetching patterns (SWR, React Query)
8. Mobile-first responsive design`,

    'refactor-edge-functions': `${basePrompt}

FOCO: REFATORAÇÃO DE EDGE FUNCTIONS
1. Input validation com Zod
2. Error handling estruturado
3. Logging com contexto (request ID, user ID)
4. Rate limiting awareness
5. Timeout handling
6. Retry logic para chamadas externas
7. Response typing
8. Health check endpoints`,

    'refactor-all': `${basePrompt}

FOCO: REFATORAÇÃO FULLSTACK COMPLETA
1. Hooks: memoização, cleanup, tipagem
2. Components: composição, acessibilidade
3. Pages: SEO, estados, performance
4. Edge Functions: validação, logging, errors
5. Consistência de padrões em todo projeto
6. Remoção de código morto
7. Unificação de estilos
8. Documentação atualizada`,

    'analyze-architecture': `${basePrompt}

FOCO: ANÁLISE ARQUITETURAL
1. Identificar problemas de acoplamento
2. Detectar circular dependencies
3. Analisar bundle size impact
4. Verificar separation of concerns
5. Avaliar testabilidade
6. Identificar code smells
7. Sugerir refatorações estruturais
8. Propor melhorias de DX`,

    'generate-tests': `${basePrompt}

FOCO: GERAÇÃO DE TESTES
1. Unit tests com Vitest
2. Integration tests para fluxos críticos
3. E2E tests outline com Playwright
4. Mocks/stubs para dependências
5. Test factories para dados
6. Coverage targets: 80%+
7. Edge cases e error scenarios
8. Snapshot tests para UI stability`,
  };

  return actionPrompts[action] || basePrompt;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request with Zod
    const rawBody = await req.json();
    const validationResult = requestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      console.error(`[${requestId}] Validation failed:`, errors);
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: errors,
          requestId,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, files, context, options } = validationResult.data;
    console.log(`[${requestId}] Fullstack refactor action: ${action}, files: ${files.length}, options:`, options);

    const systemPrompt = buildSystemPrompt(action, options);
    
    const filesContent = files.map(f => `
=== ARQUIVO: ${f.path} ===
\`\`\`typescript
${f.content}
\`\`\`
`).join('\n\n');

    const userPrompt = `Analise e refatore os seguintes arquivos seguindo o KERNEL DE REFATORAÇÃO EM 6 FASES.
${context ? `Contexto adicional: ${context}` : ''}

OPÇÕES DE REFATORAÇÃO:
- Incluir testes: ${options.includeTests ?? false}
- TypeScript estrito: ${options.strictTypeScript ?? true}
- Error Boundaries: ${options.addErrorBoundaries ?? true}
- Otimizar performance: ${options.optimizePerformance ?? true}

ARQUIVOS PARA REFATORAR:
${filesContent}

FORMATO DE RESPOSTA (JSON VÁLIDO):
{
  "files": [
    {
      "path": "caminho/do/arquivo.ts",
      "refactoredContent": "código refatorado completo",
      "changes": ["lista de mudanças específicas"],
      "improvements": ["lista de melhorias e benefícios"],
      "testsGenerated": "código de testes (se solicitado)"
    }
  ],
  "summary": "Resumo geral da refatoração",
  "securityNotes": ["notas de segurança"],
  "performanceGains": ["ganhos de performance esperados"],
  "architectureRecommendations": ["recomendações arquiteturais"],
  "phase": {
    "falsification": ["problemas encontrados na fase 1"],
    "adversarialTests": ["cenários adversos identificados fase 2"],
    "socraticAnalysis": ["análise socrática fase 3"],
    "viaNegativa": ["código removido fase 4"],
    "minimalRefactor": ["mudanças cirúrgicas fase 5"],
    "verification": ["validações finais fase 6"]
  }
}`;

    console.log(`[${requestId}] Calling Lovable AI Gateway (${AI_MODEL})...`);
    
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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Lovable AI Gateway error:`, response.status, errorText);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Handle rate limits
      if (response.status === 429) {
        await supabase.from('notifications').insert({
          type: 'rate_limit',
          severity: 'warning',
          title: 'Rate Limit Atingido',
          message: 'Limite de requisições excedido. Tente novamente em alguns segundos.',
          metadata: { requestId, action },
        });
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Handle payment required
      if (response.status === 402) {
        await supabase.from('notifications').insert({
          type: 'payment_required',
          severity: 'warning',
          title: 'Créditos Esgotados',
          message: 'Adicione créditos ao workspace do Lovable AI.',
          metadata: { requestId, action },
        });
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      await supabase.from('notifications').insert({
        type: 'critical_issue',
        severity: 'warning',
        title: 'Erro na Refatoração Fullstack',
        message: `Falha ao processar ${files.length} arquivos: ${response.status}`,
        metadata: { requestId, action, error: errorText.substring(0, 200) },
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to call Lovable AI Gateway', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Lovable AI response received in ${duration}ms`);
    
    const content = aiResponse.choices?.[0]?.message?.content || '';
    if (!content) {
      throw new Error('No content in Lovable AI response');
    }

    let result: RefactorResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse Lovable AI response:`, parseError);
      result = {
        files: files.map(f => ({
          path: f.path,
          originalContent: f.content,
          refactoredContent: content,
          changes: ['Ver conteúdo refatorado para detalhes'],
          improvements: ['Refatoração aplicada via Lovable AI'],
        })),
        summary: 'Refatoração concluída. Verifique as mudanças individuais.',
        securityNotes: [],
        performanceGains: [],
        phase: {
          falsification: [],
          adversarialTests: [],
          socraticAnalysis: [],
          viaNegativa: [],
          minimalRefactor: [],
          verification: [],
        },
      };
    }

    // Add original content to each file
    result.files = result.files.map((file, index) => ({
      ...file,
      originalContent: files[index]?.content || '',
    }));

    // Create notification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('notifications').insert({
      type: 'refactor_ready',
      severity: 'info',
      title: `Refatoração Fullstack Completa`,
      message: `${result.files.length} arquivos refatorados em ${duration}ms`,
      metadata: { 
        requestId,
        action, 
        filesCount: result.files.length,
        model: AI_MODEL,
        usage: aiResponse.usage,
        duration,
      },
    });

    console.log(`[${requestId}] Refactoring complete: ${result.files.length} files processed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        usage: aiResponse.usage,
        model: AI_MODEL,
        duration,
        requestId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error in fullstack-refactor:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, requestId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
