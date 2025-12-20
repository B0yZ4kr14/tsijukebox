import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lovable AI Gateway
const AI_MODEL = 'google/gemini-2.5-flash';
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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
          { role: 'user', content: `Analise o seguinte código do arquivo "${fileName}":\n\n\`\`\`\n${code}\n\`\`\`` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[code-scan] Lovable AI error: ${response.status} - ${errorText}`);
      
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
        model: AI_MODEL,
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
