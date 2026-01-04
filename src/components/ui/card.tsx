import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card Component - TSiJUKEBOX
 * 
 * Componente de card refatorado com Design Tokens integrados.
 * Suporta múltiplas variantes com hover effects e acessibilidade.
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 * @reference src/lib/design-tokens.ts
 */

const cardVariants = cva(
  // Base styles - usando design tokens via Tailwind
  "rounded-lg border transition-all duration-normal",
  {
    variants: {
      variant: {
        // Default - Card padrão com fundo secundário
        default: 
          "bg-bg-secondary border-[#333333] text-text-primary shadow-sm hover:bg-bg-tertiary hover:border-[#444444] hover:shadow-md hover:-translate-y-0.5",
        
        // Elevated - Card com mais destaque
        elevated: 
          "bg-bg-secondary border-[#444444] text-text-primary shadow-md hover:shadow-lg hover:-translate-y-1",
        
        // Flat - Card sem sombra
        flat: 
          "bg-bg-secondary border-[#333333] text-text-primary hover:bg-bg-tertiary hover:border-[#444444]",
        
        // Outlined - Card com borda mais forte
        outlined: 
          "bg-transparent border-2 border-[#444444] text-text-primary hover:border-accent-cyan hover:shadow-glow-cyan",
        
        // Glassmorphism - Card com efeito vidro
        glass: 
          "bg-bg-secondary/80 backdrop-blur-md border-[#333333]/50 text-text-primary shadow-lg hover:bg-bg-tertiary/80 hover:border-[#444444]/50",
        
        // Interactive - Card clicável com feedback visual
        interactive: 
          "bg-bg-secondary border-[#333333] text-text-primary shadow-sm cursor-pointer hover:bg-bg-tertiary hover:border-accent-cyan hover:shadow-glow-cyan hover:-translate-y-1 active:scale-98 active:translate-y-0",
        
        // Success - Card com tema de sucesso
        success: 
          "bg-bg-secondary border-state-success/30 text-text-primary shadow-sm hover:border-state-success/50 hover:shadow-glow-green",
        
        // Warning - Card com tema de aviso
        warning: 
          "bg-bg-secondary border-state-warning/30 text-text-primary shadow-sm hover:border-state-warning/50 hover:shadow-glow-yellow",
        
        // Error - Card com tema de erro
        error: 
          "bg-bg-secondary border-state-error/30 text-text-primary shadow-sm hover:border-state-error/50",
        
        // Info - Card com tema informativo
        info: 
          "bg-bg-secondary border-accent-cyan/30 text-text-primary shadow-sm hover:border-accent-cyan/50 hover:shadow-glow-cyan",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Se true, adiciona cursor pointer e torna o card clicável
   */
  clickable?: boolean;
  
  /**
   * Se true, desabilita animações de hover
   */
  noHover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, clickable, noHover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding }),
        clickable && "cursor-pointer",
        noHover && "hover:transform-none hover:shadow-sm",
        className
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex flex-col space-y-1.5 p-6", className)} 
      {...props} 
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-h3 font-semibold leading-tight tracking-tight text-text-primary",
        className
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-small text-text-secondary leading-relaxed", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0 gap-2", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
export type { CardProps };
