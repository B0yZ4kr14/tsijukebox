import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Default credentials as requested
const DEFAULT_CREDENTIALS = {
  username: 'tsi',
  password: 'connect',
};

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated on mount
    const token = sessionStorage.getItem('auth_token');
    if (token === 'tsi_authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (
      username === DEFAULT_CREDENTIALS.username &&
      password === DEFAULT_CREDENTIALS.password
    ) {
      sessionStorage.setItem('auth_token', 'tsi_authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
