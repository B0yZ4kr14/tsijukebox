import { useState, useMemo, useCallback } from 'react';
import { Play, Music, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { YouTubeMusicPlaylist } from '@/lib/api/youtubeMusic';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';

interface YouTubeMusicPlaylistCardProps {
  playlist: YouTubeMusicPlaylist;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
  isPlaying?: boolean;
}

// Confetti burst component
const ConfettiBurst = ({ isActive }: { isActive: boolean }) => {
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 30) * (Math.PI / 180),
      distance: 40 + Math.random() * 30,
    })),
  []);

  if (!isActive) return null;

  return (
    <>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-[#FF0000] pointer-events-none z-50"
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </>
  );
};

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

export function YouTubeMusicPlaylistCard({ playlist, onClick, onPlay, className, isPlaying }: YouTubeMusicPlaylistCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { animationsEnabled, soundEnabled } = useSettings();
  const cardRipple = useRipple();
  const { playSound } = useSoundEffects();

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (animationsEnabled) {
      cardRipple.createRipple(e);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 600);
    }
    if (soundEnabled) playSound('click');
    onClick?.();
  }, [animationsEnabled, soundEnabled, cardRipple, playSound, onClick]);

  const hoverParticles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['red', 'white', 'pink'][i % 3] as 'red' | 'white' | 'pink',
    })),
  []);

  const privacyIcon = playlist.privacy === 'PRIVATE' ? Lock : playlist.privacy === 'PUBLIC' ? Globe : null;

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
      
      {/* Confetti burst on click */}
      <ConfettiBurst isActive={showConfetti} />
      
      {/* Partículas flutuantes no hover */}
      <AnimatePresence>
        {isHovered && animationsEnabled && hoverParticles.map(p => (
          <HoverParticle key={p.id} x={p.x} delay={p.delay} color={p.color} />
        ))}
      </AnimatePresence>

      {/* Playlist Art */}
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-kiosk-surface">
        {playlist.thumbnailUrl ? (
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5">
            <Music className="w-12 h-12 text-[#FF0000]/50" />
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

        {/* Privacy badge */}
        {privacyIcon && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            {privacyIcon === Lock ? (
              <Lock className="w-3 h-3 text-white" />
            ) : (
              <Globe className="w-3 h-3 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-kiosk-text truncate">{playlist.title}</h3>
        <p className="text-sm text-kiosk-text/60 truncate">
          {playlist.trackCount} faixas
        </p>
      </div>
    </div>
  );
}
