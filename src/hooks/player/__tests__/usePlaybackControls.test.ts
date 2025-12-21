import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlaybackControls } from '../usePlaybackControls';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import React from 'react';

// Mock dependencies
vi.mock('@/lib/api/client', () => ({
  api: {
    getQueue: vi.fn(),
    setShuffle: vi.fn(),
    setRepeat: vi.fn(),
    addToQueue: vi.fn(),
    removeFromQueue: vi.fn(),
    clearQueue: vi.fn(),
    reorderQueue: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: vi.fn(() => ({ isDemoMode: false })),
}));

import { useSettings } from '@/contexts/SettingsContext';

describe('usePlaybackControls', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  describe('demo mode', () => {
    beforeEach(() => {
      vi.mocked(useSettings).mockReturnValue({ isDemoMode: true } as any);
    });

    it('should toggle shuffle in demo mode', () => {
      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      expect(result.current.shuffle).toBe(false);

      act(() => {
        result.current.toggleShuffle();
      });

      expect(result.current.shuffle).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Shuffle ativado');
    });

    it('should cycle repeat modes in demo mode: off → context → track → off', () => {
      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      expect(result.current.repeat).toBe('off');

      act(() => {
        result.current.toggleRepeat();
      });
      expect(result.current.repeat).toBe('context');
      expect(toast.success).toHaveBeenCalledWith('Repetir contexto');

      act(() => {
        result.current.toggleRepeat();
      });
      expect(result.current.repeat).toBe('track');
      expect(toast.success).toHaveBeenCalledWith('Repetir faixa');

      act(() => {
        result.current.toggleRepeat();
      });
      expect(result.current.repeat).toBe('off');
      expect(toast.success).toHaveBeenCalledWith('Repeat desativado');
    });

    it('should return mock queue in demo mode', () => {
      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      expect(result.current.queue).toBeDefined();
      expect(result.current.queue?.current).toBeDefined();
      expect(result.current.queue?.next).toHaveLength(2);
      expect(result.current.queue?.history).toHaveLength(1);
    });

    it('should handle reorderQueue in demo mode', () => {
      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      act(() => {
        result.current.reorderQueue(0, 1);
      });

      expect(toast.success).toHaveBeenCalledWith('Fila reordenada (demo)');
      expect(api.reorderQueue).not.toHaveBeenCalled();
    });
  });

  describe('API mode', () => {
    beforeEach(() => {
      vi.mocked(useSettings).mockReturnValue({ isDemoMode: false } as any);
    });

    it('should fetch queue from API', async () => {
      const mockQueue = {
        current: { id: '1', title: 'Current Track', artist: 'Artist', album: 'Album', cover: null, duration: 180000 },
        next: [],
        history: [],
      };
      vi.mocked(api.getQueue).mockResolvedValue(mockQueue);

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await waitFor(() => {
        expect(result.current.queue).toEqual(mockQueue);
      });
    });

    it('should call API when toggling shuffle', async () => {
      vi.mocked(api.setShuffle).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await act(async () => {
        result.current.toggleShuffle();
      });

      expect(api.setShuffle).toHaveBeenCalledWith(true);
    });

    it('should call API when toggling repeat', async () => {
      vi.mocked(api.setRepeat).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await act(async () => {
        result.current.toggleRepeat();
      });

      expect(api.setRepeat).toHaveBeenCalledWith('context');
    });

    it('should add track to queue', async () => {
      vi.mocked(api.addToQueue).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await act(async () => {
        result.current.addToQueue('spotify:track:123');
      });

      expect(api.addToQueue).toHaveBeenCalledWith('spotify:track:123');
    });

    it('should remove track from queue', async () => {
      vi.mocked(api.removeFromQueue).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await act(async () => {
        result.current.removeFromQueue('track-id');
      });

      expect(api.removeFromQueue).toHaveBeenCalledWith('track-id');
    });

    it('should clear queue', async () => {
      vi.mocked(api.clearQueue).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await act(async () => {
        result.current.clearQueue();
      });

      expect(api.clearQueue).toHaveBeenCalled();
    });

    it('should show error toast on API failure', async () => {
      vi.mocked(api.setShuffle).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      await act(async () => {
        result.current.toggleShuffle();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao alterar shuffle');
      });
    });
  });

  describe('returned values', () => {
    beforeEach(() => {
      vi.mocked(useSettings).mockReturnValue({ isDemoMode: true } as any);
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      expect(result.current).toHaveProperty('shuffle');
      expect(result.current).toHaveProperty('repeat');
      expect(result.current).toHaveProperty('queue');
      expect(result.current).toHaveProperty('isLoadingQueue');
      expect(result.current).toHaveProperty('toggleShuffle');
      expect(result.current).toHaveProperty('toggleRepeat');
      expect(result.current).toHaveProperty('addToQueue');
      expect(result.current).toHaveProperty('removeFromQueue');
      expect(result.current).toHaveProperty('clearQueue');
      expect(result.current).toHaveProperty('reorderQueue');
      expect(result.current).toHaveProperty('refetchQueue');
    });

    it('should have correct initial values', () => {
      const { result } = renderHook(() => usePlaybackControls(), { wrapper });

      expect(result.current.shuffle).toBe(false);
      expect(result.current.repeat).toBe('off');
      expect(typeof result.current.toggleShuffle).toBe('function');
      expect(typeof result.current.toggleRepeat).toBe('function');
    });
  });
});
