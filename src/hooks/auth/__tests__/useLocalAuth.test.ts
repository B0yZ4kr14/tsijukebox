import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalAuth } from '../useLocalAuth';
import { createMockSessionStorage } from '@/test/mocks/authMocks';

// Mock the localUsers module
vi.mock('@/lib/auth/localUsers', () => ({
  validateLocalPassword: vi.fn(),
  DEV_AUTO_LOGIN: false,
  getDevAutoLoginUser: vi.fn(() => null),
}));

// Mock password utils
vi.mock('@/lib/auth/passwordUtils', () => ({
  generateSessionToken: vi.fn(() => 'mock-session-token'),
}));

import { validateLocalPassword } from '@/lib/auth/localUsers';

describe('useLocalAuth', () => {
  let mockSessionStorage: ReturnType<typeof createMockSessionStorage>;
  const originalSessionStorage = global.sessionStorage;

  beforeEach(() => {
    mockSessionStorage = createMockSessionStorage();
    Object.defineProperty(global, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  describe('login', () => {
    it('should return user on successful login', async () => {
      vi.mocked(validateLocalPassword).mockResolvedValue('admin');

      const { result } = renderHook(() => useLocalAuth());

      let user: Awaited<ReturnType<typeof result.current.login>>;
      await act(async () => {
        user = await result.current.login('tsi', 'correct-password');
      });

      expect(user).not.toBeNull();
      expect(user?.username).toBe('tsi');
      expect(user?.role).toBe('admin');
      expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should return null on invalid credentials', async () => {
      vi.mocked(validateLocalPassword).mockResolvedValue(null);

      const { result } = renderHook(() => useLocalAuth());

      let user: Awaited<ReturnType<typeof result.current.login>>;
      await act(async () => {
        user = await result.current.login('invalid', 'wrong-password');
      });

      expect(user).toBeNull();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should store user in sessionStorage after login', async () => {
      vi.mocked(validateLocalPassword).mockResolvedValue('user');

      const { result } = renderHook(() => useLocalAuth());

      await act(async () => {
        await result.current.login('demo', 'demo-password');
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'current_user',
        expect.stringContaining('demo')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'auth_session',
        'mock-session-token'
      );
    });
  });

  describe('logout', () => {
    it('should clear session storage on logout', () => {
      const { result } = renderHook(() => useLocalAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('current_user');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_session');
    });
  });

  describe('checkSession', () => {
    it('should return user if session exists', () => {
      const savedUser = JSON.stringify({
        id: 'local_test',
        username: 'test',
        role: 'user',
      });
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'current_user') return savedUser;
        if (key === 'auth_session') return 'valid-token';
        return null;
      });

      const { result } = renderHook(() => useLocalAuth());

      const user = result.current.checkSession();

      expect(user).not.toBeNull();
      expect(user?.username).toBe('test');
    });

    it('should return null if no session exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalAuth());

      const user = result.current.checkSession();

      expect(user).toBeNull();
    });

    it('should return null if session token is missing', () => {
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'current_user') return JSON.stringify({ id: 'test' });
        return null; // No session token
      });

      const { result } = renderHook(() => useLocalAuth());

      const user = result.current.checkSession();

      expect(user).toBeNull();
    });

    it('should handle corrupted session data gracefully', () => {
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'current_user') return 'invalid-json';
        if (key === 'auth_session') return 'token';
        return null;
      });

      const { result } = renderHook(() => useLocalAuth());

      const user = result.current.checkSession();

      expect(user).toBeNull();
    });
  });

  describe('DEV_AUTO_LOGIN', () => {
    it('should expose isDevAutoLogin flag', () => {
      const { result } = renderHook(() => useLocalAuth());

      expect(typeof result.current.isDevAutoLogin).toBe('boolean');
    });

    it('should provide getDevUser function', () => {
      const { result } = renderHook(() => useLocalAuth());

      expect(typeof result.current.getDevUser).toBe('function');
    });
  });
});
