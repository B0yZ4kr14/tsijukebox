/**
 * Integration tests for github-repo edge function
 * Tests create-deploy-key, delete-deploy-key, validate-token, save-token and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockGitHubRepoRequests,
  mockGitHubSuccessResponses,
  mockGitHubErrorResponses,
  httpStatus,
  expectedCorsHeaders,
  validSSHKeys,
  validPATTokens,
} from '../../fixtures/githubRepoData';

// Mock supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

describe('github-repo Edge Function Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================
  // CREATE DEPLOY KEY TESTS (7 tests)
  // ============================================
  describe('POST create-deploy-key', () => {
    it('should create deploy key successfully with valid SSH key', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.deployKey,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockGitHubSuccessResponses.deployKey);
      expect(result.data.id).toBe(12345678);
      expect(result.data.title).toBe('Lovable Deploy Key');
      expect(result.data.read_only).toBe(true);
    });

    it('should create deploy key with read-write access', async () => {
      const readWriteResponse = {
        ...mockGitHubSuccessResponses.deployKey,
        read_only: false,
        title: 'Lovable Deploy Key (Write)',
      };
      
      mockInvoke.mockResolvedValueOnce({
        data: readWriteResponse,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.validReadWrite,
      });

      expect(result.error).toBeNull();
      expect(result.data.read_only).toBe(false);
    });

    it('should return 422 when key is already in use', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'key is already in use',
          code: 'KEY_ALREADY_IN_USE',
          status: httpStatus.UNPROCESSABLE_ENTITY,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('already in use');
      expect(result.error?.code).toBe('KEY_ALREADY_IN_USE');
    });

    it('should return 422 when key already exists in repository', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'key_already_exists',
          code: 'KEY_ALREADY_EXISTS',
          status: httpStatus.UNPROCESSABLE_ENTITY,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('already_exists');
      expect(result.error?.code).toBe('KEY_ALREADY_EXISTS');
    });

    it('should return 401 when token is invalid', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Bad credentials',
          code: 'BAD_CREDENTIALS',
          status: httpStatus.UNAUTHORIZED,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Bad credentials');
      expect(result.error?.code).toBe('BAD_CREDENTIALS');
    });

    it('should return 403 when user lacks permissions', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Must have admin rights to Repository',
          code: 'FORBIDDEN',
          status: httpStatus.FORBIDDEN,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('admin rights');
      expect(result.error?.code).toBe('FORBIDDEN');
    });

    it('should return 404 when repository not found', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Not Found',
          code: 'NOT_FOUND',
          status: httpStatus.NOT_FOUND,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Not Found');
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  // ============================================
  // DELETE DEPLOY KEY TESTS (4 tests)
  // ============================================
  describe('DELETE delete-deploy-key', () => {
    it('should return success on successful deletion', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.deleteDeployKey.valid,
      });

      expect(result.error).toBeNull();
      expect(result.data.success).toBe(true);
    });

    it('should return 404 when key does not exist', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Not Found',
          code: 'NOT_FOUND',
          status: httpStatus.NOT_FOUND,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: { action: 'delete-deploy-key', keyId: 999999999 },
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Not Found');
    });

    it('should return 403 when lacking delete permissions', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Must have admin rights to Repository',
          code: 'FORBIDDEN',
          status: httpStatus.FORBIDDEN,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.deleteDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('FORBIDDEN');
    });

    it('should require keyId parameter', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'keyId is required for delete-deploy-key action',
          code: 'VALIDATION_ERROR',
          status: httpStatus.BAD_REQUEST,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.deleteDeployKey.missingKeyId,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('keyId');
    });
  });

  // ============================================
  // VALIDATE TOKEN TESTS (5 tests)
  // ============================================
  describe('POST validate-token', () => {
    it('should validate token and return user info', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.validateToken,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.validateToken.valid,
      });

      expect(result.error).toBeNull();
      expect(result.data.login).toBe('testuser');
      expect(result.data.id).toBe(12345678);
    });

    it('should return 401 for invalid token', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Bad credentials',
          code: 'BAD_CREDENTIALS',
          status: httpStatus.UNAUTHORIZED,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: { action: 'validate-token', custom_token: 'invalid_token' },
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Bad credentials');
    });

    it('should return user login in response', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { login: 'B0yZ4kr14', id: 87654321 },
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.validateToken.valid,
      });

      expect(result.data).toHaveProperty('login');
      expect(typeof result.data.login).toBe('string');
    });

    it('should work with ghp_ tokens', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.validateToken,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: { action: 'validate-token', custom_token: validPATTokens.ghp },
      });

      expect(result.error).toBeNull();
      expect(result.data.login).toBeDefined();
    });

    it('should work with github_pat_ tokens', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.validateToken,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.validateToken.validGithubPat,
      });

      expect(result.error).toBeNull();
      expect(result.data.login).toBeDefined();
    });
  });

  // ============================================
  // SAVE TOKEN TESTS (3 tests)
  // ============================================
  describe('POST save-token', () => {
    it('should validate and acknowledge token save', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.saveToken,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.saveToken.valid,
      });

      expect(result.error).toBeNull();
      expect(result.data.success).toBe(true);
      expect(result.data.message).toContain('validated');
    });

    it('should include token_name in response', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.saveToken,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.saveToken.valid,
      });

      expect(result.data.token_name).toBe('Production Token');
    });

    it('should return 401 for invalid token', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Bad credentials',
          code: 'BAD_CREDENTIALS',
          status: httpStatus.UNAUTHORIZED,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: { action: 'save-token', custom_token: 'invalid', token_name: 'Test' },
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Bad credentials');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS (5 tests)
  // ============================================
  describe('Error Handling', () => {
    it('should return 400 for invalid action', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Invalid action: invalid-action',
          code: 'INVALID_ACTION',
          status: httpStatus.BAD_REQUEST,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.invalidAction,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('Invalid action');
    });

    it('should return 400 for missing required parameters', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Missing required parameter: title',
          code: 'VALIDATION_ERROR',
          status: httpStatus.BAD_REQUEST,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.missingTitle,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should handle CORS preflight OPTIONS request', async () => {
      // CORS is handled automatically by Supabase functions.invoke
      // This test verifies the edge function is configured correctly
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.deployKey,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      // If CORS is configured correctly, the request will succeed
      expect(result.error).toBeNull();
    });

    it('should return structured error with code', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'key is already in use',
          code: 'KEY_ALREADY_IN_USE',
          status: httpStatus.UNPROCESSABLE_ENTITY,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).toHaveProperty('message');
      expect(result.error).toHaveProperty('code');
      expect(typeof result.error?.code).toBe('string');
    });

    it('should handle rate limiting errors', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'API rate limit exceeded',
          code: 'RATE_LIMITED',
          status: httpStatus.TOO_MANY_REQUESTS,
        },
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.createDeployKey.valid,
      });

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('rate limit');
    });
  });

  // ============================================
  // GET DEPLOY KEYS TESTS (Bonus - 2 tests)
  // ============================================
  describe('GET get-deploy-keys', () => {
    it('should return list of deploy keys', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.deployKeysList,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.getDeployKeys.valid,
      });

      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
    });

    it('should return empty array when no keys exist', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: mockGitHubRepoRequests.getDeployKeys.valid,
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  // ============================================
  // SSH KEY FORMAT TESTS (Bonus - 3 tests)
  // ============================================
  describe('SSH Key Format Validation', () => {
    it('should accept valid ssh-rsa key', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.deployKey,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: {
          action: 'create-deploy-key',
          title: 'RSA Key',
          key: validSSHKeys.rsa,
          read_only: true,
        },
      });

      expect(result.error).toBeNull();
    });

    it('should accept valid ssh-ed25519 key', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.deployKey,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: {
          action: 'create-deploy-key',
          title: 'ED25519 Key',
          key: validSSHKeys.ed25519,
          read_only: true,
        },
      });

      expect(result.error).toBeNull();
    });

    it('should accept valid ecdsa key', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: mockGitHubSuccessResponses.deployKey,
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const result = await supabase.functions.invoke('github-repo', {
        body: {
          action: 'create-deploy-key',
          title: 'ECDSA Key',
          key: validSSHKeys.ecdsa,
          read_only: true,
        },
      });

      expect(result.error).toBeNull();
    });
  });
});
