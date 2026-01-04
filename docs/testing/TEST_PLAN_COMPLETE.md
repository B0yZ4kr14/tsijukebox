# 🧪 Plano de Testes Completo - TSiJUKEBOX

> **Versão:** 1.0.0  
> **Data:** 24 de Dezembro de 2024  
> **Autor:** Manus AI  
> **Status:** Aprovado para Implementação

---

## 📋 Sumário Executivo

Este documento apresenta o plano de testes completo para o TSiJUKEBOX, cobrindo **31 Edge Functions** e **10 Contextos React**. O plano define estratégias de teste de unidade e integração, mocks, fixtures e métricas de cobertura.

### Objetivos

1. Garantir **80%+ de cobertura** de código
2. Validar todas as **Edge Functions** em isolamento e integração
3. Testar todos os **Contextos React** com cenários reais
4. Estabelecer **pipeline de CI/CD** com testes automatizados
5. Documentar **mocks e fixtures** reutilizáveis

---

## 📊 Visão Geral dos Testes

### Estatísticas do Plano

| Categoria | Quantidade | Cenários de Teste |
|-----------|------------|-------------------|
| Edge Functions | 31 | 186 |
| Contextos React | 10 | 60 |
| Hooks de Auth | 3 | 18 |
| **Total** | **44** | **264** |

### Distribuição por Tipo de Teste

| Tipo | Quantidade | % do Total |
|------|------------|------------|
| Testes de Unidade | 150 | 57% |
| Testes de Integração | 80 | 30% |
| Testes E2E | 34 | 13% |
| **Total** | **264** | **100%** |

---

## 🔌 Parte 1: Testes de Edge Functions

### 1.1 Categorização das Edge Functions

#### Categoria A: Autenticação (Prioridade Alta)

| Função | Cenários | Cobertura Alvo |
|--------|----------|----------------|
| `spotify-auth` | 8 | 90% |
| `youtube-music-auth` | 8 | 90% |
| `check-api-key` | 5 | 85% |
| `save-api-key` | 5 | 85% |
| `test-api-key` | 4 | 85% |

#### Categoria B: IA e Automação (Prioridade Alta)

| Função | Cenários | Cobertura Alvo |
|--------|----------|----------------|
| `ai-gateway` | 10 | 85% |
| `manus-automation` | 8 | 80% |
| `perplexity-research` | 6 | 80% |
| `claude-refactor-opus` | 6 | 80% |
| `manus-search` | 5 | 80% |

#### Categoria C: GitHub e Sincronização (Prioridade Média)

| Função | Cenários | Cobertura Alvo |
|--------|----------|----------------|
| `github-repo` | 8 | 85% |
| `auto-sync-repository` | 6 | 80% |
| `github-sync-export` | 6 | 80% |
| `full-repo-sync` | 6 | 80% |
| `auto-sync-trigger` | 5 | 80% |
| `file-change-webhook` | 5 | 80% |

#### Categoria D: Monitoramento (Prioridade Média)

| Função | Cenários | Cobertura Alvo |
|--------|----------|----------------|
| `health-monitor-ws` | 6 | 85% |
| `otel-exporter` | 5 | 80% |
| `installer-metrics` | 5 | 80% |
| `alert-notifications` | 6 | 85% |

#### Categoria E: Utilitários (Prioridade Normal)

| Função | Cenários | Cobertura Alvo |
|--------|----------|----------------|
| `lyrics-search` | 6 | 80% |
| `track-playback` | 5 | 80% |
| `screenshot-service` | 4 | 75% |
| `analyze-jam` | 5 | 80% |
| `kiosk-webhook` | 4 | 75% |
| `read-project-files` | 4 | 75% |

#### Categoria F: Refatoração (Prioridade Normal)

| Função | Cenários | Cobertura Alvo |
|--------|----------|----------------|
| `code-refactor` | 5 | 80% |
| `code-scan` | 5 | 80% |
| `doc-orchestrator` | 5 | 80% |
| `fullstack-refactor` | 5 | 80% |
| `refactor-docs` | 4 | 75% |

---

### 1.2 Testes de Unidade - Edge Functions

#### 1.2.1 spotify-auth

```typescript
// Arquivo: src/test/edge-functions/__tests__/spotify-auth.unit.test.ts

describe('spotify-auth Unit Tests', () => {
  describe('Token Generation', () => {
    it('should generate valid authorization URL', async () => {
      // Arrange
      const mockConfig = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['user-read-playback-state', 'user-modify-playback-state']
      };
      
      // Act
      const authUrl = generateAuthorizationUrl(mockConfig);
      
      // Assert
      expect(authUrl).toContain('https://accounts.spotify.com/authorize');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('scope=user-read-playback-state');
    });

    it('should exchange code for tokens', async () => {
      // Arrange
      const mockCode = 'valid-auth-code';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600
        })
      });
      
      // Act
      const tokens = await exchangeCodeForTokens(mockCode);
      
      // Assert
      expect(tokens.access_token).toBe('mock-access-token');
      expect(tokens.refresh_token).toBe('mock-refresh-token');
    });

    it('should refresh expired tokens', async () => {
      // Arrange
      const expiredToken = {
        access_token: 'expired-token',
        refresh_token: 'valid-refresh-token',
        expires_at: Date.now() - 1000
      };
      
      // Act
      const newTokens = await refreshAccessToken(expiredToken.refresh_token);
      
      // Assert
      expect(newTokens.access_token).not.toBe(expiredToken.access_token);
    });

    it('should handle invalid authorization code', async () => {
      // Arrange
      const invalidCode = 'invalid-code';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'invalid_grant' })
      });
      
      // Act & Assert
      await expect(exchangeCodeForTokens(invalidCode))
        .rejects.toThrow('Invalid authorization code');
    });
  });

  describe('Token Validation', () => {
    it('should validate token format', () => {
      const validToken = 'BQC...valid-token';
      expect(isValidTokenFormat(validToken)).toBe(true);
    });

    it('should reject malformed tokens', () => {
      const invalidToken = '';
      expect(isValidTokenFormat(invalidToken)).toBe(false);
    });

    it('should check token expiration', () => {
      const expiredToken = { expires_at: Date.now() - 1000 };
      expect(isTokenExpired(expiredToken)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(exchangeCodeForTokens('code'))
        .rejects.toThrow('Network error');
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { 'Retry-After': '60' }
      });
      
      await expect(exchangeCodeForTokens('code'))
        .rejects.toThrow('Rate limited');
    });
  });
});
```

#### 1.2.2 ai-gateway

```typescript
// Arquivo: src/test/edge-functions/__tests__/ai-gateway.unit.test.ts

describe('ai-gateway Unit Tests', () => {
  describe('Provider Selection', () => {
    it('should select OpenAI for GPT models', () => {
      const provider = selectProvider('gpt-4');
      expect(provider).toBe('openai');
    });

    it('should select Anthropic for Claude models', () => {
      const provider = selectProvider('claude-3-opus');
      expect(provider).toBe('anthropic');
    });

    it('should select Google for Gemini models', () => {
      const provider = selectProvider('gemini-pro');
      expect(provider).toBe('google');
    });

    it('should fallback to default provider', () => {
      const provider = selectProvider('unknown-model');
      expect(provider).toBe('openai');
    });
  });

  describe('Request Transformation', () => {
    it('should transform OpenAI format to Anthropic', () => {
      const openaiRequest = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      const anthropicRequest = transformToAnthropic(openaiRequest);
      
      expect(anthropicRequest.model).toBe('claude-3-opus-20240229');
      expect(anthropicRequest.messages[0].role).toBe('user');
    });

    it('should preserve system messages', () => {
      const request = {
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' }
        ]
      };
      
      const transformed = transformToAnthropic(request);
      expect(transformed.system).toBe('You are helpful');
    });
  });

  describe('Response Normalization', () => {
    it('should normalize OpenAI response', () => {
      const openaiResponse = {
        choices: [{ message: { content: 'Hello!' } }],
        usage: { total_tokens: 100 }
      };
      
      const normalized = normalizeResponse(openaiResponse, 'openai');
      
      expect(normalized.content).toBe('Hello!');
      expect(normalized.tokens).toBe(100);
    });

    it('should normalize Anthropic response', () => {
      const anthropicResponse = {
        content: [{ text: 'Hello!' }],
        usage: { input_tokens: 50, output_tokens: 50 }
      };
      
      const normalized = normalizeResponse(anthropicResponse, 'anthropic');
      
      expect(normalized.content).toBe('Hello!');
      expect(normalized.tokens).toBe(100);
    });
  });

  describe('Rate Limiting', () => {
    it('should track request counts per provider', () => {
      const limiter = new RateLimiter();
      
      limiter.recordRequest('openai');
      limiter.recordRequest('openai');
      
      expect(limiter.getCount('openai')).toBe(2);
    });

    it('should block requests when limit exceeded', () => {
      const limiter = new RateLimiter({ maxRequests: 2 });
      
      limiter.recordRequest('openai');
      limiter.recordRequest('openai');
      
      expect(limiter.canMakeRequest('openai')).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache identical requests', async () => {
      const cache = new ResponseCache();
      const request = { model: 'gpt-4', messages: [{ content: 'Hello' }] };
      const response = { content: 'Hi!' };
      
      cache.set(request, response);
      
      expect(cache.get(request)).toEqual(response);
    });

    it('should expire cached responses', async () => {
      const cache = new ResponseCache({ ttl: 100 });
      const request = { model: 'gpt-4', messages: [{ content: 'Hello' }] };
      
      cache.set(request, { content: 'Hi!' });
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get(request)).toBeNull();
    });
  });
});
```

#### 1.2.3 github-repo

```typescript
// Arquivo: src/test/edge-functions/__tests__/github-repo.unit.test.ts

describe('github-repo Unit Tests', () => {
  describe('Repository Operations', () => {
    it('should parse repository URL correctly', () => {
      const url = 'https://github.com/owner/repo';
      const parsed = parseRepoUrl(url);
      
      expect(parsed.owner).toBe('owner');
      expect(parsed.repo).toBe('repo');
    });

    it('should handle SSH URLs', () => {
      const url = 'git@github.com:owner/repo.git';
      const parsed = parseRepoUrl(url);
      
      expect(parsed.owner).toBe('owner');
      expect(parsed.repo).toBe('repo');
    });

    it('should validate repository existence', async () => {
      mockOctokit.repos.get.mockResolvedValueOnce({
        data: { id: 123, name: 'repo' }
      });
      
      const exists = await checkRepoExists('owner', 'repo');
      expect(exists).toBe(true);
    });

    it('should handle non-existent repositories', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 404
      });
      
      const exists = await checkRepoExists('owner', 'nonexistent');
      expect(exists).toBe(false);
    });
  });

  describe('File Operations', () => {
    it('should read file content', async () => {
      mockOctokit.repos.getContent.mockResolvedValueOnce({
        data: {
          content: Buffer.from('Hello World').toString('base64'),
          encoding: 'base64'
        }
      });
      
      const content = await getFileContent('owner', 'repo', 'README.md');
      expect(content).toBe('Hello World');
    });

    it('should create new file', async () => {
      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValueOnce({
        data: { commit: { sha: 'abc123' } }
      });
      
      const result = await createFile('owner', 'repo', 'new-file.txt', 'content');
      expect(result.sha).toBe('abc123');
    });

    it('should update existing file', async () => {
      mockOctokit.repos.getContent.mockResolvedValueOnce({
        data: { sha: 'old-sha' }
      });
      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValueOnce({
        data: { commit: { sha: 'new-sha' } }
      });
      
      const result = await updateFile('owner', 'repo', 'file.txt', 'new content');
      expect(result.sha).toBe('new-sha');
    });
  });

  describe('Branch Operations', () => {
    it('should list branches', async () => {
      mockOctokit.repos.listBranches.mockResolvedValueOnce({
        data: [
          { name: 'main' },
          { name: 'develop' }
        ]
      });
      
      const branches = await listBranches('owner', 'repo');
      expect(branches).toHaveLength(2);
      expect(branches[0].name).toBe('main');
    });

    it('should create new branch', async () => {
      mockOctokit.git.getRef.mockResolvedValueOnce({
        data: { object: { sha: 'base-sha' } }
      });
      mockOctokit.git.createRef.mockResolvedValueOnce({
        data: { ref: 'refs/heads/feature-branch' }
      });
      
      const branch = await createBranch('owner', 'repo', 'feature-branch', 'main');
      expect(branch.ref).toContain('feature-branch');
    });
  });
});
```

---

### 1.3 Testes de Integração - Edge Functions

#### 1.3.1 Fluxo Completo de Autenticação Spotify

```typescript
// Arquivo: src/test/edge-functions/__tests__/spotify-auth.integration.test.ts

describe('spotify-auth Integration Tests', () => {
  let supabaseClient: SupabaseClient;
  let testUserId: string;

  beforeAll(async () => {
    supabaseClient = createTestClient();
    testUserId = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser(testUserId);
  });

  describe('Complete OAuth Flow', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Get authorization URL
      const authResponse = await supabaseClient.functions.invoke('spotify-auth', {
        body: { action: 'get_auth_url', userId: testUserId }
      });
      
      expect(authResponse.data.url).toContain('accounts.spotify.com');
      
      // Step 2: Simulate callback with mock code
      const callbackResponse = await supabaseClient.functions.invoke('spotify-auth', {
        body: { 
          action: 'exchange_code',
          code: 'mock-auth-code',
          userId: testUserId
        }
      });
      
      expect(callbackResponse.data.success).toBe(true);
      expect(callbackResponse.data.tokens.access_token).toBeDefined();
      
      // Step 3: Verify tokens are stored
      const { data: storedTokens } = await supabaseClient
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', testUserId)
        .single();
      
      expect(storedTokens).not.toBeNull();
      expect(storedTokens.access_token).toBeDefined();
    });

    it('should refresh expired tokens automatically', async () => {
      // Setup: Create expired token
      await supabaseClient
        .from('spotify_tokens')
        .upsert({
          user_id: testUserId,
          access_token: 'expired-token',
          refresh_token: 'valid-refresh-token',
          expires_at: new Date(Date.now() - 3600000).toISOString()
        });
      
      // Act: Make API call that requires valid token
      const response = await supabaseClient.functions.invoke('spotify-auth', {
        body: { action: 'get_current_user', userId: testUserId }
      });
      
      // Assert: Token was refreshed
      const { data: newTokens } = await supabaseClient
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', testUserId)
        .single();
      
      expect(new Date(newTokens.expires_at).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid refresh token', async () => {
      await supabaseClient
        .from('spotify_tokens')
        .upsert({
          user_id: testUserId,
          access_token: 'expired-token',
          refresh_token: 'invalid-refresh-token',
          expires_at: new Date(Date.now() - 3600000).toISOString()
        });
      
      const response = await supabaseClient.functions.invoke('spotify-auth', {
        body: { action: 'get_current_user', userId: testUserId }
      });
      
      expect(response.error).toBeDefined();
      expect(response.error.message).toContain('re-authenticate');
    });

    it('should handle revoked access', async () => {
      // Mock Spotify returning 401 for revoked access
      const response = await supabaseClient.functions.invoke('spotify-auth', {
        body: { 
          action: 'get_current_user',
          userId: testUserId,
          _test_force_401: true
        }
      });
      
      expect(response.data.requiresReauth).toBe(true);
    });
  });
});
```

#### 1.3.2 Fluxo de AI Gateway

```typescript
// Arquivo: src/test/edge-functions/__tests__/ai-gateway.integration.test.ts

describe('ai-gateway Integration Tests', () => {
  describe('Multi-Provider Routing', () => {
    it('should route to OpenAI for GPT models', async () => {
      const response = await supabaseClient.functions.invoke('ai-gateway', {
        body: {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Say hello' }]
        }
      });
      
      expect(response.data.provider).toBe('openai');
      expect(response.data.content).toBeDefined();
    });

    it('should route to Anthropic for Claude models', async () => {
      const response = await supabaseClient.functions.invoke('ai-gateway', {
        body: {
          model: 'claude-3-opus',
          messages: [{ role: 'user', content: 'Say hello' }]
        }
      });
      
      expect(response.data.provider).toBe('anthropic');
      expect(response.data.content).toBeDefined();
    });

    it('should fallback on provider failure', async () => {
      // Force OpenAI to fail
      const response = await supabaseClient.functions.invoke('ai-gateway', {
        body: {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Say hello' }],
          _test_force_openai_fail: true
        }
      });
      
      // Should fallback to Anthropic
      expect(response.data.provider).toBe('anthropic');
      expect(response.data.fallback).toBe(true);
    });
  });

  describe('Streaming Responses', () => {
    it('should stream responses correctly', async () => {
      const chunks: string[] = [];
      
      const response = await supabaseClient.functions.invoke('ai-gateway', {
        body: {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Count to 5' }],
          stream: true
        }
      });
      
      // Process stream
      const reader = response.data.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(new TextDecoder().decode(value));
      }
      
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks.join('')).toContain('1');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(10).fill(null).map(() =>
        supabaseClient.functions.invoke('ai-gateway', {
          body: {
            model: 'gpt-4',
            messages: [{ role: 'user', content: 'Hello' }]
          }
        })
      );
      
      const results = await Promise.all(requests);
      const rateLimited = results.filter(r => r.error?.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 🌐 Parte 2: Testes de Contextos React

### 2.1 Categorização dos Contextos

| Contexto | Prioridade | Cenários | Cobertura Alvo |
|----------|------------|----------|----------------|
| `UserContext` | Alta | 8 | 90% |
| `SpotifyContext` | Alta | 8 | 90% |
| `YouTubeMusicContext` | Alta | 8 | 90% |
| `AppSettingsContext` | Alta | 6 | 85% |
| `ThemeContext` | Média | 5 | 85% |
| `LayoutContext` | Média | 5 | 80% |
| `PlayerContext` | Alta | 8 | 90% |
| `QueueContext` | Alta | 6 | 85% |
| `JamContext` | Média | 6 | 80% |
| `SettingsContext` | Média | 5 | 80% |

---

### 2.2 Testes de Contextos

#### 2.2.1 SpotifyContext

```typescript
// Arquivo: src/contexts/__tests__/SpotifyContext.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { SpotifyProvider, useSpotify } from '../SpotifyContext';

describe('SpotifyContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SpotifyProvider>{children}</SpotifyProvider>
  );

  describe('Authentication State', () => {
    it('should start with unauthenticated state', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should update state after successful login', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.login();
      });
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).not.toBeNull();
      });
    });

    it('should clear state after logout', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      // Login first
      await act(async () => {
        await result.current.login();
      });
      
      // Then logout
      await act(async () => {
        await result.current.logout();
      });
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Playback Control', () => {
    beforeEach(async () => {
      // Setup authenticated state
      mockSpotifyAuth();
    });

    it('should play a track', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.playTrack('spotify:track:123');
      });
      
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentTrack?.id).toBe('123');
    });

    it('should pause playback', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.playTrack('spotify:track:123');
        await result.current.pause();
      });
      
      expect(result.current.isPlaying).toBe(false);
    });

    it('should skip to next track', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.playTrack('spotify:track:123');
        await result.current.next();
      });
      
      expect(result.current.currentTrack?.id).not.toBe('123');
    });

    it('should update volume', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.setVolume(50);
      });
      
      expect(result.current.volume).toBe(50);
    });
  });

  describe('Search', () => {
    it('should search for tracks', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.search('test query');
      });
      
      expect(result.current.searchResults.tracks.length).toBeGreaterThan(0);
    });

    it('should handle empty search results', async () => {
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.search('xyznonexistent123');
      });
      
      expect(result.current.searchResults.tracks).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockSpotifyApiError();
      
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.playTrack('invalid:uri');
      });
      
      expect(result.current.error).toBeDefined();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle network errors', async () => {
      mockNetworkError();
      
      const { result } = renderHook(() => useSpotify(), { wrapper });
      
      await act(async () => {
        await result.current.search('test');
      });
      
      expect(result.current.error?.message).toContain('network');
    });
  });
});
```

#### 2.2.2 JamContext

```typescript
// Arquivo: src/contexts/__tests__/JamContext.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { JamProvider, useJam } from '../JamContext';

describe('JamContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <JamProvider>{children}</JamProvider>
  );

  describe('Session Management', () => {
    it('should create a new jam session', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.createSession('Test Session');
      });
      
      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.currentSession?.name).toBe('Test Session');
      expect(result.current.isHost).toBe(true);
    });

    it('should join an existing session', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.joinSession('session-code-123');
      });
      
      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.isHost).toBe(false);
    });

    it('should leave session', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.createSession('Test');
        await result.current.leaveSession();
      });
      
      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('Queue Management', () => {
    beforeEach(async () => {
      // Create session first
    });

    it('should add track to queue', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.createSession('Test');
        await result.current.addToQueue({
          id: 'track-1',
          name: 'Test Track',
          artist: 'Test Artist'
        });
      });
      
      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].name).toBe('Test Track');
    });

    it('should vote for track', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.createSession('Test');
        await result.current.addToQueue({ id: 'track-1', name: 'Test' });
        await result.current.voteForTrack('track-1');
      });
      
      expect(result.current.queue[0].votes).toBe(1);
    });

    it('should reorder queue by votes', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.createSession('Test');
        await result.current.addToQueue({ id: 'track-1', name: 'Track 1' });
        await result.current.addToQueue({ id: 'track-2', name: 'Track 2' });
        await result.current.voteForTrack('track-2');
        await result.current.voteForTrack('track-2');
      });
      
      expect(result.current.queue[0].id).toBe('track-2');
    });
  });

  describe('Real-time Updates', () => {
    it('should receive participant updates', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.createSession('Test');
      });
      
      // Simulate another user joining
      await act(async () => {
        mockRealtimeEvent('participant_joined', { userId: 'user-2' });
      });
      
      expect(result.current.participants).toHaveLength(2);
    });

    it('should sync queue changes', async () => {
      const { result } = renderHook(() => useJam(), { wrapper });
      
      await act(async () => {
        await result.current.joinSession('session-123');
      });
      
      // Simulate queue update from another user
      await act(async () => {
        mockRealtimeEvent('queue_updated', {
          queue: [{ id: 'track-1', name: 'New Track' }]
        });
      });
      
      expect(result.current.queue).toHaveLength(1);
    });
  });
});
```

---

## 🔧 Parte 3: Configuração de Ambiente de Testes

### 3.1 Estrutura de Diretórios

```
src/
├── test/
│   ├── setup.ts                    # Configuração global
│   ├── mocks/
│   │   ├── supabase.ts            # Mock do Supabase
│   │   ├── spotify-api.ts         # Mock da API do Spotify
│   │   ├── youtube-api.ts         # Mock da API do YouTube
│   │   ├── fetch.ts               # Mock do fetch global
│   │   └── websocket.ts           # Mock de WebSocket
│   ├── fixtures/
│   │   ├── users.ts               # Dados de usuários
│   │   ├── tracks.ts              # Dados de músicas
│   │   ├── playlists.ts           # Dados de playlists
│   │   └── sessions.ts            # Dados de sessões Jam
│   ├── helpers/
│   │   ├── render.tsx             # Wrapper de renderização
│   │   ├── auth.ts                # Helpers de autenticação
│   │   └── wait.ts                # Helpers de espera
│   └── edge-functions/
│       └── __tests__/             # Testes de Edge Functions
├── contexts/
│   └── __tests__/                 # Testes de Contextos
└── hooks/
    └── __tests__/                 # Testes de Hooks
```

### 3.2 Configuração do Vitest

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'supabase/functions/**/*.{test,spec}.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 3.3 Setup Global

```typescript
// src/test/setup.ts

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setupMocks } from './mocks';
import { setupFixtures } from './fixtures';

// Setup global mocks
beforeAll(() => {
  setupMocks();
  setupFixtures();
});

// Reset mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  vi.restoreAllMocks();
});

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-spotify-client-id');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
```

### 3.4 Mocks Principais

```typescript
// src/test/mocks/supabase.ts

import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }),
  functions: {
    invoke: vi.fn(),
  },
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  }),
  removeChannel: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

export function mockSupabaseAuth(user = { id: 'test-user-id', email: 'test@example.com' }) {
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: { user, access_token: 'test-token' } },
    error: null,
  });
}

export function mockSupabaseError(error: string) {
  mockSupabaseClient.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: { message: error } }),
  });
}
```

```typescript
// src/test/mocks/spotify-api.ts

import { vi } from 'vitest';

export const mockSpotifyApi = {
  getMe: vi.fn().mockResolvedValue({
    id: 'spotify-user-id',
    display_name: 'Test User',
    email: 'test@spotify.com',
    images: [{ url: 'https://example.com/avatar.jpg' }],
  }),
  
  search: vi.fn().mockResolvedValue({
    tracks: {
      items: [
        {
          id: 'track-1',
          name: 'Test Track',
          artists: [{ name: 'Test Artist' }],
          album: { name: 'Test Album', images: [{ url: 'https://example.com/cover.jpg' }] },
          duration_ms: 180000,
        },
      ],
    },
  }),
  
  play: vi.fn().mockResolvedValue({}),
  pause: vi.fn().mockResolvedValue({}),
  next: vi.fn().mockResolvedValue({}),
  previous: vi.fn().mockResolvedValue({}),
  setVolume: vi.fn().mockResolvedValue({}),
  seek: vi.fn().mockResolvedValue({}),
  
  getPlaybackState: vi.fn().mockResolvedValue({
    is_playing: false,
    item: null,
    progress_ms: 0,
    device: { volume_percent: 50 },
  }),
};

export function mockSpotifyApiError() {
  mockSpotifyApi.play.mockRejectedValue(new Error('Spotify API Error'));
}

export function mockNetworkError() {
  mockSpotifyApi.search.mockRejectedValue(new Error('Network error'));
}
```

### 3.5 Fixtures

```typescript
// src/test/fixtures/tracks.ts

export const mockTracks = [
  {
    id: 'track-1',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 354000,
    coverUrl: 'https://example.com/covers/bohemian.jpg',
    uri: 'spotify:track:track-1',
  },
  {
    id: 'track-2',
    name: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: 482000,
    coverUrl: 'https://example.com/covers/stairway.jpg',
    uri: 'spotify:track:track-2',
  },
  {
    id: 'track-3',
    name: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: 391000,
    coverUrl: 'https://example.com/covers/hotel.jpg',
    uri: 'spotify:track:track-3',
  },
];

export const mockPlaylists = [
  {
    id: 'playlist-1',
    name: 'Classic Rock',
    description: 'Best classic rock hits',
    tracks: mockTracks,
    owner: { id: 'user-1', display_name: 'Test User' },
    images: [{ url: 'https://example.com/playlists/classic.jpg' }],
  },
];

export const mockSearchResults = {
  tracks: { items: mockTracks },
  artists: { items: [] },
  albums: { items: [] },
  playlists: { items: mockPlaylists },
};
```

```typescript
// src/test/fixtures/users.ts

export const mockUsers = {
  admin: {
    id: 'admin-user-id',
    email: 'admin@example.com',
    username: 'admin',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  regular: {
    id: 'regular-user-id',
    email: 'user@example.com',
    username: 'testuser',
    role: 'user',
    createdAt: '2024-06-01T00:00:00Z',
  },
  guest: {
    id: 'guest-user-id',
    email: null,
    username: 'guest',
    role: 'guest',
    createdAt: '2024-12-01T00:00:00Z',
  },
};

export const mockSpotifyUsers = {
  premium: {
    id: 'spotify-premium-id',
    display_name: 'Premium User',
    email: 'premium@spotify.com',
    product: 'premium',
    country: 'BR',
  },
  free: {
    id: 'spotify-free-id',
    display_name: 'Free User',
    email: 'free@spotify.com',
    product: 'free',
    country: 'BR',
  },
};
```

---

## 📈 Parte 4: Métricas e Cobertura

### 4.1 Metas de Cobertura

| Categoria | Meta | Crítico |
|-----------|------|---------|
| **Edge Functions** | 80% | 90% para auth |
| **Contextos** | 85% | 90% para Player/Spotify |
| **Hooks** | 80% | 85% para auth |
| **Componentes** | 75% | 80% para UI crítica |
| **Global** | 80% | - |

### 4.2 Comandos de Teste

```bash
# Executar todos os testes
npm run test

# Executar com cobertura
npm run test -- --coverage

# Executar testes específicos
npm run test -- --filter="spotify"

# Executar testes de Edge Functions
npm run test -- --filter="edge-functions"

# Executar testes de Contextos
npm run test -- --filter="contexts"

# Executar em modo watch
npm run test -- --watch

# Executar testes E2E
npm run test:e2e
```

### 4.3 CI/CD Pipeline

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## 📋 Parte 5: Cronograma de Implementação

### Fase 1: Semana 1-2 (Infraestrutura)

| Tarefa | Responsável | Status |
|--------|-------------|--------|
| Configurar Vitest | Dev | ⏳ |
| Criar mocks base | Dev | ⏳ |
| Criar fixtures | Dev | ⏳ |
| Setup CI/CD | DevOps | ⏳ |

### Fase 2: Semana 3-4 (Edge Functions)

| Tarefa | Responsável | Status |
|--------|-------------|--------|
| Testes spotify-auth | Dev | ⏳ |
| Testes youtube-music-auth | Dev | ⏳ |
| Testes ai-gateway | Dev | ⏳ |
| Testes github-repo | Dev | ⏳ |

### Fase 3: Semana 5-6 (Contextos)

| Tarefa | Responsável | Status |
|--------|-------------|--------|
| Testes SpotifyContext | Dev | ⏳ |
| Testes JamContext | Dev | ⏳ |
| Testes PlayerContext | Dev | ⏳ |
| Testes AppSettingsContext | Dev | ⏳ |

### Fase 4: Semana 7-8 (Integração e E2E)

| Tarefa | Responsável | Status |
|--------|-------------|--------|
| Testes de integração | Dev | ⏳ |
| Testes E2E | QA | ⏳ |
| Documentação | Dev | ⏳ |
| Review final | Lead | ⏳ |

---

## 📚 Referências

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/functions/unit-test)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Autor:** Manus AI  
**Data:** 24 de Dezembro de 2024  
**Versão:** 1.0.0
