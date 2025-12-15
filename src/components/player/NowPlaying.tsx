import { Disc3 } from 'lucide-react';
import type { TrackInfo } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface NowPlayingProps {
  track: TrackInfo | null;
  isPlaying: boolean;
}

export function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Album Cover */}
      <div className="relative">
        <div 
          className={cn(
            "w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden",
            "bg-kiosk-surface border-4 border-kiosk-surface",
            "shadow-2xl shadow-kiosk-primary/20",
            "flex items-center justify-center",
            isPlaying && "animate-spin-slow"
          )}
          style={{ animationDuration: '8s' }}
        >
          {track?.cover ? (
            <img
              src={track.cover}
              alt={`${track.title} - ${track.artist}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-kiosk-surface to-kiosk-bg flex items-center justify-center">
              <Disc3 className="w-32 h-32 text-kiosk-primary/50" />
            </div>
          )}
        </div>
        
        {/* Center hole effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-kiosk-bg border-4 border-kiosk-surface" />
        
        {/* Playing indicator glow */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-kiosk-primary/10 animate-pulse" />
        )}
      </div>

      {/* Track Info */}
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-kiosk-text truncate">
          {track?.title || 'Nenhuma faixa'}
        </h2>
        <p className="text-lg text-kiosk-text/70 truncate">
          {track?.artist || 'Aguardando...'}
        </p>
        {track?.album && (
          <p className="text-sm text-kiosk-text/50 truncate">
            {track.album}
          </p>
        )}
      </div>
    </div>
  );
}
