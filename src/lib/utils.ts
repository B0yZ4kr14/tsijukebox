import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata automaticamente "TSiJUKEBOX" em texto para React nodes com estilo da marca
 * TSi em prata/steel, JUKEBOX em dourado/âmbar (herda tamanho da fonte)
 * @param text - Texto que pode conter "TSiJUKEBOX"
 * @returns React nodes com TSiJUKEBOX formatado ou texto original
 */
export function formatBrandName(text: string): React.ReactNode {
  if (!text || !text.includes('TSiJUKEBOX')) return text;
  
  const parts = text.split(/(TSiJUKEBOX)/g);
  return parts.map((part, i) => 
    part === 'TSiJUKEBOX' 
      ? React.createElement('span', { key: i, className: 'inline' }, [
          React.createElement('span', { key: `${i}-tsi`, className: 'text-brand-tsi' }, 'TSi'),
          React.createElement('span', { key: `${i}-jukebox`, className: 'text-brand-jukebox' }, 'JUKEBOX')
        ])
      : part
  );
}
