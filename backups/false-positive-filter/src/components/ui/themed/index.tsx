/**
 * TSiJUKEBOX Themed UI Components
 * 
 * Componentes de UI com suporte aos 5 temas oficiais:
 * - Card, Button, Input, Toggle, Slider, Badge
 * 
 * Baseados nos designs de referência dos prints fornecidos.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useCurrentTheme } from '@/contexts/ThemeContext';
import { Check, Loader2 } from 'lucide-react';

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable, clickable, children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const variantClasses = {
      default: 'bg-[var(--bg-card)] border border-[var(--border-primary)]',
      elevated: 'bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-lg',
      outlined: 'bg-transparent border-2 border-[var(--border-secondary)]',
      glass: 'bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-primary)]/50',
      gradient: 'bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-tertiary)] border border-[var(--border-primary)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          hoverable && 'hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent-primary)]/30',
          clickable && 'cursor-pointer active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'spotify' | 'youtube';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    leftIcon, 
    rightIcon, 
    fullWidth,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: 'h-7 px-2 text-xs gap-1 rounded-md',
      sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
      md: 'h-10 px-4 text-sm gap-2 rounded-lg',
      lg: 'h-12 px-6 text-base gap-2 rounded-xl',
      xl: 'h-14 px-8 text-lg gap-3 rounded-xl',
    };

    const variantClasses = {
      primary: cn(
        'bg-[var(--accent-primary)] text-white',
        'hover:bg-[var(--accent-primary)]/90',
        'shadow-md hover:shadow-lg',
        'border border-transparent'
      ),
      secondary: cn(
        'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
        'hover:bg-[var(--bg-tertiary)]/80',
        'border border-[var(--border-primary)]'
      ),
      outline: cn(
        'bg-transparent text-[var(--accent-primary)]',
        'hover:bg-[var(--accent-primary)]/10',
        'border-2 border-[var(--accent-primary)]'
      ),
      ghost: cn(
        'bg-transparent text-[var(--text-secondary)]',
        'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        'border border-transparent'
      ),
      danger: cn(
        'bg-[var(--error)] text-white',
        'hover:bg-[var(--error)]/90',
        'border border-transparent'
      ),
      success: cn(
        'bg-[var(--success)] text-white',
        'hover:bg-[var(--success)]/90',
        'border border-transparent'
      ),
      spotify: cn(
        'bg-[#1DB954] text-white',
        'hover:bg-[#1DB954]/90',
        'border border-transparent'
      ),
      youtube: cn(
        'bg-[#FF0000] text-white',
        'hover:bg-[#FF0000]/90',
        'border border-transparent'
      ),
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    inputSize = 'md', 
    leftIcon, 
    rightIcon, 
    error,
    label,
    id,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    const variantClasses = {
      default: cn(
        'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
        'focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20'
      ),
      filled: cn(
        'bg-[var(--bg-secondary)] border-2 border-transparent',
        'focus:border-[var(--accent-primary)] focus:bg-[var(--bg-tertiary)]'
      ),
      outline: cn(
        'bg-transparent border-2 border-[var(--border-secondary)]',
        'focus:border-[var(--accent-primary)]'
      ),
    };

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg px-3',
              'text-[var(--text-primary)] placeholder-[var(--text-muted)]',
              'transition-all duration-200',
              'focus:outline-none',
              sizeClasses[inputSize],
              variantClasses[variant],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-1 text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled,
  size = 'md',
  label,
  description,
  className,
}) => {
  const sizeClasses = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const config = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          config.track,
          checked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg',
            'transform transition-transform duration-200 ease-in-out',
            config.thumb,
            checked ? config.translate : 'translate-x-0.5'
          )}
          style={{ marginTop: '0.5px' }}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
          )}
          {description && (
            <span className="text-xs text-[var(--text-muted)]">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SLIDER COMPONENT
// ============================================================================

export interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue,
  label,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-[var(--accent-primary)]">{value}%</span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-[var(--bg-tertiary)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-[var(--accent-primary)]',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110'
          )}
          style={{
            background: `linear-gradient(to right, var(--accent-primary) ${percentage}%, var(--bg-tertiary) ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-1.5 py-0.5 text-[10px]',
      md: 'px-2 py-0.5 text-xs',
      lg: 'px-2.5 py-1 text-sm',
    };

    const variantClasses = {
      default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
      primary: 'bg-[var(--accent-primary)] text-white',
      success: 'bg-[var(--success)] text-white',
      warning: 'bg-[var(--warning)] text-black',
      error: 'bg-[var(--error)] text-white',
      info: 'bg-[var(--info)] text-white',
      outline: 'bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)]',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

// ============================================================================
// STAT CARD COMPONENT (Dashboard)
// ============================================================================

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <Card variant="primary" className={cn('flex items-center gap-4', className)}>
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-[var(--text-muted)]">{title}</p>
        <p className="text-2xl font-bold text-[var(--accent-primary)]">{value}</p>
      </div>
      {trend && (
        <div className={cn(
          'text-sm font-medium',
          trend.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
        )}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Card,
  Button,
  Input,
  Toggle,
  Slider,
  Badge,
  StatCard,
};
