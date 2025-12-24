/**
 * ============================================================================
 * TSiJUKEBOX - CENTRALIZED ROUTE CONFIGURATION
 * ============================================================================
 * 
 * @file        src/routes/index.tsx
 * @description Configuração centralizada de todas as rotas da aplicação
 * @version     4.2.0
 * @date        2025-01-20
 * @author      B0.y_Z4kr14
 * 
 * ============================================================================
 * ARQUITETURA DE ROTAS
 * ============================================================================
 * 
 * O sistema de rotas está organizado em 6 categorias principais:
 * 
 * 1. PUBLIC ROUTES      - Acessíveis sem autenticação
 * 2. PROTECTED ROUTES   - Requerem autenticação + permissões
 * 3. DASHBOARD ROUTES   - Monitoramento e analytics
 * 4. SPOTIFY ROUTES     - Integração Spotify
 * 5. YOUTUBE ROUTES     - Integração YouTube Music
 * 6. ADMIN ROUTES       - Funções administrativas
 * 
 * ============================================================================
 * MANUTENÇÃO - COMO ADICIONAR NOVAS ROTAS
 * ============================================================================
 * 
 * PASSO 1: Criar o componente de página na subpasta apropriada
 *   - src/pages/public/ para páginas públicas
 *   - src/pages/admin/ para páginas administrativas
 *   - src/pages/dashboards/ para dashboards
 *   - src/pages/spotify/ para Spotify
 *   - src/pages/youtube/ para YouTube Music
 *   - src/pages/settings/ para configurações
 *   - src/pages/brand/ para identidade visual
 *   - src/pages/tools/ para ferramentas
 *   - src/pages/social/ para funcionalidades sociais
 * 
 * PASSO 2: Exportar no barrel export da subpasta (index.ts)
 * 
 * PASSO 3: Adicionar import lazy neste arquivo (se não for crítico)
 *   const NovaPage = lazy(() => import('@/pages/categoria/NovaPage'));
 * 
 * PASSO 4: Adicionar à categoria apropriada de rotas
 * 
 * PASSO 5: Definir permissão (se protegida)
 * 
 * PASSO 6: Atualizar docs/ROUTES.md e testes E2E
 * 
 * ============================================================================
 * ESTRUTURA DE ARQUIVOS (v4.2.0 - MIGRAÇÃO CONCLUÍDA)
 * ============================================================================
 * 
 * src/pages/
 * ├── public/           → Index, Auth, Help, Wiki, Install, LandingPage, etc.
 * ├── admin/            → Admin, AdminFeedback, AdminLibrary, AdminLogs
 * ├── dashboards/       → Dashboard, HealthDashboard, GitHubDashboard, etc.
 * ├── spotify/          → SpotifyBrowser, SpotifyLibrary, SpotifyPlaylist, etc.
 * ├── youtube/          → YouTubeMusicBrowser, YouTubeMusicLibrary, etc.
 * ├── settings/         → Settings, ThemePreview, SystemDiagnostics, etc.
 * ├── brand/            → BrandGuidelines, LogoGitHubPreview
 * ├── tools/            → ChangelogTimeline, ComponentsShowcase, etc.
 * ├── social/           → JamSession
 * └── index.ts          → Barrel export principal
 * 
 * ============================================================================
 * CHECKLIST DE MANUTENÇÃO
 * ============================================================================
 * 
 * [ ] Verificar se novo componente existe na subpasta correta
 * [ ] Adicionar export no barrel da subpasta
 * [ ] Adicionar import (eager ou lazy conforme necessidade)
 * [ ] Adicionar rota na categoria correta
 * [ ] Definir permissão se rota protegida
 * [ ] Atualizar docs/ROUTES.md
 * [ ] Adicionar teste em e2e/specs/routes-validation.spec.ts
 * [ ] Testar navegação manualmente
 * 
 * ============================================================================
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// ============================================================================
// IMPORTS - PÁGINAS CARREGADAS IMEDIATAMENTE (Critical Path)
// ============================================================================
// Estas páginas são carregadas imediatamente pois fazem parte do critical path
// da aplicação (primeira renderização, autenticação, etc.)

import Index from '@/pages/public/Index';
import Auth from '@/pages/public/Auth';
import SetupWizard from '@/pages/public/SetupWizard';
import NotFound from '@/pages/public/NotFound';

// ============================================================================
// IMPORTS - PÁGINAS COM LAZY LOADING
// ============================================================================
// Estas páginas são carregadas sob demanda para melhorar o tempo de
// carregamento inicial da aplicação

// --- Páginas Públicas ---
const Install = lazy(() => import('@/pages/public/Install'));
const Help = lazy(() => import('@/pages/public/Help'));
const Wiki = lazy(() => import('@/pages/public/Wiki'));
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));
const About = lazy(() => import('@/pages/public/About'));
const DesignSystem = lazy(() => import('@/pages/public/DesignSystem'));

// --- Páginas de Settings ---
const Settings = lazy(() => import('@/pages/settings/Settings'));
const ThemePreview = lazy(() => import('@/pages/settings/ThemePreview'));
const SystemDiagnostics = lazy(() => import('@/pages/settings/SystemDiagnostics'));

// --- Dashboards ---
const Dashboard = lazy(() => import('@/pages/dashboards/Dashboard'));
const GitHubDashboard = lazy(() => import('@/pages/dashboards/GitHubDashboard'));
const HealthDashboard = lazy(() => import('@/pages/dashboards/HealthDashboard'));
const JukeboxStatsDashboard = lazy(() => import('@/pages/dashboards/JukeboxStatsDashboard'));
const ClientsMonitorDashboard = lazy(() => import('@/pages/dashboards/ClientsMonitorDashboard'));
const KioskMonitorDashboard = lazy(() => import('@/pages/dashboards/KioskMonitorDashboard'));

// --- Spotify ---
const SpotifyBrowser = lazy(() => import('@/pages/spotify/SpotifyBrowser'));
const SpotifyPlaylistPage = lazy(() => import('@/pages/spotify/SpotifyPlaylist'));
const SpotifySearchPage = lazy(() => import('@/pages/spotify/SpotifySearch'));
const SpotifyLibraryPage = lazy(() => import('@/pages/spotify/SpotifyLibrary'));

// --- YouTube Music ---
const YouTubeMusicBrowser = lazy(() => import('@/pages/youtube/YouTubeMusicBrowser'));
const YouTubeMusicLibraryPage = lazy(() => import('@/pages/youtube/YouTubeMusicLibrary'));
const YouTubeMusicSearchPage = lazy(() => import('@/pages/youtube/YouTubeMusicSearch'));
const YouTubeMusicPlaylistPage = lazy(() => import('@/pages/youtube/YouTubeMusicPlaylist'));

// --- Admin ---
const Admin = lazy(() => import('@/pages/admin/Admin'));
const AdminLibrary = lazy(() => import('@/pages/admin/AdminLibrary'));
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'));
const AdminFeedback = lazy(() => import('@/pages/admin/AdminFeedback'));

// --- Brand & Tools ---
const BrandGuidelines = lazy(() => import('@/pages/brand/BrandGuidelines'));
const LogoGitHubPreview = lazy(() => import('@/pages/brand/LogoGitHubPreview'));
const ChangelogTimeline = lazy(() => import('@/pages/tools/ChangelogTimeline'));
const ComponentsShowcase = lazy(() => import('@/pages/tools/ComponentsShowcase'));
const VersionComparison = lazy(() => import('@/pages/tools/VersionComparison'));
const InstallerMetrics = lazy(() => import('@/pages/dashboards/InstallerMetrics'));
const ScreenshotService = lazy(() => import('@/pages/tools/ScreenshotService'));
const A11yDashboard = lazy(() => import('@/pages/dashboards/A11yDashboard'));
const WcagExceptions = lazy(() => import('@/pages/tools/WcagExceptions'));
const LyricsTest = lazy(() => import('@/pages/tools/LyricsTest'));

// --- Social ---
const JamSession = lazy(() => import('@/pages/social/JamSession'));

// --- Themes ---
const SpicetifyThemeGallery = lazy(() => import('@/pages/settings/SpicetifyThemeGallery'));

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuração de rota individual
 */
export interface RouteConfig {
  /** Caminho da URL */
  path: string;
  /** Elemento React a ser renderizado */
  element: React.ReactNode;
  /** Permissão necessária para acessar (opcional) */
  requiredPermission?: 'canAccessSettings' | 'canManageUsers' | 'canAccessSystemControls';
  /** Rotas filhas (opcional) */
  children?: RouteConfig[];
}

// ============================================================================
// ROTAS PÚBLICAS
// ============================================================================
/**
 * Rotas acessíveis sem autenticação
 * Qualquer visitante pode acessar essas páginas
 */
export const publicRoutes: RouteConfig[] = [
  // --- Páginas Principais (Eager Loading) ---
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/login', element: <Navigate to="/auth" replace /> },
  { path: '/setup', element: <SetupWizard /> },
  
  // --- Páginas Públicas (Lazy Loading) ---
  { path: '/install', element: <Install /> },
  { path: '/help', element: <Help /> },
  { path: '/wiki', element: <Wiki /> },
  { path: '/landing', element: <LandingPage /> },
  { path: '/about', element: <About /> },
  { path: '/design-system', element: <DesignSystem /> },
  
  // --- Acessibilidade ---
  { path: '/wcag-exceptions', element: <WcagExceptions /> },
  { path: '/a11y-dashboard', element: <A11yDashboard /> },
  { path: '/lyrics-test', element: <LyricsTest /> },
  
  // --- Brand & Tools ---
  { path: '/brand', element: <BrandGuidelines /> },
  { path: '/brand-guidelines', element: <BrandGuidelines /> },
  { path: '/changelog', element: <ChangelogTimeline /> },
  { path: '/showcase', element: <ComponentsShowcase /> },
  { path: '/installer-metrics', element: <InstallerMetrics /> },
  { path: '/version-comparison', element: <VersionComparison /> },
  { path: '/logo-github', element: <LogoGitHubPreview /> },
  { path: '/screenshot-service', element: <ScreenshotService /> },
  
  // --- Social ---
  { path: '/jam/:code', element: <JamSession /> },
];

// ============================================================================
// ROTAS PROTEGIDAS
// ============================================================================
/**
 * Rotas que requerem autenticação e permissões específicas
 */
export const protectedRoutes: RouteConfig[] = [
  { path: '/settings', element: <Settings />, requiredPermission: 'canAccessSettings' },
  { path: '/settings/diagnostics', element: <SystemDiagnostics />, requiredPermission: 'canAccessSettings' },
  { path: '/theme-preview', element: <ThemePreview />, requiredPermission: 'canAccessSettings' },
];

// ============================================================================
// ROTAS DE DASHBOARD
// ============================================================================
/**
 * Dashboards de monitoramento e analytics
 * Todas requerem permissão canAccessSettings
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

// ============================================================================
// ROTAS SPOTIFY
// ============================================================================
/**
 * Integração com Spotify
 * Públicas - não requerem autenticação do sistema (apenas Spotify Connect)
 */
export const spotifyRoutes: RouteConfig[] = [
  { path: '/spotify', element: <SpotifyBrowser /> },
  { path: '/spotify/playlist/:id', element: <SpotifyPlaylistPage /> },
  { path: '/spotify/search', element: <SpotifySearchPage /> },
  { path: '/spotify/library', element: <SpotifyLibraryPage /> },
];

// ============================================================================
// ROTAS YOUTUBE MUSIC
// ============================================================================
/**
 * Integração com YouTube Music
 * Públicas - não requerem autenticação do sistema
 */
export const youtubeRoutes: RouteConfig[] = [
  { path: '/youtube-music', element: <YouTubeMusicBrowser /> },
  { path: '/youtube-music/library', element: <YouTubeMusicLibraryPage /> },
  { path: '/youtube-music/search', element: <YouTubeMusicSearchPage /> },
  { path: '/youtube-music/playlist/:id', element: <YouTubeMusicPlaylistPage /> },
];

// ============================================================================
// ROTAS ADMIN
// ============================================================================
/**
 * Funções administrativas
 * Todas requerem permissão canAccessSettings
 */
export const adminRoutes: RouteConfig[] = [
  { path: '/admin', element: <Admin />, requiredPermission: 'canAccessSettings' },
  { path: '/admin/library', element: <AdminLibrary />, requiredPermission: 'canAccessSettings' },
  { path: '/admin/logs', element: <AdminLogs />, requiredPermission: 'canAccessSettings' },
  { path: '/admin/feedback', element: <AdminFeedback />, requiredPermission: 'canAccessSettings' },
];

// ============================================================================
// ROTA 404
// ============================================================================
/**
 * Catch-all para páginas não encontradas
 */
export const catchAllRoute: RouteConfig = {
  path: '*',
  element: <NotFound />,
};

// ============================================================================
// AGREGAÇÃO
// ============================================================================

/**
 * Todas as rotas combinadas em um único array
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
 * Rotas públicas (sem autenticação)
 */
export const unauthenticatedRoutes = [
  ...publicRoutes,
  ...spotifyRoutes,
  ...youtubeRoutes,
];

/**
 * Rotas que requerem autenticação
 */
export const authenticatedRoutes = [
  ...protectedRoutes,
  ...dashboardRoutes,
  ...adminRoutes,
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verifica se uma rota requer autenticação
 */
export const requiresAuth = (path: string): boolean => {
  return authenticatedRoutes.some(route => route.path === path);
};

/**
 * Obtém a permissão necessária para uma rota
 */
export const getRequiredPermission = (path: string): RouteConfig['requiredPermission'] | undefined => {
  const route = allRoutes.find(r => r.path === path);
  return route?.requiredPermission;
};

/**
 * Obtém todas as rotas de uma categoria
 */
export const getRoutesByCategory = (category: 'public' | 'protected' | 'dashboard' | 'spotify' | 'youtube' | 'admin'): RouteConfig[] => {
  switch (category) {
    case 'public': return publicRoutes;
    case 'protected': return protectedRoutes;
    case 'dashboard': return dashboardRoutes;
    case 'spotify': return spotifyRoutes;
    case 'youtube': return youtubeRoutes;
    case 'admin': return adminRoutes;
    default: return [];
  }
};
