import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  let originalNavigator: Navigator;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalNavigator = global.navigator;
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    // Mock window events
    vi.spyOn(window, 'addEventListener').mockImplementation(mockAddEventListener);
    vi.spyOn(window, 'removeEventListener').mockImplementation(mockRemoveEventListener);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true });
  });

  it('should initialize with navigator.onLine status', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should initialize as offline when navigator.onLine is false', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(false);
  });

  it('should add event listeners on mount', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    renderHook(() => useNetworkStatus());

    expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update state on online event', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    // Get the online handler from the mock calls
    const onlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )?.[1];

    expect(onlineHandler).toBeDefined();

    act(() => {
      onlineHandler?.();
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
  });

  it('should update state on offline event', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    // Get the offline handler from the mock calls
    const offlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )?.[1];

    expect(offlineHandler).toBeDefined();

    act(() => {
      offlineHandler?.();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
    expect(result.current.lastOfflineAt).toBeInstanceOf(Date);
  });

  it('should get connection info from Network Information API', () => {
    const mockConnection = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(global, 'navigator', {
      value: {
        onLine: true,
        connection: mockConnection,
      },
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.connectionType).toBe('4g');
    expect(result.current.downlink).toBe(10);
    expect(result.current.rtt).toBe(50);
  });

  it('should perform manual connection check successfully', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    // Mock fetch for connection check
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    let checkResult: boolean;
    await act(async () => {
      checkResult = await result.current.checkConnection();
    });

    expect(checkResult!).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/favicon.ico', expect.objectContaining({
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    }));
  });

  it('should handle connection check failure', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkStatus());

    let checkResult: boolean;
    await act(async () => {
      checkResult = await result.current.checkConnection();
    });

    expect(checkResult!).toBe(false);
  });

  it('should handle connection check timeout', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    // Mock fetch that will be aborted
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    global.fetch = vi.fn().mockRejectedValue(abortError);

    const { result } = renderHook(() => useNetworkStatus());

    let checkResult: boolean;
    await act(async () => {
      checkResult = await result.current.checkConnection();
    });

    expect(checkResult!).toBe(false);
  });

  it('should return null values when Network Information API is not available', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.connectionType).toBeNull();
    expect(result.current.downlink).toBeNull();
    expect(result.current.rtt).toBeNull();
  });
});
