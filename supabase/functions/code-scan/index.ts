import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  code: string;
  fileName?: string;
  scanType?: 'security' | 'performance' | 'all';
  persist?: boolean;
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

    const { code, fileName = 'unknown', scanType = 'all', persist = true }: ScanRequest = await req.json();

    if (!code || code.trim().length === 0) {
      throw new Error('Code content is required');
    }

    console.log(`[code-scan] Starting ${scanType} scan for: ${fileName}`);

    const systemPrompt = `Você é um especialista em segurança e qualidade de código. Analise o código fornecido e identifique:

1. **Vulnerabilidades de Segurança** (CRÍTICO):
   - Injeção SQL/XSS/Command Injection
   - Exposição de credenciais/tokens
   - Autenticação/autorização falha
   - Validação de entrada insuficiente

2. **Problemas de Performance** (ALTO):
   - Loops ineficientes
   - Memory leaks
   - Chamadas de API desnecessárias
   - Re-renders excessivos (React)

3. **Más Práticas** (MÉDIO):
   - Código duplicado
   - Falta de tratamento de erros
   - Tipos implícitos (TypeScript)
   - Violações de SOLID

4. **Sugestões de Melhoria** (BAIXO):
   - Refatoração para legibilidade
   - Nomes de variáveis
   - Documentação

Responda em JSON com este formato:
{
  "issues": [
    {
      "severity": "critical|high|medium|low|info",
      "category": "security|performance|maintainability|style",
      "title": "Título curto do problema",
      "message": "Descrição detalhada",
      "line": número da linha (se aplicável) ou null,
      "suggestion": "Código ou dica para corrigir"
    }
  ],
  "summary": "Resumo geral da análise em 2-3 frases",
  "score": número de 0-100 representando qualidade geral
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
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `Analise o seguinte código do arquivo "${fileName}":\n\n\`\`\`\n${code}\n\`\`\``,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[code-scan] Anthropic API error: ${response.status} - ${errorText}`);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const anthropicData = await response.json();
    const content = anthropicData.content?.[0]?.text || '';

    console.log(`[code-scan] Raw response received, parsing...`);

    // Parse the JSON from the response
    let scanResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scanResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error(`[code-scan] Failed to parse response: ${parseError}`);
      scanResult = {
        issues: [],
        summary: content.substring(0, 500),
        score: 50,
      };
    }

    const scannedAt = new Date().toISOString();
    const issues = scanResult.issues || [];
    
    // Calculate issue counts by severity
    const issuesCount = issues.length;
    const criticalCount = issues.filter((i: { severity: string }) => i.severity === 'critical').length;
    const highCount = issues.filter((i: { severity: string }) => i.severity === 'high').length;
    const mediumCount = issues.filter((i: { severity: string }) => i.severity === 'medium').length;
    const lowCount = issues.filter((i: { severity: string }) => i.severity === 'low').length;

    // Persist to database if enabled
    let persistedId = null;
    if (persist) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: insertedData, error: insertError } = await supabase
          .from('code_scan_history')
          .insert({
            file_name: fileName,
            score: scanResult.score || 0,
            summary: scanResult.summary || '',
            issues: issues,
            issues_count: issuesCount,
            critical_count: criticalCount,
            high_count: highCount,
            medium_count: mediumCount,
            low_count: lowCount,
            scanned_at: scannedAt,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error(`[code-scan] Failed to persist scan: ${insertError.message}`);
        } else {
          persistedId = insertedData?.id;
          console.log(`[code-scan] Scan persisted with ID: ${persistedId}`);
        }
      } catch (dbError) {
        console.error(`[code-scan] Database error: ${dbError}`);
      }
    }

    console.log(`[code-scan] Scan complete for ${fileName}: ${issuesCount} issues found`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        ...scanResult,
        fileName,
        scannedAt,
        persistedId,
        counts: {
          total: issuesCount,
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[code-scan] Error: ${errorMessage}`);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
