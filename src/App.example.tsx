/**
 * App.tsx - Exemplo de Integração
 * 
 * Exemplo de como integrar o MainLayout com GlobalSidebar e Header
 * no arquivo principal da aplicação.
 * 
 * @example
 * @version 1.0.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { MainLayout } from '@/components/layout/MainLayout';

// Import your pages
import Dashboard from '@/pages/dashboards/Dashboard';
import Player from '@/pages/player/Player';
import Karaoke from '@/pages/karaoke/Karaoke';
import Library from '@/pages/library/Library';
import Settings from '@/pages/settings/Settings';
import Help from '@/pages/public/Help';
import About from '@/pages/public/About';
import DesignSystem from '@/pages/public/DesignSystem';

function App() {
  return (
    <BrowserRouter>
      <LayoutProvider>
        <Routes>
          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Player */}
            <Route path="/player" element={<Player />} />

            {/* Karaoke */}
            <Route path="/karaoke" element={<Karaoke />} />

            {/* Library */}
            <Route path="/library" element={<Library />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Documentation */}
            <Route path="/docs/installation" element={<div>Installation Docs</div>} />
            <Route path="/docs/tutorials" element={<div>Tutorials</div>} />
            <Route path="/docs/development" element={<div>Development Docs</div>} />
            <Route path="/docs/api" element={<div>API Docs</div>} />
            <Route path="/docs/security" element={<div>Security Docs</div>} />
            <Route path="/docs/monitoring" element={<div>Monitoring Docs</div>} />
            <Route path="/docs/testing" element={<div>Testing Docs</div>} />

            {/* Public Pages */}
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/design-system" element={<DesignSystem />} />

            {/* 404 */}
            <Route path="*" element={<div>404 - Página não encontrada</div>} />
          </Route>
        </Routes>
      </LayoutProvider>
    </BrowserRouter>
  );
}

export default App;

/**
 * INSTRUÇÕES DE USO:
 * 
 * 1. Renomeie este arquivo para App.tsx (substitua o existente)
 * 2. Certifique-se de que todos os imports estão corretos
 * 3. Adicione suas páginas personalizadas nas rotas
 * 4. O layout será aplicado automaticamente a todas as rotas dentro de <MainLayout />
 * 
 * ESTRUTURA:
 * 
 * App
 *  └─ BrowserRouter
 *      └─ LayoutProvider (gerenciamento de estado global)
 *          └─ Routes
 *              └─ MainLayout (sidebar + header + footer)
 *                  └─ Suas páginas aqui
 * 
 * GERENCIAMENTO DE ESTADO:
 * 
 * Use o hook useLayout() em qualquer componente para acessar/controlar o layout:
 * 
 * ```tsx
 * import { useLayout } from '@/contexts/LayoutContext';
 * 
 * function MyComponent() {
 *   const { sidebarCollapsed, toggleSidebar } = useLayout();
 *   
 *   return (
 *     <button onClick={toggleSidebar}>
 *       {sidebarCollapsed ? 'Expandir' : 'Recolher'} Sidebar
 *     </button>
 *   );
 * }
 * ```
 * 
 * NAVEGAÇÃO:
 * 
 * Use o hook useGlobalSidebar() para controle avançado de navegação:
 * 
 * ```tsx
 * import { useGlobalSidebar } from '@/hooks/useGlobalSidebar';
 * 
 * function MyComponent() {
 *   const { navigateTo, goBack, recentRoutes } = useGlobalSidebar();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => navigateTo('/dashboard')}>
 *         Ir para Dashboard
 *       </button>
 *       <button onClick={goBack}>
 *         Voltar
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
