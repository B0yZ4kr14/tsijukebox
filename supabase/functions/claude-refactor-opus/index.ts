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
  language: z.enum(['python', 'typescript', 'bash', 'dockerfile', 'yaml', 'toml', 'sql']).optional(),
});

const requestSchema = z.object({
  action: z.enum([
    'refactor-python',
    'refactor-docker',
    'optimize-archlinux',
    'optimize-cachyos',
    'analyze-security',
    'generate-docs',
    'validate-config',
  ]),
  files: z.array(fileSchema).min(1, "At least one file is required").max(10, "Maximum 10 files per request"),
  context: z.string().max(5000).optional(),
  targetDistro: z.string().optional().default('cachyos'),
});

type ClaudeRefactorRequest = z.infer<typeof requestSchema>;

interface RefactorResult {
  files: Array<{
    path: string;
    originalContent: string;
    refactoredContent: string;
    changes: string[];
    improvements: string[];
    securityNotes?: string[];
  }>;
  summary: string;
  securityNotes: string[];
  performanceGains: string[];
  architectureNotes?: string[];
  phase: {
    falsification: string[];
    adversarialTests: string[];
    socraticAnalysis: string[];
    viaNegativa: string[];
    minimalRefactor: string[];
    verification: string[];
  };
}

// =============================================================================
// CLAUDE OPUS 4.5 CONFIGURATION
// =============================================================================

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_OPUS_MODEL = 'claude-opus-4-1-20250805';
const MAX_TOKENS = 8192;

// Fallback to Lovable AI Gateway
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const FALLBACK_MODEL = 'google/gemini-2.5-pro';

// =============================================================================
// KERNEL REFACTOR PROTOCOL
// =============================================================================

const KERNEL_REFACTOR_PROTOCOL = `
## KERNEL DE REFATORAÇÃO EM 6 FASES (OBRIGATÓRIO)

### FASE 1 - FALSIFICAÇÃO INICIAL:
- Assuma que o código está incorreto ou frágil
- Identifique bugs óbvios, brechas de segurança, violações de contrato
- Classifique por severidade: CRÍTICO, ALTO, MÉDIO, BAIXO

### FASE 2 - TESTES ADVERSARIAIS MENTAIS:
- Teste de estresse mental no código
- Considere entradas inesperadas: null, undefined, strings vazias, limites numéricos
- Pense em timeouts, erros de rede, dados corrompidos, concorrência
- Para scripts shell: command injection, path traversal, race conditions

### FASE 3 - ANÁLISE SOCRÁTICA:
- Questione pré-condições, pós-condições, invariantes
- Identifique suposições frágeis no código atual
- Para Python: quais dependências são realmente necessárias?

### FASE 4 - VIA NEGATIVA (REMOÇÃO DE RUÍDO):
- Simplifique antes de adicionar
- Remova abstrações desnecessárias, helpers inúteis, duplicação
- Menos código = menos bugs
- Remova imports não utilizados

### FASE 5 - REFATORAÇÃO MINIMALISTA:
- Modifique apenas o necessário
- Adicione validações de entrada robustas
- Tratamento explícito de erros com mensagens claras
- Type hints completos para Python
- Docstrings para funções públicas

### FASE 6 - TESTES E VERIFICAÇÃO:
- Proponha casos de teste unitário e integração
- Cubra fluxo padrão, cenários de erro, casos de borda
- Confirme comportamento preservado
`;

// =============================================================================
// SYSTEM PROMPTS POR AÇÃO
// =============================================================================

function buildSystemPrompt(action: ClaudeRefactorRequest['action'], targetDistro: string): string {
  const basePrompt = `Você é um arquiteto de software sênior especializado em refatoração.
Você é o Claude Opus 4.5 da Anthropic, o modelo mais poderoso disponível.

PROJETO TSiJUKEBOX:
- Sistema de jukebox kiosk-mode para música
- Target OS: ${targetDistro} Linux (Arch-based)
- Instaladores em Python 3.11+
- Edge Functions em TypeScript/Deno

${KERNEL_REFACTOR_PROTOCOL}

IMPORTANTE:
- Sempre retorne JSON válido
- Preserve a funcionalidade original
- Priorize segurança e robustez
- Use type hints em Python
- Docstrings para funções públicas
`;

  const actionPrompts: Record<string, string> = {
    'refactor-python': `${basePrompt}

FOCO: REFATORAÇÃO PYTHON
1. Type hints completos (PEP 484, PEP 604)
2. Docstrings Google style
3. Error handling com exceções específicas
4. Logging estruturado
5. Pathlib para caminhos de arquivo
6. subprocess com shell=False para segurança
7. Context managers (with statements)
8. F-strings para formatação
9. Dataclasses ou Pydantic para dados estruturados
10. Async/await quando apropriado`,

    'refactor-docker': `${basePrompt}

FOCO: OTIMIZAÇÃO DE DOCKERFILE
1. Multi-stage builds para imagens menores
2. Camadas otimizadas (menos layers)
3. .dockerignore apropriado
4. Usuário não-root
5. Health checks
6. Labels padronizadas
7. Variáveis de ambiente seguras
8. Cache de dependências
9. Imagem base específica (não latest)
10. COPY ao invés de ADD quando possível`,

    'optimize-archlinux': `${basePrompt}

FOCO: OTIMIZAÇÃO PARA ARCH LINUX
1. pacman como gerenciador primário
2. Makepkg para builds
3. Systemd units
4. /etc/pacman.conf otimizado
5. Hooks para pacman
6. AUR helpers (yay, paru)
7. Kernel customizado (linux-zen, linux-cachyos)
8. mkinitcpio configuration
9. Boot loader configuration
10. Performance tuning`,

    'optimize-cachyos': `${basePrompt}

FOCO: OTIMIZAÇÃO PARA CACHYOS
1. CachyOS repositories
2. BORE scheduler optimizations
3. ZSTD compression
4. Profile-Guided Optimization (PGO)
5. LTO (Link-Time Optimization)
6. Kernel linux-cachyos
7. Performance governors
8. ANANICY-CPP rules
9. Memory management (zram)
10. I/O schedulers (kyber, mq-deadline)`,

    'analyze-security': `${basePrompt}

FOCO: ANÁLISE DE SEGURANÇA
1. Command injection vulnerabilities
2. Path traversal attacks
3. Privilege escalation
4. Hardcoded credentials
5. Insecure file permissions
6. Race conditions
7. Input validation
8. Secure defaults
9. Principle of least privilege
10. Audit logging`,

    'generate-docs': `${basePrompt}

FOCO: GERAÇÃO DE DOCUMENTAÇÃO
1. README.md completo
2. Docstrings para todas as funções públicas
3. Type hints como documentação
4. Exemplos de uso
5. Changelog
6. API reference
7. Diagramas de arquitetura (Mermaid)
8. Guia de instalação
9. Troubleshooting
10. Contributing guide`,

    'validate-config': `${basePrompt}

FOCO: VALIDAÇÃO DE CONFIGURAÇÃO
1. Sintaxe YAML/TOML/JSON
2. Valores obrigatórios
3. Tipos de dados
4. Ranges válidos
5. Dependências entre campos
6. Valores default
7. Variáveis de ambiente
8. Secrets handling
9. Schema validation
10. Best practices`,
  };

  return actionPrompts[action] || basePrompt;
}

// =============================================================================
// ANTHROPIC API CALL
// =============================================================================

async function callClaudeOpus(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  requestId: string
): Promise<{ content: string; usage: Record<string, number> }> {
  console.log(`[${requestId}] Calling Claude Opus (${CLAUDE_OPUS_MODEL})...`);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_OPUS_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${requestId}] Claude Opus error:`, response.status, errorText);
    throw new Error(`Claude Opus API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';
  const usage = data.usage || {};

  return { content, usage };
}

// =============================================================================
// LOVABLE AI FALLBACK
// =============================================================================

async function callLovableAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  requestId: string
): Promise<{ content: string; usage: Record<string, number> }> {
  console.log(`[${requestId}] Falling back to Lovable AI Gateway (${FALLBACK_MODEL})...`);

  const response = await fetch(LOVABLE_AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: FALLBACK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${requestId}] Lovable AI error:`, response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  return { content, usage };
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Check for API keys
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_CLAUDE_OPUS') || Deno.env.get('ANTHROPIC_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!ANTHROPIC_API_KEY && !LOVABLE_API_KEY) {
      console.error(`[${requestId}] No API keys configured`);
      return new Response(
        JSON.stringify({ error: 'No API keys configured (ANTHROPIC_CLAUDE_OPUS or LOVABLE_API_KEY required)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request
    const rawBody = await req.json();
    const validationResult = requestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      console.error(`[${requestId}] Validation failed:`, errors);
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors, requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, files, context, targetDistro } = validationResult.data;
    console.log(`[${requestId}] Action: ${action}, Files: ${files.length}, Target: ${targetDistro}`);

    // Build prompts
    const systemPrompt = buildSystemPrompt(action, targetDistro);
    
    const filesContent = files.map(f => `
=== ARQUIVO: ${f.path} (${f.language || 'auto-detect'}) ===
\`\`\`${f.language || ''}
${f.content}
\`\`\`
`).join('\n\n');

    const userPrompt = `Analise e refatore os seguintes arquivos seguindo o KERNEL DE REFATORAÇÃO EM 6 FASES.
${context ? `Contexto adicional: ${context}` : ''}

TARGET DISTRO: ${targetDistro}

ARQUIVOS PARA REFATORAR:
${filesContent}

FORMATO DE RESPOSTA (JSON VÁLIDO):
{
  "files": [
    {
      "path": "caminho/do/arquivo",
      "refactoredContent": "código refatorado completo",
      "changes": ["lista de mudanças específicas"],
      "improvements": ["lista de melhorias e benefícios"],
      "securityNotes": ["notas de segurança específicas do arquivo"]
    }
  ],
  "summary": "Resumo geral da refatoração",
  "securityNotes": ["notas de segurança gerais"],
  "performanceGains": ["ganhos de performance esperados"],
  "architectureNotes": ["notas arquiteturais"],
  "phase": {
    "falsification": ["problemas encontrados na fase 1"],
    "adversarialTests": ["cenários adversos identificados fase 2"],
    "socraticAnalysis": ["análise socrática fase 3"],
    "viaNegativa": ["código removido fase 4"],
    "minimalRefactor": ["mudanças cirúrgicas fase 5"],
    "verification": ["validações finais fase 6"]
  }
}`;

    // Call AI
    let content: string;
    let usage: Record<string, number>;
    let modelUsed: string;

    try {
      if (ANTHROPIC_API_KEY) {
        const result = await callClaudeOpus(systemPrompt, userPrompt, ANTHROPIC_API_KEY, requestId);
        content = result.content;
        usage = result.usage;
        modelUsed = CLAUDE_OPUS_MODEL;
      } else {
        const result = await callLovableAI(systemPrompt, userPrompt, LOVABLE_API_KEY!, requestId);
        content = result.content;
        usage = result.usage;
        modelUsed = FALLBACK_MODEL;
      }
    } catch (error) {
      // Try fallback if primary fails
      if (ANTHROPIC_API_KEY && LOVABLE_API_KEY) {
        console.log(`[${requestId}] Primary API failed, trying fallback...`);
        const result = await callLovableAI(systemPrompt, userPrompt, LOVABLE_API_KEY, requestId);
        content = result.content;
        usage = result.usage;
        modelUsed = FALLBACK_MODEL;
      } else {
        throw error;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] AI response received in ${duration}ms using ${modelUsed}`);

    // Parse response
    let result: RefactorResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse AI response:`, parseError);
      result = {
        files: files.map(f => ({
          path: f.path,
          originalContent: f.content,
          refactoredContent: content,
          changes: ['Ver conteúdo refatorado para detalhes'],
          improvements: ['Refatoração aplicada'],
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

    // Add original content
    result.files = result.files.map((file, index) => ({
      ...file,
      originalContent: files[index]?.content || '',
    }));

    // Create notification
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('notifications').insert({
        type: 'refactor_ready',
        severity: 'info',
        title: `Refatoração ${action} Completa`,
        message: `${result.files.length} arquivos processados em ${duration}ms via ${modelUsed}`,
        metadata: { requestId, action, filesCount: result.files.length, model: modelUsed, usage, duration },
      });
    } catch (notifError) {
      console.warn(`[${requestId}] Failed to create notification:`, notifError);
    }

    console.log(`[${requestId}] Refactoring complete: ${result.files.length} files processed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        usage,
        model: modelUsed,
        duration,
        requestId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error in claude-refactor-opus:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific error codes
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded, please try again later.', requestId }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorMessage.includes('402') || errorMessage.includes('payment')) {
      return new Response(
        JSON.stringify({ error: 'Payment required, please add funds.', requestId }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage, requestId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
