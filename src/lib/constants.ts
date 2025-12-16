/**
 * Centralized localStorage keys for TSi JUKEBOX
 * Eliminates duplication across components
 */

export const STORAGE_KEYS = {
  // Setup & Tour
  SETUP_COMPLETE: 'tsi_jukebox_setup_complete',
  TOUR_COMPLETE: 'tsi_jukebox_tour_complete',
  
  // User & Achievements
  ACHIEVEMENTS: 'tsi_jukebox_achievements',
  CURRENT_USER: 'tsi_jukebox_current_user',
  
  // Theme & Accessibility
  CUSTOM_THEMES: 'tsi_jukebox_custom_themes',
  CUSTOM_COLORS: 'tsi_jukebox_custom_colors',
  ACCESSIBILITY: 'tsi_jukebox_accessibility',
  
  // Settings
  SETTINGS: 'tsi_jukebox_settings',
  SPOTIFY_SETTINGS: 'tsi_jukebox_spotify_settings',
  WEATHER_SETTINGS: 'tsi_jukebox_weather_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
