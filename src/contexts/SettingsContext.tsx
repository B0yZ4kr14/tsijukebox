import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SettingsContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  useWebSocket: boolean;
  setUseWebSocket: (value: boolean) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
}

const defaultApiUrl = import.meta.env.VITE_API_URL || 'https://midiaserver.local/api';
const envDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'tsi_jukebox_settings';

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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(() => {
    const stored = loadSettings();
    return {
      isDemoMode: stored.isDemoMode ?? envDemoMode,
      apiUrl: stored.apiUrl ?? defaultApiUrl,
      useWebSocket: stored.useWebSocket ?? true,
      pollingInterval: stored.pollingInterval ?? 2000,
    };
  });

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

  return (
    <SettingsContext.Provider
      value={{
        isDemoMode: settings.isDemoMode ?? false,
        setDemoMode,
        apiUrl: settings.apiUrl ?? defaultApiUrl,
        setApiUrl,
        useWebSocket: settings.useWebSocket ?? true,
        setUseWebSocket,
        pollingInterval: settings.pollingInterval ?? 2000,
        setPollingInterval,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
