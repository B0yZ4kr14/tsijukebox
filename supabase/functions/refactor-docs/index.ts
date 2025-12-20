import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface RefactorRequest {
  code: string;
  language?: string;
  type?: 'refactor' | 'optimize' | 'document' | 'analyze';
  context?: string;
}

interface RefactorResponse {
  success: boolean;
  refactored_code?: string;
  analysis?: string;
  suggestions?: string[];
  issues?: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    line?: number;
    fix?: string;
  }>;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { code, language = 'python', type = 'refactor', context = '' }: RefactorRequest = await req.json();

    if (!code) {
      throw new Error('Code is required');
    }

    console.log(`Refactoring ${language} code, type: ${type}, length: ${code.length} chars`);

    // Build system prompt based on type
    let systemPrompt = `You are an expert code refactoring assistant using Claude Opus 4.5. 
You analyze and improve code with a focus on:
- Correctness and robustness
- Security best practices
- Performance optimization
- Code readability and maintainability
- Following language-specific conventions

Language: ${language}
${context ? `Context: ${context}` : ''}

IMPORTANT: Return your response in valid JSON format with the following structure:
{
  "refactored_code": "the improved code",
  "analysis": "brief analysis of what was improved",
  "suggestions": ["list", "of", "suggestions"],
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "description": "issue description",
      "line": 123,
      "fix": "how to fix"
    }
  ]
}`;

    let userPrompt = '';
    
    switch (type) {
      case 'refactor':
        userPrompt = `Refactor the following ${language} code to improve its quality, readability, and maintainability. 
Apply best practices and modern conventions.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;
        
      case 'optimize':
        userPrompt = `Optimize the following ${language} code for better performance.
Identify bottlenecks and suggest improvements.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;
        
      case 'document':
        userPrompt = `Add comprehensive documentation to the following ${language} code.
Include docstrings, type hints, and inline comments where appropriate.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;
        
      case 'analyze':
        userPrompt = `Analyze the following ${language} code for potential issues, security vulnerabilities, and improvement opportunities.
Provide a detailed report.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;
    }

    // Call Claude Opus 4.5
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    console.log('Received response from Claude Opus 4.5');

    // Try to parse JSON from the response
    let result: RefactorResponse;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        result = {
          success: true,
          refactored_code: parsed.refactored_code,
          analysis: parsed.analysis,
          suggestions: parsed.suggestions || [],
          issues: parsed.issues || [],
        };
      } else {
        // If no JSON found, return raw content as analysis
        result = {
          success: true,
          analysis: content,
          suggestions: [],
          issues: [],
        };
      }
    } catch (parseError) {
      console.log('Could not parse JSON, returning raw content');
      result = {
        success: true,
        analysis: content,
        suggestions: [],
        issues: [],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refactor-docs function:', error);
    
    const errorResponse: RefactorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
