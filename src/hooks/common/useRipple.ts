import { useState, useCallback } from 'react';

export interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Click position relative to element
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Ripple size = element diagonal to cover everything
    const size = Math.max(rect.width, rect.height) * 2.5;
    
    const newRipple: Ripple = { id: Date.now(), x, y, size };
    setRipples(prev => [...prev, newRipple]);
    
    // Remove after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, []);

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return { ripples, createRipple, clearRipples };
}
