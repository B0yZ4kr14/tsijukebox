import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useVolume } from '@/hooks/useVolume';
import { cn } from '@/lib/utils';

interface VolumeSliderProps {
  volume: number;
  muted: boolean;
}

export function VolumeSlider({ volume, muted }: VolumeSliderProps) {
  const { setVolume, toggleMute, isLoading } = useVolume();

  const getVolumeIcon = () => {
    if (muted || volume === 0) return VolumeX;
    if (volume < 33) return Volume;
    if (volume < 66) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="flex items-center gap-4 w-full max-w-md px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleMute(!muted)}
        disabled={isLoading}
        className={cn(
          "w-12 h-12 rounded-full shrink-0",
          "bg-kiosk-surface/30 hover:bg-kiosk-surface/50",
          "text-kiosk-text/70 hover:text-kiosk-text",
          muted && "text-destructive hover:text-destructive"
        )}
      >
        <VolumeIcon className="w-5 h-5" />
      </Button>

      <Slider
        value={[muted ? 0 : volume]}
        onValueChange={([value]) => setVolume(value)}
        max={100}
        step={1}
        disabled={isLoading}
        className="flex-1"
      />

      <span className="text-sm font-medium text-kiosk-text/70 w-12 text-right">
        {muted ? 0 : volume}%
      </span>
    </div>
  );
}
