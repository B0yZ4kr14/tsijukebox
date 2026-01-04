// Lib index template - 1 arquivo
// Geração automática de conteúdo para src/lib/index.ts

const VERSION = '2.5.0';
const GENERATED_AT = new Date().toISOString();

export function generateLibIndexContent(): string {
  return `// Library utilities - centralized exports
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

// Core utilities
export * from './utils';
export * from './formatters';
export * from './date-utils';

// Theme and styling
export * from './colorExtractor';
export * from './contrastUtils';
export * from './theme-utils';

// Media utilities
export * from './lrcParser';
export * from './lyricsCache';

// Search and export
export * from './globalSearch';
export * from './documentExporter';

// Constants
export * from './constants';

// Storage
export * from './storage';

// Validations
export * from './validations';

// API clients
export * from './api';

// Auth utilities
export * from './auth';

// Re-export commonly used functions
export { cn } from './utils';
export { formatDuration, formatDate, formatRelativeTime } from './formatters';
`;
}
