import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock dependencies before importing the hook
vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: vi.fn(() => ({
    isDemoMode: false,
    apiUrl: 'http://localhost:3000',
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useConnectionMonitor } from '../useConnectionMonitor';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

describe('useConnectionMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock Notification API
    Object.defineProperty(global, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
    });

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with checking status', () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useConnectionMonitor());

    expect(result.current.status).toBe('checking');
  });

  it('should update to online after successful check', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    // Fast forward past initial delay
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('online');
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.consecutiveFailures).toBe(0);
  });

  it('should update to offline after failed check', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    // Fast forward past initial delay
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });

    expect(result.current.isOnline).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });

  it('should increment consecutiveFailures on repeated failures', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    // First check
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.consecutiveFailures).toBe(1);
    });

    // Second check
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(result.current.consecutiveFailures).toBe(2);
    });
  });

  it('should set status to reconnecting after initial offline', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    // First check - should be offline
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });

    // Second check - should be reconnecting
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('reconnecting');
    });
  });

  it('should reset backoff on forceCheck', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    // Force check should work immediately
    let checkResult: boolean;
    await act(async () => {
      checkResult = await result.current.forceCheck();
    });

    expect(checkResult!).toBe(true);
  });

  it('should skip checks in demo mode', async () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: true,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    expect(result.current.status).toBe('online');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should show success toast when connection is restored', async () => {
    // First fail, then succeed
    vi.mocked(global.fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true } as Response);
    
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    // First check - should fail
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });

    // Second check - should succeed
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('online');
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Conexão com o servidor restaurada',
      expect.any(Object)
    );
  });

  it('should fetch health endpoint with correct URL', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://api.example.com',
    } as any);

    renderHook(() => useConnectionMonitor());

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.example.com/health',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
      })
    );
  });

  it('should update lastCheckAt after each check', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
    } as any);

    const { result } = renderHook(() => useConnectionMonitor());

    expect(result.current.lastCheckAt).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.lastCheckAt).toBeInstanceOf(Date);
    });
  });
});
