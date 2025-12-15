import { Link } from 'react-router-dom';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { NowPlaying } from '@/components/player/NowPlaying';
import { PlayerControls } from '@/components/player/PlayerControls';
import { VolumeSlider } from '@/components/player/VolumeSlider';
import { SystemMonitor } from '@/components/player/SystemMonitor';
import { useStatus } from '@/hooks/useStatus';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';

export default function Index() {
  const { data: status, isLoading, error } = useStatus();

  if (isLoading && !status) {
    return (
      <KioskLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-kiosk-primary mx-auto" />
            <p className="text-kiosk-text/70">Conectando ao servidor...</p>
          </div>
        </div>
      </KioskLayout>
    );
  }

  if (error) {
    return (
      <KioskLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-kiosk-text">Erro de Conexão</h2>
            <p className="text-kiosk-text/70">
              Não foi possível conectar ao servidor. Verifique se o backend está em execução.
            </p>
          </div>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4">
          <SystemMonitor 
            cpu={status?.cpu ?? 0} 
            memory={status?.memory ?? 0} 
            temp={status?.temp ?? 0} 
          />
          
          <Link to="/login">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-kiosk-surface/30 hover:bg-kiosk-surface/50 text-kiosk-text/50 hover:text-kiosk-text"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 pb-8">
          <NowPlaying 
            track={status?.track ?? null} 
            isPlaying={status?.playing ?? false} 
          />
          
          <PlayerControls isPlaying={status?.playing ?? false} />
          
          <VolumeSlider 
            volume={status?.volume ?? 75} 
            muted={status?.muted ?? false} 
          />
        </main>
      </div>
    </KioskLayout>
  );
}
