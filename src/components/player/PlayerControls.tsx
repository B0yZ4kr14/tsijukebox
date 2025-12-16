import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { cn } from '@/lib/utils';

interface PlayerControlsProps {
  isPlaying: boolean;
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.08 },
  tap: { scale: 0.92 },
};

export function PlayerControls({ isPlaying }: PlayerControlsProps) {
  const { play, pause, next, prev, stop, isLoading } = usePlayer();

  return (
    <motion.div 
      className="flex items-center justify-center gap-4 md:gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Previous */}
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={prev}
          disabled={isLoading}
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full",
            "button-control-3d",
            "text-kiosk-text hover:text-kiosk-primary",
            "transition-all duration-200"
          )}
        >
          <SkipBack className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
        </Button>
      </motion.div>

      {/* Play/Pause */}
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        className="relative"
      >
        {/* Pulse effect when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full bg-kiosk-primary"
            animate={{
              scale: [1, 1.3],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={isPlaying ? pause : play}
          disabled={isLoading}
          className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full relative z-10",
            "bg-kiosk-primary hover:bg-kiosk-primary/90",
            "text-kiosk-bg hover:text-kiosk-bg",
            "button-primary-3d",
            "transition-all duration-200"
          )}
        >
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
            ) : (
              <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 drop-shadow-lg" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Next */}
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          disabled={isLoading}
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full",
            "button-control-3d",
            "text-kiosk-text hover:text-kiosk-primary",
            "transition-all duration-200"
          )}
        >
          <SkipForward className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
        </Button>
      </motion.div>

      {/* Stop */}
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          disabled={isLoading}
          className={cn(
            "w-12 h-12 rounded-full",
            "button-3d",
            "text-kiosk-text/50 hover:text-destructive",
            "transition-all duration-200"
          )}
        >
          <Square className="w-5 h-5 drop-shadow-md" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
