import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManusRequest {
  action: 'create-task' | 'get-task' | 'generate-docs' | 'generate-tutorial' | 'optimize-docker';
  prompt?: string;
  taskId?: string;
  files?: string[];
  topic?: string;
}

interface ManusTaskResponse {
  taskId: string;
  taskTitle: string;
  taskUrl: string;
  shareUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  artifacts?: Array<{
    type: string;
    name: string;
    content: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY');
    
    if (!MANUS_API_KEY) {
      console.error('MANUS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Manus API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, prompt, taskId, files, topic } = await req.json() as ManusRequest;
    console.log(`Manus automation action: ${action}`);

    let taskPrompt = '';
    
    switch (action) {
      case 'create-task':
        taskPrompt = prompt || '';
        break;
        
      case 'generate-docs':
        taskPrompt = `Generate comprehensive documentation for the TSiJUKEBOX project. 
        Focus on:
        - Architecture overview
        - Installation guide
        - API reference
        - Configuration options
        ${files ? `Files to document: ${files.join(', ')}` : ''}
        
        Create professional Markdown documentation with code examples, diagrams, and clear explanations.`;
        break;
        
      case 'generate-tutorial':
        taskPrompt = `Create a detailed tutorial for TSiJUKEBOX covering: ${topic || 'getting started'}
        
        Include:
        - Step-by-step instructions with screenshots
        - Code examples
        - Common troubleshooting tips
        - Best practices
        
        Format as a comprehensive guide suitable for beginners and intermediate users.`;
        break;
        
      case 'optimize-docker':
        taskPrompt = `Analyze and optimize the Docker configuration for TSiJUKEBOX:
        
        1. Review Dockerfile for best practices
        2. Optimize docker-compose.yml
        3. Implement multi-stage builds if not present
        4. Add proper health checks
        5. Optimize layer caching
        6. Security hardening
        
        ${files ? `Docker files to analyze: ${files.join(', ')}` : ''}
        
        Provide the optimized files with explanations for each improvement.`;
        break;
        
      case 'get-task':
        if (!taskId) {
          return new Response(
            JSON.stringify({ error: 'taskId is required for get-task action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get task status from Manus
        const statusResponse = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MANUS_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('Manus API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to get task status', details: errorText }),
            { status: statusResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const taskStatus = await statusResponse.json();
        return new Response(
          JSON.stringify({ success: true, task: taskStatus }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Create task in Manus
    console.log('Creating Manus task with prompt:', taskPrompt.substring(0, 100) + '...');
    
    const createResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MANUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: taskPrompt,
        mode: 'autonomous',
        context: {
          project: 'TSiJUKEBOX',
          type: action,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Manus API error:', errorText);
      
      // If Manus API is not available, create a mock response for development
      if (createResponse.status === 401 || createResponse.status === 403) {
        const mockTask: ManusTaskResponse = {
          taskId: `mock-${Date.now()}`,
          taskTitle: `[Mock] ${action}`,
          taskUrl: '#',
          shareUrl: '#',
          status: 'pending',
        };
        
        // Save notification about mock mode
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from('notifications').insert({
          type: 'task_complete',
          severity: 'info',
          title: 'Tarefa Manus criada (modo simulação)',
          message: `Tarefa "${action}" criada. API Manus em modo de simulação.`,
          metadata: { taskId: mockTask.taskId, action },
        });
        
        return new Response(
          JSON.stringify({ success: true, task: mockTask, mock: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to create Manus task', details: errorText }),
        { status: createResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const taskData = await createResponse.json();
    console.log('Manus task created:', taskData);
    
    // Create notification for new task
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('notifications').insert({
      type: 'task_complete',
      severity: 'info',
      title: `Tarefa Manus iniciada: ${action}`,
      message: `Tarefa "${taskData.taskTitle || action}" foi criada e está em execução.`,
      metadata: { taskId: taskData.taskId, action, taskUrl: taskData.taskUrl },
    });

    const response: ManusTaskResponse = {
      taskId: taskData.taskId || taskData.id,
      taskTitle: taskData.taskTitle || taskData.title || action,
      taskUrl: taskData.taskUrl || taskData.url || '#',
      shareUrl: taskData.shareUrl || '#',
      status: taskData.status || 'pending',
      result: taskData.result,
      artifacts: taskData.artifacts,
    };

    return new Response(
      JSON.stringify({ success: true, task: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manus-automation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
