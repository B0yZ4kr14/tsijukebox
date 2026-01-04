/**
 * TSiJUKEBOX Design System Tokens
 * 
 * Design tokens centralizados baseados no Design System documentado.
 * Referência: docs/DESIGN_SYSTEM.md
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 */

// =============================================================================
// CORES - TEMA ESCURO (Padrão)
// =============================================================================

export const colors = {
  // Backgrounds
  background: {
    primary: '#0a0a0a',     // Preto Profundo - Fundo principal
    secondary: '#1a1a1a',   // Cinza Escuro - Cards e painéis
    tertiary: '#2a2a2a',    // Cinza Médio - Hover states
  },

  // Accent Colors (Cores Vibrantes)
  accent: {
    cyan: '#00d4ff',        // Cor primária - Botões, links, interativos
    greenNeon: '#00ff88',   // Sucesso, instalação, positivo
    magenta: '#ff00d4',     // Karaoke, destaque, tutoriais
    yellowGold: '#ffd400',  // Atenção, desenvolvimento, avisos
    purple: '#d400ff',      // API, dados, storage
    orange: '#ff4400',      // Segurança, alerta, erros
    greenLime: '#00ff44',   // Monitoramento, ativo, online
    blueElectric: '#4400ff',// Testes, qualidade, QA
  },

  // Branding (Integrações)
  branding: {
    spotify: '#1DB954',     // Verde Spotify
    youtube: '#FF0000',     // Vermelho YouTube
    github: '#24292e',      // Cinza GitHub
  },

  // Texto (Hierarquia)
  text: {
    primary: '#ffffff',     // 100% - Títulos, labels principais
    secondary: '#cccccc',   // 80% - Subtítulos, descrições
    tertiary: '#999999',    // 60% - Metadados, timestamps
    disabled: '#666666',    // 40% - Elementos desabilitados
  },

  // Estados
  state: {
    success: '#00ff44',     // Verde - Operações bem-sucedidas
    warning: '#ffd400',     // Amarelo - Avisos e atenção
    error: '#ff4444',       // Vermelho - Erros e falhas
    info: '#00d4ff',        // Cyan - Informações neutras
  },

  // Borders
  border: {
    default: '#333333',     // Bordas padrão
    hover: '#444444',       // Bordas em hover
    focus: '#00d4ff',       // Bordas em foco (cyan)
  },
} as const;

// =============================================================================
// TIPOGRAFIA
// =============================================================================

export const typography = {
  // Família de Fontes
  fontFamily: {
    sans: '"Inter", "Noto Sans", system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", "Courier New", monospace',
  },

  // Hierarquia de Tamanhos (8 níveis)
  fontSize: {
    h1: '3rem',      // 48px - Títulos principais
    h2: '2.25rem',   // 36px - Títulos de seção
    h3: '1.875rem',  // 30px - Subtítulos
    h4: '1.5rem',    // 24px - Títulos de card
    body: '1rem',    // 16px - Texto padrão
    small: '0.875rem', // 14px - Texto secundário
    xs: '0.75rem',   // 12px - Metadados
    xxs: '0.625rem', // 10px - Labels pequenos
  },

  // Peso da Fonte
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  // Altura de Linha
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Espaçamento de Letras
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

// =============================================================================
// ESPAÇAMENTO (Sistema de 7 Tokens)
// =============================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // Círculo completo
} as const;

// =============================================================================
// SOMBRAS
// =============================================================================

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  
  // Glow Effects
  glow: {
    cyan: '0 0 20px rgba(0, 212, 255, 0.5)',
    green: '0 0 20px rgba(0, 255, 136, 0.5)',
    magenta: '0 0 20px rgba(255, 0, 212, 0.5)',
    yellow: '0 0 20px rgba(255, 212, 0, 0.5)',
  },
} as const;

// =============================================================================
// TRANSIÇÕES
// =============================================================================

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
  
  // Propriedades específicas
  color: 'color 250ms ease-in-out',
  background: 'background-color 250ms ease-in-out',
  transform: 'transform 250ms ease-in-out',
  opacity: 'opacity 250ms ease-in-out',
  all: 'all 250ms ease-in-out',
} as const;

// =============================================================================
// BREAKPOINTS (Responsividade)
// =============================================================================

export const breakpoints = {
  xs: '320px',      // Mobile pequeno
  sm: '640px',      // Mobile
  md: '768px',      // Tablet
  lg: '1024px',     // Desktop
  xl: '1280px',     // Desktop grande
  '2xl': '1536px',  // Desktop extra grande
} as const;

// =============================================================================
// Z-INDEX (Camadas)
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// =============================================================================
// COMPONENTES - VARIANTES
// =============================================================================

export const components = {
  button: {
    sizes: {
      sm: {
        height: '32px',
        padding: '0 12px',
        fontSize: typography.fontSize.small,
      },
      md: {
        height: '40px',
        padding: '0 16px',
        fontSize: typography.fontSize.body,
      },
      lg: {
        height: '48px',
        padding: '0 24px',
        fontSize: typography.fontSize.h4,
      },
    },
    variants: {
      primary: {
        background: colors.accent.cyan,
        color: colors.background.primary,
        hover: {
          background: '#00b8e6',
          boxShadow: shadows.glow.cyan,
        },
      },
      secondary: {
        background: colors.background.secondary,
        color: colors.text.primary,
        border: `1px solid ${colors.border.default}`,
        hover: {
          background: colors.background.tertiary,
          borderColor: colors.border.hover,
        },
      },
      ghost: {
        background: 'transparent',
        color: colors.text.primary,
        hover: {
          background: colors.background.secondary,
        },
      },
    },
  },

  card: {
    default: {
      background: colors.background.secondary,
      border: `1px solid ${colors.border.default}`,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    hover: {
      background: colors.background.tertiary,
      borderColor: colors.border.hover,
      transform: 'translateY(-2px)',
      boxShadow: shadows.md,
    },
  },

  input: {
    default: {
      background: colors.background.secondary,
      border: `1px solid ${colors.border.default}`,
      borderRadius: borderRadius.md,
      padding: `${spacing.sm} ${spacing.md}`,
      color: colors.text.primary,
      fontSize: typography.fontSize.body,
    },
    focus: {
      borderColor: colors.accent.cyan,
      boxShadow: `0 0 0 3px rgba(0, 212, 255, 0.1)`,
      outline: 'none',
    },
    error: {
      borderColor: colors.state.error,
      boxShadow: `0 0 0 3px rgba(255, 68, 68, 0.1)`,
    },
  },
} as const;

// =============================================================================
// ACESSIBILIDADE
// =============================================================================

export const a11y = {
  // Contraste mínimo WCAG 2.1 AA
  minContrast: 4.5,
  
  // Tamanhos mínimos de toque (touch targets)
  minTouchTarget: '44px',
  
  // Focus visible
  focusRing: {
    width: '2px',
    style: 'solid',
    color: colors.accent.cyan,
    offset: '2px',
  },
} as const;

// =============================================================================
// UTILITÁRIOS
// =============================================================================

/**
 * Converte tokens de espaçamento para valores numéricos
 */
export const getSpacingValue = (token: keyof typeof spacing): number => {
  return parseFloat(spacing[token]) * 16; // Converte rem para px
};

/**
 * Gera classe CSS para glow effect
 */
export const getGlowClass = (color: keyof typeof shadows.glow): string => {
  return `shadow-[${shadows.glow[color]}]`;
};

/**
 * Gera media query para breakpoint
 */
export const mediaQuery = (breakpoint: keyof typeof breakpoints): string => {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
};

// =============================================================================
// EXPORTAÇÃO PADRÃO
// =============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
  a11y,
} as const;

export default designTokens;

// =============================================================================
// TIPOS TYPESCRIPT
// =============================================================================

export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Transitions = typeof transitions;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Components = typeof components;
export type A11y = typeof a11y;
export type DesignTokens = typeof designTokens;
