import { useState, useMemo } from 'react';
import { Play, Disc3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotifyAlbum } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';

interface AlbumCardProps {
  album: SpotifyAlbum;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
}

// Partícula individual para efeito hover
const HoverParticle = ({ delay, x, color }: { delay: number; x: number; color: 'green' | 'cyan' | 'gold' }) => {
  const colorClasses = {
    green: 'bg-[#1DB954] shadow-[0_0_8px_#1DB954]',
    cyan: 'bg-cyan-400 shadow-[0_0_8px_hsl(185_100%_60%)]',
    gold: 'bg-amber-400 shadow-[0_0_8px_hsl(45_100%_60%)]',
  };

  return (
    <motion.div
      className={`absolute w-1.5 h-1.5 rounded-full ${colorClasses[color]} pointer-events-none z-10`}
      style={{ left: `${x}%`, bottom: '10%' }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: [0, -80, -120],
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0.5],
        x: [(Math.random() - 0.5) * 30],
      }}
      transition={{
        duration: 1.5 + Math.random(),
        delay,
        ease: 'easeOut',
      }}
    />
  );
};

export function AlbumCard({ album, onClick, onPlay, className }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { animationsEnabled, soundEnabled } = useSettings();
  const cardRipple = useRipple();
  const { playSound } = useSoundEffects();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (animationsEnabled) cardRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    onClick?.();
  };

  const hoverParticles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['green', 'cyan', 'gold'][i % 3] as 'green' | 'cyan' | 'gold',
    })),
  []);

  return (
    <div
      className={cn(
        "group relative bg-kiosk-surface/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-kiosk-surface hover:scale-[1.02] overflow-hidden card-shimmer-border",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ripple verde Spotify */}
      <RippleContainer ripples={cardRipple.ripples} color="spotify" />
      
      {/* Partículas flutuantes no hover */}
      <AnimatePresence>
        {isHovered && animationsEnabled && hoverParticles.map(p => (
          <HoverParticle key={p.id} x={p.x} delay={p.delay} color={p.color} />
        ))}
      </AnimatePresence>

      {/* Album Art */}
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-kiosk-surface">
        {album.imageUrl ? (
          <img
            src={album.imageUrl}
            alt={album.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="w-12 h-12 text-kiosk-text/30" />
          </div>
        )}
        
        {/* Play button overlay com glow pulsante */}
        <button
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110 group-hover:play-button-spotify-glow"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
        >
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-kiosk-text truncate">{album.name}</h3>
        <p className="text-sm text-kiosk-text/60 truncate">
          {album.releaseDate.split('-')[0]} • {album.artist}
        </p>
      </div>
    </div>
  );
}
