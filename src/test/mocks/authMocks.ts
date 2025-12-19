/**
 * Mock utilities for authentication testing.
 */
import { vi } from 'vitest';
import type { AppUser, UserRole } from '@/types/user';

// Mock sessionStorage
export function createMockSessionStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
}

// Mock localStorage
export function createMockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
}

// Mock user factory
export function createMockUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    id: 'test-user-id',
    username: 'testuser',
    role: 'user' as UserRole,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    ...overrides,
  };
}

// Mock Supabase auth
export function createMockSupabaseAuth() {
  const mockUser = {
    id: 'supabase-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  return {
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    onAuthStateChange: vi.fn((callback) => {
      // Immediately call with initial session
      callback('INITIAL_SESSION', mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  };
}

// Mock Supabase client
export function createMockSupabase() {
  const mockAuth = createMockSupabaseAuth();
  return {
    auth: mockAuth,
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
        })),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: 'user', error: null }),
  };
}
