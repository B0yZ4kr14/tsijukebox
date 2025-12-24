/**
 * @fileoverview Testes Críticos para Edge Function spotify-auth
 * @description 5 cenários de teste mais críticos para autenticação Spotify
 * @version 1.0.0
 * @author Manus AI
 * 
 * Cenários Críticos:
 * 1. Fluxo completo de autenticação OAuth
 * 2. Refresh de token expirado
 * 3. Validação de token inválido
 * 4. Tratamento de rate limiting
 * 5. Revogação de acesso e re-autenticação
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO E MOCKS
// ============================================================================

// Mock do fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Configuração do cliente Supabase para testes
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key';

// Dados de teste
const TEST_USER_ID = 'test-user-123';
const TEST_CLIENT_ID = 'test-spotify-client-id';
const TEST_CLIENT_SECRET = 'test-spotify-client-secret';
const TEST_REDIRECT_URI = 'http://localhost:3000/callback';

// Tokens de teste
const MOCK_TOKENS = {
  access_token: 'BQC_mock_access_token_123456789',
  refresh_token: 'AQC_mock_refresh_token_987654321',
  token_type: 'Bearer',
  expires_in: 3600,
  scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
};

// Usuário Spotify de teste
const MOCK_SPOTIFY_USER = {
  id: 'spotify_user_123',
  display_name: 'Test User',
  email: 'test@spotify.com',
  country: 'BR',
  product: 'premium',
  images: [{ url: 'https://example.com/avatar.jpg', height: 300, width: 300 }]
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Cria um cliente Supabase para testes
 */
function createTestClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Simula resposta bem-sucedida do Spotify
 */
function mockSpotifySuccess(data: any, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers({ 'Content-Type': 'application/json' })
  });
}

/**
 * Simula erro do Spotify
 */
function mockSpotifyError(error: string, status = 400, description = '') {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ 
      error, 
      error_description: description 
    }),
    headers: new Headers({ 'Content-Type': 'application/json' })
  });
}

/**
 * Simula rate limiting do Spotify
 */
function mockSpotifyRateLimit(retryAfter = 60) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 429,
    json: () => Promise.resolve({ error: 'rate_limited' }),
    headers: new Headers({ 
      'Content-Type': 'application/json',
      'Retry-After': retryAfter.toString()
    })
  });
}

/**
 * Limpa todos os mocks
 */
function resetMocks() {
  mockFetch.mockReset();
}

// ============================================================================
// CENÁRIO CRÍTICO 1: FLUXO COMPLETO DE AUTENTICAÇÃO OAUTH
// ============================================================================

describe('Cenário Crítico 1: Fluxo Completo de Autenticação OAuth', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createTestClient();
  });

  beforeEach(() => {
    resetMocks();
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('1.1 Geração de URL de Autorização', () => {
    it('deve gerar URL de autorização válida com todos os parâmetros', async () => {
      // Arrange
      const expectedScopes = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
        'user-library-read'
      ];

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_auth_url',
          userId: TEST_USER_ID,
          scopes: expectedScopes
        }
      });

      // Assert
      expect(response.error).toBeNull();
      expect(response.data).toBeDefined();
      expect(response.data.url).toContain('https://accounts.spotify.com/authorize');
      expect(response.data.url).toContain('client_id=');
      expect(response.data.url).toContain('response_type=code');
      expect(response.data.url).toContain('redirect_uri=');
      expect(response.data.url).toContain('scope=');
      expect(response.data.url).toContain('state=');
      
      // Verificar que o state contém o userId para segurança
      const urlParams = new URLSearchParams(response.data.url.split('?')[1]);
      const state = urlParams.get('state');
      expect(state).toBeDefined();
      expect(state?.length).toBeGreaterThan(10); // State deve ser suficientemente longo
    });

    it('deve incluir PKCE code_challenge para segurança adicional', async () => {
      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_auth_url',
          userId: TEST_USER_ID,
          usePKCE: true
        }
      });

      // Assert
      expect(response.data.url).toContain('code_challenge=');
      expect(response.data.url).toContain('code_challenge_method=S256');
      expect(response.data.codeVerifier).toBeDefined();
    });
  });

  describe('1.2 Troca de Código por Tokens', () => {
    it('deve trocar código de autorização por tokens válidos', async () => {
      // Arrange
      const authCode = 'AQC_valid_auth_code_123';
      
      // Mock da resposta do Spotify
      mockSpotifySuccess(MOCK_TOKENS);
      mockSpotifySuccess(MOCK_SPOTIFY_USER); // Para buscar dados do usuário

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: authCode,
          userId: TEST_USER_ID,
          redirectUri: TEST_REDIRECT_URI
        }
      });

      // Assert
      expect(response.error).toBeNull();
      expect(response.data.success).toBe(true);
      expect(response.data.tokens).toBeDefined();
      expect(response.data.tokens.access_token).toBeDefined();
      expect(response.data.tokens.refresh_token).toBeDefined();
      expect(response.data.tokens.expires_in).toBe(3600);
      expect(response.data.user).toBeDefined();
      expect(response.data.user.id).toBe(MOCK_SPOTIFY_USER.id);
    });

    it('deve armazenar tokens no banco de dados após troca bem-sucedida', async () => {
      // Arrange
      const authCode = 'AQC_valid_auth_code_456';
      mockSpotifySuccess(MOCK_TOKENS);
      mockSpotifySuccess(MOCK_SPOTIFY_USER);

      // Act
      await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: authCode,
          userId: TEST_USER_ID
        }
      });

      // Assert - Verificar que tokens foram salvos
      const { data: storedTokens } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      expect(storedTokens).not.toBeNull();
      expect(storedTokens?.access_token).toBeDefined();
      expect(storedTokens?.refresh_token).toBeDefined();
      expect(new Date(storedTokens?.expires_at).getTime()).toBeGreaterThan(Date.now());
    });

    it('deve rejeitar código de autorização inválido', async () => {
      // Arrange
      const invalidCode = 'invalid_code';
      mockSpotifyError('invalid_grant', 400, 'Authorization code expired');

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: invalidCode,
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.error).toBeDefined();
      expect(response.error?.message).toContain('invalid');
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 2: REFRESH DE TOKEN EXPIRADO
// ============================================================================

describe('Cenário Crítico 2: Refresh de Token Expirado', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createTestClient();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe('2.1 Detecção de Token Expirado', () => {
    it('deve detectar token expirado e iniciar refresh automaticamente', async () => {
      // Arrange - Criar token expirado no banco
      const expiredToken = {
        user_id: TEST_USER_ID,
        access_token: 'expired_access_token',
        refresh_token: MOCK_TOKENS.refresh_token,
        expires_at: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
      };

      await supabase
        .from('spotify_tokens')
        .upsert(expiredToken);

      // Mock do refresh bem-sucedido
      mockSpotifySuccess({
        ...MOCK_TOKENS,
        access_token: 'new_access_token_after_refresh'
      });

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_valid_token',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.error).toBeNull();
      expect(response.data.access_token).toBe('new_access_token_after_refresh');
      expect(response.data.refreshed).toBe(true);
    });

    it('deve atualizar expires_at após refresh bem-sucedido', async () => {
      // Arrange
      const expiredToken = {
        user_id: TEST_USER_ID,
        access_token: 'old_token',
        refresh_token: MOCK_TOKENS.refresh_token,
        expires_at: new Date(Date.now() - 1000).toISOString()
      };

      await supabase.from('spotify_tokens').upsert(expiredToken);

      mockSpotifySuccess({
        ...MOCK_TOKENS,
        access_token: 'refreshed_token'
      });

      // Act
      await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_valid_token',
          userId: TEST_USER_ID
        }
      });

      // Assert
      const { data: updatedToken } = await supabase
        .from('spotify_tokens')
        .select('expires_at')
        .eq('user_id', TEST_USER_ID)
        .single();

      const expiresAt = new Date(updatedToken?.expires_at).getTime();
      const expectedMinExpiry = Date.now() + (3500 * 1000); // ~1 hora no futuro
      
      expect(expiresAt).toBeGreaterThan(expectedMinExpiry);
    });
  });

  describe('2.2 Tratamento de Refresh Token Inválido', () => {
    it('deve solicitar re-autenticação quando refresh token é inválido', async () => {
      // Arrange
      const tokenWithInvalidRefresh = {
        user_id: TEST_USER_ID,
        access_token: 'expired_token',
        refresh_token: 'invalid_refresh_token',
        expires_at: new Date(Date.now() - 1000).toISOString()
      };

      await supabase.from('spotify_tokens').upsert(tokenWithInvalidRefresh);

      mockSpotifyError('invalid_grant', 400, 'Refresh token revoked');

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_valid_token',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.data.requiresReauth).toBe(true);
      expect(response.data.error).toContain('re-authenticate');
    });

    it('deve limpar tokens inválidos do banco de dados', async () => {
      // Arrange
      await supabase.from('spotify_tokens').upsert({
        user_id: TEST_USER_ID,
        access_token: 'bad_token',
        refresh_token: 'bad_refresh',
        expires_at: new Date(Date.now() - 1000).toISOString()
      });

      mockSpotifyError('invalid_grant', 400);

      // Act
      await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_valid_token',
          userId: TEST_USER_ID
        }
      });

      // Assert
      const { data: tokens } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      expect(tokens).toBeNull();
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 3: VALIDAÇÃO DE TOKEN INVÁLIDO
// ============================================================================

describe('Cenário Crítico 3: Validação de Token Inválido', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createTestClient();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe('3.1 Validação de Formato de Token', () => {
    it('deve rejeitar token com formato inválido', async () => {
      // Arrange
      const invalidTokenFormats = [
        '',
        'invalid',
        'Bearer ',
        'BQ_too_short',
        null,
        undefined
      ];

      for (const invalidToken of invalidTokenFormats) {
        // Act
        const response = await supabase.functions.invoke('spotify-auth', {
          body: {
            action: 'validate_token',
            token: invalidToken
          }
        });

        // Assert
        expect(response.data.valid).toBe(false);
        expect(response.data.error).toContain('invalid format');
      }
    });

    it('deve aceitar token com formato válido', async () => {
      // Arrange
      const validToken = 'BQC_valid_token_with_correct_format_123456789';
      mockSpotifySuccess(MOCK_SPOTIFY_USER);

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'validate_token',
          token: validToken
        }
      });

      // Assert
      expect(response.data.valid).toBe(true);
    });
  });

  describe('3.2 Validação de Token com API do Spotify', () => {
    it('deve validar token fazendo chamada à API do Spotify', async () => {
      // Arrange
      const token = MOCK_TOKENS.access_token;
      mockSpotifySuccess(MOCK_SPOTIFY_USER);

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'validate_token',
          token,
          checkWithApi: true
        }
      });

      // Assert
      expect(response.data.valid).toBe(true);
      expect(response.data.user).toBeDefined();
      expect(response.data.user.id).toBe(MOCK_SPOTIFY_USER.id);
    });

    it('deve detectar token expirado via API', async () => {
      // Arrange
      const expiredToken = 'BQC_expired_token_123';
      mockSpotifyError('invalid_token', 401, 'The access token expired');

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'validate_token',
          token: expiredToken,
          checkWithApi: true
        }
      });

      // Assert
      expect(response.data.valid).toBe(false);
      expect(response.data.expired).toBe(true);
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 4: TRATAMENTO DE RATE LIMITING
// ============================================================================

describe('Cenário Crítico 4: Tratamento de Rate Limiting', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createTestClient();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe('4.1 Detecção de Rate Limit', () => {
    it('deve detectar e reportar rate limiting do Spotify', async () => {
      // Arrange
      mockSpotifyRateLimit(60);

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: 'valid_code',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.error).toBeDefined();
      expect(response.error?.message).toContain('rate');
      expect(response.data?.retryAfter).toBe(60);
    });
  });

  describe('4.2 Retry com Backoff Exponencial', () => {
    it('deve implementar retry com backoff exponencial', async () => {
      // Arrange
      const startTime = Date.now();
      
      // Primeiro: rate limit, segundo: rate limit, terceiro: sucesso
      mockSpotifyRateLimit(1);
      mockSpotifyRateLimit(2);
      mockSpotifySuccess(MOCK_TOKENS);
      mockSpotifySuccess(MOCK_SPOTIFY_USER);

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: 'valid_code',
          userId: TEST_USER_ID,
          enableRetry: true,
          maxRetries: 3
        }
      });

      const elapsed = Date.now() - startTime;

      // Assert
      expect(response.error).toBeNull();
      expect(response.data.success).toBe(true);
      expect(response.data.retryCount).toBe(2);
      expect(elapsed).toBeGreaterThan(2000); // Pelo menos 2 segundos de backoff
    });

    it('deve falhar após exceder máximo de retries', async () => {
      // Arrange
      // Todos os requests retornam rate limit
      for (let i = 0; i < 5; i++) {
        mockSpotifyRateLimit(1);
      }

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: 'valid_code',
          userId: TEST_USER_ID,
          enableRetry: true,
          maxRetries: 3
        }
      });

      // Assert
      expect(response.error).toBeDefined();
      expect(response.error?.message).toContain('max retries');
    });
  });

  describe('4.3 Respeito ao Header Retry-After', () => {
    it('deve respeitar o header Retry-After do Spotify', async () => {
      // Arrange
      const retryAfterSeconds = 30;
      mockSpotifyRateLimit(retryAfterSeconds);

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: 'valid_code',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.data?.retryAfter).toBe(retryAfterSeconds);
      expect(response.data?.retryAt).toBeDefined();
      
      const retryAt = new Date(response.data?.retryAt).getTime();
      const expectedRetryAt = Date.now() + (retryAfterSeconds * 1000);
      
      // Permitir 1 segundo de margem
      expect(Math.abs(retryAt - expectedRetryAt)).toBeLessThan(1000);
    });
  });
});

// ============================================================================
// CENÁRIO CRÍTICO 5: REVOGAÇÃO DE ACESSO E RE-AUTENTICAÇÃO
// ============================================================================

describe('Cenário Crítico 5: Revogação de Acesso e Re-autenticação', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createTestClient();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe('5.1 Detecção de Acesso Revogado', () => {
    it('deve detectar quando usuário revogou acesso no Spotify', async () => {
      // Arrange
      await supabase.from('spotify_tokens').upsert({
        user_id: TEST_USER_ID,
        access_token: 'revoked_token',
        refresh_token: 'revoked_refresh',
        expires_at: new Date(Date.now() + 3600000).toISOString()
      });

      // Spotify retorna 401 para token revogado
      mockSpotifyError('invalid_token', 401, 'Token has been revoked');

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_current_user',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.data.requiresReauth).toBe(true);
      expect(response.data.reason).toContain('revoked');
    });

    it('deve limpar dados do usuário após revogação', async () => {
      // Arrange
      await supabase.from('spotify_tokens').upsert({
        user_id: TEST_USER_ID,
        access_token: 'token_to_revoke',
        refresh_token: 'refresh_to_revoke',
        expires_at: new Date(Date.now() + 3600000).toISOString()
      });

      mockSpotifyError('invalid_token', 401);

      // Act
      await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_current_user',
          userId: TEST_USER_ID
        }
      });

      // Assert
      const { data: tokens } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      expect(tokens).toBeNull();
    });
  });

  describe('5.2 Fluxo de Re-autenticação', () => {
    it('deve fornecer URL de re-autenticação após revogação', async () => {
      // Arrange
      mockSpotifyError('invalid_token', 401);

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'get_current_user',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.data.requiresReauth).toBe(true);
      expect(response.data.reauthUrl).toBeDefined();
      expect(response.data.reauthUrl).toContain('accounts.spotify.com/authorize');
    });

    it('deve manter preferências do usuário após re-autenticação', async () => {
      // Arrange - Salvar preferências
      const userPreferences = {
        user_id: TEST_USER_ID,
        preferred_quality: 'high',
        auto_play: true,
        crossfade: 5
      };

      await supabase.from('user_spotify_preferences').upsert(userPreferences);

      // Simular revogação e re-autenticação
      mockSpotifyError('invalid_token', 401);
      
      await supabase.functions.invoke('spotify-auth', {
        body: { action: 'get_current_user', userId: TEST_USER_ID }
      });

      // Re-autenticar
      mockSpotifySuccess(MOCK_TOKENS);
      mockSpotifySuccess(MOCK_SPOTIFY_USER);

      await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'exchange_code',
          code: 'new_auth_code',
          userId: TEST_USER_ID
        }
      });

      // Assert - Preferências devem estar intactas
      const { data: savedPrefs } = await supabase
        .from('user_spotify_preferences')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      expect(savedPrefs?.preferred_quality).toBe('high');
      expect(savedPrefs?.auto_play).toBe(true);
      expect(savedPrefs?.crossfade).toBe(5);
    });
  });

  describe('5.3 Logout Explícito', () => {
    it('deve realizar logout e limpar todos os dados de sessão', async () => {
      // Arrange
      await supabase.from('spotify_tokens').upsert({
        user_id: TEST_USER_ID,
        access_token: 'active_token',
        refresh_token: 'active_refresh',
        expires_at: new Date(Date.now() + 3600000).toISOString()
      });

      // Act
      const response = await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'logout',
          userId: TEST_USER_ID
        }
      });

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('logged out');

      const { data: tokens } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      expect(tokens).toBeNull();
    });

    it('deve emitir evento de logout para outros componentes', async () => {
      // Arrange
      const logoutEvents: any[] = [];
      
      const channel = supabase
        .channel('spotify-auth-events')
        .on('broadcast', { event: 'logout' }, (payload) => {
          logoutEvents.push(payload);
        })
        .subscribe();

      // Act
      await supabase.functions.invoke('spotify-auth', {
        body: {
          action: 'logout',
          userId: TEST_USER_ID,
          broadcastLogout: true
        }
      });

      // Aguardar evento
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(logoutEvents.length).toBeGreaterThan(0);
      expect(logoutEvents[0].payload.userId).toBe(TEST_USER_ID);

      // Cleanup
      supabase.removeChannel(channel);
    });
  });
});

// ============================================================================
// TESTES DE INTEGRAÇÃO END-TO-END
// ============================================================================

describe('Integração E2E: Fluxo Completo de Autenticação', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createTestClient();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('deve completar fluxo completo: auth -> uso -> refresh -> logout', async () => {
    // PASSO 1: Obter URL de autorização
    const authUrlResponse = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'get_auth_url', userId: TEST_USER_ID }
    });
    expect(authUrlResponse.data.url).toBeDefined();

    // PASSO 2: Trocar código por tokens
    mockSpotifySuccess(MOCK_TOKENS);
    mockSpotifySuccess(MOCK_SPOTIFY_USER);

    const exchangeResponse = await supabase.functions.invoke('spotify-auth', {
      body: {
        action: 'exchange_code',
        code: 'valid_code',
        userId: TEST_USER_ID
      }
    });
    expect(exchangeResponse.data.success).toBe(true);

    // PASSO 3: Usar token para operação
    mockSpotifySuccess(MOCK_SPOTIFY_USER);

    const userResponse = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'get_current_user', userId: TEST_USER_ID }
    });
    expect(userResponse.data.user.id).toBe(MOCK_SPOTIFY_USER.id);

    // PASSO 4: Simular expiração e refresh
    await supabase.from('spotify_tokens').update({
      expires_at: new Date(Date.now() - 1000).toISOString()
    }).eq('user_id', TEST_USER_ID);

    mockSpotifySuccess({ ...MOCK_TOKENS, access_token: 'refreshed_token' });

    const refreshedResponse = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'get_valid_token', userId: TEST_USER_ID }
    });
    expect(refreshedResponse.data.access_token).toBe('refreshed_token');

    // PASSO 5: Logout
    const logoutResponse = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'logout', userId: TEST_USER_ID }
    });
    expect(logoutResponse.data.success).toBe(true);

    // VERIFICAÇÃO FINAL: Tokens removidos
    const { data: finalTokens } = await supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .single();
    expect(finalTokens).toBeNull();
  });
});
