// Routes templates - 1 arquivo
// Geração automática de conteúdo para src/routes/

const VERSION = '2.5.0';
const GENERATED_AT = new Date().toISOString();

export function generateRoutesContent(path: string): string | null {
  const fileName = path.split('/').pop();
  
  if (fileName === 'index.tsx') {
    return generateRoutesIndex();
  }
  
  return null;
}

function generateRoutesIndex(): string {
  return `// Application routes configuration
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Index'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const GitHubDashboard = lazy(() => import('@/pages/dashboards/GitHubDashboard'));
const A11yDashboard = lazy(() => import('@/pages/dashboards/A11yDashboard'));
const HealthDashboard = lazy(() => import('@/pages/dashboards/HealthDashboard'));
const KioskDashboard = lazy(() => import('@/pages/dashboards/KioskMonitorDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Route definitions
export const routes = [
  { path: '/', element: Home, label: 'Home' },
  { path: '/settings', element: Settings, label: 'Configurações' },
  { path: '/github-dashboard', element: GitHubDashboard, label: 'GitHub' },
  { path: '/a11y-dashboard', element: A11yDashboard, label: 'Acessibilidade' },
  { path: '/health-dashboard', element: HealthDashboard, label: 'Saúde' },
  { path: '/kiosk-dashboard', element: KioskDashboard, label: 'Kiosk' },
] as const;

// Main router component
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {routes.map(({ path, element: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404\" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
`;
}
