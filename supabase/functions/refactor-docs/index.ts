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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { code, language = 'python', type = 'refactor', context = '' }: RefactorRequest = await req.json();

    if (!code) {
      throw new Error('Code is required');
    }

    console.log(`Refactoring ${language} code, type: ${type}, length: ${code.length} chars`);

    // Build system prompt based on type
    let systemPrompt = `You are an expert code refactoring assistant using ${AI_MODEL}. 
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

    // Call Lovable AI Gateway
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
      console.error('Lovable AI error:', response.status, errorText);
      
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('Received response from Lovable AI');

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
