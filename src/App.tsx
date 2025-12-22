import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useConnectionMonitor, useFileChangeDetector, useAutoSync } from "@/hooks/system";
import { ContrastDebugPanel } from "@/components/debug/ContrastDebugPanel";
import { ErrorBoundary, SuspenseBoundary } from "@/components/errors";
import { DevFileChangeMonitor } from "@/components/dev";

// Import route configurations
import {
  publicRoutes,
  protectedRoutes,
  dashboardRoutes,
  spotifyRoutes,
  youtubeRoutes,
  adminRoutes,
  catchAllRoute,
  type RouteConfig,
} from "@/routes";

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

/**
 * Render a single route configuration
 */
function renderRoute(route: RouteConfig) {
  if (route.requiredPermission) {
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ProtectedRoute requiredPermission={route.requiredPermission}>
            {route.element}
          </ProtectedRoute>
        }
      />
    );
  }
  return <Route key={route.path} path={route.path} element={route.element} />;
}

/**
 * Inner app component that uses hooks
 */
function AppRoutes() {
  // Monitor backend connection and send push notifications
  useConnectionMonitor();

  return (
    <SuspenseBoundary variant="music" message="Carregando...">
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(renderRoute)}
        
        {/* Protected Settings Routes */}
        {protectedRoutes.map(renderRoute)}
        
        {/* Dashboard Routes */}
        {dashboardRoutes.map(renderRoute)}
        
        {/* Spotify Routes */}
        {spotifyRoutes.map(renderRoute)}
        
        {/* YouTube Music Routes */}
        {youtubeRoutes.map(renderRoute)}
        
        {/* Admin Routes */}
        {adminRoutes.map(renderRoute)}
        
        {/* Catch-all */}
        {renderRoute(catchAllRoute)}
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
