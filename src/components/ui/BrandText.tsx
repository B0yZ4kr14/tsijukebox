import React from 'react';
import { cn } from '@/lib/utils';

export type BrandTextSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type BrandTextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface BrandTextProps {
  className?: string;
  size?: BrandTextSize;
  weight?: BrandTextWeight;
  noShimmer?: boolean;
}

const sizeClasses: Record<BrandTextSize, string> = {
  sm: 'text-sm',      // 14px
  md: 'text-base',    // 16px (padrão)
  lg: 'text-lg',      // 18px
  xl: 'text-2xl',     // 24px
  '2xl': 'text-3xl',  // 30px
  '3xl': 'text-4xl',  // 36px
};

const weightClasses: Record<BrandTextWeight, string> = {
  light: 'font-light',       // 300
  normal: 'font-normal',     // 400
  medium: 'font-medium',     // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold',         // 700 (padrão atual)
  extrabold: 'font-extrabold', // 800
};

/**
 * Componente reutilizável para renderizar "TSiJUKEBOX"
 * com cores da logo: TSi em prata/steel, JUKEBOX em dourado/âmbar
 * Suporta variantes de tamanho, peso e controle de animação shimmer
 */
export function BrandText({ 
  className, 
  size = 'md', 
  weight = 'bold',
  noShimmer = false 
}: BrandTextProps) {
  const shimmerClass = noShimmer ? 'no-shimmer' : '';
  
  return (
    <span className={cn('inline', sizeClasses[size], weightClasses[weight], className)}>
      <span className={cn('text-brand-tsi', shimmerClass)}>TSi</span>
      <span className={cn('text-brand-jukebox', shimmerClass)}>JUKEBOX</span>
    </span>
  );
}

interface FormatBrandOptions {
  size?: BrandTextSize;
  weight?: BrandTextWeight;
  noShimmer?: boolean;
}

/**
 * Formata texto substituindo "TSiJUKEBOX" por componente estilizado
 * Útil para textos dinâmicos que podem conter a marca
 */
export function formatBrandInText(
  text: string, 
  options?: FormatBrandOptions
): React.ReactNode {
  if (!text || !text.includes('TSiJUKEBOX')) return text;
  
  const parts = text.split(/(TSiJUKEBOX)/g);
  return parts.map((part, i) => 
    part === 'TSiJUKEBOX' 
      ? <BrandText key={i} size={options?.size} weight={options?.weight} noShimmer={options?.noShimmer} />
      : part
  );
}

export default BrandText;
