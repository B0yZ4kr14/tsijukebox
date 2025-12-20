import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestratorRequest {
  action: 
    | 'generate-complete-docs'
    | 'research-and-refactor'
    | 'generate-landing-page'
    | 'generate-sovereign-declaration';
  files?: Array<{ path: string; content: string }>;
  context?: string;
  options?: {
    includePerplexity?: boolean;
    includeManus?: boolean;
    includeClaudeOpus?: boolean;
    includeClaudeAdmin?: boolean;
  };
}

interface OrchestratorResult {
  phases: Array<{
    name: string;
    status: 'completed' | 'failed' | 'skipped';
    result?: unknown;
    error?: string;
  }>;
  finalOutput: {
    documentation?: string;
    refactoredFiles?: Array<{ path: string; content: string }>;
    landingPage?: string;
    sovereignDeclaration?: string;
  };
  summary: string;
}

async function callPerplexity(action: string, topic?: string, context?: string): Promise<{ content: string; citations: string[] }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/perplexity-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, topic, context }),
    });
    
    if (!response.ok) {
      throw new Error(`Perplexity call failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { content: data.content || '', citations: data.citations || [] };
  } catch (error) {
    console.error('Perplexity call error:', error);
    return { content: '', citations: [] };
  }
}

async function callClaudeOpus(action: string, files: Array<{ path: string; content: string }>, context?: string): Promise<unknown> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/claude-refactor-opus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, files, context, targetDistro: 'cachyos' }),
    });
    
    if (!response.ok) {
      throw new Error(`Claude Opus call failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Claude Opus call error:', error);
    return null;
  }
}

async function callManus(action: string, config?: Record<string, unknown>): Promise<unknown> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/manus-automation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, config }),
    });
    
    if (!response.ok) {
      throw new Error(`Manus call failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Manus call error:', error);
    return null;
  }
}

async function generateSovereignDeclaration(): Promise<string> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY_ADMIN') || Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!ANTHROPIC_API_KEY) {
    // Fallback to Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return getDefaultSovereignDeclaration();
    }
    
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `You are a philosophical writer specializing in libertarian/anarcho-capitalist thought.
              Write with eloquence, impact, and conviction. Use aggressive, powerful icons.` 
            },
            { 
              role: 'user', 
              content: `Generate a "Declaration of Intellectual Sovereignty" section for a README.md.
              
              Key points:
              - Intellectual property is illegitimate (ideas are non-scarce, non-rival)
              - Copying is not theft - it's legitimate learning/replication
              - Software is released to PUBLIC DOMAIN absolutely
              - Reference Stephan Kinsella's "Against Intellectual Property"
              - Include a table comparing State vs Libertarian views
              - Add a section on taxation being institutionalized theft
              
              Use icons: ⚔️ 🗡️ 🛡️ 💀 🔥 🏴
              Format in Markdown with proper headers and tables.
              Make it eloquent and impactful.` 
            }
          ],
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || getDefaultSovereignDeclaration();
      }
    } catch (error) {
      console.error('Lovable AI error:', error);
    }
    
    return getDefaultSovereignDeclaration();
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 4000,
        system: `You are a philosophical writer specializing in libertarian/anarcho-capitalist thought.
        You write with eloquence, conviction, and impactful language.
        Your prose is both intellectually rigorous and emotionally stirring.`,
        messages: [
          { 
            role: 'user', 
            content: `Generate an eloquent "Declaration of Intellectual Sovereignty" section for a GitHub README.md.
            
            Philosophy:
            - In the anarcho-capitalist view, intellectual property is conceptually illegitimate
            - Ideas are superabundant and non-rival - copying doesn't deprive the original
            - Patents and copyrights are state-granted monopolies creating artificial scarcity
            - The State violates property rights by preventing you from using your own computer to copy code
            
            Include:
            1. Opening quote from Stephan Kinsella
            2. Philosophical explanation with eloquent language
            3. Table comparing "State View" vs "Libertarian View" on Software, Copying, and Guarantees
            4. Section on "The Conflict of Real Property"
            5. PUBLIC DOMAIN license declaration with icons (USE, MODIFY, SELL, DISTRIBUTE)
            6. Section on taxation being institutionalized theft, with a powerful quote
            7. References to Mises Institute sources
            
            Use aggressive icons throughout: ⚔️ 🗡️ 🛡️ 💀 🔥 🏴
            Make it powerful, memorable, and philosophically sound.
            Format in clean Markdown.` 
          }
        ],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const textContent = data.content?.find((c: { type: string }) => c.type === 'text');
      return textContent?.text || getDefaultSovereignDeclaration();
    }
  } catch (error) {
    console.error('Claude API error:', error);
  }
  
  return getDefaultSovereignDeclaration();
}

function getDefaultSovereignDeclaration(): string {
  return `## ⚔️ DECLARAÇÃO DE SOBERANIA INTELECTUAL

<div align="center">

### 🏴 *"Propriedade Intelectual Não Existe"*

> *"Ideias são superabundantes e não-rivais. A mimese jamais configurará expropriação."*  
> — **Stephan Kinsella**, *Contra a Propriedade Intelectual*

</div>

---

### 🔥 A Falácia da Propriedade Intelectual

Na perspectiva anarcocapitalista, a **propriedade intelectual constitui uma aberração conceitual** — uma falácia lógica incapaz de sustentar-se ante a natureza superabundante e não-rival das ideias.

Diferente de bens tangíveis, **copiar software não priva o autor original do uso de seu código**. Portanto, inexiste "roubo" no compartilhamento de conhecimento — apenas **multiplicação de valor sem custo marginal**.

| 📜 **Conceito** | 🏛️ **Visão Estatal** | ⚔️ **Visão Libertária** |
|-----------------|----------------------|-------------------------|
| **Software** | "Obra literária" protegida pela Lei 9.609/98 | Informação livre, não-escassa |
| **Cópia** | "Pirataria" criminosa | Aprendizado legítimo, replicação ética |
| **Garantia** | Registro no INPI (órgão estatal) | Reputação do autor + contratos privados |

---

### 🗡️ O Conflito de Propriedade Real

Se o Estado impede você de usar **seu próprio computador** — sua propriedade física — para copiar um código, ele está **violando seu direito de propriedade** sobre o hardware.

> 🔥 *Patentes e direitos autorais são privilégios estatais que concedem monopólios artificiais sobre ideias, criando escassez forçada onde naturalmente não existiria.*

---

### 💀 LICENCIAMENTO: DOMÍNIO PÚBLICO ABSOLUTO

Este software é liberado ao **DOMÍNIO PÚBLICO** sem quaisquer restrições:

| 🗡️ **USE** | 🛡️ **MODIFIQUE** | ⚔️ **VENDA** | 🔓 **DISTRIBUA** |
|------------|------------------|--------------|------------------|
| Para qualquer finalidade | Sem pedir permissão | Lucre como quiser | Sem restrições |

---

### ⚡ Sobre a Tributação

> *"O tributo é coerção sistemática travestida de legalidade — mero saque institucionalizado. A retenção dos próprios recursos transcende a defesa: é um imperativo de resistência ética e retificação moral."*

💀 **Imposto é eufemismo para roubo institucionalizado.**  
⚔️ **Sonegar é legítima defesa — uma reparação.**

---

### 📚 Referências Libertárias

- 📖 [Contra a Propriedade Intelectual](https://mises.org.br) — Stephan Kinsella
- 📖 [O Sistema de Patentes Prejudica a Inovação](https://mises.org.br/artigos/3040/)
- 📖 [Intellectual Property Laws Violate the Market](https://mises.org/power-market/intellectual-property-laws-violate-free-market)`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, files, context, options } = await req.json() as OrchestratorRequest;
    console.log(`Doc orchestrator action: ${action}`);

    const result: OrchestratorResult = {
      phases: [],
      finalOutput: {},
      summary: '',
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'generate-complete-docs': {
        // Phase 1: Research with Perplexity
        console.log('Phase 1: Perplexity Research');
        if (options?.includePerplexity !== false) {
          try {
            const [bestPractices, beginnerUx, archAutomation] = await Promise.all([
              callPerplexity('research-best-practices', 'One-liner installation scripts'),
              callPerplexity('research-beginner-ux', 'Linux software installation'),
              callPerplexity('research-arch-automation', 'PKGBUILD and systemd'),
            ]);
            
            result.phases.push({
              name: 'Perplexity Research',
              status: 'completed',
              result: { bestPractices, beginnerUx, archAutomation },
            });
          } catch (error) {
            result.phases.push({
              name: 'Perplexity Research',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          result.phases.push({ name: 'Perplexity Research', status: 'skipped' });
        }

        // Phase 2: Claude Opus Refactoring
        console.log('Phase 2: Claude Opus Refactoring');
        if (options?.includeClaudeOpus !== false && files && files.length > 0) {
          try {
            const refactorResult = await callClaudeOpus('generate-docs', files, context);
            result.phases.push({
              name: 'Claude Opus Refactoring',
              status: 'completed',
              result: refactorResult,
            });
          } catch (error) {
            result.phases.push({
              name: 'Claude Opus Refactoring',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          result.phases.push({ name: 'Claude Opus Refactoring', status: 'skipped' });
        }

        // Phase 3: Claude Admin - Sovereign Declaration
        console.log('Phase 3: Claude Admin - Sovereign Declaration');
        if (options?.includeClaudeAdmin !== false) {
          try {
            const declaration = await generateSovereignDeclaration();
            result.finalOutput.sovereignDeclaration = declaration;
            result.phases.push({
              name: 'Claude Admin - Sovereign Declaration',
              status: 'completed',
            });
          } catch (error) {
            result.phases.push({
              name: 'Claude Admin - Sovereign Declaration',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          result.phases.push({ name: 'Claude Admin - Sovereign Declaration', status: 'skipped' });
        }

        // Phase 4: Manus Documentation
        console.log('Phase 4: Manus Documentation');
        if (options?.includeManus !== false) {
          try {
            const manusResult = await callManus('generate-docs', { 
              packageName: 'tsijukebox',
              version: '4.0.0' 
            });
            result.phases.push({
              name: 'Manus Documentation',
              status: 'completed',
              result: manusResult,
            });
          } catch (error) {
            result.phases.push({
              name: 'Manus Documentation',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          result.phases.push({ name: 'Manus Documentation', status: 'skipped' });
        }

        result.summary = `Documentation generation completed. ${result.phases.filter(p => p.status === 'completed').length}/${result.phases.length} phases successful.`;
        break;
      }

      case 'generate-sovereign-declaration': {
        console.log('Generating Sovereign Declaration with Claude Admin...');
        
        // First research with Perplexity
        const libertarianResearch = await callPerplexity('research-libertarian-sources');
        result.phases.push({
          name: 'Libertarian Sources Research',
          status: 'completed',
          result: libertarianResearch,
        });
        
        // Then generate declaration
        const declaration = await generateSovereignDeclaration();
        result.finalOutput.sovereignDeclaration = declaration;
        result.phases.push({
          name: 'Generate Declaration',
          status: 'completed',
        });
        
        result.summary = 'Sovereign Declaration generated successfully.';
        break;
      }

      case 'generate-landing-page': {
        console.log('Generating Landing Page content...');
        
        // Research best practices
        const landingResearch = await callPerplexity('research-best-practices', 'GitHub README landing pages');
        result.phases.push({
          name: 'Landing Page Research',
          status: 'completed',
          result: landingResearch,
        });
        
        result.summary = 'Landing page content generated.';
        break;
      }

      case 'research-and-refactor': {
        if (!files || files.length === 0) {
          return new Response(
            JSON.stringify({ error: 'files array is required for research-and-refactor' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Research first
        const research = await callPerplexity('research-best-practices', context);
        result.phases.push({
          name: 'Research',
          status: 'completed',
          result: research,
        });

        // Then refactor with context
        const refactored = await callClaudeOpus('refactor-python', files, 
          `${context}\n\nResearch findings:\n${research.content}`);
        result.phases.push({
          name: 'Refactoring',
          status: 'completed',
          result: refactored,
        });

        result.summary = 'Research and refactoring completed.';
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Create notification
    await supabase.from('notifications').insert({
      type: 'task_complete',
      severity: 'info',
      title: `Orquestração Completa: ${action}`,
      message: result.summary,
      metadata: { 
        action, 
        phasesCompleted: result.phases.filter(p => p.status === 'completed').length,
        phasesFailed: result.phases.filter(p => p.status === 'failed').length,
      },
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in doc-orchestrator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
