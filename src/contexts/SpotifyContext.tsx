import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { spotifyClient, SpotifyTokens, SpotifyUser } from '@/lib/api/spotify';

export interface SpotifySettings {
  clientId: string;
  clientSecret: string;
  tokens: SpotifyTokens | null;
  user: SpotifyUser | null;
  isConnected: boolean;
}

interface SpotifyContextType {
  spotify: SpotifySettings;
  setSpotifyCredentials: (clientId: string, clientSecret: string) => void;
  setSpotifyTokens: (tokens: SpotifyTokens | null) => void;
  setSpotifyUser: (user: SpotifyUser | null) => void;
  clearSpotifyAuth: () => void;
}

const SPOTIFY_STORAGE_KEY = 'tsi_jukebox_spotify';

const defaultSpotifySettings: SpotifySettings = {
  clientId: '',
  clientSecret: '',
  tokens: null,
  user: null,
  isConnected: false,
};

interface StoredSpotifySettings {
  clientId?: string;
  clientSecret?: string;
  tokens?: SpotifyTokens;
}

function loadSpotifySettings(): StoredSpotifySettings {
  try {
    const stored = localStorage.getItem(SPOTIFY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSpotifySettings(settings: StoredSpotifySettings) {
  try {
    localStorage.setItem(SPOTIFY_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save Spotify settings:', e);
  }
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [spotifySettings, setSpotifySettings] = useState<SpotifySettings>(() => {
    const stored = loadSpotifySettings();
    
    if (stored.clientId && stored.clientSecret) {
      spotifyClient.setCredentials({
        clientId: stored.clientId,
        clientSecret: stored.clientSecret,
      });
    }
    
    if (stored.tokens) {
      spotifyClient.setTokens(stored.tokens);
    }

    return {
      clientId: stored.clientId || '',
      clientSecret: stored.clientSecret || '',
      tokens: stored.tokens || null,
      user: null,
      isConnected: !!stored.tokens?.accessToken,
    };
  });

  // Validate stored token on mount
  useEffect(() => {
    const validateStoredToken = async () => {
      if (spotifySettings.tokens?.accessToken) {
        const user = await spotifyClient.validateToken();
        if (user) {
          setSpotifySettings(prev => ({ ...prev, user, isConnected: true }));
        } else {
          setSpotifySettings(prev => ({
            ...prev,
            tokens: null,
            user: null,
            isConnected: false,
          }));
          spotifyClient.clearTokens();
          saveSpotifySettings({
            clientId: spotifySettings.clientId,
            clientSecret: spotifySettings.clientSecret,
          });
        }
      }
    };

    validateStoredToken();
  }, []);

  const setSpotifyCredentials = useCallback((clientId: string, clientSecret: string) => {
    spotifyClient.setCredentials({ clientId, clientSecret });
    setSpotifySettings(prev => ({ ...prev, clientId, clientSecret }));
    saveSpotifySettings({
      clientId,
      clientSecret,
      tokens: spotifySettings.tokens || undefined,
    });
  }, [spotifySettings.tokens]);

  const setSpotifyTokens = useCallback((tokens: SpotifyTokens | null) => {
    if (tokens) {
      spotifyClient.setTokens(tokens);
    } else {
      spotifyClient.clearTokens();
    }
    setSpotifySettings(prev => ({
      ...prev,
      tokens,
      isConnected: !!tokens?.accessToken,
    }));
    saveSpotifySettings({
      clientId: spotifySettings.clientId,
      clientSecret: spotifySettings.clientSecret,
      tokens: tokens || undefined,
    });
  }, [spotifySettings.clientId, spotifySettings.clientSecret]);

  const setSpotifyUser = useCallback((user: SpotifyUser | null) => {
    setSpotifySettings(prev => ({ ...prev, user }));
  }, []);

  const clearSpotifyAuth = useCallback(() => {
    spotifyClient.clearTokens();
    setSpotifySettings(prev => ({
      ...prev,
      tokens: null,
      user: null,
      isConnected: false,
    }));
    saveSpotifySettings({
      clientId: spotifySettings.clientId,
      clientSecret: spotifySettings.clientSecret,
    });
  }, [spotifySettings.clientId, spotifySettings.clientSecret]);

  return (
    <SpotifyContext.Provider value={{
      spotify: spotifySettings,
      setSpotifyCredentials,
      setSpotifyTokens,
      setSpotifyUser,
      clearSpotifyAuth,
    }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
