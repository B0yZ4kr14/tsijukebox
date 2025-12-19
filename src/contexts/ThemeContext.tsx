import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from '@/i18n';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'custom';

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
}

const LANGUAGE_STORAGE_KEY = 'tsi_jukebox_language';
const THEME_STORAGE_KEY = 'tsi_jukebox_theme';
const FEEDBACK_STORAGE_KEY = 'tsi_jukebox_feedback';

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored as ThemeColor) || 'blue';
    } catch {
      return 'blue';
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

  const setTheme = useCallback((newTheme: ThemeColor) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
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
    setFeedbackSettings((prev: { soundEnabled: boolean; animationsEnabled: boolean }) => {
      const updated = { ...prev, soundEnabled: value };
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setFeedbackSettings((prev: { soundEnabled: boolean; animationsEnabled: boolean }) => {
      const updated = { ...prev, animationsEnabled: value };
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      language,
      setLanguage,
      soundEnabled: feedbackSettings.soundEnabled,
      setSoundEnabled,
      animationsEnabled: feedbackSettings.animationsEnabled,
      setAnimationsEnabled,
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
