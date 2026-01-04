import { LogoBrand } from '@/components/ui/LogoBrand';
import { SystemMonitor } from '@/components/player/SystemMonitor';
import { WeatherWidget } from '@/components/player/WeatherWidget';
import { ConnectionIndicator } from '@/components/player/ConnectionIndicator';
import { DigitalClock } from '@/components/player/DigitalClock';
import { UserBadge } from '@/components/player/UserBadge';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';
import { SpotifyPanelToggle } from '@/components/spotify/SpotifyPanel';
import { LibraryPanelToggle } from '@/components/player/LibraryPanel';
import { SideInfoPanelToggle } from '@/components/player/SideInfoPanel';
import { NotificationsDropdown } from '@/components/ui/NotificationsDropdown';
import { Button } from "@/components/ui/themed";
import { Download, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SystemStatus } from '@/lib/api/types';
import type { ConnectionType } from '@/lib/constants/connectionTypes';

interface IndexHeaderProps {
  status: SystemStatus | undefined;
  connectionType: ConnectionType | undefined;
  isOnline: boolean;
  isSpotifyConnected: boolean;
  showSideInfoPanel: boolean;
  showSpotifyPanel: boolean;
  showLibraryPanel: boolean;
  canInstall: boolean;
  onSideInfoToggle: () => void;
  onSpotifyToggle: () => void;
  onLibraryToggle: () => void;
  onInstall: () => void;
}

export function IndexHeader({
  status,
  connectionType,
  isOnline,
  isSpotifyConnected,
  showSideInfoPanel,
  showSpotifyPanel,
  showLibraryPanel,
  canInstall,
  onSideInfoToggle,
  onSpotifyToggle,
  onLibraryToggle,
  onInstall,
}: IndexHeaderProps) {
  return (
    <header className="flex flex-col p-2 pt-1.5 header-3d backdrop-blur-sm">
      {/* LINE 1: Logo centered at absolute top - responsive size */}
      <div className="w-full flex justify-center mb-2">
        <div className="hidden sm:block">
          <LogoBrand size="lg" variant="metal" animate={false} />
        </div>
        <div className="block sm:hidden">
          <LogoBrand size="md" variant="metal" animate={false} />
        </div>
      </div>

      {/* LINE 2: Status bar with grid for perfect centering */}
      <div className="grid grid-cols-3 items-center w-full">
        {/* Left: System Info - responsive hiding */}
        <div className="flex items-center gap-3 justify-start min-w-0 overflow-hidden">
          <SystemMonitor 
            cpu={status?.cpu ?? 0} 
            memory={status?.memory ?? 0} 
            temp={status?.temp ?? 0} 
          />
          
          {/* WeatherWidget: hidden on xs, visible on sm+ */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-6 bg-kiosk-text/20" />
            <WeatherWidget />
          </div>
          
          {/* ConnectionIndicator: hidden on xs/sm, visible on md+ */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-px h-6 bg-kiosk-text/20" />
            <ConnectionIndicator 
              connectionType={isOnline ? (connectionType ?? 'polling') : 'disconnected'}
              isSpotifyActive={!!status?.playing && !!status?.track}
            />
          </div>
          
          {/* Mini visualizer: hidden on xs/sm/md, visible on lg+ */}
          {status?.playing && (
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-px h-6 bg-kiosk-text/20" />
              <AudioVisualizer 
                variant="compact" 
                isPlaying={true} 
                barCount={8}
                className="opacity-50 scale-75"
              />
            </div>
          )}
        </div>

        {/* Center: Digital Clock - truly centered via grid */}
        <div className="flex justify-center z-10 relative">
          <DigitalClock showDate={true} showSeconds={false} />
        </div>
        
        {/* Right: User & Actions - responsive hiding */}
        <div className="flex items-center gap-3 justify-end min-w-0 overflow-hidden">
          <UserBadge />

          {/* Notifications dropdown - visible on sm+ */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-6 bg-kiosk-text/20" />
            <NotificationsDropdown />
          </div>

          {/* Panel toggles: hidden on xs, visible on sm+ */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-6 bg-kiosk-text/20" />

            <SideInfoPanelToggle
              onClick={onSideInfoToggle}
              isOpen={showSideInfoPanel}
            />

            <SpotifyPanelToggle 
              onClick={onSpotifyToggle}
              isOpen={showSpotifyPanel}
              isConnected={isSpotifyConnected}
            />

            <LibraryPanelToggle 
              onClick={onLibraryToggle}
              isOpen={showLibraryPanel}
            />
          </div>

          {/* Brand button: hidden on xs/sm, visible on md+ */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="xs"
              asChild
              className="w-10 h-10 rounded-full hover:bg-kiosk-surface/50"
              aria-label="Brand Guidelines"
            >
              <Link to="/brand">
                <Palette className="w-5 h-5 icon-neon-blue" />
              </Link>
            </Button>
          </div>

          {/* Install button: always visible (important action) */}
          {canInstall && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onInstall}
              className="w-10 h-10 rounded-full button-primary-3d bg-kiosk-primary/20 hover:bg-kiosk-primary/30 text-kiosk-primary transition-colors" aria-label="Baixar">
              <Download aria-hidden="true" className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
