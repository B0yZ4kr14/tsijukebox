import { useState, useCallback } from 'react';
import type { AuthConfig, AuthProvider } from '@/types/user';

const AUTH_CONFIG_KEY = 'auth_config';

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  provider: 'local' as AuthProvider,
};

/**
 * Load auth config from localStorage.
 */
function loadAuthConfig(): AuthConfig {
  try {
    const saved = localStorage.getItem(AUTH_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved) as AuthConfig;
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_AUTH_CONFIG;
}

/**
 * Save auth config to localStorage.
 */
function saveAuthConfig(config: AuthConfig): void {
  try {
    localStorage.setItem(AUTH_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

export interface AuthConfigResult {
  authConfig: AuthConfig;
  setProvider: (provider: AuthProvider) => void;
}

/**
 * Hook for managing auth configuration.
 */
export function useAuthConfig(): AuthConfigResult {
  const [authConfig, setAuthConfig] = useState<AuthConfig>(loadAuthConfig);

  const setProvider = useCallback((provider: AuthProvider) => {
    const newConfig: AuthConfig = { ...authConfig, provider };
    setAuthConfig(newConfig);
    saveAuthConfig(newConfig);
  }, [authConfig]);

  return {
    authConfig,
    setProvider,
  };
}
