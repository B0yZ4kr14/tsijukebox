/**
 * TSiJUKEBOX Theme System v2.0
 * 
 * 5 Temas Oficiais baseados nos designs de referência:
 * 1. Cosmic Player - Player principal com visual aurora/cósmico
 * 2. Karaoke Stage - Interface karaoke com visual de palco
 * 3. Dashboard Home - Tela inicial com cards e estatísticas
 * 4. Spotify Integration - Integração Spotify com visual verde
 * 5. Settings Dark - Configurações com sidebar escura
 */

// ============================================================================
// TIPOS
// ============================================================================

export type ThemeName = 
  | 'cosmic-player'
  | 'karaoke-stage'
  | 'dashboard-home'
  | 'spotify-integration'
  | 'settings-dark'
  | 'stage-neon-metallic';

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgCardHover: string;
  bgOverlay: string;
  bgGradient: string;
  
  // Accent colors
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  accentGlow: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  
  // Border colors
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;
  
  // State colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Brand colors
  brandPrimary: string;
  brandSecondary: string;
  brandGradient: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyDisplay: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;
  fontSize4xl: string;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightSemibold: number;
  fontWeightBold: number;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glow: string;
  glowStrong: string;
  card: string;
  button: string;
}

export interface ThemeEffects {
  blur: string;
  blurStrong: string;
  transition: string;
  transitionFast: string;
  transitionSlow: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  effects: ThemeEffects;
}

// ============================================================================
// TIPOGRAFIA COMPARTILHADA
// ============================================================================

const sharedTypography: ThemeTypography = {
  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyDisplay: "'Poppins', 'Inter', sans-serif",
  fontSizeXs: '0.75rem',
  fontSizeSm: '0.875rem',
  fontSizeBase: '1rem',
  fontSizeLg: '1.125rem',
  fontSizeXl: '1.25rem',
  fontSize2xl: '1.5rem',
  fontSize3xl: '1.875rem',
  fontSize4xl: '2.25rem',
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,
};

const sharedSpacing: ThemeSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

const sharedBorderRadius: ThemeBorderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

const sharedEffects: ThemeEffects = {
  blur: 'blur(8px)',
  blurStrong: 'blur(16px)',
  transition: 'all 0.2s ease-in-out',
  transitionFast: 'all 0.1s ease-in-out',
  transitionSlow: 'all 0.3s ease-in-out',
};

// ============================================================================
// TEMA 1: COSMIC PLAYER
// Visual aurora/cósmico com gradientes vibrantes
// ============================================================================

export const cosmicPlayerTheme: Theme = {
  name: 'cosmic-player',
  displayName: 'Cosmic Player',
  description: 'Visual aurora cósmico com gradientes vibrantes e efeitos de luz',
  colors: {
    // Backgrounds - tons escuros com nuances roxas/azuis
    bgPrimary: '#0a0a0f',
    bgSecondary: '#12121a',
    bgTertiary: '#1a1a2e',
    bgCard: 'rgba(26, 26, 46, 0.8)',
    bgCardHover: 'rgba(36, 36, 66, 0.9)',
    bgOverlay: 'rgba(10, 10, 15, 0.85)',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    
    // Accent - cyan/turquesa como cor principal
    accentPrimary: '#00d4ff',
    accentSecondary: '#00b4d8',
    accentTertiary: '#0096c7',
    accentGlow: 'rgba(0, 212, 255, 0.5)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textAccent: '#00d4ff',
    
    // Borders
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.05)',
    borderAccent: 'rgba(0, 212, 255, 0.5)',
    
    // States
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#00d4ff',
    
    // Brand - TSiJUKEBOX gradient
    brandPrimary: '#ff6b35',
    brandSecondary: '#fbbf24',
    brandGradient: 'linear-gradient(90deg, #ff6b35 0%, #fbbf24 100%)',
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(0, 212, 255, 0.3)',
    glowStrong: '0 0 40px rgba(0, 212, 255, 0.5)',
    card: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    button: '0 4px 14px rgba(0, 212, 255, 0.4)',
  },
  effects: sharedEffects,
};

// ============================================================================
// TEMA 2: KARAOKE STAGE
// Visual de palco com luzes de show e cores vibrantes
// ============================================================================

export const karaokeStageTheme: Theme = {
  name: 'karaoke-stage',
  displayName: 'Karaoke Stage',
  description: 'Visual de palco com luzes de show, efeitos neon e cores vibrantes',
  colors: {
    // Backgrounds - tons escuros com nuances roxas/magenta
    bgPrimary: '#0d0d1a',
    bgSecondary: '#1a1a2e',
    bgTertiary: '#252545',
    bgCard: 'rgba(37, 37, 69, 0.9)',
    bgCardHover: 'rgba(47, 47, 89, 0.95)',
    bgOverlay: 'rgba(13, 13, 26, 0.9)',
    bgGradient: 'linear-gradient(180deg, #1a1a2e 0%, #2d1f4e 50%, #1a1a2e 100%)',
    
    // Accent - magenta/pink como cor principal
    accentPrimary: '#ff00ff',
    accentSecondary: '#e040fb',
    accentTertiary: '#d500f9',
    accentGlow: 'rgba(255, 0, 255, 0.5)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.85)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textAccent: '#00ffff',
    
    // Borders
    borderPrimary: 'rgba(255, 255, 255, 0.15)',
    borderSecondary: 'rgba(255, 255, 255, 0.08)',
    borderAccent: 'rgba(0, 255, 255, 0.6)',
    
    // States
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4466',
    info: '#00ffff',
    
    // Brand
    brandPrimary: '#00ffff',
    brandSecondary: '#ff00ff',
    brandGradient: 'linear-gradient(90deg, #00ffff 0%, #ff00ff 100%)',
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.7)',
    glow: '0 0 30px rgba(255, 0, 255, 0.4)',
    glowStrong: '0 0 60px rgba(255, 0, 255, 0.6)',
    card: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 0, 255, 0.1)',
    button: '0 4px 20px rgba(255, 0, 255, 0.5)',
  },
  effects: sharedEffects,
};

// ============================================================================
// TEMA 3: DASHBOARD HOME
// Visual moderno com cards e gradientes sutis
// ============================================================================

export const dashboardHomeTheme: Theme = {
  name: 'dashboard-home',
  displayName: 'Dashboard Home',
  description: 'Visual moderno com cards elegantes, gradientes sutis e cores equilibradas',
  colors: {
    // Backgrounds - tons escuros neutros
    bgPrimary: '#0f0f0f',
    bgSecondary: '#1a1a1a',
    bgTertiary: '#252525',
    bgCard: 'rgba(30, 30, 30, 0.95)',
    bgCardHover: 'rgba(40, 40, 40, 0.98)',
    bgOverlay: 'rgba(15, 15, 15, 0.9)',
    bgGradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    
    // Accent - turquesa/teal como cor principal
    accentPrimary: '#00d4aa',
    accentSecondary: '#00b894',
    accentTertiary: '#00a085',
    accentGlow: 'rgba(0, 212, 170, 0.4)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textAccent: '#00d4aa',
    
    // Borders
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.05)',
    borderAccent: 'rgba(0, 212, 170, 0.5)',
    
    // States
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Brand
    brandPrimary: '#ff6b35',
    brandSecondary: '#00d4aa',
    brandGradient: 'linear-gradient(90deg, #ff6b35 0%, #fbbf24 100%)',
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
    glow: '0 0 15px rgba(0, 212, 170, 0.3)',
    glowStrong: '0 0 30px rgba(0, 212, 170, 0.5)',
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    button: '0 4px 12px rgba(0, 212, 170, 0.3)',
  },
  effects: sharedEffects,
};

// ============================================================================
// TEMA 4: SPOTIFY INTEGRATION
// Visual verde Spotify com elementos modernos
// ============================================================================

export const spotifyIntegrationTheme: Theme = {
  name: 'spotify-integration',
  displayName: 'Spotify Integration',
  description: 'Visual inspirado no Spotify com verde vibrante e design limpo',
  colors: {
    // Backgrounds - tons escuros com nuances verdes
    bgPrimary: '#0a0a0a',
    bgSecondary: '#121212',
    bgTertiary: '#1a1a1a',
    bgCard: 'rgba(24, 24, 24, 0.95)',
    bgCardHover: 'rgba(34, 34, 34, 0.98)',
    bgOverlay: 'rgba(10, 10, 10, 0.9)',
    bgGradient: 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)',
    
    // Accent - verde Spotify
    accentPrimary: '#1DB954',
    accentSecondary: '#1ed760',
    accentTertiary: '#169c46',
    accentGlow: 'rgba(29, 185, 84, 0.4)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textAccent: '#1DB954',
    
    // Borders
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.05)',
    borderAccent: 'rgba(29, 185, 84, 0.5)',
    
    // States
    success: '#1DB954',
    warning: '#ffa500',
    error: '#e91429',
    info: '#509bf5',
    
    // Brand
    brandPrimary: '#1DB954',
    brandSecondary: '#191414',
    brandGradient: 'linear-gradient(90deg, #1DB954 0%, #1ed760 100%)',
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(29, 185, 84, 0.3)',
    glowStrong: '0 0 40px rgba(29, 185, 84, 0.5)',
    card: '0 4px 16px rgba(0, 0, 0, 0.4)',
    button: '0 4px 14px rgba(29, 185, 84, 0.4)',
  },
  effects: sharedEffects,
};

// ============================================================================
// TEMA 5: SETTINGS DARK
// Visual escuro minimalista para configurações
// ============================================================================

export const settingsDarkTheme: Theme = {
  name: 'settings-dark',
  displayName: 'Settings Dark',
  description: 'Visual escuro minimalista com sidebar elegante e controles precisos',
  colors: {
    // Backgrounds - tons escuros profundos
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1e1e1e',
    bgCard: 'rgba(30, 30, 30, 0.95)',
    bgCardHover: 'rgba(40, 40, 40, 0.98)',
    bgOverlay: 'rgba(10, 10, 10, 0.95)',
    bgGradient: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
    
    // Accent - cyan/turquesa
    accentPrimary: '#00d4ff',
    accentSecondary: '#00b8e6',
    accentTertiary: '#009dcc',
    accentGlow: 'rgba(0, 212, 255, 0.4)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    textAccent: '#00d4ff',
    
    // Borders
    borderPrimary: 'rgba(255, 255, 255, 0.12)',
    borderSecondary: 'rgba(255, 255, 255, 0.06)',
    borderAccent: 'rgba(0, 212, 255, 0.5)',
    
    // States
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#00d4ff',
    
    // Brand
    brandPrimary: '#ff6b35',
    brandSecondary: '#fbbf24',
    brandGradient: 'linear-gradient(90deg, #ff6b35 0%, #fbbf24 100%)',
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px rgba(0, 0, 0, 0.35)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.45)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.55)',
    glow: '0 0 15px rgba(0, 212, 255, 0.25)',
    glowStrong: '0 0 30px rgba(0, 212, 255, 0.4)',
    card: '0 4px 16px rgba(0, 0, 0, 0.35)',
    button: '0 4px 12px rgba(0, 212, 255, 0.35)',
  },
  effects: sharedEffects,
};

// ============================================================================
// TEMA 6: STAGE NEON METALLIC
// Visual inspirado no modo Karaoke com interface metálica e luzes de palco
// Aplicável a todos os modos do sistema
// ============================================================================

export const stageNeonMetallicTheme: Theme = {
  name: 'stage-neon-metallic',
  displayName: 'Stage Neon Metallic',
  description: 'Visual de palco com interface metálica, luzes neon cyan/magenta e efeitos de spotlight',
  colors: {
    // Backgrounds - azul escuro profundo com nuances roxas
    bgPrimary: '#0a0a1a',
    bgSecondary: '#1a0a2e',
    bgTertiary: '#2a1040',
    bgCard: 'rgba(26, 10, 46, 0.85)',
    bgCardHover: 'rgba(42, 16, 64, 0.95)',
    bgOverlay: 'rgba(10, 10, 26, 0.9)',
    bgGradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2a1040 100%)',
    
    // Accent - cyan neon como cor principal, magenta como secundária
    accentPrimary: '#00ffff',
    accentSecondary: '#ff00d4',
    accentTertiary: '#8a2be2',
    accentGlow: 'rgba(0, 255, 255, 0.6)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textMuted: '#808080',
    textAccent: '#00ffff',
    
    // Borders - metálicos
    borderPrimary: '#4a4a4a',
    borderSecondary: '#606060',
    borderAccent: '#00ffff',
    
    // States
    success: '#00ff44',
    warning: '#ffd700',
    error: '#ff4444',
    info: '#00ffff',
    
    // Brand
    brandPrimary: '#00ffff',
    brandSecondary: '#ff00d4',
    brandGradient: 'linear-gradient(90deg, #00ffff 0%, #ff00d4 100%)',
  },
  typography: {
    ...sharedTypography,
    fontFamilyDisplay: "'Bebas Neue', 'Impact', sans-serif",
  },
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.7)',
    glow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)',
    glowStrong: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)',
    card: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    button: '0 0 15px rgba(0, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  },
  effects: {
    ...sharedEffects,
    blur: 'blur(10px)',
    blurStrong: 'blur(20px)',
  },
};

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export const themes: Record<ThemeName, Theme> = {
  'cosmic-player': cosmicPlayerTheme,
  'karaoke-stage': karaokeStageTheme,
  'dashboard-home': dashboardHomeTheme,
  'spotify-integration': spotifyIntegrationTheme,
  'settings-dark': settingsDarkTheme,
  'stage-neon-metallic': stageNeonMetallicTheme,
};

export const themeList: Theme[] = Object.values(themes);

export const defaultTheme: ThemeName = 'cosmic-player';

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes[defaultTheme];
}

export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

// ============================================================================
// CSS VARIABLES GENERATOR
// ============================================================================

export function generateCSSVariables(theme: Theme): string {
  const { colors, typography, spacing, borderRadius, shadows, effects } = theme;
  
  return `
    /* TSiJUKEBOX Theme: ${theme.displayName} */
    
    /* Colors */
    --bg-primary: ${colors.bgPrimary};
    --bg-secondary: ${colors.bgSecondary};
    --bg-tertiary: ${colors.bgTertiary};
    --bg-card: ${colors.bgCard};
    --bg-card-hover: ${colors.bgCardHover};
    --bg-overlay: ${colors.bgOverlay};
    --bg-gradient: ${colors.bgGradient};
    
    --accent-primary: ${colors.accentPrimary};
    --accent-secondary: ${colors.accentSecondary};
    --accent-tertiary: ${colors.accentTertiary};
    --accent-glow: ${colors.accentGlow};
    
    --text-primary: ${colors.textPrimary};
    --text-secondary: ${colors.textSecondary};
    --text-muted: ${colors.textMuted};
    --text-accent: ${colors.textAccent};
    
    --border-primary: ${colors.borderPrimary};
    --border-secondary: ${colors.borderSecondary};
    --border-accent: ${colors.borderAccent};
    
    --success: ${colors.success};
    --warning: ${colors.warning};
    --error: ${colors.error};
    --info: ${colors.info};
    
    --brand-primary: ${colors.brandPrimary};
    --brand-secondary: ${colors.brandSecondary};
    --brand-gradient: ${colors.brandGradient};
    
    /* Typography */
    --font-family: ${typography.fontFamily};
    --font-family-display: ${typography.fontFamilyDisplay};
    --font-size-xs: ${typography.fontSizeXs};
    --font-size-sm: ${typography.fontSizeSm};
    --font-size-base: ${typography.fontSizeBase};
    --font-size-lg: ${typography.fontSizeLg};
    --font-size-xl: ${typography.fontSizeXl};
    --font-size-2xl: ${typography.fontSize2xl};
    --font-size-3xl: ${typography.fontSize3xl};
    --font-size-4xl: ${typography.fontSize4xl};
    
    /* Spacing */
    --spacing-xs: ${spacing.xs};
    --spacing-sm: ${spacing.sm};
    --spacing-md: ${spacing.md};
    --spacing-lg: ${spacing.lg};
    --spacing-xl: ${spacing.xl};
    --spacing-2xl: ${spacing['2xl']};
    --spacing-3xl: ${spacing['3xl']};
    
    /* Border Radius */
    --radius-none: ${borderRadius.none};
    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    --radius-2xl: ${borderRadius['2xl']};
    --radius-full: ${borderRadius.full};
    
    /* Shadows */
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    --shadow-xl: ${shadows.xl};
    --shadow-glow: ${shadows.glow};
    --shadow-glow-strong: ${shadows.glowStrong};
    --shadow-card: ${shadows.card};
    --shadow-button: ${shadows.button};
    
    /* Effects */
    --blur: ${effects.blur};
    --blur-strong: ${effects.blurStrong};
    --transition: ${effects.transition};
    --transition-fast: ${effects.transitionFast};
    --transition-slow: ${effects.transitionSlow};
  `.trim();
}

// ============================================================================
// TAILWIND CONFIG HELPER
// ============================================================================

export function generateTailwindColors(theme: Theme) {
  return {
    'bg-primary': theme.colors.bgPrimary,
    'bg-secondary': theme.colors.bgSecondary,
    'bg-tertiary': theme.colors.bgTertiary,
    'accent-primary': theme.colors.accentPrimary,
    'accent-secondary': theme.colors.accentSecondary,
    'text-primary': theme.colors.textPrimary,
    'text-secondary': theme.colors.textSecondary,
    'brand-primary': theme.colors.brandPrimary,
    'brand-secondary': theme.colors.brandSecondary,
  };
}
