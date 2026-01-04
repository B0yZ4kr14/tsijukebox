/**
 * Card System Optimizations
 * 
 * Otimizações de performance e bundle size para o Card System.
 * 
 * @version 1.0.0
 */

import { lazy } from 'react';

// ============================================================================
// Lazy Loading de Cards Especializados
// ============================================================================

/**
 * Lazy load de MusicCard para reduzir bundle inicial
 */
export const LazyMusicCard = lazy(() =>
  import('./specialized-cards').then((module) => ({ default: module.MusicCard }))
);

/**
 * Lazy load de StatCard para reduzir bundle inicial
 */
export const LazyStatCard = lazy(() =>
  import('./specialized-cards').then((module) => ({ default: module.StatCard }))
);

/**
 * Lazy load de PlaylistCard para reduzir bundle inicial
 */
export const LazyPlaylistCard = lazy(() =>
  import('./specialized-cards').then((module) => ({ default: module.PlaylistCard }))
);

/**
 * Lazy load de ArtistCard para reduzir bundle inicial
 */
export const LazyArtistCard = lazy(() =>
  import('./specialized-cards').then((module) => ({ default: module.ArtistCard }))
);

/**
 * Lazy load de AlbumCard para reduzir bundle inicial
 */
export const LazyAlbumCard = lazy(() =>
  import('./specialized-cards').then((module) => ({ default: module.AlbumCard }))
);

// ============================================================================
// Memoization Helpers
// ============================================================================

/**
 * Compara props para React.memo
 * Otimiza re-renders desnecessários
 */
export const cardPropsAreEqual = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>
): boolean => {
  // Lista de props que devem ser comparadas
  const propsToCompare = [
    'title',
    'artist',
    'album',
    'duration',
    'coverUrl',
    'isPlaying',
    'isFavorite',
    'name',
    'description',
    'trackCount',
    'value',
    'trend',
    'trendValue',
    'followers',
    'isFollowing',
    'year',
  ];

  // Comparação rápida de props primitivas
  for (const prop of propsToCompare) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  // Callbacks são sempre consideradas iguais se existem
  // (assumindo que são estáveis via useCallback)
  return true;
};

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Debounce para callbacks de busca/filtro
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle para scroll handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Formata números grandes (1234567 → "1.2M")
 * Reduz processamento de formatação
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Formata duração (segundos → "MM:SS")
 * Cache de resultados comuns
 */
const durationCache = new Map<number, string>();

export const formatDuration = (seconds: number): string => {
  if (durationCache.has(seconds)) {
    return durationCache.get(seconds)!;
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, '0')}`;

  // Cache apenas durações comuns (< 1 hora)
  if (seconds < 3600) {
    durationCache.set(seconds, formatted);
  }

  return formatted;
};

// ============================================================================
// Image Optimization
// ============================================================================

/**
 * Gera URL de imagem otimizada
 * Adiciona parâmetros de resize/quality se disponível
 */
export const optimizeImageUrl = (
  url: string | undefined,
  width: number,
  quality: number = 80
): string | undefined => {
  if (!url) return undefined;

  // Se for URL externa com suporte a resize (ex: Cloudinary, Imgix)
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }

  if (url.includes('imgix.net')) {
    return `${url}?w=${width}&q=${quality}&auto=format`;
  }

  // URL local ou sem suporte a resize
  return url;
};

/**
 * Preload de imagens críticas
 * Melhora LCP (Largest Contentful Paint)
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Preload de múltiplas imagens
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(preloadImage));
};

// ============================================================================
// Virtual Scrolling Helper
// ============================================================================

/**
 * Calcula itens visíveis para virtual scrolling
 * Reduz renderização de cards fora da viewport
 */
export const calculateVisibleItems = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { startIndex: number; endIndex: number } => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex };
};

// ============================================================================
// Bundle Size Optimization
// ============================================================================

/**
 * Tree-shaking friendly exports
 * Permite importar apenas o necessário
 */
export const cardOptimizations = {
  lazy: {
    MusicCard: LazyMusicCard,
    StatCard: LazyStatCard,
    PlaylistCard: LazyPlaylistCard,
    ArtistCard: LazyArtistCard,
    AlbumCard: LazyAlbumCard,
  },
  memo: {
    propsAreEqual: cardPropsAreEqual,
  },
  performance: {
    debounce,
    throttle,
    formatNumber,
    formatDuration,
  },
  image: {
    optimize: optimizeImageUrl,
    preload: preloadImage,
    preloadMultiple: preloadImages,
  },
  virtual: {
    calculateVisibleItems,
  },
} as const;

export default cardOptimizations;
