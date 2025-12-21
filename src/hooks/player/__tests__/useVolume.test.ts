import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVolume } from '../useVolume';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import React from 'react';

// Mock dependencies
vi.mock('@/lib/api/client', () => ({
  api: {
    setVolume: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useVolume', () => {
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

  it('should call api.setVolume with level', async () => {
    vi.mocked(api.setVolume).mockResolvedValue(undefined);

    const { result } = renderHook(() => useVolume(), { wrapper });

    await act(async () => {
      result.current.setVolume(75);
    });

    expect(api.setVolume).toHaveBeenCalledWith({ level: 75 });
  });

  it('should invalidate status query on success', async () => {
    vi.mocked(api.setVolume).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useVolume(), { wrapper });

    await act(async () => {
      result.current.setVolume(50);
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['status'] });
    });
  });

  it('should show error toast on failure', async () => {
    const error = new Error('API Error');
    vi.mocked(api.setVolume).mockRejectedValue(error);

    const { result } = renderHook(() => useVolume(), { wrapper });

    await act(async () => {
      result.current.setVolume(50);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao ajustar volume', {
        description: 'API Error',
      });
    });
  });

  it('should handle mute toggle', async () => {
    vi.mocked(api.setVolume).mockResolvedValue(undefined);

    const { result } = renderHook(() => useVolume(), { wrapper });

    await act(async () => {
      result.current.toggleMute(true);
    });

    expect(api.setVolume).toHaveBeenCalledWith({ level: 0, mute: true });
  });

  it('should expose isLoading state', async () => {
    let resolvePromise: (value: { success: boolean }) => void;
    const promise = new Promise<{ success: boolean }>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(api.setVolume).mockReturnValue(promise);

    const { result } = renderHook(() => useVolume(), { wrapper });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setVolume(50);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ success: true });
      await promise;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return setVolume, toggleMute, and isLoading', () => {
    const { result } = renderHook(() => useVolume(), { wrapper });

    expect(typeof result.current.setVolume).toBe('function');
    expect(typeof result.current.toggleMute).toBe('function');
    expect(typeof result.current.isLoading).toBe('boolean');
  });
});
