import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { usePlayer } from '@/hooks/player';
import { useRipple, useSoundEffects, useTranslation } from '@/hooks/common';
import { RippleContainer } from '@/components/ui/RippleContainer';
import { useSettings } from '@/contexts/SettingsContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

/**
 * PlayerControls Component - TSiJUKEBOX
 * 
 * Controles principais do player de música.
 * Refatorado para usar os novos componentes Button com Design Tokens.
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 */

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
  const { hasPermission } = useUser();
  
  const canControl = hasPermission('canControlPlayback');
  
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
      {/* Previous Button - usando design tokens */}
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
          disabled={isLoading || !canControl}
          aria-label={t('player.previousTrack')}
          aria-disabled={!canControl}
          title={!canControl ? t('permissions.noPlaybackControl') : undefined}
          data-testid="player-prev"
          className={cn(
            "w-11 h-11 md:w-12 md:h-12 rounded-full relative overflow-hidden",
            // Usando design tokens via Tailwind
            "bg-bg-secondary/80 border-2 border-[#333333]",
            "hover:bg-bg-tertiary hover:border-accent-cyan/50 hover:shadow-glow-cyan",
            "text-text-primary hover:text-accent-cyan",
            "transition-all duration-normal",
            !canControl && "opacity-50 cursor-not-allowed"
          )}
        >
          <RippleContainer ripples={prevRipple.ripples} color="cyan" />
          <SkipBack className="w-5 h-5 md:w-5 md:h-5 drop-shadow-lg relative z-10" />
        </Button>
      </motion.div>

      {/* Play/Pause Button - Chrome Neon Design com design tokens */}
      <div className="relative">
        <Button
          variant="default"
          size="icon-lg"
          onClick={handlePlayPause}
          disabled={isLoading || !canControl}
          aria-label={isPlaying ? t('player.pause') : t('player.play')}
          aria-disabled={!canControl}
          title={!canControl ? t('permissions.noPlaybackControl') : undefined}
          data-testid="player-play-pause"
          className={cn(
            "w-16 h-16 md:w-18 md:h-18 rounded-full relative z-10 overflow-hidden",
            // Usando design tokens via Tailwind
            "bg-gradient-to-br from-accent-cyan to-accent-cyan/80",
            "border-2 border-accent-cyan/50",
            "shadow-glow-cyan hover:shadow-glow-cyan",
            "hover:scale-105 active:scale-95",
            "transition-all duration-normal",
            !canControl && "opacity-50 cursor-not-allowed"
          )}
        >
          <RippleContainer ripples={playRipple.ripples} color="primary" />
          <div className="relative z-10">
            {isPlaying ? (
              <Pause className="w-7 h-7 md:w-8 md:h-8 text-bg-primary drop-shadow-lg" />
            ) : (
              <Play className="w-7 h-7 md:w-8 md:h-8 ml-0.5 text-bg-primary drop-shadow-lg" />
            )}
          </div>
        </Button>
      </div>

      {/* Next Button - usando design tokens */}
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
          disabled={isLoading || !canControl}
          aria-label={t('player.nextTrack')}
          aria-disabled={!canControl}
          title={!canControl ? t('permissions.noPlaybackControl') : undefined}
          data-testid="player-next"
          className={cn(
            "w-11 h-11 md:w-12 md:h-12 rounded-full relative overflow-hidden",
            // Usando design tokens via Tailwind
            "bg-bg-secondary/80 border-2 border-[#333333]",
            "hover:bg-bg-tertiary hover:border-accent-cyan/50 hover:shadow-glow-cyan",
            "text-text-primary hover:text-accent-cyan",
            "transition-all duration-normal",
            !canControl && "opacity-50 cursor-not-allowed"
          )}
        >
          <RippleContainer ripples={nextRipple.ripples} color="cyan" />
          <SkipForward className="w-5 h-5 md:w-5 md:h-5 drop-shadow-lg relative z-10" />
        </Button>
      </motion.div>

      {/* Stop Button - usando design tokens */}
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleStop}
          disabled={isLoading || !canControl}
          aria-label={t('player.stop')}
          aria-disabled={!canControl}
          title={!canControl ? t('permissions.noPlaybackControl') : undefined}
          data-testid="player-stop"
          className={cn(
            "w-9 h-9 rounded-full relative overflow-hidden",
            // Usando design tokens via Tailwind
            "bg-bg-secondary/80 border-2 border-[#333333]",
            "hover:bg-state-error/20 hover:border-state-error/50",
            "text-text-tertiary hover:text-state-error",
            "transition-all duration-normal",
            !canControl && "opacity-50 cursor-not-allowed"
          )}
        >
          <RippleContainer ripples={stopRipple.ripples} color="stop" />
          <Square className="w-4 h-4 drop-shadow-md relative z-10" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
