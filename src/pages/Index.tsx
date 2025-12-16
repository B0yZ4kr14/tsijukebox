import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
import { useStatus } from '@/hooks/useStatus';
import { usePlayer } from '@/hooks/usePlayer';
import { useVolume } from '@/hooks/useVolume';
import { usePlaybackControls } from '@/hooks/usePlaybackControls';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { api } from '@/lib/api/client';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Wifi, WifiOff, Disc3, Music, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { data: status, isLoading, error, connectionType } = useStatus();
  const { play, pause, next, prev } = usePlayer();
  const { setVolume } = useVolume();
  const { canInstall, install } = usePWAInstall();
  const { isOnline, wasOffline } = useNetworkStatus();
  const { spotify } = useSettings();
  const { shuffle, repeat, queue, toggleShuffle, toggleRepeat, removeFromQueue, clearQueue } = usePlaybackControls();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showQueue, setShowQueue] = useState(false);

  // Show toast on network status change
  useEffect(() => {
    if (!isOnline) {
      toast.error('Conexão perdida', { icon: <WifiOff className="w-4 h-4" /> });
    } else if (wasOffline && isOnline) {
      toast.success('Conexão restaurada', { icon: <Wifi className="w-4 h-4" /> });
    }
  }, [isOnline, wasOffline]);

  const handleInstall = async () => {
    const installed = await install();
    if (installed) {
      toast.success('App instalado com sucesso!');
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
          toast('Pausado', { icon: '⏸️' });
        } else {
          play();
          toast('Reproduzindo', { icon: '▶️' });
        }
        break;
      case 'ArrowRight':
        next();
        showSwipeFeedback('left');
        toast('Próxima faixa', { icon: '⏭️' });
        break;
      case 'ArrowLeft':
        prev();
        showSwipeFeedback('right');
        toast('Faixa anterior', { icon: '⏮️' });
        break;
      case 'ArrowUp':
      case '+':
        const newVolUp = Math.min((status?.volume ?? 75) + 5, 100);
        setVolume(newVolUp);
        toast(`Volume: ${newVolUp}%`, { icon: '🔊' });
        break;
      case 'ArrowDown':
      case '-':
        const newVolDown = Math.max((status?.volume ?? 75) - 5, 0);
        setVolume(newVolDown);
        toast(`Volume: ${newVolDown}%`, { icon: '🔉' });
        break;
    }
  }, [status?.playing, status?.volume, play, pause, next, prev, setVolume]);

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
      toast('Próxima faixa', { icon: '⏭️' });
    },
    onSwipeRight: () => {
      prev();
      showSwipeFeedback('right');
      toast('Faixa anterior', { icon: '⏮️' });
    },
    threshold: 75,
  });

  if (isLoading && !status) {
    return (
      <KioskLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative mx-auto">
              <div className="w-24 h-24 rounded-full bg-kiosk-surface flex items-center justify-center">
                <Music className="w-12 h-12 text-kiosk-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-kiosk-text mb-2">TSi JUKEBOX</h1>
              <p className="text-kiosk-text/70">Conectando ao servidor...</p>
            </div>
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
            <h2 className="text-2xl font-bold text-kiosk-text">Erro de Conexão</h2>
            <p className="text-kiosk-text/70">
              Não foi possível conectar ao servidor em <br />
              <code className="text-kiosk-primary">{apiUrl}</code>
            </p>
            <p className="text-sm text-kiosk-text/50">
              {isDev 
                ? 'Acesse as Configurações para ativar o Modo Demo'
                : 'Verifique se o backend FastAPI está em execução.'
              }
            </p>
            <Link to="/settings">
              <Button className="mt-4 bg-kiosk-primary hover:bg-kiosk-primary/90">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
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

        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-kiosk-surface/30 backdrop-blur-sm border-b border-kiosk-text/10">
          {/* Left: System Info */}
          <div className="flex items-center gap-4">
            <SystemMonitor 
              cpu={status?.cpu ?? 0} 
              memory={status?.memory ?? 0} 
              temp={status?.temp ?? 0} 
            />
            
            <div className="w-px h-8 bg-kiosk-text/20" />
            
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

            <div className="w-px h-8 bg-kiosk-text/20" />

            {/* Spotify Button */}
            <Link to="/spotify">
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 rounded-full transition-colors ${
                  spotify.isConnected 
                    ? 'bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954]' 
                    : 'bg-kiosk-surface/30 hover:bg-kiosk-surface/50 text-kiosk-text/50 hover:text-kiosk-text'
                }`}
              >
                <Disc3 className="w-5 h-5" />
              </Button>
            </Link>

            {/* PWA Install Button */}
            {canInstall && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleInstall}
                className="w-10 h-10 rounded-full bg-kiosk-primary/20 hover:bg-kiosk-primary/30 text-kiosk-primary transition-colors"
              >
                <Download className="w-5 h-5" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-8 touch-pan-y">
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

          <PlayerControls isPlaying={status?.playing ?? false} />
          
          <VolumeSlider 
            volume={status?.volume ?? 75} 
            muted={status?.muted ?? false} 
          />

          {/* Swipe hint */}
          <p className="text-xs text-kiosk-text/30 mt-2">
            Deslize para mudar de faixa
          </p>
        </main>

        {/* Footer branding */}
        <footer className="pb-20 text-center">
          <p className="text-xs text-kiosk-text/30">
            TSi JUKEBOX Enterprise v4.0
          </p>
        </footer>

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
        />
      </div>
    </KioskLayout>
  );
}
