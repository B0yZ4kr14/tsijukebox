import React from 'react';
import { cn } from '@/lib/utils';

export type BrandTextSize = 'sm' | 'md' | 'lg' | 'xl';

interface BrandTextProps {
  className?: string;
  size?: BrandTextSize;
  noShimmer?: boolean;
}

const sizeClasses: Record<BrandTextSize, string> = {
  sm: 'text-sm',    // 14px
  md: 'text-base',  // 16px (padrão)
  lg: 'text-lg',    // 18px
  xl: 'text-2xl',   // 24px
};

/**
 * Componente reutilizável para renderizar "TSiJUKEBOX"
 * com cores da logo: TSi em prata/steel, JUKEBOX em dourado/âmbar
 * Suporta variantes de tamanho e controle de animação shimmer
 */
export function BrandText({ className, size = 'md', noShimmer = false }: BrandTextProps) {
  const shimmerClass = noShimmer ? 'no-shimmer' : '';
  
  return (
    <span className={cn('inline', sizeClasses[size], className)}>
      <span className={cn('text-brand-tsi', shimmerClass)}>TSi</span>
      <span className={cn('text-brand-jukebox', shimmerClass)}>JUKEBOX</span>
    </span>
  );
}

interface FormatBrandOptions {
  size?: BrandTextSize;
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
      ? <BrandText key={i} size={options?.size} noShimmer={options?.noShimmer} />
      : part
  );
}

export default BrandText;
