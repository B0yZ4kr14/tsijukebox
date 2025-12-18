import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useVolume } from '@/hooks/useVolume';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface VolumeSliderProps {
  volume: number;
  muted: boolean;
}

export function VolumeSlider({ volume, muted }: VolumeSliderProps) {
  const { setVolume, toggleMute, isLoading } = useVolume();
  const { t } = useTranslation();

  const getVolumeIcon = () => {
    if (muted || volume === 0) return VolumeX;
    if (volume < 33) return Volume;
    if (volume < 66) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <motion.div 
      className="flex items-center gap-3 w-full max-w-xs px-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleMute(!muted)}
          disabled={isLoading}
          aria-label={muted ? t('player.unmute') : t('player.mute')}
          className={cn(
            "w-11 h-11 rounded-full shrink-0",
            "button-control-3d",
            "text-kiosk-text/90 hover:text-kiosk-text",
            "transition-all duration-200",
            muted && "text-destructive hover:text-destructive"
          )}
        >
          <motion.div
            key={muted ? 'muted' : 'unmuted'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <VolumeIcon className="w-4 h-4 drop-shadow-md" />
          </motion.div>
        </Button>
      </motion.div>

      <div className="flex-1 relative">
        {/* 3D Track background */}
        <div className="absolute inset-0 rounded-full volume-track-3d" />
        
        {/* Volume level indicator */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-kiosk-primary/60 to-kiosk-primary rounded-full"
          animate={{ width: `${muted ? 0 : volume}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{ height: '100%' }}
        />
        
        <Slider
          value={[muted ? 0 : volume]}
          onValueChange={([value]) => setVolume(value)}
          max={100}
          step={1}
          disabled={isLoading}
          aria-label={t('player.volume')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={muted ? 0 : volume}
          className="relative z-10"
        />
      </div>

      <motion.span 
        className={cn(
          "text-xs font-bold text-kiosk-text/90 w-10 text-right tabular-nums",
          "badge-3d px-1.5 py-0.5 rounded-md"
        )}
        key={muted ? 0 : volume}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {muted ? 0 : volume}%
      </motion.span>
    </motion.div>
  );
}
