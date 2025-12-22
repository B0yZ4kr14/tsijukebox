import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useConnectionMonitor, useFileChangeDetector, useAutoSync } from "@/hooks/system";
import { ContrastDebugPanel } from "@/components/debug/ContrastDebugPanel";
import { ErrorBoundary, SuspenseBoundary, PageBoundary } from "@/components/errors";
import { DevFileChangeMonitor } from "@/components/dev";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SetupWizard from "./pages/SetupWizard";
import NotFound from "./pages/NotFound";

// Lazy loaded pages (less frequently accessed)
const Install = lazy(() => import("./pages/Install"));
const Settings = lazy(() => import("./pages/Settings"));
const ThemePreview = lazy(() => import("./pages/ThemePreview"));
const Help = lazy(() => import("./pages/Help"));
const Wiki = lazy(() => import("./pages/Wiki"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLibrary = lazy(() => import("./pages/AdminLibrary"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback"));
const SpotifyBrowser = lazy(() => import("./pages/SpotifyBrowser"));
const SpotifyPlaylistPage = lazy(() => import("./pages/SpotifyPlaylist"));
const SpotifySearchPage = lazy(() => import("./pages/SpotifySearch"));
const SpotifyLibraryPage = lazy(() => import("./pages/SpotifyLibrary"));
const YouTubeMusicBrowser = lazy(() => import("./pages/YouTubeMusicBrowser"));
const YouTubeMusicLibraryPage = lazy(() => import("./pages/YouTubeMusicLibrary"));
const YouTubeMusicSearchPage = lazy(() => import("./pages/YouTubeMusicSearch"));
const YouTubeMusicPlaylistPage = lazy(() => import("./pages/YouTubeMusicPlaylist"));
const SystemDiagnostics = lazy(() => import("./pages/SystemDiagnostics"));
const ClientsMonitorDashboard = lazy(() => import("./pages/ClientsMonitorDashboard"));
const WcagExceptions = lazy(() => import("./pages/WcagExceptions"));
const A11yDashboard = lazy(() => import("./pages/A11yDashboard"));
const LyricsTest = lazy(() => import("./pages/LyricsTest"));
const BrandGuidelines = lazy(() => import("./pages/BrandGuidelines"));
const ChangelogTimeline = lazy(() => import("./pages/ChangelogTimeline"));
const ComponentsShowcase = lazy(() => import("./pages/ComponentsShowcase"));
const InstallerMetrics = lazy(() => import("./pages/InstallerMetrics"));
const GitHubDashboard = lazy(() => import("./pages/GitHubDashboard"));
const JukeboxStatsDashboard = lazy(() => import("./pages/JukeboxStatsDashboard"));
const VersionComparison = lazy(() => import("./pages/VersionComparison"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LogoGitHubPreview = lazy(() => import("./pages/LogoGitHubPreview"));
const HealthDashboard = lazy(() => import("./pages/HealthDashboard"));
const SpicetifyThemeGallery = lazy(() => import("./pages/SpicetifyThemeGallery"));
const JamSession = lazy(() => import("./pages/JamSession"));

// DEV-only file change monitor wrapper with hooks connected
function DevFileChangeMonitorWrapper() {
  const { 
    detectedFiles, 
    isDetecting, 
    startDetection,
    lastDetection 
  } = useFileChangeDetector();
  
  const { triggerSync, isSyncing, pendingCount } = useAutoSync();

  // Determine sync status based on state
  const syncStatus = isSyncing 
    ? 'syncing' 
    : pendingCount > 0 
      ? 'pending' 
      : 'idle';

  return (
    <DevFileChangeMonitor
      detectedFiles={detectedFiles}
      isDetecting={isDetecting}
      onStartDetection={startDetection}
      lastDetection={lastDetection}
      onSyncNow={triggerSync}
      isSyncing={isSyncing}
      syncStatus={syncStatus}
    />
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner app component that uses hooks
function AppRoutes() {
  // Monitor backend connection and send push notifications
  useConnectionMonitor();

  return (
    <SuspenseBoundary variant="music" message="Carregando...">
      <Routes>
        {/* Public Routes - Eagerly loaded */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/setup" element={<SetupWizard />} />
        
        {/* Public Routes - Lazy loaded */}
        <Route path="/install" element={<Install />} />
        <Route path="/help" element={<Help />} />
        <Route path="/wiki" element={<Wiki />} />
        <Route path="/wcag-exceptions" element={<WcagExceptions />} />
        <Route path="/a11y-dashboard" element={<A11yDashboard />} />
        <Route path="/lyrics-test" element={<LyricsTest />} />
        <Route path="/brand" element={<BrandGuidelines />} />
        <Route path="/brand-guidelines" element={<BrandGuidelines />} />
        <Route path="/changelog" element={<ChangelogTimeline />} />
        <Route path="/showcase" element={<ComponentsShowcase />} />
        <Route path="/installer-metrics" element={<InstallerMetrics />} />
        <Route path="/version-comparison" element={<VersionComparison />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/logo-github" element={<LogoGitHubPreview />} />
        <Route path="/jam/:code" element={<JamSession />} />
        
        {/* Protected Routes - Lazy loaded */}
        <Route path="/settings" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/settings/diagnostics" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <SystemDiagnostics />
          </ProtectedRoute>
        } />
        <Route path="/theme-preview" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <ThemePreview />
          </ProtectedRoute>
        } />
        
        {/* Dashboard Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/github-dashboard" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <GitHubDashboard />
          </ProtectedRoute>
        } />
        <Route path="/clients-monitor" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <ClientsMonitorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <JukeboxStatsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/health" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <HealthDashboard />
          </ProtectedRoute>
        } />
        <Route path="/spicetify-themes" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <SpicetifyThemeGallery />
          </ProtectedRoute>
        } />
        
        {/* Spotify Routes - Lazy loaded */}
        <Route path="/spotify" element={<SpotifyBrowser />} />
        <Route path="/spotify/playlist/:id" element={<SpotifyPlaylistPage />} />
        <Route path="/spotify/search" element={<SpotifySearchPage />} />
        <Route path="/spotify/library" element={<SpotifyLibraryPage />} />
        
        {/* YouTube Music Routes - Lazy loaded */}
        <Route path="/youtube-music" element={<YouTubeMusicBrowser />} />
        <Route path="/youtube-music/library" element={<YouTubeMusicLibraryPage />} />
        <Route path="/youtube-music/search" element={<YouTubeMusicSearchPage />} />
        <Route path="/youtube-music/playlist/:id" element={<YouTubeMusicPlaylistPage />} />
        
        {/* Protected Admin Routes - Lazy loaded */}
        <Route path="/admin" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/library" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <AdminLibrary />
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <AdminLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/feedback" element={
          <ProtectedRoute requiredPermission="canAccessSettings">
            <AdminFeedback />
          </ProtectedRoute>
        } />
        
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SuspenseBoundary>
  );
}

const App = () => (
  <ErrorBoundary showDetails={import.meta.env.DEV}>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            {/* DEV-only components */}
            {import.meta.env.DEV && <DevFileChangeMonitorWrapper />}
            {import.meta.env.DEV && <ContrastDebugPanel />}
          </TooltipProvider>
        </UserProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;