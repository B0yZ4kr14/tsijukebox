import React, { createContext, useContext } from 'react';
import { youtubeMusicClient, YouTubeMusicTokens, YouTubeMusicUser } from '@/lib/api/youtubeMusic';
import { useMediaProviderStorage } from '@/hooks/common/useMediaProviderStorage';

export interface YouTubeMusicSettings {
  tokens: YouTubeMusicTokens | null;
  user: YouTubeMusicUser | null;
  isConnected: boolean;
}

interface YouTubeMusicContextType {
  youtubeMusic: YouTubeMusicSettings;
  setYouTubeMusicTokens: (tokens: YouTubeMusicTokens | null) => void;
  setYouTubeMusicUser: (user: YouTubeMusicUser | null) => void;
  clearYouTubeMusicAuth: () => void;
}

const YOUTUBE_MUSIC_STORAGE_KEY = 'tsi_jukebox_youtube_music';

const defaultYouTubeMusicSettings: YouTubeMusicSettings = {
  tokens: null,
  user: null,
  isConnected: false,
};

const YouTubeMusicContext = createContext<YouTubeMusicContextType | null>(null);

export function YouTubeMusicProvider({ children }: { children: React.ReactNode }) {
  const {
    settings,
    setTokens,
    setUser,
    clearAuth,
  } = useMediaProviderStorage<YouTubeMusicSettings, YouTubeMusicTokens, YouTubeMusicUser | null>({
    storageKey: YOUTUBE_MUSIC_STORAGE_KEY,
    defaultSettings: defaultYouTubeMusicSettings,
    client: {
      setTokens: (tokens) => youtubeMusicClient.setTokens(tokens),
      clearTokens: () => youtubeMusicClient.clearTokens(),
      validateToken: () => youtubeMusicClient.validateToken(), // Added automatic token validation
    },
    getTokens: (s) => s.tokens,
    isConnected: (s) => s.isConnected,
  });

  return (
    <YouTubeMusicContext.Provider value={{
      youtubeMusic: settings,
      setYouTubeMusicTokens: setTokens,
      setYouTubeMusicUser: setUser,
      clearYouTubeMusicAuth: clearAuth,
    }}>
      {children}
    </YouTubeMusicContext.Provider>
  );
}

export function useYouTubeMusic() {
  const context = useContext(YouTubeMusicContext);
  if (!context) {
    throw new Error('useYouTubeMusic must be used within a YouTubeMusicProvider');
  }
  return context;
}
