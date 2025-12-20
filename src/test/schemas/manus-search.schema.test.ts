import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema copied from edge function for testing
const ManusSearchRequestSchema = z.object({
  query: z.string()
    .min(1, 'query is required')
    .max(1000, 'query must be less than 1000 characters')
    .trim(),
  type: z.enum(['web', 'image', 'video', 'news', 'academic']),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .default(10),
});

describe('ManusSearchRequestSchema', () => {
  describe('valid requests', () => {
    it('should validate web search request', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'React hooks tutorial',
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should validate image search request', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'sunset photos',
        type: 'image',
        limit: 20,
      });
      expect(result.success).toBe(true);
    });

    it('should validate video search request', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'TypeScript tutorial',
        type: 'video',
        limit: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should validate news search request', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'tech news today',
        type: 'news',
        limit: 15,
      });
      expect(result.success).toBe(true);
    });

    it('should validate academic search request', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'machine learning papers',
        type: 'academic',
        limit: 25,
      });
      expect(result.success).toBe(true);
    });

    it('should use default limit when not provided', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test query',
        type: 'web',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
      }
    });

    it('should trim whitespace from query', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: '  trimmed query  ',
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('trimmed query');
      }
    });

    it('should accept query at max length (1000 chars)', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'x'.repeat(1000),
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should accept limit at minimum (1)', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should accept limit at maximum (50)', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: 50,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it('should reject empty query', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: '',
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject whitespace-only query', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: '   ',
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject query exceeding 1000 chars', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'x'.repeat(1001),
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing query', () => {
      const result = ManusSearchRequestSchema.safeParse({
        type: 'web',
        limit: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'invalid-type',
        limit: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        limit: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject limit below minimum (0)', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative limit', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: -5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject limit above maximum (51)', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: 51,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer limit', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: 10.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject string limit', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: 'test',
        type: 'web',
        limit: '10',
      });
      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const result = ManusSearchRequestSchema.safeParse({
        query: null,
        type: null,
        limit: null,
      });
      expect(result.success).toBe(false);
    });
  });
});
