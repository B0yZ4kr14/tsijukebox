import React from 'react';
import { cn } from '@/lib/utils';

interface BrandTextProps {
  className?: string;
}

/**
 * Componente reutilizável para renderizar "TSiJUKEBOX"
 * com cores da logo: TSi em prata/steel, JUKEBOX em dourado/âmbar
 * Herda o tamanho da fonte do contexto
 */
export function BrandText({ className }: BrandTextProps) {
  return (
    <span className={cn('inline', className)}>
      <span className="text-brand-tsi">TSi</span>
      <span className="text-brand-jukebox">JUKEBOX</span>
    </span>
  );
}

/**
 * Formata texto substituindo "TSiJUKEBOX" por componente estilizado
 * Útil para textos dinâmicos que podem conter a marca
 */
export function formatBrandInText(text: string): React.ReactNode {
  if (!text || !text.includes('TSiJUKEBOX')) return text;
  
  const parts = text.split(/(TSiJUKEBOX)/g);
  return parts.map((part, i) => 
    part === 'TSiJUKEBOX' 
      ? <BrandText key={i} />
      : part
  );
}

export default BrandText;
