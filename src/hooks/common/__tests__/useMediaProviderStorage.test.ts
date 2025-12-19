import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMediaProviderStorage } from '../useMediaProviderStorage';
import { createMockLocalStorage } from '@/test/mocks/authMocks';

interface TestSettings {
  tokens: { accessToken: string; refreshToken: string } | null;
  user: { id: string; name: string } | null;
  isConnected: boolean;
}

interface TestTokens {
  accessToken: string;
  refreshToken: string;
}

interface TestUser {
  id: string;
  name: string;
}

describe('useMediaProviderStorage', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  const originalLocalStorage = global.localStorage;

  const defaultSettings: TestSettings = {
    tokens: null,
    user: null,
    isConnected: false,
  };

  const mockClient = {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  };

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe('initialization', () => {
    it('should load settings from localStorage on mount', () => {
      const savedSettings: TestSettings = {
        tokens: { accessToken: 'saved-token', refreshToken: 'saved-refresh' },
        user: { id: 'user-1', name: 'Test User' },
        isConnected: true,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      expect(result.current.settings.isConnected).toBe(true);
      expect(result.current.settings.tokens?.accessToken).toBe('saved-token');
    });

    it('should use default settings when no saved data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      expect(result.current.settings).toEqual(defaultSettings);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      expect(result.current.settings).toEqual(defaultSettings);
    });

    it('should sync tokens with client on mount if connected', () => {
      const savedSettings: TestSettings = {
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        user: null,
        isConnected: true,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      expect(mockClient.setTokens).toHaveBeenCalledWith(savedSettings.tokens);
    });
  });

  describe('setTokens', () => {
    it('should update tokens and save to localStorage', () => {
      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      const newTokens = { accessToken: 'new-token', refreshToken: 'new-refresh' };
      
      act(() => {
        result.current.setTokens(newTokens);
      });

      expect(result.current.settings.tokens).toEqual(newTokens);
      expect(result.current.settings.isConnected).toBe(true);
      expect(mockClient.setTokens).toHaveBeenCalledWith(newTokens);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should disconnect when tokens are set to null', () => {
      const savedSettings: TestSettings = {
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        user: { id: '1', name: 'User' },
        isConnected: true,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      act(() => {
        result.current.setTokens(null);
      });

      expect(result.current.settings.tokens).toBeNull();
      expect(result.current.settings.isConnected).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should update user and save to localStorage', () => {
      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      const newUser = { id: 'user-1', name: 'New User' };
      
      act(() => {
        result.current.setUser(newUser);
      });

      expect(result.current.settings.user).toEqual(newUser);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clearAuth', () => {
    it('should reset to default settings and clear localStorage', () => {
      const savedSettings: TestSettings = {
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        user: { id: '1', name: 'User' },
        isConnected: true,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: mockClient,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      act(() => {
        result.current.clearAuth();
      });

      expect(result.current.settings).toEqual(defaultSettings);
      expect(mockClient.clearTokens).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_storage');
    });
  });

  describe('token validation', () => {
    it('should validate tokens on mount when validateToken is provided', async () => {
      const savedSettings: TestSettings = {
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        user: null,
        isConnected: true,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const mockValidateToken = vi.fn().mockResolvedValue({ id: 'user-1', name: 'Validated User' });
      const clientWithValidation = {
        ...mockClient,
        validateToken: mockValidateToken,
      };

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: clientWithValidation,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      await waitFor(() => {
        expect(mockValidateToken).toHaveBeenCalled();
      });
    });

    it('should clear auth when token validation fails', async () => {
      const savedSettings: TestSettings = {
        tokens: { accessToken: 'expired-token', refreshToken: 'refresh' },
        user: null,
        isConnected: true,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const mockValidateToken = vi.fn().mockResolvedValue(null);
      const clientWithValidation = {
        ...mockClient,
        validateToken: mockValidateToken,
      };

      const { result } = renderHook(() =>
        useMediaProviderStorage<TestSettings, TestTokens, TestUser | null>({
          storageKey: 'test_storage',
          defaultSettings,
          client: clientWithValidation,
          getTokens: (s) => s.tokens,
          isConnected: (s) => s.isConnected,
        })
      );

      await waitFor(() => {
        expect(result.current.settings.isConnected).toBe(false);
      });
    });
  });
});
