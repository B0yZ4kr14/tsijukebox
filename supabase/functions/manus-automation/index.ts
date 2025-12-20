import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManusRequest {
  action: 
    | 'create-task' 
    | 'get-task' 
    | 'generate-docs' 
    | 'generate-tutorial' 
    | 'optimize-docker'
    | 'deploy-pipeline'
    | 'generate-archpkg'
    | 'create-systemd-services'
    | 'sync-to-github'
    // Novas ações de refatoração Python
    | 'refactor-python-scripts'
    | 'refactor-installer'
    | 'lint-python'
    | 'generate-python-tests';
  prompt?: string;
  taskId?: string;
  files?: string[];
  topic?: string;
  config?: {
    packageName?: string;
    version?: string;
    services?: string[];
    branch?: string;
    commitMessage?: string;
    pythonVersion?: string;
    testFramework?: string;
  };
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

    const { action, prompt, taskId, files, topic, config } = await req.json() as ManusRequest;
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

      case 'deploy-pipeline':
        taskPrompt = `Create a complete CI/CD pipeline for TSiJUKEBOX:
        
        1. GitHub Actions workflow for:
           - Lint and test on PR
           - Build Docker images
           - Deploy to staging on develop branch
           - Deploy to production on main branch
        2. Include:
           - Unit test execution (Vitest)
           - E2E tests (Playwright)
           - Code coverage reports
           - Security scanning
           - Badge generation
        3. Configure for:
           - Branch: ${config?.branch || 'main'}
           - Auto-deploy on merge
           
        Create production-ready YAML files with proper secrets handling.`;
        break;

      case 'generate-archpkg':
        taskPrompt = `Generate a complete Arch Linux / CachyOS package for TSiJUKEBOX:
        
        Package Name: ${config?.packageName || 'tsijukebox'}
        Version: ${config?.version || '4.0.0'}
        
        Create:
        1. PKGBUILD file following Arch packaging guidelines
        2. .SRCINFO file
        3. tsijukebox.install script for post-install hooks
        4. systemd service files
        5. Desktop entry file
        6. Polkit rules if needed
        7. Udev rules for audio devices
        
        Target: CachyOS with Openbox kiosk mode
        Include dependencies for:
        - Node.js runtime
        - SQLite
        - PipeWire audio
        - Chromium/Firefox for kiosk
        
        Follow AUR submission guidelines.`;
        break;

      case 'create-systemd-services':
        taskPrompt = `Create systemd service configuration for TSiJUKEBOX:
        
        Services to create: ${config?.services?.join(', ') || 'tsijukebox, tsijukebox-kiosk, tsijukebox-backend'}
        
        For each service:
        1. Main service unit file
        2. Timer unit if needed
        3. Socket activation where appropriate
        4. Proper dependencies and ordering
        5. Resource limits (cgroups)
        6. Security hardening (sandboxing)
        7. Logging configuration
        8. Auto-restart policies
        
        Target: CachyOS/Arch Linux with Openbox
        User: tsijukebox (non-root)
        
        Include:
        - Install instructions
        - Enable/start commands
        - Troubleshooting tips`;
        break;

      case 'sync-to-github':
        taskPrompt = `Orchestrate a complete sync of TSiJUKEBOX project to GitHub:
        
        Repository: https://github.com/B0yZ4kr14/TSiJUKEBOX
        Branch: ${config?.branch || 'main'}
        Commit Message: ${config?.commitMessage || 'Automated sync from TSiJUKEBOX'}
        
        Tasks:
        1. Prepare all project files for export
        2. Validate file structure
        3. Check for sensitive data
        4. Create comprehensive commit
        5. Update documentation
        6. Generate changelog entry
        
        Provide a summary of all files to be synced.`;
        break;

      // ========================================
      // NOVAS AÇÕES DE REFATORAÇÃO PYTHON
      // ========================================

      case 'refactor-python-scripts':
        taskPrompt = `Refatore os scripts Python principais do TSiJUKEBOX aplicando o KERNEL DE REFATORAÇÃO DE 6 FASES:

        **SCRIPTS A REFATORAR:**
        ${files?.join('\n        - ') || `- scripts/install.py (1084 linhas)
        - scripts/update.py
        - scripts/verify.py
        - scripts/uninstall.py`}

        **KERNEL DE 6 FASES A APLICAR:**

        **FASE 1 - FALSIFICAÇÃO INICIAL:**
        - Assuma que o código está incorreto
        - Identifique bugs, brechas de segurança, violações de contrato
        - Classifique por severidade: CRÍTICO, ALTO, MÉDIO, BAIXO

        **FASE 2 - TESTES ADVERSARIAIS:**
        - Teste com null/None, strings vazias, valores extremos
        - Simule timeouts, erros de rede, dados corrompidos
        - Documente qual entrada causa falha e o comportamento esperado

        **FASE 3 - ANÁLISE SOCRÁTICA:**
        - Pré-condições: o que deve ser verdade antes de chamar?
        - Pós-condições: o que está garantido após execução?
        - Invariantes: o que nunca pode ser violado?
        - Suposições frágeis: o que o código assume implicitamente?

        **FASE 4 - VIA NEGATIVA:**
        - Remova abstrações desnecessárias
        - Delete código duplicado
        - Elimine comentários óbvios
        - Simplifique antes de adicionar

        **FASE 5 - REFATORAÇÃO MINIMALISTA:**
        - Mudanças cirúrgicas, apenas o necessário
        - Type hints completos (Python 3.10+)
        - Async/await onde apropriado
        - Logging estruturado com loguru
        - Error handling com retry e fallback
        - Docstrings Google-style

        **FASE 6 - VERIFICAÇÃO:**
        - Proponha testes unitários com pytest
        - Caso base de sucesso
        - Casos de erro e borda
        - Confirme comportamento preservado

        **REQUISITOS ADICIONAIS:**
        - Python ${config?.pythonVersion || '3.10+'}
        - Framework de testes: ${config?.testFramework || 'pytest'}
        - Target: CachyOS/Arch Linux com systemd`;
        break;

      case 'refactor-installer':
        taskPrompt = `Refatore os módulos do instalador TSiJUKEBOX:

        **MÓDULOS A REFATORAR:**
        ${files?.join('\n        - ') || `- scripts/installer/__init__.py
        - scripts/installer/config.py
        - scripts/installer/ui.py
        - scripts/installer/db.py
        - scripts/installer/audio.py
        - scripts/installer/dependencies.py
        - scripts/installer/network.py
        - scripts/installer/system.py`}

        **ARQUITETURA ALVO:**
        1. **Dependency Injection:**
           - Container de dependências
           - Interfaces abstratas para todos os serviços
           - Testes mockáveis

        2. **Abstract Base Classes:**
           - BaseInstaller
           - BaseConfigManager
           - BaseUIManager
           - BaseAudioManager

        3. **Plugin Architecture:**
           - Plugins para diferentes distros (Arch, Debian, Fedora)
           - Plugins para diferentes bancos (SQLite, PostgreSQL)
           - Plugins para diferentes áudios (PipeWire, PulseAudio)

        4. **Configuration Management:**
           - Pydantic para validação
           - YAML/TOML para configuração
           - Environment variables com python-dotenv

        5. **Error Handling:**
           - Custom exceptions hierarchy
           - Retry decorators com tenacity
           - Graceful degradation

        6. **Logging:**
           - Loguru para logging estruturado
           - Rich para output formatado
           - Progress bars com tqdm

        Aplique o KERNEL DE 6 FASES em cada módulo.`;
        break;

      case 'lint-python':
        taskPrompt = `Execute linting e type checking completo nos scripts Python do TSiJUKEBOX:

        **FERRAMENTAS A USAR:**
        1. **Ruff** - Linting ultrarrápido
           - ruff check . --fix
           - ruff format .

        2. **MyPy** - Type checking estrito
           - mypy --strict scripts/
           - Resolver todos os erros de tipo

        3. **Bandit** - Security linting
           - bandit -r scripts/ -ll
           - Identificar vulnerabilidades

        4. **Pylint** - Code quality
           - pylint scripts/ --score
           - Target: score >= 9.0

        **ARQUIVOS A VERIFICAR:**
        ${files?.join('\n        - ') || `- scripts/install.py
        - scripts/update.py
        - scripts/verify.py
        - scripts/installer/**/*.py`}

        **SAÍDA ESPERADA:**
        1. Relatório de issues encontradas
        2. Fixes aplicados automaticamente
        3. Issues que requerem correção manual
        4. Configuração recomendada para pyproject.toml
        5. Pre-commit hooks para manter qualidade`;
        break;

      case 'generate-python-tests':
        taskPrompt = `Gere testes unitários completos para os scripts Python do TSiJUKEBOX:

        **FRAMEWORK:** ${config?.testFramework || 'pytest'}
        **PYTHON VERSION:** ${config?.pythonVersion || '3.10+'}

        **MÓDULOS PARA TESTAR:**
        ${files?.join('\n        - ') || `- scripts/install.py
        - scripts/update.py
        - scripts/verify.py
        - scripts/installer/config.py
        - scripts/installer/ui.py
        - scripts/installer/db.py
        - scripts/installer/audio.py
        - scripts/installer/dependencies.py`}

        **ESTRUTURA DE TESTES:**
        \`\`\`
        tests/
        ├── conftest.py          # Fixtures globais
        ├── unit/
        │   ├── test_install.py
        │   ├── test_update.py
        │   ├── test_verify.py
        │   └── installer/
        │       ├── test_config.py
        │       ├── test_ui.py
        │       ├── test_db.py
        │       └── test_audio.py
        ├── integration/
        │   ├── test_full_install.py
        │   └── test_database_setup.py
        └── e2e/
            └── test_complete_flow.py
        \`\`\`

        **REQUISITOS:**
        1. Coverage target: >= 80%
        2. Fixtures com pytest
        3. Mocks com unittest.mock ou pytest-mock
        4. Parametrização para múltiplos cenários
        5. Markers para slow tests e integration tests
        6. Testes para:
           - Happy path
           - Error handling
           - Edge cases (null, empty, limits)
           - Concurrency (se aplicável)

        **CONFIGURAÇÃO pytest.ini:**
        Inclua configuração completa para pytest`;
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
          config,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Manus API error:', errorText);
      
      // If Manus API is not available, create a mock response for development
      if (createResponse.status === 401 || createResponse.status === 403) {
        const mockTask: ManusTaskResponse = {
          taskId: `mock-${action}-${Date.now()}`,
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
          title: `Tarefa Manus criada (modo simulação): ${action}`,
          message: `Tarefa "${action}" criada. API Manus em modo de simulação.`,
          metadata: { taskId: mockTask.taskId, action, config },
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
      metadata: { taskId: taskData.taskId, action, taskUrl: taskData.taskUrl, config },
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
