import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { MusicGenre } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  position: number;
  duration: number;
  genre?: MusicGenre;
  onSeek?: (positionSeconds: number) => void;
  className?: string;
}

const genreColorClass: Record<MusicGenre, string> = {
  'rock': 'bg-[hsl(var(--genre-rock))]',
  'pop': 'bg-[hsl(var(--genre-pop))]',
  'soul': 'bg-[hsl(var(--genre-soul))]',
  'hip-hop': 'bg-[hsl(var(--genre-hip-hop))]',
  'ballad': 'bg-[hsl(var(--genre-ballad))]',
  'classic-rock': 'bg-[hsl(var(--genre-classic-rock))]',
};

const genreGlowClass: Record<MusicGenre, string> = {
  'rock': 'shadow-[0_0_15px_hsl(var(--genre-rock)/0.6)]',
  'pop': 'shadow-[0_0_15px_hsl(var(--genre-pop)/0.6)]',
  'soul': 'shadow-[0_0_15px_hsl(var(--genre-soul)/0.6)]',
  'hip-hop': 'shadow-[0_0_15px_hsl(var(--genre-hip-hop)/0.6)]',
  'ballad': 'shadow-[0_0_15px_hsl(var(--genre-ballad)/0.6)]',
  'classic-rock': 'shadow-[0_0_15px_hsl(var(--genre-classic-rock)/0.6)]',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar({ position, duration, genre, onSeek, className }: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const colorClass = genre ? genreColorClass[genre] : 'bg-kiosk-primary';
  const glowClass = genre ? genreGlowClass[genre] : 'shadow-[0_0_15px_hsl(var(--kiosk-primary)/0.6)]';

  const calculatePosition = useCallback((clientX: number) => {
    if (!progressRef.current || !duration) return null;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * duration;
  }, [duration]);

  // Debounce para prevenir race condition em cliques rápidos
  const lastSeekRef = useRef<number>(0);
  const SEEK_DEBOUNCE_MS = 100;

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!onSeek) return;
    
    const now = Date.now();
    if (now - lastSeekRef.current < SEEK_DEBOUNCE_MS) return;
    lastSeekRef.current = now;
    
    const newPosition = calculatePosition(e.clientX);
    if (newPosition !== null) {
      onSeek(newPosition);
    }
  }, [onSeek, calculatePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!onSeek) return;
    const pos = calculatePosition(e.clientX);
    setHoverPosition(pos);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  const isInteractive = !!onSeek;

  return (
    <div className={cn("w-full max-w-md space-y-2", className)}>
      {/* Progress track with 3D inset */}
      <div 
        ref={progressRef}
        className={cn(
          "relative h-3 rounded-full overflow-hidden group",
          "progress-track-3d",
          isInteractive && "cursor-pointer hover:h-4 transition-all duration-200"
        )}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-testid="progress-bar"
      >
        {/* Background highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        {/* Progress fill with glow */}
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", colorClass, glowClass)}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: isDragging ? 0 : 0.5, 
            ease: 'linear' 
          }}
        />
        
        {/* Blur glow layer */}
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full blur-sm opacity-70",
            colorClass
          )}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />

        {/* Progress head indicator - 3D ball */}
        {isInteractive && (
          <motion.div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              colorClass,
              "slider-thumb-3d"
            )}
            style={{ left: `calc(${progress}% - 10px)` }}
            animate={{ scale: isDragging ? 1.3 : 1 }}
          />
        )}

        {/* Hover preview indicator */}
        {hoverPosition !== null && isInteractive && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-full"
            style={{ left: `${(hoverPosition / duration) * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>

      {/* Time display with 3D badges */}
      <div className="flex justify-between text-xs">
        <span className="tabular-nums text-kiosk-text/90 badge-3d px-2 py-0.5 rounded" data-testid="progress-current">{formatTime(position)}</span>
        {hoverPosition !== null && isInteractive && (
          <motion.span 
            className="text-kiosk-text/90 tabular-nums badge-3d px-2 py-0.5 rounded bg-kiosk-primary/20"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatTime(hoverPosition)}
          </motion.span>
        )}
        <span className="tabular-nums text-kiosk-text/90 badge-3d px-2 py-0.5 rounded" data-testid="progress-duration">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
