import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppUser, UserPermissions, UserRole, AuthProvider, AuthConfig } from '@/types/user';
import { rolePermissions } from '@/types/user';
import { useLocalAuth } from '@/hooks/auth/useLocalAuth';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useAuthConfig } from '@/hooks/auth/useAuthConfig';

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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevAutoLogin, setIsDevAutoLogin] = useState(false);
  
  const { authConfig, setProvider } = useAuthConfig();
  const localAuth = useLocalAuth();
  const supabaseAuth = useSupabaseAuth();

  const permissions = user ? rolePermissions[user.role] : defaultPermissions;
  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (authConfig.provider === 'local') {
        // Check for dev auto-login first
        if (localAuth.isDevAutoLogin) {
          const devUser = localAuth.getDevUser();
          if (devUser) {
            setUser(devUser);
            setIsDevAutoLogin(true);
            if (import.meta.env.DEV) console.log('🔐 Auto-login dev ativado (tsi/admin)');
            setIsLoading(false);
            return;
          }
        }

        // Check sessionStorage for local auth
        const savedUser = localAuth.checkSession();
        if (savedUser) {
          setUser(savedUser);
        }
        setIsLoading(false);
      } else {
        // Supabase auth - set up listener first
        const unsubscribe = supabaseAuth.subscribeToAuthChanges((appUser) => {
          setUser(appUser);
          setIsLoading(false);
        });

        // Check for existing session
        const session = await supabaseAuth.getSession();
        if (session?.user) {
          const role = await supabaseAuth.fetchUserRole(session.user.id);
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

        return unsubscribe;
      }
    };

    initAuth();
  }, [authConfig.provider]);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (authConfig.provider === 'local') {
      const loggedInUser = await localAuth.login(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } else {
      const loggedInUser = await supabaseAuth.login(username, password);
      return !!loggedInUser;
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (authConfig.provider !== 'supabase') {
      return { error: new Error('Sign up only available with Lovable Cloud') };
    }
    return supabaseAuth.signUp(email, password);
  };

  const logout = async () => {
    if (authConfig.provider === 'supabase') {
      await supabaseAuth.logout();
    } else {
      localAuth.logout();
    }
    setUser(null);
  };

  const setAuthProvider = (provider: AuthProvider) => {
    setProvider(provider);
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
