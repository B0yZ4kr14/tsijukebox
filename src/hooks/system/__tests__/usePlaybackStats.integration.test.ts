import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePlaybackStats, useTrackPlayback } from '../usePlaybackStats';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { 
  mockAggregatedStats, 
  mockStatsPeriods, 
  mockPlaybackTrack,
  mockNetworkError,
} from '@/test/fixtures/integrationData';
import { 
  mockSupabaseClient, 
  mockFunctionSuccess, 
  mockFunctionError,
  clearSupabaseMocks,
} from '@/test/mocks/supabaseMocks';

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

describe('usePlaybackStats Integration', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    clearSupabaseMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Buscar estatísticas por período', () => {
    it('should fetch stats for "today" period', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess(mockStatsPeriods.today)
      );

      const { result } = renderHook(
        () => usePlaybackStats('today'),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStatsPeriods.today);
      expect(result.current.period).toBe('today');
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'track-playback',
        { body: { action: 'getStats', period: 'today' } }
      );
    });

    it('should fetch stats for "week" period', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess(mockStatsPeriods.week)
      );

      const { result } = renderHook(
        () => usePlaybackStats('week'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.stats?.totalPlays).toBe(312);
      });
    });

    it('should fetch stats for "month" period', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess(mockStatsPeriods.month)
      );

      const { result } = renderHook(
        () => usePlaybackStats('month'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.stats?.totalPlays).toBe(1250);
      });
    });

    it('should fetch stats for "all" period', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess(mockStatsPeriods.all)
      );

      const { result } = renderHook(
        () => usePlaybackStats('all'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.stats?.totalPlays).toBe(8500);
      });
    });
  });

  describe('Mudança de período', () => {
    it('should update stats when period changes', async () => {
      mockSupabaseClient.functions.invoke
        .mockResolvedValueOnce(mockFunctionSuccess(mockStatsPeriods.week))
        .mockResolvedValueOnce(mockFunctionSuccess(mockStatsPeriods.month));

      const { result } = renderHook(
        () => usePlaybackStats('week'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.stats?.totalPlays).toBe(312);
      });

      act(() => {
        result.current.setPeriod('month');
      });

      await waitFor(() => {
        expect(result.current.period).toBe('month');
      });
    });
  });

  describe('Tratamento de erros', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionError(mockNetworkError.message)
      );

      const { result } = renderHook(
        () => usePlaybackStats('week'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.stats).toBeNull();
    });

    it('should allow refetch after error', async () => {
      mockSupabaseClient.functions.invoke
        .mockResolvedValueOnce(mockFunctionError('Temporary error'))
        .mockResolvedValueOnce(mockFunctionSuccess(mockAggregatedStats));

      const { result } = renderHook(
        () => usePlaybackStats('week'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockAggregatedStats);
      });
    });
  });

  describe('Formatação de dados', () => {
    it('should return correctly formatted aggregated stats', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess(mockAggregatedStats)
      );

      const { result } = renderHook(
        () => usePlaybackStats('week'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.stats).not.toBeNull();
      });

      const stats = result.current.stats!;
      expect(stats.topTracks).toHaveLength(3);
      expect(stats.topArtists).toHaveLength(5);
      expect(stats.hourlyActivity).toBeDefined();
      expect(stats.providerStats).toBeDefined();
      expect(stats.recentPlays).toBeDefined();
    });
  });
});

describe('useTrackPlayback Integration', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    clearSupabaseMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Gravar playback', () => {
    it('should record playback with complete data', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess({ success: true })
      );

      const { result } = renderHook(
        () => useTrackPlayback(),
        { wrapper }
      );

      await act(async () => {
        await result.current.recordPlay(mockPlaybackTrack);
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'track-playback',
        {
          body: {
            action: 'record',
            ...mockPlaybackTrack,
          },
        }
      );
    });

    it('should record playback with minimal data', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionSuccess({ success: true })
      );

      const minimalTrack = {
        track_id: 'spotify:track:123',
        track_name: 'Test Song',
        artist_name: 'Test Artist',
        provider: 'spotify' as const,
      };

      const { result } = renderHook(
        () => useTrackPlayback(),
        { wrapper }
      );

      await act(async () => {
        await result.current.recordPlay(minimalTrack);
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalled();
    });

    it('should show isRecording state during mutation', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockSupabaseClient.functions.invoke.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(
        () => useTrackPlayback(),
        { wrapper }
      );

      expect(result.current.isRecording).toBe(false);

      act(() => {
        result.current.recordPlay(mockPlaybackTrack);
      });

      await waitFor(() => {
        expect(result.current.isRecording).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ data: { success: true }, error: null });
      });

      await waitFor(() => {
        expect(result.current.isRecording).toBe(false);
      });
    });

    it('should handle recording errors', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
        mockFunctionError('Failed to record playback')
      );

      const { result } = renderHook(
        () => useTrackPlayback(),
        { wrapper }
      );

      await expect(
        act(async () => {
          await result.current.recordPlay(mockPlaybackTrack);
        })
      ).rejects.toThrow();
    });
  });
});
