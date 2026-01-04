// Hooks Pages templates (2 files)

export function generateHooksPagesContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/pages/index.ts':
      return `// Pages hooks barrel export
export { useIndexPage } from './useIndexPage';
`;

    case 'src/hooks/pages/useIndexPage.tsx':
      return `import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '@/contexts/SpotifyContext';
import { usePlayer } from '@/hooks/player/usePlayer';

type ViewMode = 'compact' | 'expanded' | 'fullscreen';

interface UseIndexPageOptions {
  defaultViewMode?: ViewMode;
  autoRefreshInterval?: number;
}

interface UseIndexPageReturn {
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  
  // Navigation
  navigateTo: (path: string) => void;
  goToSettings: () => void;
  goToLibrary: () => void;
  goToSearch: () => void;
  
  // Player state shortcuts
  isPlaying: boolean;
  currentTrack: any;
  togglePlayback: () => void;
  
  // Spotify state
  isSpotifyConnected: boolean;
  spotifyUser: any;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
}

export function useIndexPage(options: UseIndexPageOptions = {}): UseIndexPageReturn {
  const {
    defaultViewMode = 'compact',
    autoRefreshInterval,
  } = options;

  const navigate = useNavigate();
  const { isAuthenticated: isSpotifyConnected, user: spotifyUser } = useSpotify();
  const { 
    isPlaying, 
    currentTrack, 
    togglePlayPause: togglePlayback,
  } = usePlayer();

  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleViewMode = useCallback(() => {
    const modes: ViewMode[] = ['compact', 'expanded', 'fullscreen'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  }, [viewMode]);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const goToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const goToLibrary = useCallback(() => {
    navigate('/library');
  }, [navigate]);

  const goToSearch = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refresh data logic here
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const intervalId = setInterval(refresh, autoRefreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, refresh]);

  return {
    // View state
    viewMode,
    setViewMode,
    toggleViewMode,
    
    // Navigation
    navigateTo,
    goToSettings,
    goToLibrary,
    goToSearch,
    
    // Player state shortcuts
    isPlaying,
    currentTrack,
    togglePlayback,
    
    // Spotify state
    isSpotifyConnected,
    spotifyUser,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    refresh,
  };
}
`;

    default:
      return null;
  }
}
