import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthConfig } from '../useAuthConfig';
import { createMockLocalStorage } from '@/test/mocks/authMocks';

describe('useAuthConfig', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  it('should return default config when no saved config exists', () => {
    const { result } = renderHook(() => useAuthConfig());

    expect(result.current.authConfig.provider).toBe('local');
  });

  it('should load saved config from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ provider: 'supabase' }));

    const { result } = renderHook(() => useAuthConfig());

    expect(result.current.authConfig.provider).toBe('supabase');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useAuthConfig());

    expect(result.current.authConfig.provider).toBe('local');
  });

  it('should update provider and save to localStorage', () => {
    const { result } = renderHook(() => useAuthConfig());

    act(() => {
      result.current.setProvider('supabase');
    });

    expect(result.current.authConfig.provider).toBe('supabase');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'auth_config',
      expect.stringContaining('supabase')
    );
  });

  it('should handle localStorage.setItem errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });

    const { result } = renderHook(() => useAuthConfig());

    // Should not throw
    act(() => {
      result.current.setProvider('supabase');
    });

    // State should still update even if storage fails
    expect(result.current.authConfig.provider).toBe('supabase');
  });
});
