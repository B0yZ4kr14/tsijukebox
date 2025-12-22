import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSync } from '../useAutoSync';

// Mock Supabase client
const mockFrom = vi.fn();
const mockChannel = vi.fn();
const mockRemoveChannel = vi.fn();
const mockFunctionsInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    channel: (...args: unknown[]) => mockChannel(...args),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
    functions: {
      invoke: (...args: unknown[]) => mockFunctionsInvoke(...args),
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAutoSync', () => {
  const createChainMock = (resolvedData: unknown = []) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn(),
    };
    
    // Make order return another mock with order that resolves
    mock.order.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: resolvedData, error: null }),
    });
    
    return mock;
  };

  const createChannelMock = () => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers();

    // Default mocks
    mockFrom.mockImplementation(() => createChainMock([]));
    mockChannel.mockImplementation(() => createChannelMock());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default config when no localStorage', async () => {
      const { result } = renderHook(() => useAutoSync());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.syncInterval).toBe(30);
      expect(result.current.lastSync).toBeNull();
      expect(result.current.pendingFiles).toEqual([]);
    });

    it('should load config from localStorage if exists', async () => {
      const savedConfig = {
        isEnabled: true,
        syncInterval: 15,
        lastSync: '2024-01-01T00:00:00.000Z',
      };
      localStorageMock.setItem('tsijukebox-auto-sync-config', JSON.stringify(savedConfig));

      const { result } = renderHook(() => useAutoSync());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.syncInterval).toBe(15);
      expect(result.current.lastSync).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    });

    it('should start with isSyncing false', async () => {
      const { result } = renderHook(() => useAutoSync());
      expect(result.current.isSyncing).toBe(false);
    });
  });

  describe('toggle functionality', () => {
    it('should enable auto-sync when enable() is called', async () => {
      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.enable();
      });

      expect(result.current.isEnabled).toBe(true);
    });

    it('should disable auto-sync when disable() is called', async () => {
      localStorageMock.setItem('tsijukebox-auto-sync-config', JSON.stringify({
        isEnabled: true,
        syncInterval: 30,
        lastSync: null,
      }));

      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.disable();
      });

      expect(result.current.isEnabled).toBe(false);
    });

    it('should toggle state correctly', async () => {
      const { result } = renderHook(() => useAutoSync());

      expect(result.current.isEnabled).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isEnabled).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isEnabled).toBe(false);
    });

    it('should persist config to localStorage', async () => {
      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.enable();
      });

      // Advance timers to allow useEffect to run
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tsijukebox-auto-sync-config',
        expect.any(String)
      );
    });
  });

  describe('pending files', () => {
    it('should fetch pending files on mount', async () => {
      renderHook(() => useAutoSync());

      expect(mockFrom).toHaveBeenCalledWith('pending_sync_files');
    });

    it('should update pendingCount when files are loaded', async () => {
      const mockFiles = [
        { id: '1', file_path: 'src/test.ts', status: 'pending' },
        { id: '2', file_path: 'src/test2.ts', status: 'pending' },
      ];

      mockFrom.mockImplementation(() => createChainMock(mockFiles));

      const { result } = renderHook(() => useAutoSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(2);
      });
    });

    it('should subscribe to realtime changes', async () => {
      renderHook(() => useAutoSync());

      expect(mockChannel).toHaveBeenCalledWith('pending-sync-changes');
    });
  });

  describe('sync interval', () => {
    it('should update syncInterval when setSyncInterval is called', async () => {
      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.setSyncInterval(60);
      });

      expect(result.current.syncInterval).toBe(60);
    });

    it('should clamp interval to minimum 1 minute', async () => {
      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.setSyncInterval(0);
      });

      expect(result.current.syncInterval).toBe(1);
    });

    it('should clamp interval to maximum 1440 minutes (24h)', async () => {
      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.setSyncInterval(2000);
      });

      expect(result.current.syncInterval).toBe(1440);
    });
  });

  describe('triggerSync', () => {
    it('should show info toast when no pending files', async () => {
      const { toast } = await import('sonner');
      const { result } = renderHook(() => useAutoSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(toast.info).toHaveBeenCalledWith('Nenhum arquivo pendente para sincronizar');
    });

    it('should call auto-sync-repository function with files', async () => {
      const mockFiles = [
        { id: '1', file_path: 'src/test.ts', status: 'pending', priority: 1, category: 'critical' },
      ];
      mockFrom.mockImplementation(() => createChainMock(mockFiles));
      mockFunctionsInvoke.mockResolvedValue({ data: { success: true }, error: null });

      const { result } = renderHook(() => useAutoSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(1);
      });

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(mockFunctionsInvoke).toHaveBeenCalledWith('auto-sync-repository', expect.any(Object));
    });
  });

  describe('getTimeUntilNextSync', () => {
    it('should return null when sync is disabled', async () => {
      const { result } = renderHook(() => useAutoSync());

      expect(result.current.getTimeUntilNextSync()).toBeNull();
    });

    it('should return seconds until next sync when enabled', async () => {
      const { result } = renderHook(() => useAutoSync());

      act(() => {
        result.current.enable();
      });

      // Advance time to trigger nextSync calculation
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const timeUntilNext = result.current.getTimeUntilNextSync();
      expect(timeUntilNext).toBeGreaterThan(0);
    });
  });

  describe('cleanup', () => {
    it('should remove realtime channel on unmount', async () => {
      const { unmount } = renderHook(() => useAutoSync());

      unmount();

      expect(mockRemoveChannel).toHaveBeenCalled();
    });
  });
});
