/**
 * Centralized Route Configuration
 * 
 * Routes organized by category for better maintainability
 */

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate } from 'react-router-dom';

// Eagerly loaded pages (critical path)
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import SetupWizard from '@/pages/SetupWizard';
import NotFound from '@/pages/NotFound';

// Lazy loaded pages
const Install = lazy(() => import('@/pages/Install'));
const Settings = lazy(() => import('@/pages/Settings'));
const ThemePreview = lazy(() => import('@/pages/ThemePreview'));
const Help = lazy(() => import('@/pages/Help'));
const Wiki = lazy(() => import('@/pages/Wiki'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminLibrary = lazy(() => import('@/pages/AdminLibrary'));
const AdminLogs = lazy(() => import('@/pages/AdminLogs'));
const AdminFeedback = lazy(() => import('@/pages/AdminFeedback'));
const SpotifyBrowser = lazy(() => import('@/pages/SpotifyBrowser'));
const SpotifyPlaylistPage = lazy(() => import('@/pages/SpotifyPlaylist'));
const SpotifySearchPage = lazy(() => import('@/pages/SpotifySearch'));
const SpotifyLibraryPage = lazy(() => import('@/pages/SpotifyLibrary'));
const YouTubeMusicBrowser = lazy(() => import('@/pages/YouTubeMusicBrowser'));
const YouTubeMusicLibraryPage = lazy(() => import('@/pages/YouTubeMusicLibrary'));
const YouTubeMusicSearchPage = lazy(() => import('@/pages/YouTubeMusicSearch'));
const YouTubeMusicPlaylistPage = lazy(() => import('@/pages/YouTubeMusicPlaylist'));
const SystemDiagnostics = lazy(() => import('@/pages/SystemDiagnostics'));
const ClientsMonitorDashboard = lazy(() => import('@/pages/ClientsMonitorDashboard'));
const WcagExceptions = lazy(() => import('@/pages/WcagExceptions'));
const A11yDashboard = lazy(() => import('@/pages/A11yDashboard'));
const LyricsTest = lazy(() => import('@/pages/LyricsTest'));
const BrandGuidelines = lazy(() => import('@/pages/BrandGuidelines'));
const ChangelogTimeline = lazy(() => import('@/pages/ChangelogTimeline'));
const ComponentsShowcase = lazy(() => import('@/pages/ComponentsShowcase'));
const InstallerMetrics = lazy(() => import('@/pages/InstallerMetrics'));
const GitHubDashboard = lazy(() => import('@/pages/GitHubDashboard'));
const JukeboxStatsDashboard = lazy(() => import('@/pages/JukeboxStatsDashboard'));
const VersionComparison = lazy(() => import('@/pages/VersionComparison'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LogoGitHubPreview = lazy(() => import('@/pages/LogoGitHubPreview'));
const HealthDashboard = lazy(() => import('@/pages/HealthDashboard'));
const SpicetifyThemeGallery = lazy(() => import('@/pages/SpicetifyThemeGallery'));
const JamSession = lazy(() => import('@/pages/JamSession'));
const KioskMonitorDashboard = lazy(() => import('@/pages/KioskMonitorDashboard'));

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  requiredPermission?: 'canAccessSettings' | 'canManageUsers' | 'canAccessSystemControls';
  children?: RouteConfig[];
}

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes: RouteConfig[] = [
  // Eagerly loaded
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/login', element: <Navigate to="/auth" replace /> },
  { path: '/setup', element: <SetupWizard /> },
  
  // Lazy loaded
  { path: '/install', element: <Install /> },
  { path: '/help', element: <Help /> },
  { path: '/wiki', element: <Wiki /> },
  { path: '/wcag-exceptions', element: <WcagExceptions /> },
  { path: '/a11y-dashboard', element: <A11yDashboard /> },
  { path: '/lyrics-test', element: <LyricsTest /> },
  { path: '/brand', element: <BrandGuidelines /> },
  { path: '/brand-guidelines', element: <BrandGuidelines /> },
  { path: '/changelog', element: <ChangelogTimeline /> },
  { path: '/showcase', element: <ComponentsShowcase /> },
  { path: '/installer-metrics', element: <InstallerMetrics /> },
  { path: '/version-comparison', element: <VersionComparison /> },
  { path: '/landing', element: <LandingPage /> },
  { path: '/logo-github', element: <LogoGitHubPreview /> },
  { path: '/jam/:code', element: <JamSession /> },
];

/**
 * Protected routes - require authentication and specific permissions
 */
export const protectedRoutes: RouteConfig[] = [
  { path: '/settings', element: <Settings />, requiredPermission: 'canAccessSettings' },
  { path: '/settings/diagnostics', element: <SystemDiagnostics />, requiredPermission: 'canAccessSettings' },
  { path: '/theme-preview', element: <ThemePreview />, requiredPermission: 'canAccessSettings' },
];

/**
 * Dashboard routes - monitoring and analytics
 */
export const dashboardRoutes: RouteConfig[] = [
  { path: '/dashboard', element: <Dashboard />, requiredPermission: 'canAccessSettings' },
  { path: '/github-dashboard', element: <GitHubDashboard />, requiredPermission: 'canAccessSettings' },
  { path: '/clients-monitor', element: <ClientsMonitorDashboard />, requiredPermission: 'canAccessSettings' },
  { path: '/stats', element: <JukeboxStatsDashboard />, requiredPermission: 'canAccessSettings' },
  { path: '/health', element: <HealthDashboard />, requiredPermission: 'canAccessSettings' },
  { path: '/spicetify-themes', element: <SpicetifyThemeGallery />, requiredPermission: 'canAccessSettings' },
  { path: '/kiosk-monitor', element: <KioskMonitorDashboard />, requiredPermission: 'canAccessSettings' },
];

/**
 * Spotify routes - Spotify integration
 */
export const spotifyRoutes: RouteConfig[] = [
  { path: '/spotify', element: <SpotifyBrowser /> },
  { path: '/spotify/playlist/:id', element: <SpotifyPlaylistPage /> },
  { path: '/spotify/search', element: <SpotifySearchPage /> },
  { path: '/spotify/library', element: <SpotifyLibraryPage /> },
];

/**
 * YouTube Music routes - YouTube Music integration
 */
export const youtubeRoutes: RouteConfig[] = [
  { path: '/youtube-music', element: <YouTubeMusicBrowser /> },
  { path: '/youtube-music/library', element: <YouTubeMusicLibraryPage /> },
  { path: '/youtube-music/search', element: <YouTubeMusicSearchPage /> },
  { path: '/youtube-music/playlist/:id', element: <YouTubeMusicPlaylistPage /> },
];

/**
 * Admin routes - administrative functions
 */
export const adminRoutes: RouteConfig[] = [
  { path: '/admin', element: <Admin />, requiredPermission: 'canAccessSettings' },
  { path: '/admin/library', element: <AdminLibrary />, requiredPermission: 'canAccessSettings' },
  { path: '/admin/logs', element: <AdminLogs />, requiredPermission: 'canAccessSettings' },
  { path: '/admin/feedback', element: <AdminFeedback />, requiredPermission: 'canAccessSettings' },
];

/**
 * Catch-all route for 404
 */
export const catchAllRoute: RouteConfig = {
  path: '*',
  element: <NotFound />,
};

/**
 * All routes combined
 */
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...dashboardRoutes,
  ...spotifyRoutes,
  ...youtubeRoutes,
  ...adminRoutes,
  catchAllRoute,
];

/**
 * Get routes that require protection
 */
export const getProtectedRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => route.requiredPermission);
};

/**
 * Get routes by category
 */
export const getRoutesByCategory = () => ({
  public: publicRoutes,
  protected: protectedRoutes,
  dashboards: dashboardRoutes,
  spotify: spotifyRoutes,
  youtube: youtubeRoutes,
  admin: adminRoutes,
});
