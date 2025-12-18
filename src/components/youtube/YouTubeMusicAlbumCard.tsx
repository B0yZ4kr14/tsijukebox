import { useState, useMemo, useCallback } from 'react';
import { Play, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { YouTubeMusicAlbum } from '@/lib/api/youtubeMusic';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';

interface YouTubeMusicAlbumCardProps {
  album: YouTubeMusicAlbum;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
  isPlaying?: boolean;
}

// Partícula individual para efeito hover
const HoverParticle = ({ delay, x, color }: { delay: number; x: number; color: 'red' | 'white' | 'pink' }) => {
  const colorClasses = {
    red: 'bg-[#FF0000] shadow-[0_0_8px_#FF0000]',
    white: 'bg-white shadow-[0_0_8px_white]',
    pink: 'bg-pink-400 shadow-[0_0_8px_hsl(330_100%_60%)]',
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

export function YouTubeMusicAlbumCard({ album, onClick, onPlay, className, isPlaying }: YouTubeMusicAlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { animationsEnabled, soundEnabled } = useSettings();
  const cardRipple = useRipple();
  const { playSound } = useSoundEffects();

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (animationsEnabled) {
      cardRipple.createRipple(e);
    }
    if (soundEnabled) playSound('click');
    onClick?.();
  }, [animationsEnabled, soundEnabled, cardRipple, playSound, onClick]);

  const hoverParticles = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['red', 'white', 'pink'][i % 3] as 'red' | 'white' | 'pink',
    })),
  []);

  return (
    <div
      className={cn(
        "group relative bg-kiosk-surface/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-kiosk-surface hover:scale-[1.02] overflow-hidden card-shimmer-border-red",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ripple vermelho YouTube */}
      <RippleContainer ripples={cardRipple.ripples} color="red" />
      
      {/* Partículas flutuantes no hover */}
      <AnimatePresence>
        {isHovered && animationsEnabled && hoverParticles.map(p => (
          <HoverParticle key={p.id} x={p.x} delay={p.delay} color={p.color} />
        ))}
      </AnimatePresence>

      {/* Album Art */}
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-kiosk-surface">
        {album.thumbnailUrl ? (
          <img
            src={album.thumbnailUrl}
            alt={album.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5">
            <Disc className="w-12 h-12 text-[#FF0000]/50" />
          </div>
        )}
        
        {/* Play button ou AudioVisualizer quando tocando */}
        {isPlaying ? (
          <div className="absolute inset-x-0 bottom-0 h-10 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent pb-2">
            <AudioVisualizer isPlaying={true} barCount={10} variant="compact" className="opacity-90" />
          </div>
        ) : (
          <button
            className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
          >
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-kiosk-text truncate">{album.title}</h3>
        <p className="text-sm text-kiosk-text/85 truncate">{album.artist}</p>
        <p className="text-xs text-kiosk-text/80">
          {album.year} • {album.trackCount} faixas
        </p>
      </div>
    </div>
  );
}
