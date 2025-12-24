import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration - TSiJUKEBOX
 * 
 * Configuração completa para testes E2E com suporte a:
 * - Múltiplos browsers (Chromium, Firefox, WebKit)
 * - Dispositivos móveis (Pixel 5, iPhone 12)
 * - Modo Kiosk (1080x1920)
 * - Testes de acessibilidade
 * - Testes de performance
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Diretório de testes
  testDir: './e2e',
  
  // Timeout global para cada teste (30 segundos)
  timeout: 30000,
  
  // Timeout para expect assertions (5 segundos)
  expect: {
    timeout: 5000,
  },
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Falhar se test.only() for deixado no código (apenas em CI)
  forbidOnly: !!process.env.CI,
  
  // Número de retries em caso de falha
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers (threads) para executar testes
  // CI: 1 worker (mais estável)
  // Local: undefined (usa todos os cores disponíveis)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporters para visualização dos resultados
  reporter: [
    // HTML report (visual e interativo)
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never', // Não abrir automaticamente
    }],
    
    // List reporter (output no terminal)
    ['list'],
    
    // JSON report (para integração com outras ferramentas)
    ['json', { 
      outputFile: 'coverage/playwright/results.json' 
    }],
    
    // JUnit XML (para CI/CD)
    ['junit', { 
      outputFile: 'coverage/playwright/junit.xml' 
    }],
    
    // GitHub Actions reporter (apenas em CI)
    ...(process.env.CI ? [['github']] : []),
  ],
  
  // Configurações globais para todos os testes
  use: {
    // URL base da aplicação
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Trace (gravação de ações) apenas em retry
    trace: 'on-first-retry',
    
    // Screenshot apenas em falha
    screenshot: 'only-on-failure',
    
    // Vídeo apenas em retry
    video: 'on-first-retry',
    
    // Timeout para ações (click, fill, etc)
    actionTimeout: 10000,
    
    // Timeout para navegação
    navigationTimeout: 30000,
    
    // Aceitar downloads
    acceptDownloads: true,
    
    // Ignorar erros HTTPS (apenas para desenvolvimento)
    ignoreHTTPSErrors: !process.env.CI,
    
    // Locale e timezone
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    
    // Opções de contexto para acessibilidade
    contextOptions: {
      reducedMotion: 'reduce', // Reduzir animações para testes mais estáveis
    },
    
    // User agent customizado
    userAgent: 'TSiJUKEBOX-E2E-Tests/1.0',
  },
  
  // Projetos (diferentes configurações de browser/dispositivo)
  projects: [
    // ========================================
    // DESKTOP BROWSERS
    // ========================================
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Viewport padrão para desktop
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // ========================================
    // KIOSK MODE (Modo Quiosque)
    // ========================================
    {
      name: 'kiosk-mode',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1080, height: 1920 }, // Vertical
        isMobile: false,
        hasTouch: true, // Suporte a touch
      },
    },
    
    // ========================================
    // MOBILE DEVICES
    // ========================================
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },
    
    // ========================================
    // TABLET
    // ========================================
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
      },
    },
    
    // ========================================
    // ACCESSIBILITY TESTING
    // ========================================
    {
      name: 'a11y-chromium',
      testMatch: /.*a11y.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Forçar modo de alto contraste
        colorScheme: 'dark',
      },
    },
    
    // ========================================
    // PERFORMANCE TESTING
    // ========================================
    {
      name: 'perf-chromium',
      testMatch: /.*perf.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Desabilitar cache para testes de performance
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },
  ],
  
  // Servidor de desenvolvimento
  webServer: {
    // Comando para iniciar o servidor
    command: 'npm run dev',
    
    // URL para verificar se o servidor está pronto
    url: 'http://localhost:5173',
    
    // Reusar servidor existente (não reiniciar se já estiver rodando)
    reuseExistingServer: !process.env.CI,
    
    // Timeout para o servidor iniciar (2 minutos)
    timeout: 120000,
    
    // Variáveis de ambiente para o servidor
    env: {
      NODE_ENV: 'test',
    },
  },
  
  // Diretórios de output
  outputDir: 'test-results',
  
  // Padrão de arquivos de teste
  testMatch: '**/*.spec.ts',
  
  // Ignorar arquivos
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],
  
  // Metadados para os testes
  metadata: {
    project: 'TSiJUKEBOX',
    version: '4.2.0',
    environment: process.env.CI ? 'CI' : 'Local',
  },
});
