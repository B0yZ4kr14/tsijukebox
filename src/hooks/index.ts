// Main hooks barrel export - re-exports all hooks organized by domain

// Player hooks
export * from './player';

// Spotify hooks
export * from './spotify';

// YouTube Music hooks
export * from './youtube';

// System hooks
export * from './system';

// Common hooks
export * from './common';

// Remaining hooks (not yet organized)
export { useFirstAccess } from './useFirstAccess';
export { usePWAInstall } from './usePWAInstall';
export { useGlobalSearch } from './useGlobalSearch';
export { useLibrary } from './useLibrary';
export { useLocalMusic } from './useLocalMusic';
export { useMockStatus } from './useMockData';
export { useReadArticles } from './useReadArticles';
export { useSettingsNotifications } from './useSettingsNotifications';
export { useSettingsTour } from './useSettingsTour';
export { useSpicetifyIntegration } from './useSpicetifyIntegration';
export { useStorjClient } from './useStorjClient';
export { useThemeCustomizer } from './useThemeCustomizer';
export { useWeather } from './useWeather';
export { useWeatherForecast } from './useWeatherForecast';
export { useWikiBookmarks } from './useWikiBookmarks';
export { useA11yStats } from './useA11yStats';
export { useClientWebSocket } from './useClientWebSocket';
export { useContrastDebug } from './useContrastDebug';
