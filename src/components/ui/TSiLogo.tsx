/**
 * TSiJUKEBOX Logo Component
 * 
 * Componente de logo profissional com múltiplas variantes:
 * - full: Logo completo com ícone e texto
 * - icon: Apenas o ícone TSi
 * - text: Apenas o texto TSIJUKEBOX
 * - wordmark: Texto estilizado com gradiente
 * 
 * Baseado nos designs de referência dos 5 temas oficiais.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useCurrentTheme } from '@/contexts/ThemeContext';

// ============================================================================
// TIPOS
// ============================================================================

export type LogoVariant = 'full' | 'icon' | 'text' | 'wordmark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface TSiLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  animated?: boolean;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

// ============================================================================
// CONSTANTES DE TAMANHO
// ============================================================================

const sizeConfig: Record<LogoSize, { icon: number; text: string; tagline: string }> = {
  xs: { icon: 24, text: 'text-sm', tagline: 'text-[8px]' },
  sm: { icon: 32, text: 'text-lg', tagline: 'text-[10px]' },
  md: { icon: 40, text: 'text-xl', tagline: 'text-xs' },
  lg: { icon: 56, text: 'text-2xl', tagline: 'text-sm' },
  xl: { icon: 72, text: 'text-3xl', tagline: 'text-base' },
  '2xl': { icon: 96, text: 'text-4xl', tagline: 'text-lg' },
};

// ============================================================================
// ÍCONE SVG
// ============================================================================

interface IconProps {
  size: number;
  animated?: boolean;
  className?: string;
}

const TSiIcon: React.FC<IconProps> = ({ size, animated, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'transition-transform duration-300',
        animated && 'hover:scale-110',
        className
      )}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="tsi-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
        <linearGradient id="tsi-brand-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
        <linearGradient id="tsi-accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
        <filter id="tsi-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer circle */}
      <circle cx="32" cy="32" r="30" fill="url(#tsi-bg-gradient)" stroke="url(#tsi-accent-gradient)" strokeWidth="2" />
      
      {/* TSi Text */}
      <text
        x="32"
        y="28"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#tsi-brand-gradient)"
        fontFamily="Poppins, Inter, sans-serif"
        fontWeight="700"
        fontSize="18"
        filter="url(#tsi-glow)"
      >
        TSi
      </text>
      
      {/* Sound wave bars */}
      <g transform="translate(16, 38)" fill="url(#tsi-accent-gradient)">
        <rect x="0" y="4" width="3" height="8" rx="1.5">
          {animated && (
            <animate attributeName="height" values="8;12;8" dur="0.6s" repeatCount="indefinite" />
          )}
        </rect>
        <rect x="6" y="2" width="3" height="12" rx="1.5">
          {animated && (
            <animate attributeName="height" values="12;6;12" dur="0.6s" repeatCount="indefinite" begin="0.1s" />
          )}
        </rect>
        <rect x="12" y="0" width="3" height="16" rx="1.5">
          {animated && (
            <animate attributeName="height" values="16;10;16" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
          )}
        </rect>
        <rect x="18" y="2" width="3" height="12" rx="1.5">
          {animated && (
            <animate attributeName="height" values="12;6;12" dur="0.6s" repeatCount="indefinite" begin="0.3s" />
          )}
        </rect>
        <rect x="24" y="4" width="3" height="8" rx="1.5">
          {animated && (
            <animate attributeName="height" values="8;12;8" dur="0.6s" repeatCount="indefinite" begin="0.4s" />
          )}
        </rect>
      </g>
    </svg>
  );
};

// ============================================================================
// TEXTO DO LOGO
// ============================================================================

interface TextProps {
  size: LogoSize;
  variant: 'text' | 'wordmark';
  className?: string;
}

const TSiText: React.FC<TextProps> = ({ size, variant, className }) => {
  const config = sizeConfig[size];
  
  if (variant === 'wordmark') {
    return (
      <span
        className={cn(
          'font-display font-bold tracking-tight',
          config.text,
          className
        )}
        style={{
          background: 'linear-gradient(90deg, #ff6b35 0%, #fbbf24 50%, #ff6b35 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        TSiJUKEBOX
      </span>
    );
  }
  
  return (
    <span className={cn('font-display font-bold tracking-tight', config.text, className)}>
      <span
        style={{
          background: 'linear-gradient(90deg, #ff6b35 0%, #fbbf24 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        TSi
      </span>
      <span className="text-white">JUKEBOX</span>
    </span>
  );
};

// ============================================================================
// TAGLINE
// ============================================================================

interface TaglineProps {
  size: LogoSize;
  className?: string;
}

const TSiTagline: React.FC<TaglineProps> = ({ size, className }) => {
  const config = sizeConfig[size];
  
  return (
    <span
      className={cn(
        'text-[var(--text-muted)] tracking-widest uppercase',
        config.tagline,
        className
      )}
    >
      Enterprise Digital Jukebox
    </span>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const TSiLogo: React.FC<TSiLogoProps> = ({
  variant = 'full',
  size = 'md',
  animated = false,
  showTagline = false,
  className,
  onClick,
}) => {
  const theme = useCurrentTheme();
  const config = sizeConfig[size];
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  const containerClasses = cn(
    'inline-flex items-center gap-2 select-none',
    onClick && 'cursor-pointer',
    className
  );
  
  // Renderizar variante
  switch (variant) {
    case 'icon':
      return (
        <div className={containerClasses} onClick={handleClick}>
          <TSiIcon size={config.icon} animated={animated} />
        </div>
      );
      
    case 'text':
      return (
        <div className={cn(containerClasses, 'flex-col items-start gap-0')} onClick={handleClick}>
          <TSiText size={size} variant="text" />
          {showTagline && <TSiTagline size={size} />}
        </div>
      );
      
    case 'wordmark':
      return (
        <div className={cn(containerClasses, 'flex-col items-start gap-0')} onClick={handleClick}>
          <TSiText size={size} variant="wordmark" />
          {showTagline && <TSiTagline size={size} />}
        </div>
      );
      
    case 'full':
    default:
      return (
        <div className={containerClasses} onClick={handleClick}>
          <TSiIcon size={config.icon} animated={animated} />
          <div className="flex flex-col items-start gap-0">
            <TSiText size={size} variant="text" />
            {showTagline && <TSiTagline size={size} />}
          </div>
        </div>
      );
  }
};

// ============================================================================
// VARIANTES PRÉ-CONFIGURADAS
// ============================================================================

export const TSiLogoHeader: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <TSiLogo variant="full" size="md" animated onClick={onClick} />
);

export const TSiLogoSidebar: React.FC<{ collapsed?: boolean; onClick?: () => void }> = ({ 
  collapsed, 
  onClick 
}) => (
  <TSiLogo 
    variant={collapsed ? 'icon' : 'full'} 
    size={collapsed ? 'sm' : 'md'} 
    animated 
    onClick={onClick} 
  />
);

export const TSiLogoSplash: React.FC = () => (
  <TSiLogo variant="full" size="2xl" animated showTagline />
);

export const TSiLogoFooter: React.FC = () => (
  <TSiLogo variant="wordmark" size="sm" />
);

export default TSiLogo;
