import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppUser, UserPermissions, UserRole, AuthProvider, AuthConfig } from '@/types/user';
import { rolePermissions } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

interface UserContextType {
  user: AppUser | null;
  permissions: UserPermissions;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevAutoLogin: boolean;
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

// Local users configuration - hashes generated via crypto.subtle
// WARNING: Local auth is for development/demo only. Use Supabase in production.
const LOCAL_USERS_CONFIG: Record<string, { passwordHash: string; role: UserRole }> = {
  'tsi': { passwordHash: '5e884898da28047d9169e78f38d2b5db7b8c0e659b4e9f0f6d9f7f8a9b0c1d2e', role: 'admin' },
  'demo': { passwordHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae', role: 'user' },
};

// Simple hash function for local demo auth (NOT for production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate password against stored hash
async function validateLocalPassword(username: string, password: string): Promise<UserRole | null> {
  const userConfig = LOCAL_USERS_CONFIG[username];
  if (!userConfig) return null;
  
  const inputHash = await hashPassword(password);
  if (inputHash === userConfig.passwordHash) {
    return userConfig.role;
  }
  return null;
}

// Check for auto-login in development mode or Lovable preview environment
const isLovablePreview = window.location.hostname.includes('lovable.app') || window.location.hostname.includes('lovableproject.com');
const DEV_AUTO_LOGIN = (import.meta.env.DEV || isLovablePreview) && import.meta.env.VITE_AUTO_LOGIN !== 'false';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevAutoLogin, setIsDevAutoLogin] = useState(false);
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
        if (import.meta.env.DEV) console.log('No role found, defaulting to newbie');
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
        // Check for dev auto-login first
        if (DEV_AUTO_LOGIN) {
          const devUser: AppUser = {
            id: 'dev_admin',
            username: 'tsi',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          setUser(devUser);
          setIsDevAutoLogin(true);
          if (import.meta.env.DEV) console.log('🔐 Auto-login dev ativado (tsi/admin)');
          setIsLoading(false);
          return;
        }

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
      // Local authentication with hashed password validation
      const validatedRole = await validateLocalPassword(username, password);
      if (validatedRole) {
        const newUser: AppUser = {
          id: `local_${username}`,
          username,
          role: validatedRole,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        setUser(newUser);
        sessionStorage.setItem('current_user', JSON.stringify(newUser));
        // Generate secure session token
        const sessionToken = crypto.randomUUID();
        sessionStorage.setItem('auth_session', sessionToken);
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
          if (import.meta.env.DEV) console.error('Supabase login error:', error);
          return false;
        }

        return !!data.user;
      } catch (error) {
        if (import.meta.env.DEV) console.error('Login error:', error);
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
    sessionStorage.removeItem('auth_session');
  };

  const setAuthProvider = (provider: AuthProvider) => {
    const newConfig = { ...authConfig, provider };
    setAuthConfig(newConfig);
    localStorage.setItem('auth_config', JSON.stringify(newConfig));
    // Logout current user when switching providers
    logout();
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!user) return false;
    
    // Check customPermissions first (overrides role defaults)
    if (user.customPermissions && user.customPermissions[permission] !== undefined) {
      return user.customPermissions[permission]!;
    }
    
    // Fall back to role-based permissions
    return permissions[permission];
  };

  return (
    <UserContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated,
        isLoading,
        isDevAutoLogin,
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
