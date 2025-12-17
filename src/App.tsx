import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
        <p className="text-kiosk-text/60 text-sm">Carregando...</p>
      </div>
    </div>
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
                
                {/* Protected Routes - Lazy loaded */}
                <Route path="/settings" element={
                  <ProtectedRoute requiredPermission="canAccessSettings">
                    <Settings />
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
                
                {/* Spotify Routes - Lazy loaded */}
                <Route path="/spotify" element={<SpotifyBrowser />} />
                <Route path="/spotify/playlist/:id" element={<SpotifyPlaylistPage />} />
                <Route path="/spotify/search" element={<SpotifySearchPage />} />
                <Route path="/spotify/library" element={<SpotifyLibraryPage />} />
                
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
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;