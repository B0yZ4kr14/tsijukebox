import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrandText, BrandTextSize, BrandTextWeight } from './BrandText';

export type TaglineVariant = 'default' | 'subtle' | 'accent' | 'neon' | 'gradient';
export type TaglineSize = 'xs' | 'sm' | 'md' | 'lg';
export type BrandAnimationType = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'cascade';

interface BrandTaglineProps {
  text?: string;
  variant?: TaglineVariant;
  size?: TaglineSize;
  uppercase?: boolean;
  className?: string;
}

const sizeClasses: Record<TaglineSize, string> = {
  xs: 'text-[10px] tracking-[0.2em]',
  sm: 'text-xs tracking-[0.15em]',
  md: 'text-sm tracking-widest',
  lg: 'text-base tracking-widest',
};

const variantClasses: Record<TaglineVariant, string> = {
  default: 'text-kiosk-text/60',
  subtle: 'text-kiosk-text/40',
  accent: 'text-cyan-400/80',
  neon: 'text-brand-tagline-neon',
  gradient: 'text-brand-tagline-gradient',
};

const DEFAULT_TAGLINE = 'Enterprise Music System';

// Animation variants for Framer Motion
const containerVariants: Record<BrandAnimationType, Variants> = {
  none: {},
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  },
  'slide-up': {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  },
  'slide-down': {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  },
  cascade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  }
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

/**
 * Componente BrandTagline para renderizar tagline estilizada
 * Use junto com BrandText em headers e footers
 */
export function BrandTagline({ 
  text = DEFAULT_TAGLINE,
  variant = 'default',
  size = 'sm',
  uppercase = true,
  className 
}: BrandTaglineProps) {
  return (
    <p className={cn(
      sizeClasses[size],
      variantClasses[variant],
      uppercase && 'uppercase',
      'font-medium',
      className
    )}>
      {text}
    </p>
  );
}

interface BrandWithTaglineProps {
  brandSize?: BrandTextSize;
  brandWeight?: BrandTextWeight;
  taglineSize?: TaglineSize;
  taglineVariant?: TaglineVariant;
  taglineText?: string;
  centered?: boolean;
  className?: string;
  noShimmer?: boolean;
  animate?: BrandAnimationType;
  animationDelay?: number;
}

/**
 * Componente combinado BrandText + BrandTagline para uso em headers/footers
 * Suporta animações de entrada para splash screens e loading states
 */
export function BrandWithTagline({
  brandSize = 'lg',
  brandWeight = 'bold',
  taglineSize = 'sm',
  taglineVariant = 'subtle',
  taglineText,
  centered = true,
  className,
  noShimmer = false,
  animate = 'none',
  animationDelay = 0,
}: BrandWithTaglineProps) {
  const isCascade = animate === 'cascade';
  const shouldAnimate = animate !== 'none';
  
  const content = (
    <>
      {isCascade ? (
        <motion.div variants={childVariants}>
          <BrandText size={brandSize} weight={brandWeight} noShimmer={noShimmer} />
        </motion.div>
      ) : (
        <BrandText size={brandSize} weight={brandWeight} noShimmer={noShimmer} />
      )}
      {isCascade ? (
        <motion.div variants={childVariants}>
          <BrandTagline 
            text={taglineText} 
            size={taglineSize} 
            variant={taglineVariant} 
          />
        </motion.div>
      ) : (
        <BrandTagline 
          text={taglineText} 
          size={taglineSize} 
          variant={taglineVariant} 
        />
      )}
    </>
  );

  if (!shouldAnimate) {
    return (
      <div className={cn(
        'flex flex-col gap-1',
        centered && 'items-center',
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-1',
        centered && 'items-center',
        className
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants[animate]}
      transition={{ delay: animationDelay }}
    >
      {content}
    </motion.div>
  );
}

export default BrandTagline;
