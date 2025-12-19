import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus, useNetworkStatus } from '@/hooks/system';
import { usePlayer, useVolume, usePlaybackControls } from '@/hooks/player';
import { 
  useTouchGestures, 
  useTranslation, 
  useFirstAccess, 
  usePWAInstall 
} from '@/hooks/common';
import { useSettings } from '@/contexts/SettingsContext';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { WifiOff, Wifi } from 'lucide-react';
import { isTourComplete, useTourSteps } from '@/components/tour/GuidedTour';

export function useIndexPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isFirstAccess } = useFirstAccess();
  const { data: status, isLoading, error, connectionType } = useStatus();
  const { play, pause, next, prev } = usePlayer();
  const { setVolume } = useVolume();
  const { canInstall, install } = usePWAInstall();
  const { isOnline, wasOffline } = useNetworkStatus();
  const { spotify } = useSettings();
  const { shuffle, repeat, queue, toggleShuffle, toggleRepeat, removeFromQueue, clearQueue, reorderQueue } = usePlaybackControls();
  
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const [showSpotifyPanel, setShowSpotifyPanel] = useState(false);
  const [showLibraryPanel, setShowLibraryPanel] = useState(false);
  const [showSideInfoPanel, setShowSideInfoPanel] = useState(false);
  const [showTour, setShowTour] = useState(() => !isTourComplete());
  const tourSteps = useTourSteps();

  // Redirect to setup wizard on first access
  useEffect(() => {
    if (isFirstAccess) {
      navigate('/setup', { replace: true });
    }
  }, [isFirstAccess, navigate]);

  // Show toast on network status change
  useEffect(() => {
    if (!isOnline) {
      toast.error(t('notifications.connectionLost'), { icon: <WifiOff className="w-4 h-4" /> });
    } else if (wasOffline && isOnline) {
      toast.success(t('notifications.connectionRestored'), { icon: <Wifi className="w-4 h-4" /> });
    }
  }, [isOnline, wasOffline, t]);

  const handleInstall = useCallback(async () => {
    const installed = await install();
    if (installed) {
      toast.success(t('notifications.appInstalled'));
    }
  }, [install, t]);

  const handleSeek = useCallback(async (positionSeconds: number) => {
    try {
      await api.seek(positionSeconds);
    } catch (error) {
      console.debug('Seek not available:', error);
    }
  }, []);

  const showSwipeFeedback = useCallback((direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => setSwipeDirection(null), 300);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const handledKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-'];
    if (handledKeys.includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case ' ':
        if (status?.playing) {
          pause();
          toast(t('player.paused'), { icon: '⏸️' });
        } else {
          play();
          toast(t('player.playing'), { icon: '▶️' });
        }
        break;
      case 'ArrowRight':
        next();
        showSwipeFeedback('left');
        toast(t('player.nextTrack'), { icon: '⏭️' });
        break;
      case 'ArrowLeft':
        prev();
        showSwipeFeedback('right');
        toast(t('player.prevTrack'), { icon: '⏮️' });
        break;
      case 'ArrowUp':
      case '+':
        const newVolUp = Math.min((status?.volume ?? 75) + 5, 100);
        setVolume(newVolUp);
        toast(`${t('player.volume')}: ${newVolUp}%`, { icon: '🔊' });
        break;
      case 'ArrowDown':
      case '-':
        const newVolDown = Math.max((status?.volume ?? 75) - 5, 0);
        setVolume(newVolDown);
        toast(`${t('player.volume')}: ${newVolDown}%`, { icon: '🔉' });
        break;
    }
  }, [status?.playing, status?.volume, play, pause, next, prev, setVolume, t, showSwipeFeedback]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const touchHandlers = useTouchGestures({
    onSwipeLeft: () => {
      next();
      showSwipeFeedback('left');
      toast(t('player.nextTrack'), { icon: '⏭️' });
    },
    onSwipeRight: () => {
      prev();
      showSwipeFeedback('right');
      toast(t('player.prevTrack'), { icon: '⏮️' });
    },
    threshold: 75,
  });

  const handleSpotifyToggle = useCallback(() => {
    if (spotify.isConnected) {
      setShowSpotifyPanel(!showSpotifyPanel);
    } else {
      navigate('/settings');
      toast.info(t('spotify.configureInSettings'));
    }
  }, [spotify.isConnected, showSpotifyPanel, navigate, t]);

  const handlePlayQueueItem = useCallback((uri: string) => {
    api.playSpotifyUri(uri);
  }, []);

  return {
    // State
    status,
    isLoading,
    error,
    connectionType,
    swipeDirection,
    showQueue,
    showSpotifyPanel,
    showLibraryPanel,
    showSideInfoPanel,
    showTour,
    tourSteps,
    isOnline,
    isFirstAccess,
    spotify,
    shuffle,
    repeat,
    queue,
    canInstall,
    
    // Setters
    setShowQueue,
    setShowSpotifyPanel,
    setShowLibraryPanel,
    setShowSideInfoPanel,
    setShowTour,
    
    // Handlers
    handleInstall,
    handleSeek,
    handleSpotifyToggle,
    handlePlayQueueItem,
    toggleShuffle,
    toggleRepeat,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    touchHandlers,
    
    // Utils
    t,
    navigate,
  };
}
