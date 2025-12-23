import type { Config } from "tailwindcss";
import { designTokens } from "./src/lib/design-tokens";

/**
 * Tailwind CSS Configuration - TSiJUKEBOX
 * 
 * Configuração integrada com Design Tokens centralizados.
 * Referência: src/lib/design-tokens.ts
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 */

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // =================================================================
      // CORES - Integradas com Design Tokens
      // =================================================================
      colors: {
        // Cores CSS Variables (mantidas para compatibilidade)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Cores do Design System (novas)
        'bg-primary': designTokens.colors.background.primary,
        'bg-secondary': designTokens.colors.background.secondary,
        'bg-tertiary': designTokens.colors.background.tertiary,

        // Accent Colors
        'accent-cyan': designTokens.colors.accent.cyan,
        'accent-green-neon': designTokens.colors.accent.greenNeon,
        'accent-magenta': designTokens.colors.accent.magenta,
        'accent-yellow-gold': designTokens.colors.accent.yellowGold,
        'accent-purple': designTokens.colors.accent.purple,
        'accent-orange': designTokens.colors.accent.orange,
        'accent-green-lime': designTokens.colors.accent.greenLime,
        'accent-blue-electric': designTokens.colors.accent.blueElectric,

        // Branding
        'brand-spotify': designTokens.colors.branding.spotify,
        'brand-youtube': designTokens.colors.branding.youtube,
        'brand-github': designTokens.colors.branding.github,

        // Text
        'text-primary': designTokens.colors.text.primary,
        'text-secondary': designTokens.colors.text.secondary,
        'text-tertiary': designTokens.colors.text.tertiary,
        'text-disabled': designTokens.colors.text.disabled,

        // States
        'state-success': designTokens.colors.state.success,
        'state-warning': designTokens.colors.state.warning,
        'state-error': designTokens.colors.state.error,
        'state-info': designTokens.colors.state.info,
      },

      // =================================================================
      // ESPAÇAMENTO - Integrado com Design Tokens
      // =================================================================
      spacing: {
        'xs': designTokens.spacing.xs,
        'sm': designTokens.spacing.sm,
        'md': designTokens.spacing.md,
        'lg': designTokens.spacing.lg,
        'xl': designTokens.spacing.xl,
        '2xl': designTokens.spacing['2xl'],
        '3xl': designTokens.spacing['3xl'],
      },

      // =================================================================
      // BORDER RADIUS - Integrado com Design Tokens
      // =================================================================
      borderRadius: {
        'none': designTokens.borderRadius.none,
        'sm': designTokens.borderRadius.sm,
        'md': designTokens.borderRadius.md,
        'lg': designTokens.borderRadius.lg,
        'xl': designTokens.borderRadius.xl,
        '2xl': designTokens.borderRadius['2xl'],
        'full': designTokens.borderRadius.full,
      },

      // =================================================================
      // SOMBRAS - Integradas com Design Tokens
      // =================================================================
      boxShadow: {
        'sm': designTokens.shadows.sm,
        'md': designTokens.shadows.md,
        'lg': designTokens.shadows.lg,
        'glow-cyan': designTokens.shadows.glow.cyan,
        'glow-green': designTokens.shadows.glow.green,
        'glow-magenta': designTokens.shadows.glow.magenta,
        'glow-yellow': designTokens.shadows.glow.yellow,
      },

      // =================================================================
      // TIPOGRAFIA - Integrada com Design Tokens
      // =================================================================
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans.split(',').map(f => f.trim()),
        mono: designTokens.typography.fontFamily.mono.split(',').map(f => f.trim()),
      },
      fontSize: {
        'h1': designTokens.typography.fontSize.h1,
        'h2': designTokens.typography.fontSize.h2,
        'h3': designTokens.typography.fontSize.h3,
        'h4': designTokens.typography.fontSize.h4,
        'body': designTokens.typography.fontSize.body,
        'small': designTokens.typography.fontSize.small,
        'xs': designTokens.typography.fontSize.xs,
        'xxs': designTokens.typography.fontSize.xxs,
      },
      fontWeight: {
        'light': designTokens.typography.fontWeight.light,
        'regular': designTokens.typography.fontWeight.regular,
        'medium': designTokens.typography.fontWeight.medium,
        'semibold': designTokens.typography.fontWeight.semibold,
        'bold': designTokens.typography.fontWeight.bold,
        'black': designTokens.typography.fontWeight.black,
      },
      lineHeight: {
        'tight': designTokens.typography.lineHeight.tight,
        'normal': designTokens.typography.lineHeight.normal,
        'relaxed': designTokens.typography.lineHeight.relaxed,
      },
      letterSpacing: {
        'tight': designTokens.typography.letterSpacing.tight,
        'normal': designTokens.typography.letterSpacing.normal,
        'wide': designTokens.typography.letterSpacing.wide,
      },

      // =================================================================
      // TRANSIÇÕES - Integradas com Design Tokens
      // =================================================================
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out',
      },

      // =================================================================
      // Z-INDEX - Integrado com Design Tokens
      // =================================================================
      zIndex: {
        'base': designTokens.zIndex.base.toString(),
        'dropdown': designTokens.zIndex.dropdown.toString(),
        'sticky': designTokens.zIndex.sticky.toString(),
        'fixed': designTokens.zIndex.fixed.toString(),
        'modal-backdrop': designTokens.zIndex.modalBackdrop.toString(),
        'modal': designTokens.zIndex.modal.toString(),
        'popover': designTokens.zIndex.popover.toString(),
        'tooltip': designTokens.zIndex.tooltip.toString(),
      },

      // =================================================================
      // ANIMAÇÕES - Mantidas do config original
      // =================================================================
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
