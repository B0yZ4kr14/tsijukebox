import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { applyThemeWithTransition } from '@/lib/theme-utils';

export interface CustomThemeColors {
  primary: string;      // HSL: "195 100% 50%"
  primaryGlow: string;  // HSL: "195 100% 60%"
  accent: string;       // HSL: "210 100% 55%"
  background: string;   // HSL: "240 10% 10%"
  surface: string;      // HSL: "240 10% 15%"
  text: string;         // HSL: "0 0% 96%"
  // Gradient settings
  gradientEnabled: boolean;
  gradientStart: string;  // HSL: "240 15% 8%"
  gradientEnd: string;    // HSL: "280 20% 15%"
  gradientAngle: number;  // 0-360 degrees
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: CustomThemeColors;
  isBuiltIn: boolean;
  createdAt: string;
}

// Built-in presets
export const builtInPresets: ThemePreset[] = [
  {
    id: 'blue',
    name: 'Neon Azul',
    colors: {
      primary: '195 100% 50%',
      primaryGlow: '195 100% 60%',
      accent: '210 100% 55%',
      background: '240 10% 10%',
      surface: '240 10% 15%',
      text: '0 0% 96%',
      gradientEnabled: false,
      gradientStart: '240 15% 8%',
      gradientEnd: '220 20% 15%',
      gradientAngle: 145,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'green',
    name: 'Neon Verde',
    colors: {
      primary: '145 100% 45%',
      primaryGlow: '145 100% 55%',
      accent: '160 100% 50%',
      background: '240 10% 10%',
      surface: '240 10% 15%',
      text: '0 0% 96%',
      gradientEnabled: false,
      gradientStart: '140 15% 8%',
      gradientEnd: '160 20% 15%',
      gradientAngle: 145,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'purple',
    name: 'Neon Roxo',
    colors: {
      primary: '280 100% 60%',
      primaryGlow: '280 100% 70%',
      accent: '300 100% 65%',
      background: '240 10% 10%',
      surface: '240 10% 15%',
      text: '0 0% 96%',
      gradientEnabled: false,
      gradientStart: '280 15% 8%',
      gradientEnd: '300 20% 15%',
      gradientAngle: 145,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'orange',
    name: 'Neon Laranja',
    colors: {
      primary: '25 100% 55%',
      primaryGlow: '25 100% 65%',
      accent: '35 100% 60%',
      background: '240 10% 10%',
      surface: '240 10% 15%',
      text: '0 0% 96%',
      gradientEnabled: false,
      gradientStart: '25 15% 8%',
      gradientEnd: '35 20% 15%',
      gradientAngle: 145,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pink',
    name: 'Neon Rosa',
    colors: {
      primary: '330 100% 60%',
      primaryGlow: '330 100% 70%',
      accent: '340 100% 65%',
      background: '240 10% 10%',
      surface: '240 10% 15%',
      text: '0 0% 96%',
      gradientEnabled: false,
      gradientStart: '330 15% 8%',
      gradientEnd: '340 20% 15%',
      gradientAngle: 145,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // New gradient presets
  {
    id: 'aurora',
    name: 'Aurora Boreal',
    colors: {
      primary: '170 100% 50%',
      primaryGlow: '170 100% 60%',
      accent: '280 100% 60%',
      background: '240 15% 8%',
      surface: '240 15% 12%',
      text: '0 0% 96%',
      gradientEnabled: true,
      gradientStart: '170 50% 8%',
      gradientEnd: '280 40% 15%',
      gradientAngle: 135,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    colors: {
      primary: '25 100% 55%',
      primaryGlow: '25 100% 65%',
      accent: '350 100% 60%',
      background: '240 15% 8%',
      surface: '240 15% 12%',
      text: '0 0% 96%',
      gradientEnabled: true,
      gradientStart: '25 50% 10%',
      gradientEnd: '350 40% 12%',
      gradientAngle: 180,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ocean',
    name: 'Oceano Profundo',
    colors: {
      primary: '200 100% 50%',
      primaryGlow: '200 100% 60%',
      accent: '180 100% 45%',
      background: '210 30% 6%',
      surface: '210 30% 10%',
      text: '0 0% 96%',
      gradientEnabled: true,
      gradientStart: '210 50% 5%',
      gradientEnd: '200 40% 12%',
      gradientAngle: 160,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Light Neon Theme - Cards claros/prateados com ícones neon
  {
    id: 'light-neon',
    name: 'Light Neon',
    colors: {
      primary: '195 100% 45%',      // Cyan neon (mais saturado para fundo claro)
      primaryGlow: '195 100% 55%',
      accent: '45 100% 50%',        // Dourado
      background: '220 15% 92%',    // Prata claro/pastel
      surface: '220 20% 96%',       // Branco acinzentado
      text: '220 25% 15%',          // Texto escuro
      gradientEnabled: false,
      gradientStart: '220 15% 90%',
      gradientEnd: '220 20% 95%',
      gradientAngle: 145,
    },
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const defaultColors: CustomThemeColors = builtInPresets[0].colors;

function loadCustomPresets(): ThemePreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomPresets(presets: ThemePreset[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(presets));
  } catch (e) {
    if (import.meta.env.DEV) console.error('Failed to save custom presets:', e);
  }
}

function loadActiveCustomColors(): CustomThemeColors | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_COLORS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultColors,
        ...parsed,
        gradientEnabled: parsed.gradientEnabled ?? false,
        gradientStart: parsed.gradientStart ?? '240 15% 8%',
        gradientEnd: parsed.gradientEnd ?? '220 20% 15%',
        gradientAngle: parsed.gradientAngle ?? 145,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveActiveCustomColors(colors: CustomThemeColors | null) {
  try {
    if (colors) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COLORS, JSON.stringify(colors));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_COLORS);
    }
  } catch (e) {
    if (import.meta.env.DEV) console.error('Failed to save custom colors:', e);
  }
}

export function applyCustomColors(colors: CustomThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--custom-primary', colors.primary);
  root.style.setProperty('--custom-primary-glow', colors.primaryGlow);
  root.style.setProperty('--custom-accent', colors.accent);
  root.style.setProperty('--custom-bg', colors.background);
  root.style.setProperty('--custom-surface', colors.surface);
  root.style.setProperty('--custom-text', colors.text);
  root.setAttribute('data-theme', 'custom');
  
  // Detect if this is a light theme (background lightness > 50%)
  const bgParts = colors.background.split(' ');
  const lightness = parseFloat(bgParts[2]?.replace('%', '') || '10');
  const isLightMode = lightness > 50;
  
  // Apply light mode class for CSS conditional styling
  if (isLightMode) {
    root.setAttribute('data-light-mode', 'true');
    document.body.classList.add('light-neon-mode');
  } else {
    root.removeAttribute('data-light-mode');
    document.body.classList.remove('light-neon-mode');
  }
  
  // Apply gradient if enabled
  if (colors.gradientEnabled) {
    const gradient = `linear-gradient(${colors.gradientAngle}deg, hsl(${colors.gradientStart}), hsl(${colors.gradientEnd}))`;
    root.style.setProperty('--custom-gradient', gradient);
    document.body.setAttribute('data-gradient', 'true');
  } else {
    root.style.removeProperty('--custom-gradient');
    document.body.removeAttribute('data-gradient');
  }
}

export function clearCustomColors() {
  const root = document.documentElement;
  root.style.removeProperty('--custom-primary');
  root.style.removeProperty('--custom-primary-glow');
  root.style.removeProperty('--custom-accent');
  root.style.removeProperty('--custom-bg');
  root.style.removeProperty('--custom-surface');
  root.style.removeProperty('--custom-text');
  root.style.removeProperty('--custom-gradient');
  root.removeAttribute('data-theme');
  root.removeAttribute('data-light-mode');
  document.body.removeAttribute('data-gradient');
  document.body.classList.remove('light-neon-mode');
}

// Convert HSL string to HEX
export function hslToHex(hsl: string): string {
  const parts = hsl.split(' ').map(p => parseFloat(p));
  if (parts.length < 3) return '#00bfff';
  
  const [h, s, l] = parts;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert HEX to HSL string
export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '195 100% 50%';

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useThemeCustomizer() {
  const [customPresets, setCustomPresets] = useState<ThemePreset[]>(() => loadCustomPresets());
  const [activeColors, setActiveColors] = useState<CustomThemeColors | null>(() => loadActiveCustomColors());
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => !!loadActiveCustomColors());

  // Get all presets (built-in + custom)
  const allPresets = [...builtInPresets, ...customPresets];

  // Apply colors on mount if custom mode
  useEffect(() => {
    if (activeColors && isCustomMode) {
      applyCustomColors(activeColors);
    }
  }, []);

  const setColors = useCallback((colors: CustomThemeColors, withTransition = true) => {
    if (withTransition) {
      applyThemeWithTransition('custom', () => {
        applyCustomColors(colors);
      });
    } else {
      applyCustomColors(colors);
    }
    setActiveColors(colors);
    setIsCustomMode(true);
    saveActiveCustomColors(colors);
  }, []);

  const savePreset = useCallback((name: string, colors: CustomThemeColors): ThemePreset => {
    const newPreset: ThemePreset = {
      id: `custom-${Date.now()}`,
      name,
      colors,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    return newPreset;
  }, [customPresets]);

  const deletePreset = useCallback((id: string) => {
    const preset = customPresets.find(p => p.id === id);
    if (preset && !preset.isBuiltIn) {
      const updated = customPresets.filter(p => p.id !== id);
      setCustomPresets(updated);
      saveCustomPresets(updated);
    }
  }, [customPresets]);

  const loadPreset = useCallback((preset: ThemePreset) => {
    setColors(preset.colors);
  }, [setColors]);

  const resetToDefault = useCallback(() => {
    setActiveColors(null);
    setIsCustomMode(false);
    clearCustomColors();
    saveActiveCustomColors(null);
  }, []);

  const updateColor = useCallback((key: keyof CustomThemeColors, value: string | number | boolean) => {
    const newColors = {
      ...(activeColors || defaultColors),
      [key]: value,
    };
    setColors(newColors);
  }, [activeColors, setColors]);

  return {
    customPresets,
    allPresets,
    activeColors: activeColors || defaultColors,
    isCustomMode,
    setColors,
    savePreset,
    deletePreset,
    loadPreset,
    resetToDefault,
    updateColor,
  };
}
