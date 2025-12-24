/**
 * LayoutContext
 * 
 * Context Provider para gerenciamento global de estado do layout.
 * Gerencia sidebar, header, notificações e preferências de UI.
 * 
 * @context
 * @version 1.0.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface LayoutState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  headerVisible: boolean;
  footerVisible: boolean;
  theme: 'dark' | 'light';
}

interface LayoutContextValue extends LayoutState {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setHeaderVisible: (visible: boolean) => void;
  setFooterVisible: (visible: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

// ============================================================================
// Context
// ============================================================================

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [state, setState] = useState<LayoutState>(() => {
    // Load from localStorage
    const stored = localStorage.getItem('tsijukebox_layout_state');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('[LayoutContext] Failed to parse stored state:', error);
      }
    }

    // Default state
    return {
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      headerVisible: true,
      footerVisible: true,
      theme: 'dark',
    };
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tsijukebox_layout_state', JSON.stringify(state));
    } catch (error) {
      console.error('[LayoutContext] Failed to save state:', error);
    }
  }, [state]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  // Context value
  const value: LayoutContextValue = {
    ...state,
    setSidebarCollapsed: (collapsed: boolean) => {
      setState((prev) => ({ ...prev, sidebarCollapsed: collapsed }));
    },
    toggleSidebar: () => {
      setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
    },
    setMobileMenuOpen: (open: boolean) => {
      setState((prev) => ({ ...prev, mobileMenuOpen: open }));
    },
    toggleMobileMenu: () => {
      setState((prev) => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
    },
    setHeaderVisible: (visible: boolean) => {
      setState((prev) => ({ ...prev, headerVisible: visible }));
    },
    setFooterVisible: (visible: boolean) => {
      setState((prev) => ({ ...prev, footerVisible: visible }));
    },
    setTheme: (theme: 'dark' | 'light') => {
      setState((prev) => ({ ...prev, theme }));
    },
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export default LayoutContext;
