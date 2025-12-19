import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupabaseAuth } from '../useSupabaseAuth';
import type { AppUser } from '@/types/user';

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('useSupabaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
            }),
          }),
        }),
      }),
    });
  });

  describe('login', () => {
    it('should return user on successful login', async () => {
      const mockUser = {
        id: 'supabase-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useSupabaseAuth());

      let appUser: AppUser | null = null;
      await act(async () => {
        appUser = await result.current.login('test@example.com', 'password123');
      });

      expect(appUser).not.toBeNull();
      expect(appUser?.id).toBe('supabase-user-id');
      expect(appUser?.role).toBe('user');
    });

    it('should return null on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      const { result } = renderHook(() => useSupabaseAuth());

      let appUser: AppUser | null = null;
      await act(async () => {
        appUser = await result.current.login('invalid@example.com', 'wrong');
      });

      expect(appUser).toBeNull();
    });

    it('should fetch user role after successful login', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com', created_at: new Date().toISOString() };
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockFrom).toHaveBeenCalledWith('user_roles');
    });

    it('should add @example.com to username if no @ symbol', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'testuser@example.com',
        })
      );
    });
  });

  describe('signUp', () => {
    it('should return no error on successful signup', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'new@example.com',
      };
      mockSignUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useSupabaseAuth());

      let signUpResult: { error: Error | null } = { error: new Error('Not set') };
      await act(async () => {
        signUpResult = await result.current.signUp('new@example.com', 'password123');
      });

      expect(signUpResult.error).toBeNull();
    });

    it('should return error if user already exists', async () => {
      const mockError = new Error('User already registered');
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const { result } = renderHook(() => useSupabaseAuth());

      let signUpResult: { error: Error | null } = { error: null };
      await act(async () => {
        signUpResult = await result.current.signUp('existing@example.com', 'password');
      });

      expect(signUpResult.error).not.toBeNull();
      expect(signUpResult.error?.message).toBe('User already registered');
    });

    it('should include emailRedirectTo option', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password');
      });

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: expect.any(String),
          }),
        })
      );
    });
  });

  describe('logout', () => {
    it('should sign out successfully', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('fetchUserRole', () => {
    it('should fetch role from database', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSupabaseAuth());

      let role: string = 'unknown';
      await act(async () => {
        role = await result.current.fetchUserRole('user-id');
      });

      expect(role).toBe('admin');
    });

    it('should return newbie role on error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSupabaseAuth());

      let role: string = 'unknown';
      await act(async () => {
        role = await result.current.fetchUserRole('user-id');
      });

      expect(role).toBe('newbie');
    });
  });
});
