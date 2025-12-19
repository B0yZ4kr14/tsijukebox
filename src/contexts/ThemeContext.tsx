import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from '@/i18n';
import { setHighContrast as applyHighContrast, setReducedMotion as applyReducedMotion } from '@/lib/theme-utils';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'custom';
export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  isDarkMode: boolean;
}

const LANGUAGE_STORAGE_KEY = 'tsi_jukebox_language';
const THEME_STORAGE_KEY = 'tsi_jukebox_theme';
const THEME_MODE_STORAGE_KEY = 'tsi_jukebox_theme_mode';
const FEEDBACK_STORAGE_KEY = 'tsi_jukebox_feedback';
const ACCESSIBILITY_STORAGE_KEY = 'tsi_jukebox_accessibility';

interface FeedbackSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Ignore parse errors
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

function getSystemPrefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function getSystemPrefersHighContrast(): boolean {
  return window.matchMedia?.('(prefers-contrast: more)').matches ?? false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored as ThemeColor) || 'blue';
    } catch {
      return 'blue';
    }
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      return (stored as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (stored as Language) || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  });

  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>(() => 
    loadFromStorage(FEEDBACK_STORAGE_KEY, { soundEnabled: true, animationsEnabled: true })
  );

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    const saved = loadFromStorage<AccessibilitySettings | null>(ACCESSIBILITY_STORAGE_KEY, null);
    if (saved) return saved;
    // Use system preferences as defaults
    return {
      highContrast: getSystemPrefersHighContrast(),
      reducedMotion: getSystemPrefersReducedMotion(),
    };
  });

  // Compute actual dark mode based on themeMode
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && getSystemPrefersDark());

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply dark/light mode
  useEffect(() => {
    const dark = themeMode === 'dark' || (themeMode === 'system' && getSystemPrefersDark());
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-light-mode', String(!dark));
  }, [themeMode]);

  // Apply accessibility settings
  useEffect(() => {
    applyHighContrast(accessibilitySettings.highContrast);
    applyReducedMotion(accessibilitySettings.reducedMotion);
  }, [accessibilitySettings]);

  // Listen for system preference changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const dark = mediaQuery.matches;
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.setAttribute('data-light-mode', String(!dark));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.error('Failed to save theme mode:', e);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    setFeedbackSettings((prev) => {
      const updated = { ...prev, soundEnabled: value };
      saveToStorage(FEEDBACK_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setFeedbackSettings((prev) => {
      const updated = { ...prev, animationsEnabled: value };
      saveToStorage(FEEDBACK_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setAccessibilitySettings((prev) => {
      const updated = { ...prev, highContrast: value };
      saveToStorage(ACCESSIBILITY_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setAccessibilitySettings((prev) => {
      const updated = { ...prev, reducedMotion: value };
      saveToStorage(ACCESSIBILITY_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      themeMode,
      setThemeMode,
      language,
      setLanguage,
      soundEnabled: feedbackSettings.soundEnabled,
      setSoundEnabled,
      animationsEnabled: feedbackSettings.animationsEnabled,
      setAnimationsEnabled,
      highContrast: accessibilitySettings.highContrast,
      setHighContrast,
      reducedMotion: accessibilitySettings.reducedMotion,
      setReducedMotion,
      isDarkMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
