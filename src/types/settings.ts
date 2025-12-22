/**
 * Settings Types
 * 
 * Types for application settings and configuration
 */

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Supported languages
 */
export type SupportedLanguage = 'en' | 'es' | 'pt-BR';

/**
 * Database provider types
 */
export type DatabaseProvider = 'sqlite' | 'postgres' | 'mysql' | 'supabase';

/**
 * Backup provider types
 */
export type BackupProvider = 'storj' | 'gdrive' | 'dropbox' | 's3' | 'local';

/**
 * Music provider types
 */
export type MusicProvider = 'spotify' | 'youtube-music' | 'local';

/**
 * General settings
 */
export interface GeneralSettings {
  language: SupportedLanguage;
  theme: ThemeMode;
  autoPlay: boolean;
  shuffleOnStart: boolean;
  defaultVolume: number;
  fadeTransition: boolean;
  fadeDuration: number;
}

/**
 * Display settings
 */
export interface DisplaySettings {
  showAlbumArt: boolean;
  showLyrics: boolean;
  showQueue: boolean;
  kioskMode: boolean;
  idleTimeout: number;
  screensaverEnabled: boolean;
  clockFormat: '12h' | '24h';
  showWeather: boolean;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  provider: DatabaseProvider;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  useSSL?: boolean;
  poolSize?: number;
}

/**
 * Backup configuration
 */
export interface BackupConfig {
  provider: BackupProvider;
  enabled: boolean;
  schedule: string; // cron expression
  retentionDays: number;
  includeMedia: boolean;
  encryptBackups: boolean;
}

/**
 * Music integration configuration
 */
export interface MusicIntegrationConfig {
  provider: MusicProvider;
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  qualityPreference: 'low' | 'medium' | 'high' | 'lossless';
}

/**
 * Weather configuration
 */
export interface WeatherConfig {
  enabled: boolean;
  location: string;
  units: 'metric' | 'imperial';
  showForecast: boolean;
}

/**
 * NTP configuration
 */
export interface NtpConfig {
  enabled: boolean;
  server: string;
  syncInterval: number; // minutes
  timezone: string;
}

/**
 * Complete application settings
 */
export interface AppSettings {
  general: GeneralSettings;
  display: DisplaySettings;
  accessibility: AccessibilitySettings;
  database: DatabaseConfig;
  backup: BackupConfig;
  musicIntegrations: MusicIntegrationConfig[];
  weather: WeatherConfig;
  ntp: NtpConfig;
}

/**
 * Settings section identifiers
 */
export type SettingsSectionId =
  | 'general'
  | 'display'
  | 'accessibility'
  | 'database'
  | 'backup'
  | 'integrations'
  | 'weather'
  | 'system'
  | 'developer'
  | 'users';

/**
 * Settings section metadata
 */
export interface SettingsSectionMeta {
  id: SettingsSectionId;
  title: string;
  description: string;
  icon: string;
  requiresAdmin: boolean;
}

/**
 * Type guard for AppSettings
 */
export function isAppSettings(value: unknown): value is AppSettings {
  return (
    typeof value === 'object' &&
    value !== null &&
    'general' in value &&
    'display' in value &&
    'accessibility' in value
  );
}
