// Types barrel export

// Track types
export type {
  MusicGenre,
  BaseTrack,
  TrackInfo,
  QueueTrack,
  SpotifyTrack,
  YouTubeMusicTrack,
  LocalTrack,
  CurrentTrack,
} from './track';
export { isQueueTrack, isSpotifyTrack } from './track';

// User types
export type {
  UserRole,
  AppUser,
  UserPermissions,
  AuthProvider,
  AuthConfig,
} from './user';
export { rolePermissions } from './user';

// Lyrics types
export type {
  LyricsData,
  CachedLyrics,
  CacheStats,
} from './lyrics';

// Kiosk types
export type {
  KioskStatus,
  KioskCommandType,
  KioskCommandStatus,
  KioskConnection,
  KioskCommand,
  KioskMetrics,
  KioskEvent,
  KioskConfig,
} from './kiosk';
export { isKioskConnection, isKioskCommand } from './kiosk';

// Audit types
export type {
  AuditCategory,
  AuditSeverity,
  AuditStatus,
  AuditAction,
  AuditLog,
  AuditLogFilters,
  AuditLogInput,
  AuditStats,
} from './audit';
export { isAuditLog } from './audit';

// Settings types
export type {
  ThemeMode,
  SupportedLanguage,
  DatabaseProvider,
  BackupProvider,
  MusicProvider,
  GeneralSettings,
  DisplaySettings,
  AccessibilitySettings,
  DatabaseConfig,
  BackupConfig,
  MusicIntegrationConfig,
  WeatherConfig,
  NtpConfig,
  AppSettings,
  SettingsSectionId,
  SettingsSectionMeta,
} from './settings';
export { isAppSettings } from './settings';

// Weather types
export type {
  WeatherCondition,
  WindDirection,
  TemperatureUnit,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherAlert,
  WeatherLocation,
  WeatherData,
  WeatherApiResponse,
} from './weather';
export { getWeatherIcon, isWeatherData } from './weather';

// Notification types
export type {
  NotificationType,
  NotificationSeverity,
  NotificationActionType,
  NotificationAction,
  AppNotification,
  NotificationInput,
  NotificationFilters,
  NotificationPreferences,
  NotificationStats,
  PushNotificationPayload,
} from './notifications';
export { isAppNotification, isNotificationPreferences } from './notifications';

// Spotify API types
export type {
  SpotifyApiImage,
  SpotifyApiArtistSimple,
  SpotifyApiAlbumSimple,
  SpotifyApiTrack,
  SpotifyApiAlbum,
  SpotifyApiArtist,
  SpotifyApiPlaylistOwner,
  SpotifyApiPlaylist,
  SpotifyApiCategory,
  SpotifyApiDevice,
  SpotifyApiPaginated,
  SpotifyApiPlaylistsResponse,
  SpotifyApiPlaylistTracksResponse,
  SpotifyApiSavedTracksResponse,
  SpotifyApiSavedAlbumsResponse,
  SpotifyApiAlbumTracksResponse,
  SpotifyApiFollowedArtistsResponse,
  SpotifyApiSearchResponse,
  SpotifyApiRecentlyPlayedResponse,
  SpotifyApiTopItemsResponse,
  SpotifyApiFeaturedPlaylistsResponse,
  SpotifyApiNewReleasesResponse,
  SpotifyApiCategoriesResponse,
  SpotifyApiCategoryPlaylistsResponse,
  SpotifyApiPlaybackState,
  SpotifyApiDevicesResponse,
  SpotifyApiQueueResponse,
  SpotifyApiRecommendationsResponse,
  SpotifyApiArtistTopTracksResponse,
  LRCLIBResult,
} from './spotify-api';
