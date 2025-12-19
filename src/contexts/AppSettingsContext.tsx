import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type MusicProvider = 'spotify' | 'spicetify' | 'youtube-music' | 'local';

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

interface AppSettingsContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  useWebSocket: boolean;
  setUseWebSocket: (value: boolean) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  spicetify: SpicetifySettings;
  setSpicetifyConfig: (config: Partial<SpicetifySettings>) => void;
  musicProvider: MusicProvider;
  setMusicProvider: (provider: MusicProvider) => void;
  weather: WeatherSettings;
  setWeatherConfig: (config: Partial<WeatherSettings>) => void;
}

const STORAGE_KEY = 'tsi_jukebox_settings';
const WEATHER_STORAGE_KEY = 'tsi_jukebox_weather';
const MUSIC_PROVIDER_STORAGE_KEY = 'tsi_jukebox_music_provider';

const defaultApiUrl = import.meta.env.VITE_API_URL || 'https://midiaserver.local/api';
const envDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const shouldDefaultToDemo = import.meta.env.DEV || envDemoMode;

const defaultSpicetifySettings: SpicetifySettings = {
  isInstalled: false,
  currentTheme: '',
  version: '',
};

const defaultWeatherSettings: WeatherSettings = {
  apiKey: '',
  city: 'Montes Claros, MG',
  isEnabled: false,
};

interface StoredSettings {
  isDemoMode?: boolean;
  apiUrl?: string;
  useWebSocket?: boolean;
  pollingInterval?: number;
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

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(() => {
    const stored = loadSettings();
    return {
      isDemoMode: stored.isDemoMode ?? shouldDefaultToDemo,
      apiUrl: stored.apiUrl ?? defaultApiUrl,
      useWebSocket: stored.useWebSocket ?? true,
      pollingInterval: stored.pollingInterval ?? 2000,
    };
  });

  const [spicetifySettings, setSpicetifySettings] = useState<SpicetifySettings>(defaultSpicetifySettings);

  const [musicProvider, setMusicProviderState] = useState<MusicProvider>(() => {
    try {
      const stored = localStorage.getItem(MUSIC_PROVIDER_STORAGE_KEY);
      return (stored as MusicProvider) || 'spotify';
    } catch {
      return 'spotify';
    }
  });

  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(() => loadWeatherSettings());

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

  const setSpicetifyConfig = useCallback((config: Partial<SpicetifySettings>) => {
    setSpicetifySettings(prev => ({ ...prev, ...config }));
  }, []);

  const setMusicProvider = useCallback((provider: MusicProvider) => {
    setMusicProviderState(provider);
    try {
      localStorage.setItem(MUSIC_PROVIDER_STORAGE_KEY, provider);
    } catch (e) {
      console.error('Failed to save music provider:', e);
    }
  }, []);

  const setWeatherConfig = useCallback((config: Partial<WeatherSettings>) => {
    setWeatherSettings(prev => {
      const updated = { ...prev, ...config };
      saveWeatherSettings(updated);
      return updated;
    });
  }, []);

  return (
    <AppSettingsContext.Provider value={{
      isDemoMode: settings.isDemoMode ?? false,
      setDemoMode,
      apiUrl: settings.apiUrl ?? defaultApiUrl,
      setApiUrl,
      useWebSocket: settings.useWebSocket ?? true,
      setUseWebSocket,
      pollingInterval: settings.pollingInterval ?? 2000,
      setPollingInterval,
      spicetify: spicetifySettings,
      setSpicetifyConfig,
      musicProvider,
      setMusicProvider,
      weather: weatherSettings,
      setWeatherConfig,
    }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
