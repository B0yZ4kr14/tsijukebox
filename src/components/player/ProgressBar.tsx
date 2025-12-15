import { motion } from 'framer-motion';
import type { MusicGenre } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  position: number;
  duration: number;
  genre?: MusicGenre;
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar({ position, duration, genre, className }: ProgressBarProps) {
  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const colorClass = genre ? genreColorClass[genre] : 'bg-kiosk-primary';

  return (
    <div className={cn("w-full max-w-md space-y-2", className)}>
      {/* Progress track */}
      <div className="relative h-1.5 bg-kiosk-surface rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        {/* Glow effect */}
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full blur-sm opacity-50",
            colorClass
          )}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-kiosk-text/60">
        <span>{formatTime(position)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
