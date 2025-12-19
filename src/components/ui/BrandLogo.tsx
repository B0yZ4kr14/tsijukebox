import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LogoBrand } from './LogoBrand';
import { BrandTagline, TaglineVariant, TaglineSize } from './BrandTagline';

export type LogoVariant = 'default' | 'ultra' | 'bulge' | 'mirror' | 'mirror-dark' | 'silver' | 'metal' | 'brand';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoAnimationType = 'none' | 'fade' | 'slide-up' | 'scale' | 'cascade' | 'splash';

interface BrandLogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  showTagline?: boolean;
  taglineVariant?: TaglineVariant;
  taglineText?: string;
  centered?: boolean;
  animate?: LogoAnimationType;
  animationDelay?: number;
  logoAnimate?: boolean;
  className?: string;
}

// Animation variants for Framer Motion
const animations: Record<LogoAnimationType, Variants> = {
  none: {},
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  },
  'slide-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.7 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'backOut' } }
  },
  cascade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  },
  splash: {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  }
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Map logo sizes to tagline sizes
const taglineSizes: Record<LogoSize, TaglineSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
  xl: 'md'
};

/**
 * BrandLogo - Componente unificado que combina LogoBrand + BrandTagline
 * Ideal para splash screens, headers e loading states
 * Suporta animações de entrada elegantes
 */
export function BrandLogo({
  size = 'md',
  variant = 'default',
  showTagline = true,
  taglineVariant = 'subtle',
  taglineText,
  centered = true,
  animate = 'none',
  animationDelay = 0,
  logoAnimate = true,
  className
}: BrandLogoProps) {
  const isCascade = animate === 'cascade';
  const shouldAnimate = animate !== 'none';

  const content = (
    <>
      {isCascade ? (
        <motion.div variants={childVariants}>
          <LogoBrand 
            size={size} 
            variant={variant} 
            animate={logoAnimate}
            centered={false}
          />
        </motion.div>
      ) : (
        <LogoBrand 
          size={size} 
          variant={variant} 
          animate={logoAnimate}
          centered={false}
        />
      )}
      
      {showTagline && (
        isCascade ? (
          <motion.div variants={childVariants}>
            <BrandTagline 
              text={taglineText}
              size={taglineSizes[size]}
              variant={taglineVariant}
            />
          </motion.div>
        ) : (
          <BrandTagline 
            text={taglineText}
            size={taglineSizes[size]}
            variant={taglineVariant}
          />
        )
      )}
    </>
  );

  if (!shouldAnimate) {
    return (
      <div className={cn(
        'flex flex-col gap-2',
        centered && 'items-center justify-center',
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-2',
        centered && 'items-center justify-center',
        className
      )}
      initial="hidden"
      animate="visible"
      variants={animations[animate]}
      transition={{ delay: animationDelay }}
    >
      {content}
    </motion.div>
  );
}

export default BrandLogo;
