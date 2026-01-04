/**
 * Card Extensions
 * 
 * Componentes adicionais para estender o Card System base.
 * Adiciona CardImage, CardBadge e outros componentes auxiliares.
 * 
 * @component
 * @version 1.0.0
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// CardImage Component
// ============================================================================

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: '1/1' | '16/9' | '4/3' | '3/2' | '21/9';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  overlay?: boolean;
  overlayGradient?: 'top' | 'bottom' | 'both' | 'none';
}

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  (
    {
      className,
      aspectRatio = '16/9',
      objectFit = 'cover',
      overlay = false,
      overlayGradient = 'none',
      alt,
      ...props
    },
    ref
  ) => {
    const aspectRatioClasses = {
      '1/1': 'aspect-square',
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '3/2': 'aspect-[3/2]',
      '21/9': 'aspect-[21/9]',
    };

    const objectFitClasses = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
    };

    const gradientClasses = {
      top: 'bg-gradient-to-b from-black/60 to-transparent',
      bottom: 'bg-gradient-to-t from-black/60 to-transparent',
      both: 'bg-gradient-to-b from-black/60 via-transparent to-black/60',
      none: '',
    };

    return (
      <div className={cn('relative w-full overflow-hidden', aspectRatioClasses[aspectRatio])}>
        <img
          ref={ref}
          alt={alt}
          className={cn('w-full h-full', objectFitClasses[objectFit], className)}
          {...props}
        />
        {overlay && (
          <div className="absolute inset-0 bg-black/20" />
        )}
        {overlayGradient !== 'none' && (
          <div className={cn('absolute inset-0', gradientClasses[overlayGradient])} />
        )}
      </div>
    );
  }
);
CardImage.displayName = 'CardImage';

// ============================================================================
// CardBadge Component
// ============================================================================

export interface CardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'cyan' | 'green' | 'magenta' | 'yellow' | 'purple' | 'orange';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
}

export const CardBadge = React.forwardRef<HTMLDivElement, CardBadgeProps>(
  (
    {
      className,
      variant = 'default',
      position = 'top-right',
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'bg-bg-tertiary text-white border-white/10',
      success: 'bg-state-success/20 text-state-success border-state-success/30',
      warning: 'bg-state-warning/20 text-state-warning border-state-warning/30',
      error: 'bg-state-error/20 text-state-error border-state-error/30',
      info: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
      cyan: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
      green: 'bg-accent-greenNeon/20 text-accent-greenNeon border-accent-greenNeon/30',
      magenta: 'bg-accent-magenta/20 text-accent-magenta border-accent-magenta/30',
      yellow: 'bg-accent-yellowGold/20 text-accent-yellowGold border-accent-yellowGold/30',
      purple: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
      orange: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30',
    };

    const positionStyles = {
      'top-left': 'top-2 left-2',
      'top-right': 'top-2 right-2',
      'bottom-left': 'bottom-2 left-2',
      'bottom-right': 'bottom-2 right-2',
    };

    const sizeStyles = {
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-10 font-semibold rounded border backdrop-blur-sm',
          variantStyles[variant],
          positionStyles[position],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardBadge.displayName = 'CardBadge';

// ============================================================================
// CardIcon Component
// ============================================================================

export interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cyan' | 'green' | 'magenta' | 'yellow' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ className, variant = 'default', size = 'md', glow = false, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-bg-tertiary text-white border-white/10',
      cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
      green: 'bg-accent-greenNeon/10 text-accent-greenNeon border-accent-greenNeon/20',
      magenta: 'bg-accent-magenta/10 text-accent-magenta border-accent-magenta/20',
      yellow: 'bg-accent-yellowGold/10 text-accent-yellowGold border-accent-yellowGold/20',
      purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
      orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
    };

    const sizeStyles = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-2xl',
    };

    const glowStyles = {
      cyan: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
      green: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
      magenta: 'shadow-[0_0_20px_rgba(255,0,212,0.3)]',
      yellow: 'shadow-[0_0_20px_rgba(255,212,0,0.3)]',
      purple: 'shadow-[0_0_20px_rgba(212,0,255,0.3)]',
      orange: 'shadow-[0_0_20px_rgba(255,68,0,0.3)]',
      default: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-lg border',
          variantStyles[variant],
          sizeStyles[size],
          glow && glowStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardIcon.displayName = 'CardIcon';

// ============================================================================
// CardStat Component
// ============================================================================

export interface CardStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

export const CardStat = React.forwardRef<HTMLDivElement, CardStatProps>(
  ({ className, label, value, trend, trendValue, icon, ...props }, ref) => {
    const trendColors = {
      up: 'text-state-success',
      down: 'text-state-error',
      neutral: 'text-gray-400',
    };

    const trendIcons = {
      up: '↑',
      down: '↓',
      neutral: '→',
    };

    return (
      <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{label}</span>
          {icon && <div className="text-text-secondary">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {trend && trendValue && (
            <span className={cn('text-sm font-medium', trendColors[trend])}>
              {trendIcons[trend]} {trendValue}
            </span>
          )}
        </div>
      </div>
    );
  }
);
CardStat.displayName = 'CardStat';

// ============================================================================
// CardDivider Component
// ============================================================================

export interface CardDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
}

export const CardDivider = React.forwardRef<HTMLHRElement, CardDividerProps>(
  ({ className, variant = 'solid', ...props }, ref) => {
    const variantStyles = {
      solid: 'border-solid border-white/5',
      dashed: 'border-dashed border-white/10',
      dotted: 'border-dotted border-white/10',
      gradient: 'border-none h-px bg-gradient-to-r from-transparent via-white/10 to-transparent',
    };

    return (
      <hr
        ref={ref}
        className={cn(
          'my-4 border-t',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
CardDivider.displayName = 'CardDivider';

// ============================================================================
// CardActions Component
// ============================================================================

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, align = 'right', children, ...props }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', alignStyles[align], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardActions.displayName = 'CardActions';

// ============================================================================
// Exports
// ============================================================================

export default {
  CardImage,
  CardBadge,
  CardIcon,
  CardStat,
  CardDivider,
  CardActions,
};
