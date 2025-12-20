import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerplexityRequest {
  action: 
    | 'research-best-practices'
    | 'research-beginner-ux'
    | 'research-arch-automation'
    | 'research-kiosk-setup'
    | 'research-libertarian-sources'
    | 'enrich-documentation';
  topic?: string;
  context?: string;
  searchRecency?: 'day' | 'week' | 'month' | 'year';
}

interface PerplexityResponse {
  success: boolean;
  content: string;
  citations: string[];
  model: string;
  action: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, topic, context, searchRecency = 'month' } = await req.json() as PerplexityRequest;
    console.log(`Perplexity research action: ${action}`);

    let researchQuery = '';
    let systemPrompt = 'You are an expert technical researcher. Provide detailed, accurate information with citations.';
    
    switch (action) {
      case 'research-best-practices':
        researchQuery = `Best practices 2025 for:
          - One-liner installation scripts (curl | bash patterns)
          - GitHub README landing pages that convert visitors
          - Beginner-friendly documentation for Linux software
          - Arch Linux package distribution (AUR, PKGBUILD)
          ${topic ? `Specific focus: ${topic}` : ''}
          
          Provide actionable recommendations with real-world examples.`;
        systemPrompt = 'You are a DevOps and documentation expert. Focus on modern 2025 best practices for open-source projects.';
        break;
        
      case 'research-beginner-ux':
        researchQuery = `How to make Linux software installation beginner-friendly:
          - Visual progress indicators (bars, spinners)
          - Clear error messages with solutions
          - Interactive prompts vs automated defaults
          - Recovery from failures
          - Verification steps after install
          ${topic ? `Specific software: ${topic}` : ''}
          
          Include examples from popular projects like rustup, nvm, oh-my-zsh.`;
        systemPrompt = 'You are a UX expert for developer tools. Focus on reducing friction for first-time users.';
        break;
        
      case 'research-arch-automation':
        researchQuery = `Arch Linux automation best practices 2025:
          - PKGBUILD writing for complex applications
          - Systemd service configuration for kiosk mode
          - CachyOS / Manjaro compatibility considerations
          - PipeWire audio setup automation
          - Openbox kiosk mode configuration
          - Automatic login and app startup
          ${topic ? `Focus on: ${topic}` : ''}
          
          Provide production-ready code snippets.`;
        systemPrompt = 'You are an Arch Linux packaging expert. Provide code that follows Arch Wiki guidelines.';
        break;
        
      case 'research-kiosk-setup':
        researchQuery = `Kiosk mode setup for digital signage / jukebox systems:
          - Openbox autostart configuration
          - X11 / Wayland kiosk options
          - Touchscreen calibration
          - Preventing user escape from kiosk
          - Watchdog and auto-restart
          - Security hardening for public kiosks
          ${topic ? `Specific use case: ${topic}` : ''}
          
          Include systemd units and shell scripts.`;
        systemPrompt = 'You are a kiosk and digital signage expert. Focus on reliability and security.';
        break;

      case 'research-libertarian-sources':
        researchQuery = `Libertarian and anarcho-capitalist perspectives on intellectual property:
          - Stephan Kinsella "Against Intellectual Property" key arguments
          - Mises Institute articles on patents and copyright
          - Arguments that IP violates property rights
          - Open source as practical application of anti-IP philosophy
          - Software licensing alternatives to traditional copyright
          
          Provide philosophical arguments and practical implications.`;
        systemPrompt = 'You are a researcher on libertarian philosophy and economics. Present arguments objectively with proper citations.';
        break;
        
      case 'enrich-documentation':
        if (!context) {
          return new Response(
            JSON.stringify({ error: 'context is required for enrich-documentation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        researchQuery = `Enrich this documentation with additional context, examples, and best practices:
        
        CURRENT CONTENT:
        ${context}
        
        ${topic ? `Focus area: ${topic}` : ''}
        
        Add:
        1. Real-world examples and code snippets
        2. Common pitfalls and solutions
        3. Performance tips
        4. Security considerations
        5. Links to official documentation`;
        systemPrompt = 'You are a technical writer. Enhance documentation while maintaining the original style and structure.';
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Calling Perplexity API with sonar-pro model...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: researchQuery }
        ],
        search_recency_filter: searchRecency,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      
      // Create notification about error
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('notifications').insert({
        type: 'critical_issue',
        severity: 'warning',
        title: 'Erro na Pesquisa Perplexity',
        message: `Falha na ação "${action}": ${response.status}`,
        metadata: { action, error: errorText.substring(0, 200) },
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to call Perplexity API', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const perplexityData = await response.json();
    console.log('Perplexity response received');
    
    const content = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];
    
    // Create notification for successful research
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('notifications').insert({
      type: 'task_complete',
      severity: 'info',
      title: `Pesquisa Perplexity Completa: ${action}`,
      message: `Pesquisa concluída com ${citations.length} citações.`,
      metadata: { action, citationsCount: citations.length, model: 'sonar-pro' },
    });

    const result: PerplexityResponse = {
      success: true,
      content,
      citations,
      model: 'sonar-pro',
      action,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in perplexity-research:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
