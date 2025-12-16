import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { NowPlaying } from '@/components/player/NowPlaying';
import { PlayerControls } from '@/components/player/PlayerControls';
import { PlaybackControls } from '@/components/player/PlaybackControls';
import { QueuePanel } from '@/components/player/QueuePanel';
import { VolumeSlider } from '@/components/player/VolumeSlider';
import { SystemMonitor } from '@/components/player/SystemMonitor';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';
import { ConnectionIndicator } from '@/components/player/ConnectionIndicator';
import { ProgressBar } from '@/components/player/ProgressBar';
import { CommandDeck } from '@/components/player/CommandDeck';
import { UserBadge } from '@/components/player/UserBadge';
import { DigitalClock } from '@/components/player/DigitalClock';
import { WeatherWidget } from '@/components/player/WeatherWidget';
import { SpotifyPanel, SpotifyPanelToggle } from '@/components/spotify/SpotifyPanel';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { GuidedTour, useTourSteps, isTourComplete } from '@/components/tour/GuidedTour';
import { useStatus } from '@/hooks/useStatus';
import { usePlayer } from '@/hooks/usePlayer';
import { useVolume } from '@/hooks/useVolume';
import { usePlaybackControls } from '@/hooks/usePlaybackControls';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useTranslation } from '@/hooks/useTranslation';
import { useFirstAccess } from '@/hooks/useFirstAccess';
import { api } from '@/lib/api/client';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Wifi, WifiOff, Music, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
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

  const handleInstall = async () => {
    const installed = await install();
    if (installed) {
      toast.success(t('notifications.appInstalled'));
    }
  };

  const handleSeek = useCallback(async (positionSeconds: number) => {
    try {
      await api.seek(positionSeconds);
    } catch (error) {
      console.debug('Seek not available:', error);
    }
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
  }, [status?.playing, status?.volume, play, pause, next, prev, setVolume, t]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const showSwipeFeedback = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => setSwipeDirection(null), 300);
  };

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

  if (isLoading && !status) {
    return (
      <KioskLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <LogoBrand size="xl" showTagline animate />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Music className="w-8 h-8 text-kiosk-primary" />
                </motion.div>
              </div>
              <p className="text-kiosk-text/70">{t('notifications.connecting')}</p>
            </motion.div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  if (error) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://midiaserver.local/api';
    const isDev = import.meta.env.DEV;
    
    return (
      <KioskLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-kiosk-text">{t('notifications.connectionError')}</h2>
            <p className="text-kiosk-text/70">
              {t('notifications.backendNotRunning')} <br />
              <code className="text-kiosk-primary">{apiUrl}</code>
            </p>
            <p className="text-sm text-kiosk-text/50">
              {isDev 
                ? t('notifications.enableDemoMode')
                : t('notifications.backendNotRunning')
              }
            </p>
            <Link to="/settings">
              <Button className="mt-4 bg-kiosk-primary hover:bg-kiosk-primary/90">
                <Settings className="w-4 h-4 mr-2" />
                {t('settings.title')}
              </Button>
            </Link>
          </div>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div 
        className="h-screen flex flex-col relative"
        {...touchHandlers}
      >
        {/* Swipe Indicators */}
        {swipeDirection && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-200 ${
              swipeDirection === 'left' ? 'right-8' : 'left-8'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-kiosk-primary/20 flex items-center justify-center backdrop-blur-sm">
              {swipeDirection === 'left' ? (
                <ChevronRight className="w-10 h-10 text-kiosk-primary" />
              ) : (
                <ChevronLeft className="w-10 h-10 text-kiosk-primary" />
              )}
            </div>
          </div>
        )}

        {/* Header with 3D effect - Two Lines: Logo on top, Status bar below */}
        <header className="flex flex-col p-3 pt-2 header-3d backdrop-blur-sm">
          {/* LINE 1: Logo centered at absolute top */}
          <div className="w-full flex justify-center mb-2">
            <LogoBrand size="lg" variant="ultra" animate />
          </div>

          {/* LINE 2: Status bar */}
          <div className="flex items-center justify-between relative">
            {/* Left: System Info */}
            <div className="flex items-center gap-3">
              <SystemMonitor 
                cpu={status?.cpu ?? 0} 
                memory={status?.memory ?? 0} 
                temp={status?.temp ?? 0} 
              />
              
              <div className="w-px h-6 bg-kiosk-text/20" />
              
              {/* Weather Widget */}
              <WeatherWidget />
              
              <div className="w-px h-6 bg-kiosk-text/20" />
              
              <ConnectionIndicator 
                connectionType={isOnline ? (connectionType ?? 'polling') : 'disconnected'}
                isSpotifyActive={!!status?.playing && !!status?.track}
              />
            </div>

            {/* Center: Digital Clock */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <DigitalClock showDate={true} showSeconds={false} />
            </div>
            
            {/* Right: User & Actions */}
            <div className="flex items-center gap-3">
              <UserBadge />

              <div className="w-px h-6 bg-kiosk-text/20" />

              {/* Spotify Panel Toggle - Always visible */}
              <SpotifyPanelToggle 
                onClick={() => {
                  if (spotify.isConnected) {
                    setShowSpotifyPanel(!showSpotifyPanel);
                  } else {
                    navigate('/settings');
                    toast.info(t('spotify.configureInSettings'));
                  }
                }} 
                isOpen={showSpotifyPanel}
                isConnected={spotify.isConnected}
              />

              {/* PWA Install Button */}
              {canInstall && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleInstall}
                  className="w-10 h-10 rounded-full button-primary-3d bg-kiosk-primary/20 hover:bg-kiosk-primary/30 text-kiosk-primary transition-colors"
                >
                  <Download className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - increased padding to prevent CommandDeck overlap */}
        <main className="flex-1 flex flex-col items-center justify-center gap-3 px-4 pl-20 pb-48 touch-pan-y">
          <NowPlaying 
            track={status?.track ?? null} 
            isPlaying={status?.playing ?? false} 
          />

          {/* Audio Visualizer */}
          <div className="w-full max-w-md">
            <AudioVisualizer 
              isPlaying={status?.playing ?? false} 
              barCount={48}
              genre={status?.track?.genre}
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md px-4">
            <ProgressBar
              position={status?.track?.position ?? 0}
              duration={status?.track?.duration ?? 0}
              genre={status?.track?.genre}
              onSeek={handleSeek}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <PlaybackControls
              shuffle={shuffle}
              repeat={repeat}
              onShuffleToggle={toggleShuffle}
              onRepeatToggle={toggleRepeat}
              onQueueOpen={() => setShowQueue(true)}
            />
          </div>

          {/* Player Controls - clear separation from CommandDeck */}
          <div className="mb-28">
            <PlayerControls isPlaying={status?.playing ?? false} />
          </div>
          
          <VolumeSlider 
            volume={status?.volume ?? 75} 
            muted={status?.muted ?? false} 
          />

          {/* Swipe hint only - logo now at top */}
          <div className="text-center mt-2">
            <p className="text-xs text-kiosk-text/40">
              {t('player.swipeHint')}
            </p>
          </div>
        </main>

        {/* CommandDeck is now vertical on the left, no divider needed */}

        {/* Command Deck */}
        <CommandDeck />

        {/* Queue Panel */}
        <QueuePanel
          isOpen={showQueue}
          onClose={() => setShowQueue(false)}
          queue={queue}
          onPlayItem={(uri) => api.playSpotifyUri(uri)}
          onRemoveItem={removeFromQueue}
          onClearQueue={clearQueue}
          onReorderQueue={reorderQueue}
        />

        {/* Spotify Panel */}
        <SpotifyPanel
          isOpen={showSpotifyPanel}
          onClose={() => setShowSpotifyPanel(false)}
        />

        {/* Guided Tour for new users */}
        <GuidedTour
          steps={tourSteps}
          isOpen={showTour && !isFirstAccess}
          onClose={() => setShowTour(false)}
          onComplete={() => setShowTour(false)}
        />
      </div>
    </KioskLayout>
  );
}
