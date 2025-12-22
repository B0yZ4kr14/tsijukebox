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
 * PASSO 1: Criar o componente de página
 *   - Criar arquivo em src/pages/ ou na subpasta apropriada
 *   - Seguir padrão de nomenclatura PascalCase
 * 
 * PASSO 2: Adicionar import lazy (se não for crítico)
 *   const NovaPage = lazy(() => import('@/pages/NovaPage'));
 * 
 * PASSO 3: Adicionar à categoria apropriada
 *   - publicRoutes: rotas acessíveis a todos
 *   - protectedRoutes: rotas que requerem login
 *   - dashboardRoutes: dashboards e monitores
 *   - spotifyRoutes: funcionalidades Spotify
 *   - youtubeRoutes: funcionalidades YouTube Music
 *   - adminRoutes: funções de administração
 * 
 * PASSO 4: Definir permissão (se protegida)
 *   - canAccessSettings: acesso a configurações
 *   - canManageUsers: gerenciamento de usuários
 *   - canAccessSystemControls: controles do sistema
 * 
 * PASSO 5: Atualizar documentação
 *   - Atualizar docs/ROUTES.md
 *   - Atualizar e2e/specs/routes-validation.spec.ts
 * 
 * ============================================================================
 * TODO: MIGRAÇÃO DE ARQUIVOS PARA SUBPASTAS
 * ============================================================================
 * 
 * Quando os arquivos forem movidos fisicamente para subpastas, atualize os
 * imports conforme o mapeamento abaixo:
 * 
 * ARQUIVOS ATUAIS             →  DESTINO FINAL
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/Index.tsx         →  src/pages/public/Index.tsx
 * src/pages/Auth.tsx          →  src/pages/public/Auth.tsx
 * src/pages/Help.tsx          →  src/pages/public/Help.tsx
 * src/pages/Wiki.tsx          →  src/pages/public/Wiki.tsx
 * src/pages/Install.tsx       →  src/pages/public/Install.tsx
 * src/pages/LandingPage.tsx   →  src/pages/public/LandingPage.tsx
 * src/pages/SetupWizard.tsx   →  src/pages/public/SetupWizard.tsx
 * src/pages/NotFound.tsx      →  src/pages/public/NotFound.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/Settings.tsx      →  src/pages/settings/Settings.tsx
 * src/pages/ThemePreview.tsx  →  src/pages/settings/ThemePreview.tsx
 * src/pages/SystemDiagnostics.tsx → src/pages/settings/SystemDiagnostics.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/Dashboard.tsx     →  src/pages/dashboards/Dashboard.tsx
 * src/pages/GitHubDashboard.tsx → src/pages/dashboards/GitHubDashboard.tsx
 * src/pages/HealthDashboard.tsx → src/pages/dashboards/HealthDashboard.tsx
 * src/pages/JukeboxStatsDashboard.tsx → src/pages/dashboards/JukeboxStatsDashboard.tsx
 * src/pages/ClientsMonitorDashboard.tsx → src/pages/dashboards/ClientsMonitorDashboard.tsx
 * src/pages/KioskMonitorDashboard.tsx → src/pages/dashboards/KioskMonitorDashboard.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/SpotifyBrowser.tsx → src/pages/spotify/SpotifyBrowser.tsx
 * src/pages/SpotifyPlaylist.tsx → src/pages/spotify/SpotifyPlaylist.tsx
 * src/pages/SpotifySearch.tsx → src/pages/spotify/SpotifySearch.tsx
 * src/pages/SpotifyLibrary.tsx → src/pages/spotify/SpotifyLibrary.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/YouTubeMusicBrowser.tsx → src/pages/youtube/YouTubeMusicBrowser.tsx
 * src/pages/YouTubeMusicLibrary.tsx → src/pages/youtube/YouTubeMusicLibrary.tsx
 * src/pages/YouTubeMusicSearch.tsx → src/pages/youtube/YouTubeMusicSearch.tsx
 * src/pages/YouTubeMusicPlaylist.tsx → src/pages/youtube/YouTubeMusicPlaylist.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/Admin.tsx         →  src/pages/admin/Admin.tsx
 * src/pages/AdminLibrary.tsx  →  src/pages/admin/AdminLibrary.tsx
 * src/pages/AdminLogs.tsx     →  src/pages/admin/AdminLogs.tsx
 * src/pages/AdminFeedback.tsx →  src/pages/admin/AdminFeedback.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/BrandGuidelines.tsx → src/pages/brand/BrandGuidelines.tsx
 * src/pages/LogoGitHubPreview.tsx → src/pages/brand/LogoGitHubPreview.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/ChangelogTimeline.tsx → src/pages/tools/ChangelogTimeline.tsx
 * src/pages/ComponentsShowcase.tsx → src/pages/tools/ComponentsShowcase.tsx
 * src/pages/VersionComparison.tsx → src/pages/tools/VersionComparison.tsx
 * src/pages/InstallerMetrics.tsx → src/pages/tools/InstallerMetrics.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/JamSession.tsx    →  src/pages/social/JamSession.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * src/pages/A11yDashboard.tsx →  src/pages/accessibility/A11yDashboard.tsx
 * src/pages/WcagExceptions.tsx → src/pages/accessibility/WcagExceptions.tsx
 * src/pages/LyricsTest.tsx    →  src/pages/accessibility/LyricsTest.tsx
 * 
 * ============================================================================
 * CHECKLIST DE MANUTENÇÃO
 * ============================================================================
 * 
 * [ ] Verificar se novo componente existe em src/pages/
 * [ ] Adicionar import (eager ou lazy conforme necessidade)
 * [ ] Adicionar rota na categoria correta
 * [ ] Definir permissão se rota protegida
 * [ ] Atualizar docs/ROUTES.md
 * [ ] Adicionar teste em e2e/specs/routes-validation.spec.ts
 * [ ] Testar navegação manualmente
 * [ ] Verificar redirecionamentos funcionam
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

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import SetupWizard from '@/pages/SetupWizard';
import NotFound from '@/pages/NotFound';

// ============================================================================
// IMPORTS - PÁGINAS COM LAZY LOADING
// ============================================================================
// Estas páginas são carregadas sob demanda para melhorar o tempo de
// carregamento inicial da aplicação

// --- Páginas Públicas ---
const Install = lazy(() => import('@/pages/Install'));
const Help = lazy(() => import('@/pages/Help'));
const Wiki = lazy(() => import('@/pages/Wiki'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));

// --- Páginas de Settings ---
const Settings = lazy(() => import('@/pages/Settings'));
const ThemePreview = lazy(() => import('@/pages/ThemePreview'));
const SystemDiagnostics = lazy(() => import('@/pages/SystemDiagnostics'));

// --- Dashboards ---
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const GitHubDashboard = lazy(() => import('@/pages/GitHubDashboard'));
const HealthDashboard = lazy(() => import('@/pages/HealthDashboard'));
const JukeboxStatsDashboard = lazy(() => import('@/pages/JukeboxStatsDashboard'));
const ClientsMonitorDashboard = lazy(() => import('@/pages/ClientsMonitorDashboard'));
const KioskMonitorDashboard = lazy(() => import('@/pages/KioskMonitorDashboard'));

// --- Spotify ---
const SpotifyBrowser = lazy(() => import('@/pages/SpotifyBrowser'));
const SpotifyPlaylistPage = lazy(() => import('@/pages/SpotifyPlaylist'));
const SpotifySearchPage = lazy(() => import('@/pages/SpotifySearch'));
const SpotifyLibraryPage = lazy(() => import('@/pages/SpotifyLibrary'));

// --- YouTube Music ---
const YouTubeMusicBrowser = lazy(() => import('@/pages/YouTubeMusicBrowser'));
const YouTubeMusicLibraryPage = lazy(() => import('@/pages/YouTubeMusicLibrary'));
const YouTubeMusicSearchPage = lazy(() => import('@/pages/YouTubeMusicSearch'));
const YouTubeMusicPlaylistPage = lazy(() => import('@/pages/YouTubeMusicPlaylist'));

// --- Admin ---
const Admin = lazy(() => import('@/pages/Admin'));
const AdminLibrary = lazy(() => import('@/pages/AdminLibrary'));
const AdminLogs = lazy(() => import('@/pages/AdminLogs'));
const AdminFeedback = lazy(() => import('@/pages/AdminFeedback'));

// --- Brand & Tools ---
const BrandGuidelines = lazy(() => import('@/pages/BrandGuidelines'));
const LogoGitHubPreview = lazy(() => import('@/pages/LogoGitHubPreview'));
const ChangelogTimeline = lazy(() => import('@/pages/ChangelogTimeline'));
const ComponentsShowcase = lazy(() => import('@/pages/ComponentsShowcase'));
const VersionComparison = lazy(() => import('@/pages/VersionComparison'));
const InstallerMetrics = lazy(() => import('@/pages/InstallerMetrics'));

// --- Accessibility ---
const A11yDashboard = lazy(() => import('@/pages/A11yDashboard'));
const WcagExceptions = lazy(() => import('@/pages/WcagExceptions'));
const LyricsTest = lazy(() => import('@/pages/LyricsTest'));

// --- Social ---
const JamSession = lazy(() => import('@/pages/JamSession'));

// --- Themes ---
const SpicetifyThemeGallery = lazy(() => import('@/pages/SpicetifyThemeGallery'));

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

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Retorna apenas rotas que requerem proteção/permissão
 */
export const getProtectedRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => route.requiredPermission);
};

/**
 * Retorna rotas organizadas por categoria
 */
export const getRoutesByCategory = () => ({
  public: publicRoutes,
  protected: protectedRoutes,
  dashboards: dashboardRoutes,
  spotify: spotifyRoutes,
  youtube: youtubeRoutes,
  admin: adminRoutes,
});

/**
 * Retorna total de rotas por categoria
 */
export const getRouteStats = () => ({
  public: publicRoutes.length,
  protected: protectedRoutes.length,
  dashboards: dashboardRoutes.length,
  spotify: spotifyRoutes.length,
  youtube: youtubeRoutes.length,
  admin: adminRoutes.length,
  total: allRoutes.length,
});
