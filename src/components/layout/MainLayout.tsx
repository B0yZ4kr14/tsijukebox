/**
 * MainLayout Component
 * 
 * Layout principal da aplicação com GlobalSidebar e Header integrados.
 * Gerencia o estado global de navegação e responsividade.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSidebar } from '@/components/navigation/GlobalSidebar';
import { Header } from '@/components/navigation/Header';
import { useGlobalSidebar } from '@/hooks/useGlobalSidebar';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MainLayoutProps {
  children?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function MainLayout({ children }: MainLayoutProps) {
  const {
    collapsed,
    setCollapsed,
    toggleCollapsed,
  } = useGlobalSidebar();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [collapsed, setCollapsed]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [window.location.pathname]);

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleCollapsed();
    }
  };

  const handleBackdropClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalSidebar
          defaultCollapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>

      {/* Mobile Sidebar with Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={handleBackdropClick}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <GlobalSidebar defaultCollapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <Header onMenuClick={handleMenuClick} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="container mx-auto p-6"
          >
            {children || <Outlet />}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-bg-secondary/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>© 2024 TSiJUKEBOX v4.2.1</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">
                  Desenvolvido por{' '}
                  <span className="text-accent-cyan font-semibold">B0.y_Z4kr14</span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="/docs"
                  className="text-gray-400 hover:text-accent-cyan transition-colors"
                >
                  Documentação
                </a>
                <a
                  href="/help"
                  className="text-gray-400 hover:text-accent-cyan transition-colors"
                >
                  Ajuda
                </a>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-accent-cyan transition-colors"
                >
                  Sobre
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
