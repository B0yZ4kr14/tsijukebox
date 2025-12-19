import { useState, useCallback, useEffect } from 'react';
import { loadFromStorage, saveToStorage, clearStorage } from '@/lib/storage/mediaProviderStorage';

/**
 * Generic hook for media provider storage (Spotify, YouTube Music, etc.)
 * Eliminates duplication between provider contexts.
 */

export interface MediaProviderClient<TTokens, TCredentials = void> {
  setTokens: (tokens: TTokens) => void;
  clearTokens: () => void;
  setCredentials?: (credentials: TCredentials) => void;
  validateToken?: () => Promise<unknown | null>;
}

export interface MediaProviderStorageConfig<TSettings, TTokens, TCredentials = void> {
  storageKey: string;
  defaultSettings: TSettings;
  client: MediaProviderClient<TTokens, TCredentials>;
  getTokens: (settings: TSettings) => TTokens | null;
  getCredentials?: (settings: TSettings) => TCredentials | null;
  isConnected: (settings: TSettings) => boolean;
}

export interface MediaProviderStorageResult<TSettings, TTokens, TUser, TCredentials = void> {
  settings: TSettings;
  setTokens: (tokens: TTokens | null) => void;
  setUser: (user: TUser | null) => void;
  setCredentials?: (credentials: TCredentials) => void;
  clearAuth: () => void;
  isValidating: boolean;
}

interface StoredData<TTokens, TCredentials = void> {
  tokens?: TTokens;
  credentials?: TCredentials;
}

export function useMediaProviderStorage<
  TSettings extends { tokens: TTokens | null; user: TUser | null; isConnected: boolean },
  TTokens,
  TUser,
  TCredentials = void
>(
  config: MediaProviderStorageConfig<TSettings, TTokens, TCredentials>
): MediaProviderStorageResult<TSettings, TTokens, TUser, TCredentials> {
  const { storageKey, defaultSettings, client, getTokens, getCredentials, isConnected } = config;

  const [settings, setSettings] = useState<TSettings>(() => {
    const { data } = loadFromStorage<StoredData<TTokens, TCredentials>>(storageKey);
    
    if (data?.tokens) {
      client.setTokens(data.tokens);
    }
    
    if (data?.credentials && client.setCredentials) {
      client.setCredentials(data.credentials);
    }
    
    const initialSettings = {
      ...defaultSettings,
      tokens: data?.tokens || null,
      isConnected: !!(data?.tokens && (data.tokens as Record<string, unknown>).accessToken),
    } as TSettings;
    
    // Add credentials if present
    if (data?.credentials && 'clientId' in defaultSettings) {
      const creds = data.credentials as Record<string, unknown>;
      (initialSettings as Record<string, unknown>).clientId = creds.clientId || '';
      (initialSettings as Record<string, unknown>).clientSecret = creds.clientSecret || '';
    }
    
    return initialSettings;
  });

  const [isValidating, setIsValidating] = useState(false);

  // Validate stored token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!client.validateToken || !settings.tokens) return;
      
      setIsValidating(true);
      try {
        const result = await client.validateToken();
        if (result) {
          setSettings(prev => ({ ...prev, user: result as TUser, isConnected: true }));
        } else {
          // Token invalid, clear it
          client.clearTokens();
          setSettings(prev => ({ ...prev, tokens: null, user: null, isConnected: false }));
          
          // Update storage without tokens
          const { data } = loadFromStorage<StoredData<TTokens, TCredentials>>(storageKey);
          if (data) {
            saveToStorage(storageKey, { ...data, tokens: undefined });
          }
        }
      } catch (error) {
        console.error('Token validation failed:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []); // Only run on mount

  const setTokens = useCallback((tokens: TTokens | null) => {
    if (tokens) {
      client.setTokens(tokens);
    } else {
      client.clearTokens();
    }

    setSettings(prev => ({
      ...prev,
      tokens,
      isConnected: !!(tokens && (tokens as Record<string, unknown>).accessToken),
    }));

    // Update storage
    const { data } = loadFromStorage<StoredData<TTokens, TCredentials>>(storageKey);
    saveToStorage(storageKey, {
      ...data,
      tokens: tokens || undefined,
    });
  }, [storageKey, client]);

  const setUser = useCallback((user: TUser | null) => {
    setSettings(prev => ({ ...prev, user }));
  }, []);

  const setCredentialsCallback = useCallback((credentials: TCredentials) => {
    if (!client.setCredentials) return;
    
    client.setCredentials(credentials);
    
    // Update storage
    const { data } = loadFromStorage<StoredData<TTokens, TCredentials>>(storageKey);
    saveToStorage(storageKey, {
      ...data,
      credentials,
    });

    // Also update settings if they have credential fields
    if (credentials && typeof credentials === 'object') {
      setSettings(prev => ({
        ...prev,
        ...credentials,
      }));
    }
  }, [storageKey, client]);

  const clearAuth = useCallback(() => {
    client.clearTokens();
    
    setSettings(prev => ({
      ...prev,
      tokens: null,
      user: null,
      isConnected: false,
    }));

    // Keep credentials in storage, just clear tokens
    const { data } = loadFromStorage<StoredData<TTokens, TCredentials>>(storageKey);
    if (data?.credentials) {
      saveToStorage(storageKey, { credentials: data.credentials });
    } else {
      clearStorage(storageKey);
    }
  }, [storageKey, client]);

  return {
    settings,
    setTokens,
    setUser,
    setCredentials: client.setCredentials ? setCredentialsCallback : undefined,
    clearAuth,
    isValidating,
  };
}
