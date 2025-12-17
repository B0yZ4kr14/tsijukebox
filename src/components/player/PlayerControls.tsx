import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';
import { useSettings } from '@/contexts/SettingsContext';
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
  const { soundEnabled, animationsEnabled } = useSettings();
  
  // Ripples individuais para cada botão
  const prevRipple = useRipple();
  const playRipple = useRipple();
  const nextRipple = useRipple();
  const stopRipple = useRipple();
  
  const { playSound } = useSoundEffects();

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) prevRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    prev();
  };

  const handlePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) playRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    isPlaying ? pause() : play();
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) nextRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    next();
  };

  const handleStop = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) stopRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    stop();
  };

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
          onClick={handlePrev}
          disabled={isLoading}
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full relative overflow-hidden",
            "button-control-extreme-3d",
            "text-kiosk-text hover:text-kiosk-primary",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={prevRipple.ripples} color="cyan" />
          <SkipBack className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg relative z-10" />
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
        {isPlaying && animationsEnabled && (
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
          onClick={handlePlayPause}
          disabled={isLoading}
          className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full relative z-10 overflow-hidden",
            "bg-kiosk-primary hover:bg-kiosk-primary/90",
            "text-kiosk-bg hover:text-kiosk-bg",
            "button-play-ultra-3d",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={playRipple.ripples} color="primary" />
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative z-10"
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
          onClick={handleNext}
          disabled={isLoading}
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full relative overflow-hidden",
            "button-control-extreme-3d",
            "text-kiosk-text hover:text-kiosk-primary",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={nextRipple.ripples} color="cyan" />
          <SkipForward className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg relative z-10" />
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
          onClick={handleStop}
          disabled={isLoading}
          className={cn(
            "w-12 h-12 rounded-full relative overflow-hidden",
            "button-stop-extreme-3d",
            "text-kiosk-text/50 hover:text-destructive",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={stopRipple.ripples} color="stop" />
          <Square className="w-5 h-5 drop-shadow-md relative z-10" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
