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
  'rock': 'shadow-[0_0_10px_hsl(var(--genre-rock)/0.5)]',
  'pop': 'shadow-[0_0_10px_hsl(var(--genre-pop)/0.5)]',
  'soul': 'shadow-[0_0_10px_hsl(var(--genre-soul)/0.5)]',
  'hip-hop': 'shadow-[0_0_10px_hsl(var(--genre-hip-hop)/0.5)]',
  'ballad': 'shadow-[0_0_10px_hsl(var(--genre-ballad)/0.5)]',
  'classic-rock': 'shadow-[0_0_10px_hsl(var(--genre-classic-rock)/0.5)]',
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
  const glowClass = genre ? genreGlowClass[genre] : 'shadow-[0_0_10px_hsl(var(--kiosk-primary)/0.5)]';

  const calculatePosition = useCallback((clientX: number) => {
    if (!progressRef.current || !duration) return null;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * duration;
  }, [duration]);

  const handleClick = (e: React.MouseEvent) => {
    if (!onSeek) return;
    const newPosition = calculatePosition(e.clientX);
    if (newPosition !== null) {
      onSeek(newPosition);
    }
  };

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
      {/* Progress track */}
      <div 
        ref={progressRef}
        className={cn(
          "relative h-2 bg-kiosk-surface rounded-full overflow-hidden group",
          isInteractive && "cursor-pointer hover:h-3 transition-all duration-200"
        )}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        {/* Progress fill with smooth animation */}
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", colorClass)}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: isDragging ? 0 : 0.5, 
            ease: 'linear' 
          }}
        />
        
        {/* Glow effect on progress */}
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full blur-sm opacity-60",
            colorClass
          )}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />

        {/* Progress head indicator */}
        {isInteractive && (
          <motion.div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              colorClass,
              glowClass
            )}
            style={{ left: `calc(${progress}% - 8px)` }}
            animate={{ scale: isDragging ? 1.2 : 1 }}
          />
        )}

        {/* Hover preview indicator */}
        {hoverPosition !== null && isInteractive && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white/50 rounded-full"
            style={{ left: `${(hoverPosition / duration) * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-kiosk-text/60">
        <span className="tabular-nums">{formatTime(position)}</span>
        {hoverPosition !== null && isInteractive && (
          <motion.span 
            className="text-kiosk-text/80 tabular-nums"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatTime(hoverPosition)}
          </motion.span>
        )}
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
