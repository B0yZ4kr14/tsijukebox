import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { cn } from '@/lib/utils';

interface PlayerControlsProps {
  isPlaying: boolean;
}

export function PlayerControls({ isPlaying }: PlayerControlsProps) {
  const { play, pause, next, prev, stop, isLoading } = usePlayer();

  return (
    <div className="flex items-center justify-center gap-4 md:gap-6">
      {/* Previous */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prev}
        disabled={isLoading}
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full",
          "bg-kiosk-surface/50 hover:bg-kiosk-surface",
          "text-kiosk-text hover:text-kiosk-primary",
          "transition-all duration-200 hover:scale-110"
        )}
      >
        <SkipBack className="w-6 h-6 md:w-7 md:h-7" />
      </Button>

      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        onClick={isPlaying ? pause : play}
        disabled={isLoading}
        className={cn(
          "w-20 h-20 md:w-24 md:h-24 rounded-full",
          "bg-kiosk-primary hover:bg-kiosk-primary/90",
          "text-kiosk-bg hover:text-kiosk-bg",
          "shadow-lg shadow-kiosk-primary/30",
          "transition-all duration-200 hover:scale-105"
        )}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 md:w-10 md:h-10" />
        ) : (
          <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />
        )}
      </Button>

      {/* Next */}
      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        disabled={isLoading}
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full",
          "bg-kiosk-surface/50 hover:bg-kiosk-surface",
          "text-kiosk-text hover:text-kiosk-primary",
          "transition-all duration-200 hover:scale-110"
        )}
      >
        <SkipForward className="w-6 h-6 md:w-7 md:h-7" />
      </Button>

      {/* Stop - smaller, secondary action */}
      <Button
        variant="ghost"
        size="icon"
        onClick={stop}
        disabled={isLoading}
        className={cn(
          "w-12 h-12 rounded-full",
          "bg-kiosk-surface/30 hover:bg-destructive/20",
          "text-kiosk-text/50 hover:text-destructive",
          "transition-all duration-200"
        )}
      >
        <Square className="w-5 h-5" />
      </Button>
    </div>
  );
}
