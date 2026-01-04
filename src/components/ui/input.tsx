import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Input Component - TSiJUKEBOX
 * 
 * Componente de input refatorado com Design Tokens integrados.
 * Suporta múltiplas variantes, estados e acessibilidade WCAG 2.1 AA.
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 * @reference src/lib/design-tokens.ts
 */

const inputVariants = cva(
  // Base styles - usando design tokens via Tailwind
  "flex w-full rounded-md px-3 py-2 text-body font-regular transition-all duration-normal file:border-0 file:bg-transparent file:text-small file:font-medium placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default - Input padrão com fundo secundário
        default:
          "bg-bg-secondary border border-[#333333] text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:border-accent-cyan hover:border-[#444444]",
        
        // Filled - Input com fundo mais escuro
        filled:
          "bg-bg-tertiary border border-transparent text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:border-accent-cyan hover:bg-bg-secondary",
        
        // Outlined - Input com borda mais forte
        outlined:
          "bg-transparent border-2 border-[#444444] text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:border-accent-cyan hover:border-[#555555]",
        
        // Ghost - Input minimalista
        ghost:
          "bg-transparent border-b-2 border-[#333333] rounded-none text-text-primary focus-visible:outline-none focus-visible:border-accent-cyan hover:border-[#444444]",
        
        // Success - Input com tema de sucesso
        success:
          "bg-bg-secondary border-2 border-state-success/50 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-success focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        
        // Warning - Input com tema de aviso
        warning:
          "bg-bg-secondary border-2 border-state-warning/50 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-warning focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        
        // Error - Input com tema de erro
        error:
          "bg-bg-secondary border-2 border-state-error/50 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-error focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
      },
      inputSize: {
        sm: "h-8 text-small px-2 py-1",
        default: "h-10 text-body px-3 py-2",
        lg: "h-12 text-h4 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  /**
   * Ícone à esquerda do input
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ícone à direita do input
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Mensagem de erro a ser exibida
   */
  error?: string;
  
  /**
   * Mensagem de ajuda a ser exibida
   */
  helperText?: string;
  
  /**
   * Label do input
   */
  label?: string;
  
  /**
   * Se true, marca o campo como obrigatório
   */
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant, 
    inputSize, 
    leftIcon, 
    rightIcon, 
    error, 
    helperText, 
    label,
    required,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const hasError = !!error;
    const finalVariant = hasError ? "error" : variant;
    
    return (
      <div className="w-full space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-small font-medium text-text-primary mb-1"
          >
            {label}
            {required && <span role="alert" className="text-state-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: finalVariant, inputSize }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-xs text-state-error mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p 
            id={`${inputId}-helper`}
            className="text-xs text-text-tertiary mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
