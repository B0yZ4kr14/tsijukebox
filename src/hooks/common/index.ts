// Common hooks barrel export
export { useDebounce } from './useDebounce';
export { useTranslation } from './useTranslation';
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';
export { useRipple, type Ripple } from './useRipple';
export { useTouchGestures } from './useTouchGestures';
export { useSoundEffects } from './useSoundEffects';
export { useFirstAccess } from './useFirstAccess';
export { useGlobalSearch } from './useGlobalSearch';
export { usePWAInstall } from './usePWAInstall';
export { useReadArticles } from './useReadArticles';
export { useSettingsNotifications, type SettingsNotification } from './useSettingsNotifications';
export { useSettingsStatus, type SettingsCategoryId, type CategoryStatus, type StatusLevel } from './useSettingsStatus';
export { useSettingsTour, type SettingsTourId } from './useSettingsTour';
export { 
  useThemeCustomizer, 
  builtInPresets, 
  defaultColors, 
  hslToHex, 
  hexToHsl,
  applyCustomColors,
  type CustomThemeColors, 
  type ThemePreset 
} from './useThemeCustomizer';
export { useWikiBookmarks } from './useWikiBookmarks';
export { useBackNavigation } from './useBackNavigation';
