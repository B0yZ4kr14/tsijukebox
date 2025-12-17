import { useState, useMemo, useCallback } from 'react';
import { Play, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotifyPlaylist } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
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
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(141_70%_50%)] pointer-events-none z-50"
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

export function PlaylistCard({ playlist, onClick, onPlay, className }: PlaylistCardProps) {
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
        {playlist.imageUrl ? (
          <img
            src={playlist.imageUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-12 h-12 text-kiosk-text/30" />
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
        <h3 className="font-semibold text-kiosk-text truncate">{playlist.name}</h3>
        <p className="text-sm text-kiosk-text/60 truncate">
          {playlist.owner} • {playlist.tracksTotal} faixas
        </p>
      </div>
    </div>
  );
}
