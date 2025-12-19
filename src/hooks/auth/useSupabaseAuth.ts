import { useCallback, useEffect, useRef } from 'react';
import type { AppUser, UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface SupabaseAuthResult {
  login: (email: string, password: string) => Promise<AppUser | null>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  fetchUserRole: (userId: string) => Promise<UserRole>;
  subscribeToAuthChanges: (
    onUserChange: (user: AppUser | null) => void
  ) => () => void;
  getSession: () => Promise<Session | null>;
}

/**
 * Convert Supabase user to AppUser.
 */
function mapSupabaseUser(user: User, role: UserRole): AppUser {
  return {
    id: user.id,
    username: user.email?.split('@')[0] || 'user',
    email: user.email,
    role,
    createdAt: user.created_at || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
}

/**
 * Hook for Supabase authentication.
 */
export function useSupabaseAuth(): SupabaseAuthResult {
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role')
        .limit(1)
        .single();

      if (error || !data) {
        if (import.meta.env.DEV) console.log('No role found, defaulting to newbie');
        return 'newbie';
      }

      return data.role as UserRole;
    } catch {
      return 'newbie';
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.includes('@') ? email : `${email}@example.com`,
        password,
      });

      if (error || !data.user) {
        if (import.meta.env.DEV) console.error('Supabase login error:', error);
        return null;
      }

      const role = await fetchUserRole(data.user.id);
      return mapSupabaseUser(data.user, role);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Login error:', error);
      return null;
    }
  }, [fetchUserRole]);

  const signUp = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      return { error: error || null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const subscribeToAuthChanges = useCallback((
    onUserChange: (user: AppUser | null) => void
  ) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Defer role fetch to avoid deadlock
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            const appUser = mapSupabaseUser(session.user, role);
            onUserChange(appUser);
          }, 0);
        } else {
          onUserChange(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const getSession = useCallback(async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }, []);

  return {
    login,
    signUp,
    logout,
    fetchUserRole,
    subscribeToAuthChanges,
    getSession,
  };
}
