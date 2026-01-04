/**
 * useGlobalSidebar Hook
 * 
 * Hook customizado para gerenciar o estado global do sidebar.
 * Persiste o estado no localStorage e fornece controles de navegação.
 * 
 * @hook
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================================
// Types
// ============================================================================

interface SidebarState {
  collapsed: boolean;
  activeSection: string | null;
  recentRoutes: string[];
}

interface UseGlobalSidebarReturn {
  collapsed: boolean;
  activeSection: string | null;
  recentRoutes: string[];
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setActiveSection: (section: string | null) => void;
  navigateTo: (path: string) => void;
  goBack: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'tsijukebox_sidebar_state';
const MAX_RECENT_ROUTES = 10;

const DEFAULT_STATE: SidebarState = {
  collapsed: false,
  activeSection: null,
  recentRoutes: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

function loadState(): SidebarState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('[useGlobalSidebar] Failed to load state:', error);
  }
  return DEFAULT_STATE;
}

function saveState(state: SidebarState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[useGlobalSidebar] Failed to save state:', error);
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useGlobalSidebar(): UseGlobalSidebarReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<SidebarState>(loadState);

  // Persist state to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Update recent routes when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    setState((prev) => {
      // Don't add if it's the same as the last route
      if (prev.recentRoutes[0] === currentPath) {
        return prev;
      }

      // Add to recent routes and limit size
      const newRecentRoutes = [
        currentPath,
        ...prev.recentRoutes.filter((route) => route !== currentPath),
      ].slice(0, MAX_RECENT_ROUTES);

      return {
        ...prev,
        recentRoutes: newRecentRoutes,
      };
    });
  }, [location.pathname]);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      collapsed: !prev.collapsed,
    }));
  }, []);

  // Set collapsed state
  const setCollapsed = useCallback((collapsed: boolean) => {
    setState((prev) => ({
      ...prev,
      collapsed,
    }));
  }, []);

  // Set active section
  const setActiveSection = useCallback((section: string | null) => {
    setState((prev) => ({
      ...prev,
      activeSection: section,
    }));
  }, []);

  // Navigate to path
  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  // Go back to previous route
  const goBack = useCallback(() => {
    if (state.recentRoutes.length > 1) {
      navigate(state.recentRoutes[1]);
    } else {
      navigate(-1);
    }
  }, [navigate, state.recentRoutes]);

  return {
    collapsed: state.collapsed,
    activeSection: state.activeSection,
    recentRoutes: state.recentRoutes,
    toggleCollapsed,
    setCollapsed,
    setActiveSection,
    navigateTo,
    goBack,
  };
}

export default useGlobalSidebar;
