import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBackupManager } from '../hooks/useBackupManager';
import { 
  mockBackupItem, 
  mockBackupApiResponse, 
  mockFailedApiResponse,
  createMockFetch,
  mockScheduleConfig,
  mockCloudConfig 
} from '@/test/mocks/backupMocks';

describe('useBackupManager Integration', () => {
  const originalFetch = global.fetch;
  let mockStorage: Record<string, string>;

  const defaultParams = {
    enabledProviders: ['local' as const, 'cloud' as const, 'distributed' as const],
    isDemoMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = {};
    
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
      clear: vi.fn(() => { mockStorage = {}; }),
      length: 0,
      key: vi.fn(),
    };

    // Mock fetch with success response
    global.fetch = createMockFetch(mockBackupApiResponse);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Initialization', () => {
    it('should initialize with empty backups', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      expect(result.current.backups).toEqual({
        local: [],
        cloud: [],
        distributed: [],
      });
    });

    it('should initialize with empty history', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      expect(result.current.history).toEqual([]);
    });

    it('should load backups from localStorage if available', () => {
      mockStorage['tsi_jukebox_local_backups'] = JSON.stringify([mockBackupItem]);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      expect(result.current.backups.local).toHaveLength(1);
    });

    it('should load schedule config from localStorage', () => {
      mockStorage['tsi_jukebox_backup_schedule'] = JSON.stringify(mockScheduleConfig);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      expect(result.current.scheduleConfig.enabled).toBe(true);
    });
  });

  describe('createBackup', () => {
    it('should create local full backup', async () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/backup/local/full',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should create cloud backup', async () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('cloud', 'full');
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/backup/cloud/full',
        expect.any(Object)
      );
    });

    it('should create distributed backup', async () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('distributed', 'full');
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/backup/distributed/full',
        expect.any(Object)
      );
    });

    it('should set isLoading during backup creation', async () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      expect(result.current.isLoading).toBe(false);
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should add backup to history after creation', async () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      await waitFor(() => {
        expect(result.current.history.length).toBeGreaterThan(0);
      });
    });

    it('should skip API call in demo mode', async () => {
      const { result } = renderHook(() => useBackupManager({ 
        ...defaultParams, 
        isDemoMode: true 
      }));
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('restoreBackup', () => {
    it('should call restore API with correct backup id', async () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.restoreBackup('local', 'backup-123');
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/backup/local/restore',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('backup-123'),
        })
      );
    });
  });

  describe('deleteBackup', () => {
    it('should call delete API with correct backup id', async () => {
      mockStorage['tsi_jukebox_local_backups'] = JSON.stringify([mockBackupItem]);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.deleteBackup('local', mockBackupItem.id);
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/backup/local/${mockBackupItem.id}`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should remove backup from state after deletion', async () => {
      mockStorage['tsi_jukebox_local_backups'] = JSON.stringify([mockBackupItem]);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.deleteBackup('local', mockBackupItem.id);
      });
      
      await waitFor(() => {
        expect(result.current.backups.local).not.toContainEqual(
          expect.objectContaining({ id: mockBackupItem.id })
        );
      });
    });
  });

  describe('Configuration Management', () => {
    it('should update schedule config', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      act(() => {
        result.current.setScheduleConfig(mockScheduleConfig);
      });
      
      expect(result.current.scheduleConfig).toEqual(mockScheduleConfig);
    });

    it('should persist schedule config to localStorage', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      act(() => {
        result.current.setScheduleConfig(mockScheduleConfig);
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'tsi_jukebox_backup_schedule',
        expect.any(String)
      );
    });

    it('should update cloud config', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      act(() => {
        result.current.setCloudConfig(mockCloudConfig);
      });
      
      expect(result.current.cloudConfig).toEqual(mockCloudConfig);
    });

    it('should persist cloud config to localStorage', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      act(() => {
        result.current.setCloudConfig(mockCloudConfig);
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'tsi_jukebox_cloud_config',
        expect.any(String)
      );
    });
  });

  describe('Provider Filtering', () => {
    it('should return backups for specific provider', () => {
      mockStorage['tsi_jukebox_local_backups'] = JSON.stringify([mockBackupItem]);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      const localBackups = result.current.getProviderBackups('local');
      expect(localBackups).toHaveLength(1);
      
      const cloudBackups = result.current.getProviderBackups('cloud');
      expect(cloudBackups).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle failed API response', async () => {
      global.fetch = createMockFetch(mockFailedApiResponse, false);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('History Limits', () => {
    it('should limit history to 50 entries', async () => {
      const existingHistory = Array.from({ length: 50 }, (_, i) => ({
        id: `history-${i}`,
        provider: 'local' as const,
        type: 'full' as const,
        status: 'completed' as const,
        size: '10 MB',
        date: new Date().toISOString(),
      }));
      mockStorage['tsi_jukebox_backup_history'] = JSON.stringify(existingHistory);
      
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      await act(async () => {
        await result.current.createBackup('local', 'full');
      });
      
      await waitFor(() => {
        expect(result.current.history.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Refresh Backups', () => {
    it('should refresh backups from localStorage', () => {
      const { result } = renderHook(() => useBackupManager(defaultParams));
      
      mockStorage['tsi_jukebox_local_backups'] = JSON.stringify([mockBackupItem]);
      
      act(() => {
        result.current.refreshBackups();
      });
      
      expect(result.current.backups.local).toHaveLength(1);
    });
  });
});
