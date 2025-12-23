import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button Component - TSiJUKEBOX
 * 
 * Componente de botão refatorado com Design Tokens integrados.
 * Suporta múltiplas variantes e tamanhos com acessibilidade WCAG 2.1 AA.
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 * @reference src/lib/design-tokens.ts
 */

const buttonVariants = cva(
  // Base styles - usando design tokens via Tailwind
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Cyan accent (cor primária do design system)
        default: 
          "bg-accent-cyan text-bg-primary font-semibold hover:bg-[#00b8e6] hover:shadow-glow-cyan active:scale-95 transition-transform",
        
        // Secondary - Background secundário com borda
        secondary: 
          "bg-bg-secondary text-text-primary border border-[#333333] hover:bg-bg-tertiary hover:border-[#444444] active:scale-95",
        
        // Ghost - Transparente com hover
        ghost: 
          "bg-transparent text-text-primary hover:bg-bg-secondary active:scale-95",
        
        // Outline - Borda com fundo escuro
        outline: 
          "border border-[#333333] bg-bg-secondary text-text-primary hover:bg-bg-tertiary hover:border-[#444444] active:scale-95",
        
        // Kiosk Outline - Variante especial para modo kiosk
        "kiosk-outline": 
          "border border-[#333333] bg-bg-secondary text-text-primary hover:bg-bg-tertiary hover:border-accent-cyan/50 hover:shadow-glow-cyan active:scale-95",
        
        // Destructive - Vermelho para ações destrutivas
        destructive: 
          "bg-state-error text-text-primary font-semibold hover:bg-[#ff3333] active:scale-95",
        
        // Success - Verde para ações de sucesso
        success: 
          "bg-state-success text-bg-primary font-semibold hover:bg-[#00e63d] hover:shadow-glow-green active:scale-95",
        
        // Warning - Amarelo para avisos
        warning: 
          "bg-state-warning text-bg-primary font-semibold hover:bg-[#e6bd00] hover:shadow-glow-yellow active:scale-95",
        
        // Link - Estilo de link
        link: 
          "text-accent-cyan underline-offset-4 hover:underline hover:text-[#00b8e6]",
        
        // Spotify - Verde Spotify
        spotify: 
          "bg-brand-spotify text-text-primary font-semibold hover:bg-[#1ed760] active:scale-95",
        
        // YouTube - Vermelho YouTube
        youtube: 
          "bg-brand-youtube text-text-primary font-semibold hover:bg-[#ff1a1a] active:scale-95",
      },
      size: {
        // Tamanhos baseados nos design tokens
        sm: "h-8 px-3 py-1 rounded-md text-small",      // 32px height
        default: "h-10 px-4 py-2 rounded-lg text-body",  // 40px height
        lg: "h-12 px-6 py-3 rounded-xl text-h4",         // 48px height
        icon: "h-10 w-10 rounded-lg",                    // Square icon button
        "icon-sm": "h-8 w-8 rounded-md",                 // Small icon button
        "icon-lg": "h-12 w-12 rounded-xl",               // Large icon button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Se true, renderiza o componente filho diretamente (útil para Next.js Link)
   */
  asChild?: boolean;
  
  /**
   * Se true, mostra um indicador de loading
   */
  loading?: boolean;
  
  /**
   * Ícone à esquerda do texto
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ícone à direita do texto
   */
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
