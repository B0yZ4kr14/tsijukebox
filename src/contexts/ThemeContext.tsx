/**
 * TSiJUKEBOX Theme Context v2.0
 * 
 * Sistema de temas refatorado com 5 temas oficiais:
 * 1. Cosmic Player - Visual aurora cósmico
 * 2. Karaoke Stage - Visual de palco
 * 3. Dashboard Home - Visual moderno com cards
 * 4. Spotify Integration - Visual verde Spotify
 * 5. Settings Dark - Visual escuro minimalista
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language } from '@/i18n';
import { setHighContrast as applyHighContrast, setReducedMotion as applyReducedMotion } from '@/lib/theme-utils';
import { 
  type ThemeName, 
  type Theme, 
  themes, 
  defaultTheme, 
  getTheme,
  generateCSSVariables 
} from '@/lib/themes';

// ============================================================================
// TIPOS
// ============================================================================

export type ThemeMode = 'dark' | 'light' | 'system';

// Re-export ThemeName para compatibilidade
export type { ThemeName };

// Manter compatibilidade com código antigo
export type ThemeColor = ThemeName;

interface ThemeContextType {
  // Novo sistema de temas
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  currentTheme: Theme;
  availableThemes: Theme[];
  
  // Compatibilidade com código antigo
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  
  // Modo claro/escuro
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  
  // Idioma
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Feedback
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  
  // Acessibilidade
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STORAGE_KEYS = {
  THEME: 'tsi_jukebox_theme_v2',
  THEME_MODE: 'tsi_jukebox_theme_mode',
  LANGUAGE: 'tsi_jukebox_language',
  FEEDBACK: 'tsi_jukebox_feedback',
  ACCESSIBILITY: 'tsi_jukebox_accessibility',
} as const;

// ============================================================================
// HELPERS
// ============================================================================

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

function migrateOldTheme(oldTheme: string): ThemeName {
  // Migrar temas antigos para novos
  const migrationMap: Record<string, ThemeName> = {
    'blue': 'cosmic-player',
    'green': 'spotify-integration',
    'purple': 'karaoke-stage',
    'orange': 'dashboard-home',
    'pink': 'karaoke-stage',
    'custom': 'settings-dark',
  };
  
  return migrationMap[oldTheme] || defaultTheme;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Estado do tema
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    try {
      // Tentar carregar tema novo
      const storedNew = localStorage.getItem(STORAGE_KEYS.THEME);
      if (storedNew) {
        const parsed = JSON.parse(storedNew);
        if (themes[parsed as ThemeName]) {
          return parsed as ThemeName;
        }
      }
      
      // Migrar tema antigo se existir
      const storedOld = localStorage.getItem('tsi_jukebox_theme');
      if (storedOld) {
        const migrated = migrateOldTheme(storedOld);
        saveToStorage(STORAGE_KEYS.THEME, migrated);
        return migrated;
      }
    } catch {
      // Ignore errors
    }
    return defaultTheme;
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      return (stored as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (stored as Language) || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  });

  const [feedbackSettings, setFeedbackSettings] = useState(() => 
    loadFromStorage(STORAGE_KEYS.FEEDBACK, { soundEnabled: true, animationsEnabled: true })
  );

  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    const saved = loadFromStorage<{ highContrast: boolean; reducedMotion: boolean } | null>(
      STORAGE_KEYS.ACCESSIBILITY, 
      null
    );
    if (saved) return saved;
    return {
      highContrast: getSystemPrefersHighContrast(),
      reducedMotion: getSystemPrefersReducedMotion(),
    };
  });

  // Computed values
  const currentTheme = useMemo(() => getTheme(themeName), [themeName]);
  const availableThemes = useMemo(() => Object.values(themes), []);
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && getSystemPrefersDark());

  // Aplicar CSS variables do tema
  useEffect(() => {
    const cssVars = generateCSSVariables(currentTheme);
    const style = document.createElement('style');
    style.id = 'tsi-theme-vars';
    style.textContent = `:root { ${cssVars} }`;
    
    // Remover estilo anterior se existir
    const existing = document.getElementById('tsi-theme-vars');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(style);
    
    // Aplicar atributos ao documento
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.setAttribute('data-theme-name', currentTheme.displayName);
  }, [themeName, currentTheme]);

  // Aplicar modo claro/escuro
  useEffect(() => {
    const dark = themeMode === 'dark' || (themeMode === 'system' && getSystemPrefersDark());
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-light-mode', String(!dark));
  }, [themeMode]);

  // Aplicar configurações de acessibilidade
  useEffect(() => {
    applyHighContrast(accessibilitySettings.highContrast);
    applyReducedMotion(accessibilitySettings.reducedMotion);
  }, [accessibilitySettings]);

  // Listener para mudanças de preferência do sistema
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

  // Callbacks
  const setThemeName = useCallback((name: ThemeName) => {
    if (!themes[name]) {
      console.warn(`Theme "${name}" not found, using default`);
      name = defaultTheme;
    }
    setThemeNameState(name);
    saveToStorage(STORAGE_KEYS.THEME, name);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (e) {
      console.error('Failed to save theme mode:', e);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    setFeedbackSettings((prev) => {
      const updated = { ...prev, soundEnabled: value };
      saveToStorage(STORAGE_KEYS.FEEDBACK, updated);
      return updated;
    });
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setFeedbackSettings((prev) => {
      const updated = { ...prev, animationsEnabled: value };
      saveToStorage(STORAGE_KEYS.FEEDBACK, updated);
      return updated;
    });
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setAccessibilitySettings((prev) => {
      const updated = { ...prev, highContrast: value };
      saveToStorage(STORAGE_KEYS.ACCESSIBILITY, updated);
      return updated;
    });
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setAccessibilitySettings((prev) => {
      const updated = { ...prev, reducedMotion: value };
      saveToStorage(STORAGE_KEYS.ACCESSIBILITY, updated);
      return updated;
    });
  }, []);

  // Context value
  const value = useMemo<ThemeContextType>(() => ({
    // Novo sistema
    themeName,
    setThemeName,
    currentTheme,
    availableThemes,
    
    // Compatibilidade
    theme: themeName,
    setTheme: setThemeName,
    
    // Modo
    themeMode,
    setThemeMode,
    isDarkMode,
    
    // Idioma
    language,
    setLanguage,
    
    // Feedback
    soundEnabled: feedbackSettings.soundEnabled,
    setSoundEnabled,
    animationsEnabled: feedbackSettings.animationsEnabled,
    setAnimationsEnabled,
    
    // Acessibilidade
    highContrast: accessibilitySettings.highContrast,
    setHighContrast,
    reducedMotion: accessibilitySettings.reducedMotion,
    setReducedMotion,
  }), [
    themeName,
    setThemeName,
    currentTheme,
    availableThemes,
    themeMode,
    setThemeMode,
    isDarkMode,
    language,
    setLanguage,
    feedbackSettings,
    setSoundEnabled,
    setAnimationsEnabled,
    accessibilitySettings,
    setHighContrast,
    setReducedMotion,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useCurrentTheme() {
  const { currentTheme } = useTheme();
  return currentTheme;
}

export function useThemeColors() {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
}
