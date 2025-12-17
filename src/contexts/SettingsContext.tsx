import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { spotifyClient, SpotifyTokens, SpotifyUser } from '@/lib/api/spotify';
import type { Language } from '@/i18n';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'custom';

interface SpotifySettings {
  clientId: string;
  clientSecret: string;
  tokens: SpotifyTokens | null;
  user: SpotifyUser | null;
  isConnected: boolean;
}

interface WeatherSettings {
  apiKey: string;
  city: string;
  isEnabled: boolean;
}

interface SettingsContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  useWebSocket: boolean;
  setUseWebSocket: (value: boolean) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  // Spotify settings
  spotify: SpotifySettings;
  setSpotifyCredentials: (clientId: string, clientSecret: string) => void;
  setSpotifyTokens: (tokens: SpotifyTokens | null) => void;
  setSpotifyUser: (user: SpotifyUser | null) => void;
  clearSpotifyAuth: () => void;
  // Weather settings
  weather: WeatherSettings;
  setWeatherConfig: (config: Partial<WeatherSettings>) => void;
  // Language settings
  language: Language;
  setLanguage: (lang: Language) => void;
  // Theme settings
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  // Feedback settings
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
}

const defaultApiUrl = import.meta.env.VITE_API_URL || 'https://midiaserver.local/api';
const envDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
// Enable demo mode by default in development when no backend is configured
const shouldDefaultToDemo = import.meta.env.DEV || envDemoMode;

const defaultSpotifySettings: SpotifySettings = {
  clientId: '',
  clientSecret: '',
  tokens: null,
  user: null,
  isConnected: false,
};

const defaultWeatherSettings: WeatherSettings = {
  apiKey: '',
  city: 'Montes Claros, MG',
  isEnabled: false,
};

const defaultSettings: SettingsContextType = {
  isDemoMode: shouldDefaultToDemo,
  setDemoMode: () => {},
  apiUrl: defaultApiUrl,
  setApiUrl: () => {},
  useWebSocket: true,
  setUseWebSocket: () => {},
  pollingInterval: 2000,
  setPollingInterval: () => {},
  spotify: defaultSpotifySettings,
  setSpotifyCredentials: () => {},
  setSpotifyTokens: () => {},
  setSpotifyUser: () => {},
  clearSpotifyAuth: () => {},
  weather: defaultWeatherSettings,
  setWeatherConfig: () => {},
  language: 'pt-BR',
  setLanguage: () => {},
  theme: 'blue',
  setTheme: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
  animationsEnabled: true,
  setAnimationsEnabled: () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

const STORAGE_KEY = 'tsi_jukebox_settings';
const SPOTIFY_STORAGE_KEY = 'tsi_jukebox_spotify';
const WEATHER_STORAGE_KEY = 'tsi_jukebox_weather';
const LANGUAGE_STORAGE_KEY = 'tsi_jukebox_language';
const THEME_STORAGE_KEY = 'tsi_jukebox_theme';
const FEEDBACK_STORAGE_KEY = 'tsi_jukebox_feedback';

interface StoredSettings {
  isDemoMode?: boolean;
  apiUrl?: string;
  useWebSocket?: boolean;
  pollingInterval?: number;
}

interface StoredSpotifySettings {
  clientId?: string;
  clientSecret?: string;
  tokens?: SpotifyTokens;
}

function loadSettings(): StoredSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings: StoredSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
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

function loadWeatherSettings(): WeatherSettings {
  try {
    const stored = localStorage.getItem(WEATHER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultWeatherSettings;
  } catch {
    return defaultWeatherSettings;
  }
}

function saveWeatherSettings(settings: WeatherSettings) {
  try {
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save Weather settings:', e);
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(() => {
    const stored = loadSettings();
    return {
      isDemoMode: stored.isDemoMode ?? shouldDefaultToDemo,
      apiUrl: stored.apiUrl ?? defaultApiUrl,
      useWebSocket: stored.useWebSocket ?? true,
      pollingInterval: stored.pollingInterval ?? 2000,
    };
  });

  const [spotifySettings, setSpotifySettings] = useState<SpotifySettings>(() => {
    const stored = loadSpotifySettings();
    
    // Initialize spotifyClient with stored credentials
    if (stored.clientId && stored.clientSecret) {
      spotifyClient.setCredentials({
        clientId: stored.clientId,
        clientSecret: stored.clientSecret,
      });
    }
    
    // Initialize spotifyClient with stored tokens
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

  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(() => loadWeatherSettings());
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (stored as Language) || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  });
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored as ThemeColor) || 'blue';
    } catch {
      return 'blue';
    }
  });

  // Feedback settings (sound + animations)
  const [feedbackSettings, setFeedbackSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { soundEnabled: true, animationsEnabled: true };
    } catch {
      return { soundEnabled: true, animationsEnabled: true };
    }
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Validate stored token on mount
  useEffect(() => {
    const validateStoredToken = async () => {
      if (spotifySettings.tokens?.accessToken) {
        const user = await spotifyClient.validateToken();
        if (user) {
          setSpotifySettings(prev => ({ ...prev, user, isConnected: true }));
        } else {
          // Token invalid, clear it
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

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setDemoMode = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, isDemoMode: value }));
  }, []);

  const setApiUrl = useCallback((value: string) => {
    setSettings(prev => ({ ...prev, apiUrl: value }));
  }, []);

  const setUseWebSocket = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, useWebSocket: value }));
  }, []);

  const setPollingInterval = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, pollingInterval: value }));
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

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, []);

  const setWeatherConfig = useCallback((config: Partial<WeatherSettings>) => {
    setWeatherSettings(prev => {
      const updated = { ...prev, ...config };
      saveWeatherSettings(updated);
      return updated;
    });
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    setFeedbackSettings(prev => {
      const updated = { ...prev, soundEnabled: value };
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setFeedbackSettings(prev => {
      const updated = { ...prev, animationsEnabled: value };
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    isDemoMode: settings.isDemoMode ?? false,
    setDemoMode,
    apiUrl: settings.apiUrl ?? defaultApiUrl,
    setApiUrl,
    useWebSocket: settings.useWebSocket ?? true,
    setUseWebSocket,
    pollingInterval: settings.pollingInterval ?? 2000,
    setPollingInterval,
    spotify: spotifySettings,
    setSpotifyCredentials,
    setSpotifyTokens,
    setSpotifyUser,
    clearSpotifyAuth,
    weather: weatherSettings,
    setWeatherConfig,
    language,
    setLanguage,
    theme,
    setTheme,
    soundEnabled: feedbackSettings.soundEnabled,
    setSoundEnabled,
    animationsEnabled: feedbackSettings.animationsEnabled,
    setAnimationsEnabled,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
