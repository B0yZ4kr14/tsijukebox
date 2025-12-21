import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePWAInstall } from '../usePWAInstall';

describe('usePWAInstall', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should detect standalone mode as installed', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());
    
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should start with canInstall false when not standalone', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());
    
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.canInstall).toBe(false);
  });

  it('should set canInstall when beforeinstallprompt fires', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt');
    Object.defineProperty(mockEvent, 'prompt', {
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(mockEvent, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' }),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });
  });

  it('should call prompt() on install()', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const });

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt');
    Object.defineProperty(mockEvent, 'prompt', { value: mockPrompt });
    Object.defineProperty(mockEvent, 'userChoice', { value: mockUserChoice });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    await act(async () => {
      await result.current.install();
    });

    expect(mockPrompt).toHaveBeenCalled();
  });

  it('should handle accepted outcome', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt');
    Object.defineProperty(mockEvent, 'prompt', {
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(mockEvent, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' as const }),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(true);
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should handle dismissed outcome', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt');
    Object.defineProperty(mockEvent, 'prompt', {
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(mockEvent, 'userChoice', {
      value: Promise.resolve({ outcome: 'dismissed' as const }),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('should return false from install() when no prompt available', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(false);
  });

  it('should listen for appinstalled event', async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    await waitFor(() => {
      expect(result.current.isInstalled).toBe(true);
      expect(result.current.canInstall).toBe(false);
    });
  });

  it('should cleanup event listeners on unmount', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => usePWAInstall());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  });
});
