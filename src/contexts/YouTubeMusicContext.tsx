import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { youtubeMusicClient, YouTubeMusicTokens, YouTubeMusicUser } from '@/lib/api/youtubeMusic';

export interface YouTubeMusicSettings {
  clientId: string;
  clientSecret: string;
  tokens: YouTubeMusicTokens | null;
  user: YouTubeMusicUser | null;
  isConnected: boolean;
}

interface YouTubeMusicContextType {
  youtubeMusic: YouTubeMusicSettings;
  setYouTubeMusicCredentials: (clientId: string, clientSecret: string) => void;
  setYouTubeMusicTokens: (tokens: YouTubeMusicTokens | null) => void;
  setYouTubeMusicUser: (user: YouTubeMusicUser | null) => void;
  clearYouTubeMusicAuth: () => void;
}

const YOUTUBE_MUSIC_STORAGE_KEY = 'tsi_jukebox_youtube_music';

const defaultYouTubeMusicSettings: YouTubeMusicSettings = {
  clientId: '',
  clientSecret: '',
  tokens: null,
  user: null,
  isConnected: false,
};

const YouTubeMusicContext = createContext<YouTubeMusicContextType | null>(null);

export function YouTubeMusicProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<YouTubeMusicSettings>(() => {
    try {
      const stored = localStorage.getItem(YOUTUBE_MUSIC_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sync tokens with client
        if (parsed.tokens) {
          youtubeMusicClient.setTokens(parsed.tokens);
        }
        if (parsed.clientId && parsed.clientSecret) {
          youtubeMusicClient.setCredentials({
            clientId: parsed.clientId,
            clientSecret: parsed.clientSecret,
          });
        }
        return { ...defaultYouTubeMusicSettings, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse YouTube Music settings from localStorage');
    }
    return defaultYouTubeMusicSettings;
  });

  // Persist settings to localStorage
  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(YOUTUBE_MUSIC_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save YouTube Music settings to localStorage');
    }
  }, [settings]);

  // Validate token on app load
  const hasValidatedToken = useRef(false);
  
  useEffect(() => {
    const validateSavedToken = async () => {
      // Only validate once and if we have tokens
      if (hasValidatedToken.current || !settings.tokens || !settings.isConnected) {
        return;
      }
      
      hasValidatedToken.current = true;
      
      try {
        // Check if token is expired locally first
        const now = Date.now();
        if (settings.tokens.expiresAt && settings.tokens.expiresAt < now) {
          console.log('YouTube Music token expired, attempting refresh...');
          
          // Try to refresh the token
          if (settings.tokens.refreshToken && settings.clientId && settings.clientSecret) {
            try {
              const newTokens = await youtubeMusicClient.refreshTokens();
              setYouTubeMusicTokens(newTokens);
              console.log('YouTube Music token refreshed successfully');
              return;
            } catch (refreshError) {
              console.warn('Failed to refresh YouTube Music token:', refreshError);
            }
          }
          
          // Refresh failed, clear auth
          clearYouTubeMusicAuth();
          toast.warning('Sessão do YouTube Music expirada. Por favor, reconecte sua conta.');
          return;
        }
        
        // Validate token by making a simple API call
        const user = await youtubeMusicClient.validateToken();
        if (!user) {
          console.warn('YouTube Music token validation failed');
          
          // Try refresh before clearing
          if (settings.tokens.refreshToken && settings.clientId && settings.clientSecret) {
            try {
              const newTokens = await youtubeMusicClient.refreshTokens();
              setYouTubeMusicTokens(newTokens);
              return;
            } catch {
              // Refresh failed
            }
          }
          
          clearYouTubeMusicAuth();
          toast.warning('Token do YouTube Music inválido. Por favor, reconecte sua conta.');
        } else {
          // Update user info if needed
          if (!settings.user || settings.user.id !== user.id) {
            setYouTubeMusicUser(user);
          }
        }
      } catch (error) {
        console.warn('Failed to validate YouTube Music token:', error);
      }
    };
    
    validateSavedToken();
  }, [settings.tokens, settings.isConnected, settings.clientId, settings.clientSecret]);

  const setYouTubeMusicCredentials = useCallback((clientId: string, clientSecret: string) => {
    youtubeMusicClient.setCredentials({ clientId, clientSecret });
    setSettings(prev => ({
      ...prev,
      clientId,
      clientSecret,
    }));
  }, []);

  const setYouTubeMusicTokens = useCallback((tokens: YouTubeMusicTokens | null) => {
    if (tokens) {
      youtubeMusicClient.setTokens(tokens);
    } else {
      youtubeMusicClient.clearTokens();
    }
    setSettings(prev => ({
      ...prev,
      tokens,
      isConnected: !!tokens,
    }));
  }, []);

  const setYouTubeMusicUser = useCallback((user: YouTubeMusicUser | null) => {
    setSettings(prev => ({
      ...prev,
      user,
    }));
  }, []);

  const clearYouTubeMusicAuth = useCallback(() => {
    youtubeMusicClient.clearTokens();
    setSettings(prev => ({
      ...prev,
      tokens: null,
      user: null,
      isConnected: false,
    }));
  }, []);

  return (
    <YouTubeMusicContext.Provider value={{
      youtubeMusic: settings,
      setYouTubeMusicCredentials,
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
