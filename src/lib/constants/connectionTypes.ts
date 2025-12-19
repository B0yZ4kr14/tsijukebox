/**
 * Connection type constants for the application
 */

export const CONNECTION_TYPES = {
  DEMO: 'demo',
  WEBSOCKET: 'websocket',
  POLLING: 'polling',
  POLLING_FALLBACK: 'polling-fallback',
  DISCONNECTED: 'disconnected',
} as const;

export type ConnectionType = typeof CONNECTION_TYPES[keyof typeof CONNECTION_TYPES];

/**
 * Connection status labels for UI display
 */
export const CONNECTION_LABELS: Record<ConnectionType, string> = {
  [CONNECTION_TYPES.DEMO]: 'Demo',
  [CONNECTION_TYPES.WEBSOCKET]: 'WebSocket',
  [CONNECTION_TYPES.POLLING]: 'Polling',
  [CONNECTION_TYPES.POLLING_FALLBACK]: 'Fallback',
  [CONNECTION_TYPES.DISCONNECTED]: 'Desconectado',
};

/**
 * Music provider constants
 */
export const MUSIC_PROVIDERS = {
  SPOTIFY: 'spotify',
  SPICETIFY: 'spicetify',
  YOUTUBE_MUSIC: 'youtube-music',
  LOCAL: 'local',
} as const;

export type MusicProviderType = typeof MUSIC_PROVIDERS[keyof typeof MUSIC_PROVIDERS];

/**
 * Repeat mode constants
 */
export const REPEAT_MODES = {
  OFF: 'off',
  TRACK: 'track',
  CONTEXT: 'context',
} as const;

export type RepeatMode = typeof REPEAT_MODES[keyof typeof REPEAT_MODES];

/**
 * Theme color constants
 */
export const THEME_COLORS = {
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
  PINK: 'pink',
  CUSTOM: 'custom',
} as const;

export type ThemeColorType = typeof THEME_COLORS[keyof typeof THEME_COLORS];

/**
 * Log level constants
 */
export const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];
