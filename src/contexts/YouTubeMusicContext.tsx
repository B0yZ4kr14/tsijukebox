import React, { createContext, useContext, useState, useCallback } from 'react';
import { youtubeMusicClient, YouTubeMusicTokens, YouTubeMusicUser } from '@/lib/api/youtubeMusic';

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

function loadYouTubeMusicSettings(): { tokens?: YouTubeMusicTokens } {
  try {
    const stored = localStorage.getItem(YOUTUBE_MUSIC_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveYouTubeMusicSettings(settings: { tokens?: YouTubeMusicTokens }) {
  try {
    localStorage.setItem(YOUTUBE_MUSIC_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save YouTube Music settings:', e);
  }
}

const YouTubeMusicContext = createContext<YouTubeMusicContextType | null>(null);

export function YouTubeMusicProvider({ children }: { children: React.ReactNode }) {
  const [youtubeMusicSettings, setYouTubeMusicSettings] = useState<YouTubeMusicSettings>(() => {
    const stored = loadYouTubeMusicSettings();
    if (stored.tokens) {
      youtubeMusicClient.setTokens(stored.tokens);
    }
    return {
      tokens: stored.tokens || null,
      user: null,
      isConnected: !!stored.tokens?.accessToken,
    };
  });

  const setYouTubeMusicTokens = useCallback((tokens: YouTubeMusicTokens | null) => {
    if (tokens) {
      youtubeMusicClient.setTokens(tokens);
    } else {
      youtubeMusicClient.clearTokens();
    }
    setYouTubeMusicSettings(prev => ({
      ...prev,
      tokens,
      isConnected: !!tokens?.accessToken,
    }));
    saveYouTubeMusicSettings({ tokens: tokens || undefined });
  }, []);

  const setYouTubeMusicUser = useCallback((user: YouTubeMusicUser | null) => {
    setYouTubeMusicSettings(prev => ({ ...prev, user }));
  }, []);

  const clearYouTubeMusicAuth = useCallback(() => {
    youtubeMusicClient.clearTokens();
    setYouTubeMusicSettings({
      tokens: null,
      user: null,
      isConnected: false,
    });
    saveYouTubeMusicSettings({});
  }, []);

  return (
    <YouTubeMusicContext.Provider value={{
      youtubeMusic: youtubeMusicSettings,
      setYouTubeMusicTokens,
      setYouTubeMusicUser,
      clearYouTubeMusicAuth,
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
