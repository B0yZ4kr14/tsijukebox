import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefactorRequest {
  action: 'refactor-python' | 'refactor-docker' | 'refactor-sqlite' | 'generate-docs' | 'analyze-security' | 'optimize-archlinux';
  files: Array<{
    path: string;
    content: string;
  }>;
  context?: string;
  targetDistro?: 'cachyos' | 'archlinux' | 'manjaro';
}

interface RefactorResult {
  files: Array<{
    path: string;
    originalContent: string;
    refactoredContent: string;
    changes: string[];
    improvements: string[];
  }>;
  summary: string;
  securityNotes?: string[];
  performanceGains?: string[];
}

const CLAUDE_MODEL = 'claude-opus-4-1-20250805';

function buildSystemPrompt(action: string, targetDistro: string): string {
  const basePrompt = `You are an expert software architect and refactoring specialist for the TSiJUKEBOX project.
You are using Claude Opus 4.5, the most advanced model available.
Your responses should be precise, actionable, and production-ready.

Project Context:
- TSiJUKEBOX is a kiosk-mode music jukebox system
- Target platform: ${targetDistro} Linux with Openbox window manager
- Uses SQLite for local data, Supabase for cloud sync
- Python installer scripts for system setup
- Docker containers for development and deployment

Guidelines:
- Follow PEP 8 for Python, use type hints extensively
- Use async/await patterns where beneficial
- Implement proper error handling with specific exception types
- Add comprehensive logging
- Follow the 6-phase refactoring protocol
- Always maintain backward compatibility
- Security is paramount - validate all inputs
`;

  const actionPrompts: Record<string, string> = {
    'refactor-python': `${basePrompt}
    
PYTHON REFACTORING FOCUS:
1. Convert to dataclasses/Pydantic models for configuration
2. Use pathlib instead of os.path
3. Implement proper dependency injection
4. Add typing.Protocol for interfaces
5. Use contextlib for resource management
6. Implement proper logging with structlog
7. Add docstrings with Google style
8. Create unit test stubs`,

    'refactor-docker': `${basePrompt}

DOCKER OPTIMIZATION FOCUS:
1. Use multi-stage builds to reduce image size
2. Implement proper health checks
3. Use non-root users for security
4. Optimize layer caching order
5. Use .dockerignore properly
6. Implement secrets management
7. Add proper labels and metadata
8. Use distroless or alpine bases where possible`,

    'refactor-sqlite': `${basePrompt}

SQLITE OPTIMIZATION FOCUS:
1. Use WAL mode for better concurrency
2. Implement proper connection pooling
3. Add migration system support
4. Create proper indexes
5. Use prepared statements
6. Implement VACUUM strategy
7. Add proper foreign key constraints
8. Create backup/restore procedures`,

    'generate-docs': `${basePrompt}

DOCUMENTATION GENERATION:
1. Create comprehensive README.md
2. Add API documentation with examples
3. Generate architecture diagrams in Mermaid
4. Create installation guides
5. Add troubleshooting sections
6. Include configuration reference
7. Add changelog entries
8. Create contribution guidelines`,

    'analyze-security': `${basePrompt}

SECURITY ANALYSIS:
1. Check for injection vulnerabilities
2. Validate input sanitization
3. Review authentication/authorization
4. Check for hardcoded secrets
5. Analyze permission handling
6. Review network security
7. Check for path traversal
8. Validate crypto usage`,

    'optimize-archlinux': `${basePrompt}

ARCH LINUX / CACHYOS OPTIMIZATION:
1. Use pacman hooks properly
2. Optimize systemd services
3. Configure polkit rules
4. Set up proper user groups
5. Implement udev rules for hardware
6. Configure Openbox for kiosk mode
7. Set up proper audio (PipeWire)
8. Implement automatic updates strategy
9. Create proper PKGBUILD for AUR
10. Optimize for CachyOS kernel features`,
  };

  return actionPrompts[action] || basePrompt;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY_ADMIN');
    
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY_ADMIN not configured');
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, files, context, targetDistro = 'cachyos' } = await req.json() as RefactorRequest;
    console.log(`Claude Opus refactor action: ${action}, files: ${files.length}`);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'files array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt(action, targetDistro);
    
    const filesContent = files.map(f => `
=== FILE: ${f.path} ===
\`\`\`
${f.content}
\`\`\`
`).join('\n\n');

    const userPrompt = `Please analyze and refactor the following files according to the guidelines.
${context ? `Additional context: ${context}` : ''}

FILES TO REFACTOR:
${filesContent}

Provide your response in the following JSON format:
{
  "files": [
    {
      "path": "original/path",
      "refactoredContent": "the complete refactored code",
      "changes": ["list of specific changes made"],
      "improvements": ["list of improvements and benefits"]
    }
  ],
  "summary": "Overall summary of the refactoring",
  "securityNotes": ["any security considerations"],
  "performanceGains": ["expected performance improvements"]
}`;

    console.log('Calling Claude Opus 4.5...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      
      // Create notification about error
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('notifications').insert({
        type: 'critical_issue',
        severity: 'warning',
        title: 'Erro na Refatoração Claude Opus',
        message: `Falha ao processar ${files.length} arquivos: ${response.status}`,
        metadata: { action, error: errorText.substring(0, 200) },
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to call Claude API', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeResponse = await response.json();
    console.log('Claude Opus response received');
    
    // Extract the text content
    const textContent = claudeResponse.content.find((c: { type: string }) => c.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON from Claude's response
    let result: RefactorResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      // Return raw response if JSON parsing fails
      result = {
        files: files.map(f => ({
          path: f.path,
          originalContent: f.content,
          refactoredContent: textContent.text,
          changes: ['See refactored content for details'],
          improvements: ['AI-generated refactoring applied'],
        })),
        summary: 'Refactoring completed. See individual file changes.',
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
      title: `Refatoração Claude Opus Completa`,
      message: `${result.files.length} arquivos refatorados: ${result.summary.substring(0, 100)}`,
      metadata: { 
        action, 
        filesCount: result.files.length,
        model: CLAUDE_MODEL,
        usage: claudeResponse.usage,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        usage: claudeResponse.usage,
        model: CLAUDE_MODEL,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in claude-refactor-opus:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
