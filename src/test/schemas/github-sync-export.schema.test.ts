import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schemas copied from edge function for testing
const GitHubFileSchema = z.object({
  path: z.string().min(1, 'path is required').max(500),
  content: z.string().max(1_000_000, 'content must be less than 1MB'),
});

const GitHubSyncRequestSchema = z.object({
  action: z.enum(['export-files', 'sync-status', 'create-commit', 'list-files', 'get-file']),
  files: z.array(GitHubFileSchema).max(100).optional(),
  commitMessage: z.string().max(500).optional(),
  branch: z.string().max(100).optional(),
  filePath: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (['export-files', 'create-commit'].includes(data.action) && (!data.files || data.files.length === 0)) {
      return false;
    }
    if (data.action === 'get-file' && !data.filePath) {
      return false;
    }
    return true;
  },
  { message: 'Invalid request: files required for export-files/create-commit, filePath required for get-file' }
);

describe('GitHubSyncRequestSchema', () => {
  describe('valid requests', () => {
    it('should validate sync-status action', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'sync-status',
      });
      expect(result.success).toBe(true);
    });

    it('should validate list-files action', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'list-files',
      });
      expect(result.success).toBe(true);
    });

    it('should validate list-files action with path', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'list-files',
        filePath: 'src/components',
      });
      expect(result.success).toBe(true);
    });

    it('should validate get-file action with filePath', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'get-file',
        filePath: 'src/App.tsx',
      });
      expect(result.success).toBe(true);
    });

    it('should validate export-files action with files', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [
          { path: 'src/App.tsx', content: 'export default App;' },
          { path: 'src/index.tsx', content: 'ReactDOM.render(...)' },
        ],
        commitMessage: 'Update files',
        branch: 'main',
      });
      expect(result.success).toBe(true);
    });

    it('should validate create-commit action with files', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'create-commit',
        files: [{ path: 'README.md', content: '# Project' }],
        commitMessage: 'Add README',
      });
      expect(result.success).toBe(true);
    });

    it('should accept files with empty content', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [{ path: '.gitkeep', content: '' }],
      });
      expect(result.success).toBe(true);
    });

    it('should accept up to 100 files', () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `file${i}.txt`,
        content: `content ${i}`,
      }));
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it('should reject invalid action', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'invalid-action',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing action', () => {
      const result = GitHubSyncRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject export-files without files', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
      });
      expect(result.success).toBe(false);
    });

    it('should reject export-files with empty files array', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject create-commit without files', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'create-commit',
        commitMessage: 'Test commit',
      });
      expect(result.success).toBe(false);
    });

    it('should reject get-file without filePath', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'get-file',
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 100 files', () => {
      const files = Array.from({ length: 101 }, (_, i) => ({
        path: `file${i}.txt`,
        content: `content ${i}`,
      }));
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files,
      });
      expect(result.success).toBe(false);
    });

    it('should reject file with empty path', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [{ path: '', content: 'test' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject file with path exceeding 500 chars', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [{ path: 'x'.repeat(501), content: 'test' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject file with content exceeding 1MB', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [{ path: 'large.txt', content: 'x'.repeat(1_000_001) }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject commitMessage exceeding 500 chars', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'export-files',
        files: [{ path: 'test.txt', content: 'test' }],
        commitMessage: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should reject branch exceeding 100 chars', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'sync-status',
        branch: 'x'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject filePath exceeding 500 chars', () => {
      const result = GitHubSyncRequestSchema.safeParse({
        action: 'get-file',
        filePath: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
