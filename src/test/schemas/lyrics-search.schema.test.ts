import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema copied from edge function for testing
const LyricsSearchRequestSchema = z.object({
  trackName: z.string()
    .min(1, 'trackName is required')
    .max(500, 'trackName must be less than 500 characters')
    .trim(),
  artistName: z.string()
    .min(1, 'artistName is required')
    .max(500, 'artistName must be less than 500 characters')
    .trim(),
});

describe('LyricsSearchRequestSchema', () => {
  describe('valid requests', () => {
    it('should validate valid request with track and artist', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'Bohemian Rhapsody',
        artistName: 'Queen',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.trackName).toBe('Bohemian Rhapsody');
        expect(result.data.artistName).toBe('Queen');
      }
    });

    it('should trim whitespace from inputs', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: '  Bohemian Rhapsody  ',
        artistName: '  Queen  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.trackName).toBe('Bohemian Rhapsody');
        expect(result.data.artistName).toBe('Queen');
      }
    });

    it('should accept track names with special characters', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: "Don't Stop Me Now (2011 Remaster)",
        artistName: 'Queen & David Bowie',
      });
      expect(result.success).toBe(true);
    });

    it('should accept unicode characters', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'Águas de Março',
        artistName: 'Antônio Carlos Jobim',
      });
      expect(result.success).toBe(true);
    });

    it('should accept names at max length (500 chars)', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'x'.repeat(500),
        artistName: 'y'.repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it('should reject empty trackName', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: '',
        artistName: 'Queen',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('trackName is required');
      }
    });

    it('should reject empty artistName', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'Bohemian Rhapsody',
        artistName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('artistName is required');
      }
    });

    it('should reject missing trackName', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        artistName: 'Queen',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing artistName', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'Bohemian Rhapsody',
      });
      expect(result.success).toBe(false);
    });

    it('should reject trackName exceeding 500 chars', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'x'.repeat(501),
        artistName: 'Queen',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('trackName must be less than 500 characters');
      }
    });

    it('should reject artistName exceeding 500 chars', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'Bohemian Rhapsody',
        artistName: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('artistName must be less than 500 characters');
      }
    });

    it('should reject whitespace-only trackName', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: '   ',
        artistName: 'Queen',
      });
      expect(result.success).toBe(false);
    });

    it('should reject whitespace-only artistName', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 'Bohemian Rhapsody',
        artistName: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: null,
        artistName: null,
      });
      expect(result.success).toBe(false);
    });

    it('should reject numeric values', () => {
      const result = LyricsSearchRequestSchema.safeParse({
        trackName: 12345,
        artistName: 67890,
      });
      expect(result.success).toBe(false);
    });
  });
});
