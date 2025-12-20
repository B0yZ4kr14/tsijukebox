import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema copied from edge function for testing
const GitHubRepoRequestSchema = z.object({
  path: z.string().max(500).optional(),
  action: z.enum([
    'contents',
    'tree',
    'raw',
    'commits',
    'releases',
    'branches',
    'contributors',
    'languages',
    'deploy-keys',
    'create-deploy-key',
    'delete-deploy-key',
  ]),
  title: z.string().max(200).optional(),
  key: z.string().max(5000).optional(),
  read_only: z.boolean().optional(),
  keyId: z.number().int().positive().optional(),
}).refine(
  (data) => {
    if (data.action === 'delete-deploy-key' && !data.keyId) {
      return false;
    }
    return true;
  },
  { message: 'keyId is required for delete-deploy-key action' }
);

describe('GitHubRepoRequestSchema', () => {
  describe('valid requests', () => {
    it('should validate contents action with path', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        path: 'src/App.tsx',
        action: 'contents',
      });
      expect(result.success).toBe(true);
    });

    it('should validate tree action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'tree',
      });
      expect(result.success).toBe(true);
    });

    it('should validate raw action with path', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        path: 'README.md',
        action: 'raw',
      });
      expect(result.success).toBe(true);
    });

    it('should validate commits action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'commits',
      });
      expect(result.success).toBe(true);
    });

    it('should validate releases action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'releases',
      });
      expect(result.success).toBe(true);
    });

    it('should validate branches action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'branches',
      });
      expect(result.success).toBe(true);
    });

    it('should validate contributors action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'contributors',
      });
      expect(result.success).toBe(true);
    });

    it('should validate languages action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'languages',
      });
      expect(result.success).toBe(true);
    });

    it('should validate deploy-keys action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'deploy-keys',
      });
      expect(result.success).toBe(true);
    });

    it('should validate create-deploy-key action with all fields', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'create-deploy-key',
        title: 'CI/CD Key',
        key: 'ssh-rsa AAAAB3NzaC1yc2EAAA...',
        read_only: true,
      });
      expect(result.success).toBe(true);
    });

    it('should validate delete-deploy-key action with keyId', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'delete-deploy-key',
        keyId: 12345,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it('should reject invalid action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'invalid-action',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing action', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        path: 'src/App.tsx',
      });
      expect(result.success).toBe(false);
    });

    it('should reject delete-deploy-key without keyId', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'delete-deploy-key',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('keyId is required for delete-deploy-key action');
      }
    });

    it('should reject path exceeding 500 chars', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'contents',
        path: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should reject title exceeding 200 chars', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'create-deploy-key',
        title: 'x'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should reject key exceeding 5000 chars', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'create-deploy-key',
        key: 'x'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative keyId', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'delete-deploy-key',
        keyId: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer keyId', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'delete-deploy-key',
        keyId: 123.45,
      });
      expect(result.success).toBe(false);
    });

    it('should reject string keyId', () => {
      const result = GitHubRepoRequestSchema.safeParse({
        action: 'delete-deploy-key',
        keyId: '12345',
      });
      expect(result.success).toBe(false);
    });
  });
});
