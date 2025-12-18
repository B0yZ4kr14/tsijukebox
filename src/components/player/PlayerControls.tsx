import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  
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
      className="flex items-center justify-center gap-3 md:gap-4"
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
          aria-label={t('player.previousTrack')}
          className={cn(
            "w-11 h-11 md:w-12 md:h-12 rounded-full relative overflow-hidden",
            "button-control-extreme-3d",
            "text-kiosk-text hover:text-kiosk-primary",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={prevRipple.ripples} color="cyan" />
          <SkipBack className="w-5 h-5 md:w-5 md:h-5 drop-shadow-lg relative z-10" />
        </Button>
      </motion.div>

      {/* Play/Pause - Chrome Neon Design */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          disabled={isLoading}
          aria-label={isPlaying ? t('player.pause') : t('player.play')}
          className={cn(
            "w-16 h-16 md:w-18 md:h-18 rounded-full relative z-10 overflow-hidden",
            "button-play-chrome-neon",
            "transition-all duration-300"
          )}
        >
          <RippleContainer ripples={playRipple.ripples} color="primary" />
          <div className="relative z-10">
            {isPlaying ? (
              <Pause className="w-7 h-7 md:w-8 md:h-8 text-cyan-300 drop-shadow-[0_0_8px_hsl(185_100%_60%)]" />
            ) : (
              <Play className="w-7 h-7 md:w-8 md:h-8 ml-0.5 text-cyan-300 drop-shadow-[0_0_8px_hsl(185_100%_60%)]" />
            )}
          </div>
        </Button>
      </div>

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
          aria-label={t('player.nextTrack')}
          className={cn(
            "w-11 h-11 md:w-12 md:h-12 rounded-full relative overflow-hidden",
            "button-control-extreme-3d",
            "text-kiosk-text hover:text-kiosk-primary",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={nextRipple.ripples} color="cyan" />
          <SkipForward className="w-5 h-5 md:w-5 md:h-5 drop-shadow-lg relative z-10" />
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
          aria-label={t('player.stop')}
          className={cn(
            "w-9 h-9 rounded-full relative overflow-hidden",
            "button-stop-extreme-3d",
            "text-kiosk-text/50 hover:text-destructive",
            "transition-all duration-200"
          )}
        >
          <RippleContainer ripples={stopRipple.ripples} color="stop" />
          <Square className="w-4 h-4 drop-shadow-md relative z-10" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
