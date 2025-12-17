import { Music } from 'lucide-react';
import type { TrackInfo } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface NowPlayingProps {
  track: TrackInfo | null;
  isPlaying: boolean;
}

export function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Album Cover - Static with 3D effects */}
      <div className="relative">
        {/* Outer glow - static */}
        <div 
          className={cn(
            "absolute -inset-4 rounded-xl blur-xl transition-opacity duration-500",
            isPlaying ? "bg-kiosk-primary/25 opacity-100" : "bg-kiosk-primary/10 opacity-50"
          )}
        />

        {/* Multiple shadow layers for depth */}
        <div className="absolute -inset-1 rounded-lg bg-black/50 blur-lg" />
        <div className="absolute -inset-2 rounded-lg bg-kiosk-primary/10 blur-xl" />

        {/* Main album cover - Reduced size, no animations */}
        <div 
          className={cn(
            "w-40 h-40 md:w-44 md:h-44 rounded-lg overflow-hidden relative z-10",
            "album-frame-extreme-3d"
          )}
        >
          {/* Solid dark background layers */}
          <div className="absolute inset-0 bg-[#050508]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] to-[#000000]" />
          
          {track?.cover ? (
            <img
              src={track.cover}
              alt={`${track.title} - ${track.artist}`}
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-kiosk-surface to-[#050508] flex items-center justify-center relative z-10">
              <Music className="w-12 h-12 text-kiosk-primary/40" />
            </div>
          )}

          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/50 via-transparent to-[#050508]/30 pointer-events-none z-20" />
          
          {/* Inner shadow for inset effect */}
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] pointer-events-none rounded-lg z-20" />
        </div>
      </div>

      {/* Track Info with new neon styles */}
      <div className="text-center space-y-1 max-w-sm mt-2">
        <h2 className="text-xl md:text-2xl text-title-white-neon font-bold">
          {track?.title || 'Nenhuma faixa'}
        </h2>
        
        <p className="text-base md:text-lg text-artist-neon-blue">
          {track?.artist || 'Aguardando...'}
        </p>
        
        {track?.album && (
          <p className="text-sm md:text-base text-album-neon">
            {track.album}
          </p>
        )}
      </div>
    </div>
  );
}
