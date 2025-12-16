import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppUser, UserPermissions, UserRole, AuthProvider, AuthConfig } from '@/types/user';
import { rolePermissions } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

interface UserContextType {
  user: AppUser | null;
  permissions: UserPermissions;
  isAuthenticated: boolean;
  isLoading: boolean;
  authConfig: AuthConfig;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAuthProvider: (provider: AuthProvider) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
}

const defaultPermissions: UserPermissions = {
  canAddToQueue: false,
  canRemoveFromQueue: false,
  canModifyPlaylists: false,
  canControlPlayback: false,
  canAccessSettings: false,
  canManageUsers: false,
  canAccessSystemControls: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Local users for SQLite backend simulation
const LOCAL_USERS: Record<string, { password: string; role: UserRole }> = {
  'tsi': { password: 'connect', role: 'admin' },
  'user': { password: 'user123', role: 'user' },
  'guest': { password: 'guest', role: 'newbie' },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => {
    const saved = localStorage.getItem('auth_config');
    return saved ? JSON.parse(saved) : { provider: 'local' as AuthProvider };
  });

  const permissions = user ? rolePermissions[user.role] : defaultPermissions;
  const isAuthenticated = !!user;

  // Fetch user role from Supabase
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role')
        .limit(1)
        .single();

      if (error || !data) {
        console.log('No role found, defaulting to newbie');
        return 'newbie';
      }

      return data.role as UserRole;
    } catch {
      return 'newbie';
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (authConfig.provider === 'local') {
        // Check sessionStorage for local auth
        const savedUser = sessionStorage.getItem('current_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
      } else {
        // Supabase auth - set up listener first, then check session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (session?.user) {
              // Defer role fetch to avoid deadlock
              setTimeout(async () => {
                const role = await fetchUserRole(session.user.id);
                const appUser: AppUser = {
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || 'user',
                  email: session.user.email,
                  role,
                  createdAt: session.user.created_at || new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                };
                setUser(appUser);
                setIsLoading(false);
              }, 0);
            } else {
              setUser(null);
              setIsLoading(false);
            }
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          const appUser: AppUser = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            email: session.user.email,
            role,
            createdAt: session.user.created_at || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          setUser(appUser);
        }
        setIsLoading(false);

        return () => subscription.unsubscribe();
      }
    };

    initAuth();
  }, [authConfig.provider]);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (authConfig.provider === 'local') {
      // Local authentication
      const localUser = LOCAL_USERS[username];
      if (localUser && localUser.password === password) {
        const newUser: AppUser = {
          id: `local_${username}`,
          username,
          role: localUser.role,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        setUser(newUser);
        sessionStorage.setItem('current_user', JSON.stringify(newUser));
        sessionStorage.setItem('auth_token', `local_${username}_token`);
        return true;
      }
      return false;
    } else {
      // Supabase authentication
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.includes('@') ? username : `${username}@example.com`,
          password,
        });

        if (error) {
          console.error('Supabase login error:', error);
          return false;
        }

        return !!data.user;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (authConfig.provider !== 'supabase') {
      return { error: new Error('Sign up only available with Lovable Cloud') };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const logout = async () => {
    if (authConfig.provider === 'supabase') {
      await supabase.auth.signOut();
    }
    setUser(null);
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('auth_token');
  };

  const setAuthProvider = (provider: AuthProvider) => {
    const newConfig = { ...authConfig, provider };
    setAuthConfig(newConfig);
    localStorage.setItem('auth_config', JSON.stringify(newConfig));
    // Logout current user when switching providers
    logout();
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission];
  };

  return (
    <UserContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated,
        isLoading,
        authConfig,
        login,
        logout,
        setAuthProvider,
        hasPermission,
        signUp,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
