/**
 * TSiJUKEBOX Theme Manager
 * ========================
 * Sistema de troca dinâmica entre os 6 temas visuais
 * usando CSS Variables
 * 
 * @author B0.y_Z4kr14
 * @license Public Domain
 */

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export type ThemeId = 
  | 'cosmic-player'
  | 'karaoke-stage'
  | 'stage-neon-metallic'
  | 'dashboard-home'
  | 'spotify-integration'
  | 'settings-dark';

export interface ThemeColors {
  // Background
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGradient: string;
  
  // Accent
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Glow Effects
  glowPrimary: string;
  glowSecondary: string;
  
  // States
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Metallic
  metallicLight: string;
  metallicDark: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  colors: ThemeColors;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFINIÇÃO DOS 6 TEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const themes: Record<ThemeId, Theme> = {
  'cosmic-player': {
    id: 'cosmic-player',
    name: 'Cosmic Player',
    description: 'Tema padrão com estética espacial e cores vibrantes',
    icon: '🌌',
    colors: {
      bgPrimary: '#09090B',
      bgSecondary: '#1a1a2e',
      bgTertiary: '#2a1a3e',
      bgGradient: 'linear-gradient(135deg, #09090B 0%, #1a1a2e 50%, #2a1a3e 100%)',
      accentPrimary: '#00D4FF',
      accentSecondary: '#FF00D4',
      accentTertiary: '#8A2BE2',
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textMuted: '#808080',
      glowPrimary: '0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.3)',
      glowSecondary: '0 0 20px rgba(255, 0, 212, 0.6), 0 0 40px rgba(255, 0, 212, 0.3)',
      success: '#22C55E',
      warning: '#FFD700',
      error: '#EF4444',
      info: '#00D4FF',
      metallicLight: '#E8E8E8',
      metallicDark: '#4A4A4A',
    },
  },
  
  'karaoke-stage': {
    id: 'karaoke-stage',
    name: 'Karaoke Stage',
    description: 'Tema otimizado para o modo karaoke com luzes de palco',
    icon: '🎤',
    colors: {
      bgPrimary: '#1a0a2e',
      bgSecondary: '#2a1040',
      bgTertiary: '#3a1050',
      bgGradient: 'linear-gradient(135deg, #1a0a2e 0%, #2a1040 50%, #3a1050 100%)',
      accentPrimary: '#FF00D4',
      accentSecondary: '#FF1493',
      accentTertiary: '#8A2BE2',
      textPrimary: '#FFFFFF',
      textSecondary: '#D4A5FF',
      textMuted: '#9966CC',
      glowPrimary: '0 0 30px rgba(255, 0, 212, 0.8), 0 0 60px rgba(255, 0, 212, 0.4)',
      glowSecondary: '0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(138, 43, 226, 0.4)',
      success: '#00FF44',
      warning: '#FFD700',
      error: '#FF4444',
      info: '#FF00D4',
      metallicLight: '#D4A5FF',
      metallicDark: '#3a1050',
    },
  },
  
  'stage-neon-metallic': {
    id: 'stage-neon-metallic',
    name: 'Stage Neon Metallic',
    description: 'Interface metálica com efeitos neon cyan e magenta',
    icon: '✨',
    colors: {
      bgPrimary: '#0a0a1a',
      bgSecondary: '#1a0a2e',
      bgTertiary: '#2a1040',
      bgGradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2a1040 100%)',
      accentPrimary: '#00FFFF',
      accentSecondary: '#FF00D4',
      accentTertiary: '#FFD700',
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textMuted: '#808080',
      glowPrimary: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)',
      glowSecondary: '0 0 20px rgba(255, 0, 212, 0.6), 0 0 40px rgba(255, 0, 212, 0.3)',
      success: '#00FF44',
      warning: '#FFD700',
      error: '#FF4444',
      info: '#00FFFF',
      metallicLight: '#C0C0C0',
      metallicDark: '#71797E',
    },
  },
  
  'dashboard-home': {
    id: 'dashboard-home',
    name: 'Dashboard Home',
    description: 'Tema clean para visualização de estatísticas',
    icon: '🏠',
    colors: {
      bgPrimary: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      accentPrimary: '#FFD700',
      accentSecondary: '#FBB724',
      accentTertiary: '#F59E0B',
      textPrimary: '#FAFAFA',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      glowPrimary: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
      glowSecondary: '0 0 20px rgba(251, 183, 36, 0.6), 0 0 40px rgba(251, 183, 36, 0.3)',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      metallicLight: '#E2E8F0',
      metallicDark: '#475569',
    },
  },
  
  'spotify-integration': {
    id: 'spotify-integration',
    name: 'Spotify Integration',
    description: 'Tema inspirado na interface do Spotify',
    icon: '🟢',
    colors: {
      bgPrimary: '#121212',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#282828',
      bgGradient: 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #282828 100%)',
      accentPrimary: '#1DB954',
      accentSecondary: '#1ED760',
      accentTertiary: '#169C46',
      textPrimary: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textMuted: '#727272',
      glowPrimary: '0 0 20px rgba(29, 185, 84, 0.6), 0 0 40px rgba(29, 185, 84, 0.3)',
      glowSecondary: '0 0 20px rgba(30, 215, 96, 0.6), 0 0 40px rgba(30, 215, 96, 0.3)',
      success: '#1DB954',
      warning: '#F59E0B',
      error: '#E91429',
      info: '#509BF5',
      metallicLight: '#B3B3B3',
      metallicDark: '#404040',
    },
  },
  
  'settings-dark': {
    id: 'settings-dark',
    name: 'Settings Dark',
    description: 'Tema escuro para configurações do sistema',
    icon: '⚙️',
    colors: {
      bgPrimary: '#18181B',
      bgSecondary: '#27272A',
      bgTertiary: '#3F3F46',
      bgGradient: 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #3F3F46 100%)',
      accentPrimary: '#8B5CF6',
      accentSecondary: '#A78BFA',
      accentTertiary: '#7C3AED',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      glowPrimary: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
      glowSecondary: '0 0 20px rgba(167, 139, 250, 0.6), 0 0 40px rgba(167, 139, 250, 0.3)',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#8B5CF6',
      metallicLight: '#D4D4D8',
      metallicDark: '#52525B',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════

class ThemeManager {
  private currentTheme: ThemeId = 'stage-neon-metallic';
  private listeners: Set<(theme: Theme) => void> = new Set();
  private transitionDuration = 300; // ms
  
  constructor() {
    // Carrega tema salvo do localStorage
    this.loadSavedTheme();
    
    // Aplica tema inicial
    this.applyTheme(this.currentTheme);
  }
  
  /**
   * Carrega tema salvo do localStorage
   */
  private loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem('tsijukebox-theme');
      if (saved && themes[saved as ThemeId]) {
        this.currentTheme = saved as ThemeId;
      }
    } catch (e) {
      console.warn('Erro ao carregar tema:', e);
    }
  }
  
  /**
   * Salva tema no localStorage
   */
  private saveTheme(themeId: ThemeId): void {
    try {
      localStorage.setItem('tsijukebox-theme', themeId);
    } catch (e) {
      console.warn('Erro ao salvar tema:', e);
    }
  }
  
  /**
   * Aplica CSS Variables do tema ao documento
   */
  private applyTheme(themeId: ThemeId): void {
    const theme = themes[themeId];
    if (!theme) return;
    
    const root = document.documentElement;
    const { colors } = theme;
    
    // Adiciona classe de transição
    root.classList.add('theme-transitioning');
    
    // Aplica CSS Variables
    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--bg-gradient', colors.bgGradient);
    
    root.style.setProperty('--accent-primary', colors.accentPrimary);
    root.style.setProperty('--accent-secondary', colors.accentSecondary);
    root.style.setProperty('--accent-tertiary', colors.accentTertiary);
    
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    
    root.style.setProperty('--glow-primary', colors.glowPrimary);
    root.style.setProperty('--glow-secondary', colors.glowSecondary);
    
    root.style.setProperty('--state-success', colors.success);
    root.style.setProperty('--state-warning', colors.warning);
    root.style.setProperty('--state-error', colors.error);
    root.style.setProperty('--state-info', colors.info);
    
    root.style.setProperty('--metallic-light', colors.metallicLight);
    root.style.setProperty('--metallic-dark', colors.metallicDark);
    
    // Atualiza atributo data-theme
    root.setAttribute('data-theme', themeId);
    
    // Remove classe de transição após animação
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, this.transitionDuration);
  }
  
  /**
   * Troca para um tema específico
   */
  setTheme(themeId: ThemeId): void {
    if (!themes[themeId]) {
      console.error(`Tema não encontrado: ${themeId}`);
      return;
    }
    
    this.currentTheme = themeId;
    this.applyTheme(themeId);
    this.saveTheme(themeId);
    
    // Notifica listeners
    this.listeners.forEach(listener => listener(themes[themeId]));
  }
  
  /**
   * Retorna o tema atual
   */
  getTheme(): Theme {
    return themes[this.currentTheme];
  }
  
  /**
   * Retorna o ID do tema atual
   */
  getThemeId(): ThemeId {
    return this.currentTheme;
  }
  
  /**
   * Retorna todos os temas disponíveis
   */
  getAllThemes(): Theme[] {
    return Object.values(themes);
  }
  
  /**
   * Avança para o próximo tema (ciclo)
   */
  nextTheme(): void {
    const themeIds = Object.keys(themes) as ThemeId[];
    const currentIndex = themeIds.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeIds.length;
    this.setTheme(themeIds[nextIndex]);
  }
  
  /**
   * Volta para o tema anterior (ciclo)
   */
  previousTheme(): void {
    const themeIds = Object.keys(themes) as ThemeId[];
    const currentIndex = themeIds.indexOf(this.currentTheme);
    const prevIndex = (currentIndex - 1 + themeIds.length) % themeIds.length;
    this.setTheme(themeIds[prevIndex]);
  }
  
  /**
   * Adiciona listener para mudanças de tema
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Define duração da transição em ms
   */
  setTransitionDuration(ms: number): void {
    this.transitionDuration = ms;
    document.documentElement.style.setProperty('--theme-transition', `${ms}ms`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const themeManager = new ThemeManager();

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(themeManager.getTheme());
  
  useEffect(() => {
    const unsubscribe = themeManager.subscribe(setTheme);
    return unsubscribe;
  }, []);
  
  return {
    theme,
    themeId: theme.id,
    setTheme: (id: ThemeId) => themeManager.setTheme(id),
    nextTheme: () => themeManager.nextTheme(),
    previousTheme: () => themeManager.previousTheme(),
    allThemes: themeManager.getAllThemes(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS BASE PARA TRANSIÇÕES
// ═══════════════════════════════════════════════════════════════════════════

export const themeTransitionCSS = `
/* Transição suave entre temas */
:root {
  --theme-transition: 300ms;
}

.theme-transitioning,
.theme-transitioning * {
  transition: 
    background-color var(--theme-transition) ease,
    border-color var(--theme-transition) ease,
    color var(--theme-transition) ease,
    box-shadow var(--theme-transition) ease,
    fill var(--theme-transition) ease,
    stroke var(--theme-transition) ease !important;
}

/* CSS Variables padrão (Stage Neon Metallic) */
:root {
  --bg-primary: #0a0a1a;
  --bg-secondary: #1a0a2e;
  --bg-tertiary: #2a1040;
  --bg-gradient: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2a1040 100%);
  
  --accent-primary: #00FFFF;
  --accent-secondary: #FF00D4;
  --accent-tertiary: #FFD700;
  
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --text-muted: #808080;
  
  --glow-primary: 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3);
  --glow-secondary: 0 0 20px rgba(255, 0, 212, 0.6), 0 0 40px rgba(255, 0, 212, 0.3);
  
  --state-success: #00FF44;
  --state-warning: #FFD700;
  --state-error: #FF4444;
  --state-info: #00FFFF;
  
  --metallic-light: #C0C0C0;
  --metallic-dark: #71797E;
}
`;

export default themeManager;
