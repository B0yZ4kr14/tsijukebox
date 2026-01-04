import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-all duration-normal focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg-primary",
  {
    variants: {
      variant: {
        // Default - Cinza neutro
        default: 
          "bg-bg-secondary border-[#333333] text-text-primary hover:bg-bg-tertiary hover:border-[#444444]",
        
        // Primary - Cyan (cor principal do sistema)
        primary: 
          "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/30 hover:border-accent-cyan shadow-glow-cyan",
        
        // Success - Verde
        success: 
          "bg-state-success/20 border-state-success/50 text-state-success hover:bg-state-success/30 hover:border-state-success",
        
        // Warning - Amarelo/Ouro
        warning: 
          "bg-state-warning/20 border-state-warning/50 text-state-warning hover:bg-state-warning/30 hover:border-state-warning",
        
        // Error - Vermelho
        error: 
          "bg-state-error/20 border-state-error/50 text-state-error hover:bg-state-error/30 hover:border-state-error",
        
        // Info - Cyan claro
        info: 
          "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 hover:border-accent-cyan/40",
        
        // Outline - Transparente com borda
        outline: 
          "bg-transparent border-[#444444] text-text-primary hover:bg-bg-secondary hover:border-accent-cyan/50",
        
        // Spotify - Verde Spotify
        spotify: 
          "bg-brand-spotify/20 border-brand-spotify/50 text-brand-spotify hover:bg-brand-spotify/30 hover:border-brand-spotify",
        
        // YouTube - Vermelho YouTube
        youtube: 
          "bg-brand-youtube/20 border-brand-youtube/50 text-brand-youtube hover:bg-brand-youtube/30 hover:border-brand-youtube",
        
        // Gold - Amarelo ouro (para títulos e destaques)
        gold: 
          "bg-brand-gold/20 border-brand-gold/50 text-brand-gold hover:bg-brand-gold/30 hover:border-brand-gold",
        
        // Ghost - Sem background, apenas texto
        ghost: 
          "bg-transparent border-transparent text-text-tertiary hover:bg-bg-secondary hover:text-text-primary",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-small px-2.5 py-1",
        lg: "text-body px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the badge text
   */
  icon?: React.ReactNode;
  /**
   * Whether the badge is clickable
   */
  clickable?: boolean;
}

/**
 * Badge Component
 * 
 * Displays a small badge with various styles and sizes.
 * Integrated with TSiJUKEBOX Design System tokens.
 * 
 * @example
 * ```tsx
 * // Status badges
 * <Badge variant="success">Conectado</Badge>
 * <Badge variant="error">Desconectado</Badge>
 * <Badge variant="warning">Pendente</Badge>
 * 
 * // Brand badges
 * <Badge variant="spotify">Spotify</Badge>
 * <Badge variant="youtube">YouTube Music</Badge>
 * 
 * // With icon
 * <Badge variant="primary" icon={<CheckIcon />}>Ativo</Badge>
 * 
 * // Sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="default">Default</Badge>
 * <Badge size="lg">Large</Badge>
 * 
 * // Clickable
 * <Badge variant="primary" clickable onClick={() => {}}>
 *   Click me
 * </Badge>
 * ```
 * 
 * @see Design System: /docs/DESIGN_SYSTEM.md
 * @see Design Tokens: /src/lib/design-tokens.ts
 */
function Badge({ 
  className, 
  variant, 
  size, 
  icon, 
  clickable, 
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        clickable && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )} 
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
