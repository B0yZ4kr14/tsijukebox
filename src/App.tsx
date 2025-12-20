import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useConnectionMonitor } from "@/hooks/system";
import { ContrastDebugPanel } from "@/components/debug/ContrastDebugPanel";
import { Music } from "lucide-react";

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
const JamSession = lazy(() => import("./pages/JamSession"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-kiosk-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center mx-auto animate-pulse">
          <Music className="w-8 h-8 text-kiosk-primary" />
        </div>
        <p className="text-kiosk-text/85 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

// Inner app component that uses hooks
function AppRoutes() {
  // Monitor backend connection and send push notifications
  useConnectionMonitor();

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          {/* Contrast Debug Panel - Only in DEV mode */}
          {import.meta.env.DEV && <ContrastDebugPanel />}
        </TooltipProvider>
      </UserProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;