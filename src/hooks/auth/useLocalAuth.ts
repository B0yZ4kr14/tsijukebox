import { useCallback } from 'react';
import type { AppUser, UserRole } from '@/types/user';
import { validateLocalPassword, DEV_AUTO_LOGIN, getDevAutoLoginUser } from '@/lib/auth/localUsers';
import { generateSessionToken } from '@/lib/auth/passwordUtils';

const SESSION_USER_KEY = 'current_user';
const SESSION_TOKEN_KEY = 'auth_session';

export interface LocalAuthResult {
  login: (username: string, password: string) => Promise<AppUser | null>;
  logout: () => void;
  checkSession: () => AppUser | null;
  isDevAutoLogin: boolean;
  getDevUser: () => AppUser | null;
}

/**
 * Hook for local authentication (demo/development only).
 */
export function useLocalAuth(): LocalAuthResult {
  const login = useCallback(async (username: string, password: string): Promise<AppUser | null> => {
    const validatedRole = await validateLocalPassword(username, password);
    
    if (!validatedRole) {
      return null;
    }

    const user: AppUser = {
      id: `local_${username}`,
      username,
      role: validatedRole,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Store in sessionStorage
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(SESSION_TOKEN_KEY, generateSessionToken());
    
    return user;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  }, []);

  const checkSession = useCallback((): AppUser | null => {
    try {
      const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
      const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
      
      if (savedUser && sessionToken) {
        return JSON.parse(savedUser) as AppUser;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const getDevUser = useCallback((): AppUser | null => {
    if (!DEV_AUTO_LOGIN) return null;
    return getDevAutoLoginUser() as AppUser;
  }, []);

  return {
    login,
    logout,
    checkSession,
    isDevAutoLogin: DEV_AUTO_LOGIN,
    getDevUser,
  };
}
