import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schemas copied from edge function for testing
const JamTrackSchema = z.object({
  trackName: z.string().min(1).max(500),
  artistName: z.string().min(1).max(500),
  albumArt: z.string().url().optional().or(z.literal('')),
  durationMs: z.number().int().positive().optional(),
});

const AnalyzeJamRequestSchema = z.object({
  action: z.enum(['suggest-tracks', 'analyze-mood', 'get-similar']),
  queue: z.array(JamTrackSchema).max(100),
  currentTrack: JamTrackSchema.optional(),
  sessionName: z.string().max(200).optional(),
});

describe('AnalyzeJamRequestSchema', () => {
  describe('valid requests', () => {
    it('should validate request with suggest-tracks action', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [
          { trackName: 'Bohemian Rhapsody', artistName: 'Queen' },
          { trackName: 'Stairway to Heaven', artistName: 'Led Zeppelin' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should validate request with analyze-mood action', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'analyze-mood',
        queue: [{ trackName: 'Happy', artistName: 'Pharrell Williams' }],
        sessionName: 'Friday Party',
      });
      expect(result.success).toBe(true);
    });

    it('should validate request with get-similar action and currentTrack', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'get-similar',
        queue: [],
        currentTrack: {
          trackName: 'Blinding Lights',
          artistName: 'The Weeknd',
          albumArt: 'https://example.com/cover.jpg',
          durationMs: 200000,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate request with empty queue', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'analyze-mood',
        queue: [],
      });
      expect(result.success).toBe(true);
    });

    it('should validate track with empty string albumArt', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: 'Song', artistName: 'Artist', albumArt: '' }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it('should reject invalid action', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'invalid-action',
        queue: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('action');
      }
    });

    it('should reject missing action', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        queue: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing queue', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
      });
      expect(result.success).toBe(false);
    });

    it('should reject queue with more than 100 tracks', () => {
      const tracks = Array.from({ length: 101 }, (_, i) => ({
        trackName: `Track ${i}`,
        artistName: `Artist ${i}`,
      }));
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: tracks,
      });
      expect(result.success).toBe(false);
    });

    it('should reject track with empty trackName', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: '', artistName: 'Artist' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject track with empty artistName', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: 'Song', artistName: '' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject track with trackName exceeding 500 chars', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: 'x'.repeat(501), artistName: 'Artist' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject track with invalid albumArt URL', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: 'Song', artistName: 'Artist', albumArt: 'not-a-url' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject track with negative durationMs', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: 'Song', artistName: 'Artist', durationMs: -1000 }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject track with non-integer durationMs', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [{ trackName: 'Song', artistName: 'Artist', durationMs: 1000.5 }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject sessionName exceeding 200 chars', () => {
      const result = AnalyzeJamRequestSchema.safeParse({
        action: 'suggest-tracks',
        queue: [],
        sessionName: 'x'.repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });
});
