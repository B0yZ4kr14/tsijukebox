import React, { createContext, useContext } from 'react';
import { SpotifyProvider, useSpotify, type SpotifySettings } from './SpotifyContext';
import { YouTubeMusicProvider, useYouTubeMusic, type YouTubeMusicSettings } from './YouTubeMusicContext';
import { ThemeProvider, useTheme, type ThemeColor } from './ThemeContext';
import { AppSettingsProvider, useAppSettings, type MusicProvider } from './AppSettingsContext';
import type { SpotifyTokens, SpotifyUser } from '@/lib/api/spotify';
import type { YouTubeMusicTokens, YouTubeMusicUser } from '@/lib/api/youtubeMusic';
import type { Language } from '@/i18n';

// Re-export types for backward compatibility
export type { ThemeColor, MusicProvider };

interface SpicetifySettings {
  isInstalled: boolean;
  currentTheme: string;
  version: string;
}

interface WeatherSettings {
  apiKey: string;
  city: string;
  isEnabled: boolean;
}

// Unified interface for backward compatibility
interface SettingsContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  useWebSocket: boolean;
  setUseWebSocket: (value: boolean) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  spotify: SpotifySettings;
  setSpotifyCredentials: (clientId: string, clientSecret: string) => void;
  setSpotifyTokens: (tokens: SpotifyTokens | null) => void;
  setSpotifyUser: (user: SpotifyUser | null) => void;
  clearSpotifyAuth: () => void;
  youtubeMusic: YouTubeMusicSettings;
  setYouTubeMusicTokens: (tokens: YouTubeMusicTokens | null) => void;
  setYouTubeMusicUser: (user: YouTubeMusicUser | null) => void;
  clearYouTubeMusicAuth: () => void;
  spicetify: SpicetifySettings;
  setSpicetifyConfig: (config: Partial<SpicetifySettings>) => void;
  musicProvider: MusicProvider;
  setMusicProvider: (provider: MusicProvider) => void;
  weather: WeatherSettings;
  setWeatherConfig: (config: Partial<WeatherSettings>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

/**
 * Internal component that combines all context values
 */
function SettingsAggregator({ children }: { children: React.ReactNode }) {
  const spotifyContext = useSpotify();
  const youtubeMusicContext = useYouTubeMusic();
  const themeContext = useTheme();
  const appSettingsContext = useAppSettings();

  const value: SettingsContextType = {
    // App settings
    isDemoMode: appSettingsContext.isDemoMode,
    setDemoMode: appSettingsContext.setDemoMode,
    apiUrl: appSettingsContext.apiUrl,
    setApiUrl: appSettingsContext.setApiUrl,
    useWebSocket: appSettingsContext.useWebSocket,
    setUseWebSocket: appSettingsContext.setUseWebSocket,
    pollingInterval: appSettingsContext.pollingInterval,
    setPollingInterval: appSettingsContext.setPollingInterval,
    spicetify: appSettingsContext.spicetify,
    setSpicetifyConfig: appSettingsContext.setSpicetifyConfig,
    musicProvider: appSettingsContext.musicProvider,
    setMusicProvider: appSettingsContext.setMusicProvider,
    weather: appSettingsContext.weather,
    setWeatherConfig: appSettingsContext.setWeatherConfig,
    // Spotify
    spotify: spotifyContext.spotify,
    setSpotifyCredentials: spotifyContext.setSpotifyCredentials,
    setSpotifyTokens: spotifyContext.setSpotifyTokens,
    setSpotifyUser: spotifyContext.setSpotifyUser,
    clearSpotifyAuth: spotifyContext.clearSpotifyAuth,
    // YouTube Music
    youtubeMusic: youtubeMusicContext.youtubeMusic,
    setYouTubeMusicTokens: youtubeMusicContext.setYouTubeMusicTokens,
    setYouTubeMusicUser: youtubeMusicContext.setYouTubeMusicUser,
    clearYouTubeMusicAuth: youtubeMusicContext.clearYouTubeMusicAuth,
    // Theme
    theme: themeContext.theme,
    setTheme: themeContext.setTheme,
    language: themeContext.language,
    setLanguage: themeContext.setLanguage,
    soundEnabled: themeContext.soundEnabled,
    setSoundEnabled: themeContext.setSoundEnabled,
    animationsEnabled: themeContext.animationsEnabled,
    setAnimationsEnabled: themeContext.setAnimationsEnabled,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Provider that composes all settings contexts
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppSettingsProvider>
      <ThemeProvider>
        <SpotifyProvider>
          <YouTubeMusicProvider>
            <SettingsAggregator>
              {children}
            </SettingsAggregator>
          </YouTubeMusicProvider>
        </SpotifyProvider>
      </ThemeProvider>
    </AppSettingsProvider>
  );
}

/**
 * Hook to access all settings (backward compatible)
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
