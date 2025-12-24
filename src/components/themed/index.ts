/**
 * TSiJUKEBOX Themed Components
 * 
 * Exportação centralizada de todos os componentes refatorados
 * com suporte aos 5 temas oficiais.
 */

// ============================================================================
// THEME SYSTEM
// ============================================================================

export * from '@/lib/themes';
export { useTheme, useCurrentTheme, useThemeColors, ThemeProvider } from '@/contexts/ThemeContext';

// ============================================================================
// LOGO & BRANDING
// ============================================================================

export { 
  TSiLogo, 
  TSiLogoHeader, 
  TSiLogoSidebar, 
  TSiLogoSplash, 
  TSiLogoFooter,
  type LogoVariant,
  type LogoSize,
} from '@/components/ui/TSiLogo';

// ============================================================================
// NAVIGATION
// ============================================================================

export { 
  Sidebar, 
  MobileSidebar 
} from '@/components/navigation/Sidebar';

export { 
  HeaderV2 as Header,
} from '@/components/navigation/HeaderV2';

// ============================================================================
// UI COMPONENTS
// ============================================================================

export {
  Card,
  Button,
  Input,
  Toggle,
  Slider,
  Badge,
  StatCard,
  type CardProps,
  type ButtonProps,
  type InputProps,
  type ToggleProps,
  type SliderProps,
  type BadgeProps,
  type StatCardProps,
} from '@/components/ui/themed';

// ============================================================================
// SETTINGS
// ============================================================================

export {
  ThemeSelector,
  ThemeSelectorCompact,
} from '@/components/settings/ThemeSelector';

// ============================================================================
// PLAYER
// ============================================================================

export {
  ThemedPlayer,
  type Track,
  type PlayerState,
  type ThemedPlayerProps,
} from '@/components/player/ThemedPlayer';
