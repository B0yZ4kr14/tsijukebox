// Types templates for GitHub sync - 10 arquivos

const VERSION = '2.1.0';
const UPDATED = new Date().toISOString().split('T')[0];

export function generateTypesContent(path: string): string | null {
  const templates: Record<string, string> = {
    'src/types/audit.ts': `/**
 * TSiJUKEBOX - Audit Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for audit logging and activity tracking
 */

export type AuditCategory = 
  | 'auth'
  | 'playback'
  | 'library'
  | 'settings'
  | 'sync'
  | 'system'
  | 'user';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditDetails {
  [key: string]: string | number | boolean | null | undefined;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;
  status: AuditStatus;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  targetId: string | null;
  targetType: string | null;
  targetName: string | null;
  details: AuditDetails | null;
  metadata: Record<string, any> | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AuditFilter {
  category?: AuditCategory;
  severity?: AuditSeverity;
  status?: AuditStatus;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface AuditStats {
  totalLogs: number;
  byCategory: Record<AuditCategory, number>;
  bySeverity: Record<AuditSeverity, number>;
  byStatus: Record<AuditStatus, number>;
  recentActivity: AuditLog[];
}

export function isAuditLog(obj: unknown): obj is AuditLog {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'timestamp' in obj &&
    'action' in obj &&
    'category' in obj
  );
}
`,

    'src/types/index.ts': `/**
 * TSiJUKEBOX - Types Index
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Central export for all TypeScript types
 */

// Audit & Logging
export type {
  AuditCategory,
  AuditSeverity,
  AuditStatus,
  AuditDetails,
  AuditLog,
  AuditFilter,
  AuditStats,
} from './audit';
export { isAuditLog } from './audit';

// Kiosk Mode
export type {
  KioskStatus,
  KioskConnection,
  KioskCommand,
  KioskMetrics,
  KioskConfig,
} from './kiosk';

// Lyrics
export type {
  LyricLine,
  SyncedLyrics,
  LyricSource,
  LyricsSearchResult,
} from './lyrics';

// Notifications
export type {
  NotificationType,
  NotificationSeverity,
  Notification,
  NotificationPreferences,
} from './notifications';

// Settings
export type {
  AudioSettings,
  DisplaySettings,
  PlaybackSettings,
  SystemSettings,
  AllSettings,
} from './settings';

// Spotify API
export type {
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyDevice,
  SpotifyPlaybackState,
} from './spotify-api';

// Track
export type {
  TrackSource,
  Track,
  TrackQueue,
  PlaybackState,
  RepeatMode,
} from './track';

// User
export type {
  UserRole,
  UserPermissions,
  User,
  UserPreferences,
  UserSession,
} from './user';

// Weather
export type {
  WeatherCondition,
  WeatherData,
  WeatherForecast,
  WeatherLocation,
} from './weather';
`,

    'src/types/kiosk.ts': `/**
 * TSiJUKEBOX - Kiosk Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for kiosk mode and remote management
 */

export type KioskStatus = 'online' | 'offline' | 'idle' | 'playing' | 'error';

export interface KioskMetrics {
  cpuUsagePercent: number;
  memoryUsedMb: number;
  uptimeSeconds: number;
  crashCount: number;
  lastHeartbeat: string;
}

export interface KioskConfig {
  displayName: string;
  location: string;
  autoStart: boolean;
  idleTimeout: number;
  maxVolume: number;
  allowedSources: string[];
  restrictedHours: {
    start: string;
    end: string;
  } | null;
}

export interface KioskConnection {
  id: string;
  machineId: string;
  hostname: string;
  ipAddress: string | null;
  status: KioskStatus;
  metrics: KioskMetrics;
  config: KioskConfig;
  lastEvent: string | null;
  lastEventAt: string | null;
  lastScreenshotUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type KioskCommandType = 
  | 'play'
  | 'pause'
  | 'stop'
  | 'skip'
  | 'volume'
  | 'reboot'
  | 'shutdown'
  | 'screenshot'
  | 'update'
  | 'config';

export interface KioskCommand {
  id: string;
  machineId: string;
  command: KioskCommandType;
  params: Record<string, any> | null;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result: string | null;
  createdBy: string | null;
  createdAt: string;
  executedAt: string | null;
}

export interface KioskEvent {
  type: string;
  timestamp: string;
  details: Record<string, any>;
}

export function isKioskOnline(connection: KioskConnection): boolean {
  const lastHeartbeat = new Date(connection.metrics.lastHeartbeat);
  const now = new Date();
  const diffMs = now.getTime() - lastHeartbeat.getTime();
  return diffMs < 60000; // 1 minute threshold
}
`,

    'src/types/lyrics.ts': `/**
 * TSiJUKEBOX - Lyrics Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for lyrics display and synchronization
 */

export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface SyncedLyrics {
  lines: LyricLine[];
  language: string;
  source: LyricSource;
  syncType: 'line' | 'word';
  duration: number;
}

export type LyricSource = 
  | 'local'
  | 'lrclib'
  | 'genius'
  | 'musixmatch'
  | 'netease'
  | 'manual';

export interface LyricsSearchResult {
  id: string;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  source: LyricSource;
  synced: boolean;
  previewText?: string;
}

export interface LyricsCache {
  trackId: string;
  lyrics: SyncedLyrics | null;
  plainText?: string;
  fetchedAt: string;
  expiresAt: string;
}

export interface LyricsDisplaySettings {
  fontSize: 'small' | 'medium' | 'large';
  showTranslation: boolean;
  highlightColor: string;
  scrollBehavior: 'smooth' | 'instant';
  offset: number; // in milliseconds
}

export function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const regex = /\\[(\\d{2}):(\\d{2})\\.(\\d{2,3})\\](.+)/g;
  let match;
  
  while ((match = regex.exec(lrc)) !== null) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const ms = parseInt(match[3].padEnd(3, '0'), 10);
    const time = minutes * 60 + seconds + ms / 1000;
    const text = match[4].trim();
    
    if (text) {
      lines.push({ time, text });
    }
  }
  
  return lines.sort((a, b) => a.time - b.time);
}
`,

    'src/types/notifications.ts': `/**
 * TSiJUKEBOX - Notification Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for in-app notifications
 */

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'sync'
  | 'playback'
  | 'system';

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string | null;
  read: boolean;
  metadata: Record<string, any> | null;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  playback: boolean;
  sync: boolean;
  system: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationGroup {
  type: NotificationType;
  count: number;
  latestAt: string;
  notifications: Notification[];
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  bySeverity: Record<NotificationSeverity, number>;
}

export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
    sync: 'refresh-cw',
    playback: 'play-circle',
    system: 'settings',
  };
  return icons[type];
}
`,

    'src/types/settings.ts': `/**
 * TSiJUKEBOX - Settings Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for application settings
 */

export interface AudioSettings {
  volume: number;
  muted: boolean;
  equalizer: number[];
  normalization: boolean;
  crossfade: boolean;
  crossfadeDuration: number;
  gapless: boolean;
  replayGain: 'off' | 'track' | 'album';
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  showLyrics: boolean;
  showVisualizer: boolean;
  visualizerType: 'bars' | 'wave' | 'circular' | 'particles';
  albumArtSize: 'small' | 'medium' | 'large' | 'fullscreen';
  compactMode: boolean;
  showClock: boolean;
  language: string;
}

export interface PlaybackSettings {
  autoPlay: boolean;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  rememberPosition: boolean;
  skipSilence: boolean;
  playbackSpeed: number;
  defaultSource: 'local' | 'spotify' | 'youtube';
}

export interface SystemSettings {
  kioskMode: boolean;
  debugMode: boolean;
  telemetry: boolean;
  autoUpdate: boolean;
  cacheSize: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  backendUrl: string;
  apiTimeout: number;
}

export interface AllSettings {
  audio: AudioSettings;
  display: DisplaySettings;
  playback: PlaybackSettings;
  system: SystemSettings;
}

export const defaultAudioSettings: AudioSettings = {
  volume: 80,
  muted: false,
  equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  normalization: true,
  crossfade: true,
  crossfadeDuration: 5,
  gapless: true,
  replayGain: 'off',
};

export const defaultDisplaySettings: DisplaySettings = {
  theme: 'system',
  accentColor: '#8B5CF6',
  showLyrics: true,
  showVisualizer: true,
  visualizerType: 'bars',
  albumArtSize: 'medium',
  compactMode: false,
  showClock: true,
  language: 'pt-BR',
};

export const defaultPlaybackSettings: PlaybackSettings = {
  autoPlay: true,
  shuffle: false,
  repeat: 'off',
  rememberPosition: true,
  skipSilence: false,
  playbackSpeed: 1,
  defaultSource: 'local',
};

export const defaultSystemSettings: SystemSettings = {
  kioskMode: false,
  debugMode: false,
  telemetry: true,
  autoUpdate: true,
  cacheSize: 500,
  logLevel: 'info',
  backendUrl: '',
  apiTimeout: 30000,
};
`,

    'src/types/spotify-api.ts': `/**
 * TSiJUKEBOX - Spotify API Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for Spotify Web API responses
 */

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  href: string;
  images?: SpotifyImage[];
  genres?: string[];
  followers?: {
    total: number;
  };
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  href: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  releaseDate: string;
  releaseDatePrecision: 'year' | 'month' | 'day';
  totalTracks: number;
  albumType: 'album' | 'single' | 'compilation';
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  href: string;
  durationMs: number;
  explicit: boolean;
  popularity: number;
  previewUrl: string | null;
  trackNumber: number;
  discNumber: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  isLocal: boolean;
  isPlayable: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  uri: string;
  href: string;
  images: SpotifyImage[];
  owner: {
    id: string;
    displayName: string;
  };
  public: boolean;
  collaborative: boolean;
  tracks: {
    total: number;
    href: string;
  };
  snapshotId: string;
}

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  isPrivateSession: boolean;
  isRestricted: boolean;
  volumePercent: number;
}

export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  repeatState: 'off' | 'track' | 'context';
  shuffleState: boolean;
  timestamp: number;
  progressMs: number;
  isPlaying: boolean;
  item: SpotifyTrack | null;
  currentlyPlayingType: 'track' | 'episode' | 'ad' | 'unknown';
  context: {
    type: string;
    uri: string;
    href: string;
  } | null;
}

export interface SpotifySearchResults {
  tracks?: { items: SpotifyTrack[]; total: number };
  artists?: { items: SpotifyArtist[]; total: number };
  albums?: { items: SpotifyAlbum[]; total: number };
  playlists?: { items: SpotifyPlaylist[]; total: number };
}
`,

    'src/types/track.ts': `/**
 * TSiJUKEBOX - Track Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Core types for music tracks and playback
 */

export type TrackSource = 'local' | 'spotify' | 'youtube' | 'soundcloud';

export type RepeatMode = 'off' | 'one' | 'all';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArtist?: string;
  duration: number; // in seconds
  coverUrl?: string;
  source: TrackSource;
  sourceId?: string;
  filePath?: string;
  streamUrl?: string;
  bitrate?: number;
  sampleRate?: number;
  format?: string;
  year?: number;
  genre?: string;
  trackNumber?: number;
  discNumber?: number;
  bpm?: number;
  key?: string;
  isExplicit?: boolean;
  isLiked?: boolean;
  playCount?: number;
  lastPlayedAt?: string;
  addedAt?: string;
}

export interface TrackQueue {
  items: Track[];
  currentIndex: number;
  shuffled: boolean;
  shuffleOrder?: number[];
  repeatMode: RepeatMode;
  history: Track[];
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isSeeking: boolean;
  currentTrack: Track | null;
  position: number; // in seconds
  duration: number; // in seconds
  volume: number; // 0-100
  muted: boolean;
  playbackRate: number;
}

export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
  trackNumber?: number;
  discNumber?: number;
  duration: number;
  coverData?: string; // base64
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
}

export function isValidTrack(track: unknown): track is Track {
  return (
    typeof track === 'object' &&
    track !== null &&
    'id' in track &&
    'title' in track &&
    'artist' in track &&
    'duration' in track &&
    'source' in track
  );
}
`,

    'src/types/user.ts': `/**
 * TSiJUKEBOX - User Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for user authentication and profiles
 */

export type UserRole = 'admin' | 'user' | 'newbie';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageLibrary: boolean;
  canCreatePlaylists: boolean;
  canDeleteTracks: boolean;
  canAccessKiosk: boolean;
  canViewStats: boolean;
  canExportData: boolean;
  canImportData: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privateProfile: boolean;
  showListeningActivity: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface UserStats {
  totalPlaytime: number;
  tracksPlayed: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  topGenres: Array<{ genre: string; count: number }>;
  topArtists: Array<{ artist: string; count: number }>;
  listeningStreak: number;
  memberSince: string;
}

export const defaultPermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canManageUsers: true,
    canManageSettings: true,
    canManageLibrary: true,
    canCreatePlaylists: true,
    canDeleteTracks: true,
    canAccessKiosk: true,
    canViewStats: true,
    canExportData: true,
    canImportData: true,
  },
  user: {
    canManageUsers: false,
    canManageSettings: false,
    canManageLibrary: true,
    canCreatePlaylists: true,
    canDeleteTracks: false,
    canAccessKiosk: true,
    canViewStats: true,
    canExportData: true,
    canImportData: false,
  },
  newbie: {
    canManageUsers: false,
    canManageSettings: false,
    canManageLibrary: false,
    canCreatePlaylists: false,
    canDeleteTracks: false,
    canAccessKiosk: true,
    canViewStats: false,
    canExportData: false,
    canImportData: false,
  },
};
`,

    'src/types/weather.ts': `/**
 * TSiJUKEBOX - Weather Types
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Types for weather display widget
 */

export type WeatherCondition = 
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'snow'
  | 'sleet'
  | 'hail'
  | 'wind';

export interface WeatherLocation {
  latitude: number;
  longitude: number;
  city: string;
  region?: string;
  country: string;
  timezone: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    condition: WeatherCondition;
    description: string;
    icon: string;
    isDay: boolean;
  };
  updatedAt: string;
}

export interface WeatherForecast {
  date: string;
  temperatureHigh: number;
  temperatureLow: number;
  condition: WeatherCondition;
  description: string;
  icon: string;
  precipitationChance: number;
  humidity: number;
  windSpeed: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherSettings {
  enabled: boolean;
  units: 'metric' | 'imperial';
  location: WeatherLocation | null;
  autoDetectLocation: boolean;
  refreshInterval: number; // in minutes
  showInKiosk: boolean;
}

export function getWeatherIcon(condition: WeatherCondition, isDay: boolean): string {
  const icons: Record<WeatherCondition, { day: string; night: string }> = {
    'clear': { day: 'sun', night: 'moon' },
    'partly-cloudy': { day: 'cloud-sun', night: 'cloud-moon' },
    'cloudy': { day: 'cloud', night: 'cloud' },
    'overcast': { day: 'clouds', night: 'clouds' },
    'fog': { day: 'cloud-fog', night: 'cloud-fog' },
    'drizzle': { day: 'cloud-drizzle', night: 'cloud-drizzle' },
    'rain': { day: 'cloud-rain', night: 'cloud-rain' },
    'heavy-rain': { day: 'cloud-rain-wind', night: 'cloud-rain-wind' },
    'thunderstorm': { day: 'cloud-lightning', night: 'cloud-lightning' },
    'snow': { day: 'snowflake', night: 'snowflake' },
    'sleet': { day: 'cloud-hail', night: 'cloud-hail' },
    'hail': { day: 'cloud-hail', night: 'cloud-hail' },
    'wind': { day: 'wind', night: 'wind' },
  };
  
  return icons[condition]?.[isDay ? 'day' : 'night'] ?? 'cloud';
}

export function formatTemperature(temp: number, units: 'metric' | 'imperial'): string {
  const rounded = Math.round(temp);
  return units === 'metric' ? \`\${rounded}°C\` : \`\${rounded}°F\`;
}
`,
  };

  return templates[path] ?? null;
}
