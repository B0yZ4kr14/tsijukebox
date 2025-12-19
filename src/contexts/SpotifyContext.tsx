import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { spotifyClient, SpotifyTokens, SpotifyUser } from '@/lib/api/spotify';
import { useMediaProviderStorage } from '@/hooks/common/useMediaProviderStorage';

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

interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const {
    settings,
    setTokens,
    setUser,
    setCredentials,
    clearAuth,
  } = useMediaProviderStorage<SpotifySettings, SpotifyTokens, SpotifyUser | null, SpotifyCredentials>({
    storageKey: SPOTIFY_STORAGE_KEY,
    defaultSettings: defaultSpotifySettings,
    client: {
      setTokens: (tokens) => spotifyClient.setTokens(tokens),
      clearTokens: () => spotifyClient.clearTokens(),
      setCredentials: (credentials) => spotifyClient.setCredentials(credentials),
      validateToken: () => spotifyClient.validateToken(),
    },
    getTokens: (s) => s.tokens,
    getCredentials: (s) => ({ clientId: s.clientId, clientSecret: s.clientSecret }),
    isConnected: (s) => s.isConnected,
  });

  const setSpotifyCredentials = useCallback((clientId: string, clientSecret: string) => {
    setCredentials?.({ clientId, clientSecret });
  }, [setCredentials]);

  return (
    <SpotifyContext.Provider value={{
      spotify: settings,
      setSpotifyCredentials,
      setSpotifyTokens: setTokens,
      setSpotifyUser: setUser,
      clearSpotifyAuth: clearAuth,
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
