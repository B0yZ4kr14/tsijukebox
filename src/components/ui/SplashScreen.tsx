import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrandLogo, LogoAnimationType, LogoVariant } from './BrandLogo';
import { TaglineVariant } from './BrandTagline';

export type SplashVariant = 'default' | 'minimal' | 'cyberpunk' | 'elegant';

interface SplashScreenProps {
  /** Duração em ms antes de chamar onComplete (default: 3000) */
  duration?: number;
  /** Callback quando o splash terminar */
  onComplete?: () => void;
  /** Mostrar progress bar */
  showProgress?: boolean;
  /** Variante visual do splash */
  variant?: SplashVariant;
  /** Animação do logo */
  logoAnimation?: LogoAnimationType;
  /** Variante do logo */
  logoVariant?: LogoVariant;
  /** Texto customizado da tagline */
  taglineText?: string;
  /** Variante da tagline */
  taglineVariant?: TaglineVariant;
  /** Texto de loading customizado */
  loadingText?: string;
  /** Permitir skip (click/touch) */
  allowSkip?: boolean;
  /** ClassName customizado */
  className?: string;
}

export function SplashScreen({
  duration = 3000,
  onComplete,
  showProgress = true,
  variant = 'default',
  logoAnimation = 'splash',
  logoVariant = 'metal',
  taglineText,
  taglineVariant = 'neon',
  loadingText = 'Carregando...',
  allowSkip = true,
  className,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleComplete = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 500);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (allowSkip && !isExiting) {
      handleComplete();
    }
  }, [allowSkip, isExiting, handleComplete]);

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  // Auto-complete when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      handleComplete();
    }
  }, [progress, isExiting, handleComplete]);

  // Variantes visuais do container
  const variantStyles: Record<SplashVariant, string> = {
    default: 'bg-gradient-to-b from-kiosk-bg via-kiosk-surface to-kiosk-bg',
    minimal: 'bg-kiosk-bg',
    cyberpunk: 'bg-gradient-to-br from-purple-950 via-kiosk-bg to-cyan-950 glitch-scanlines',
    elegant: 'bg-[radial-gradient(ellipse_at_center,hsl(var(--kiosk-surface))_0%,hsl(var(--kiosk-bg))_70%)]',
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center justify-center',
          variantStyles[variant],
          allowSkip && 'cursor-pointer',
          className
        )}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        animate={isExiting ? { opacity: 0, scale: 1.1 } : { opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onClick={handleSkip}
        role="status"
        aria-label="Carregando aplicação"
      >
        {/* Logo */}
        <BrandLogo
          size="xl"
          variant={logoVariant}
          animate={logoAnimation}
          taglineVariant={taglineVariant}
          taglineText={taglineText}
          showTagline
        />

        {/* Progress Section */}
        {showProgress && (
          <motion.div
            className="mt-12 w-64 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {/* Progress Bar */}
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-kiosk-surface/50">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-yellow-400"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              {/* Glow effect */}
              <div 
                className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                style={{ left: `${Math.max(0, progress - 10)}%` }}
              />
            </div>

            {/* Loading Text */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-kiosk-text/50">{loadingText}</span>
              <span className="text-cyan-400 font-mono">{Math.round(progress)}%</span>
            </div>
          </motion.div>
        )}

        {/* Skip hint */}
        {allowSkip && (
          <motion.p
            className="absolute bottom-8 text-xs text-kiosk-text/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Clique para pular
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default SplashScreen;
