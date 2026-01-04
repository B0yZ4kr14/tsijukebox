import { Shuffle, Repeat, Repeat1, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks';

interface PlaybackControlsProps {
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onQueueOpen: () => void;
  disabled?: boolean;
}

export function PlaybackControls({
  shuffle,
  repeat,
  onShuffleToggle,
  onRepeatToggle,
  onQueueOpen,
  disabled,
}: PlaybackControlsProps) {
  const { t } = useTranslation();
  const repeatLabel = repeat === 'off' ? t('player.repeatOff') : repeat === 'track' ? t('player.repeatTrack') : t('player.repeatContext');

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Shuffle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileTap={{ scale: 0.9 }}
              animate={shuffle ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onShuffleToggle}
                disabled={disabled}
                aria-label={shuffle ? t('player.shuffleOn') : t('player.shuffleOff')}
                aria-pressed={shuffle}
                data-testid="playback-shuffle"
                className={cn(
                  "w-9 h-9 rounded-full transition-all duration-300 relative",
                  shuffle
                    ? "text-[#1DB954] hover:text-[#1DB954]/80 bg-[#1DB954]/15 hover:bg-[#1DB954]/25 shadow-[0_0_20px_rgba(29,185,84,0.4)] border border-[#1DB954]/30"
                    : "text-kiosk-text/85 hover:text-kiosk-text hover:bg-kiosk-surface/50"
                )}
              >
                <Shuffle className={cn(
                  "w-4 h-4 transition-all duration-300",
                  shuffle && "drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                )} />
                {shuffle && (
                  <motion.span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1DB954] shadow-[0_0_6px_rgba(29,185,84,0.8)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-slate-800 border-slate-700">
            <p>{shuffle ? t('player.shuffleOn') : t('player.shuffleOff')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Repeat */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileTap={{ scale: 0.9 }}
              animate={repeat !== 'off' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onRepeatToggle}
                disabled={disabled}
                aria-label={repeatLabel}
                aria-pressed={repeat !== 'off'}
                data-testid="playback-repeat"
                className={cn(
                  "w-9 h-9 rounded-full transition-all duration-300 relative",
                  repeat !== 'off'
                    ? "text-[#1DB954] hover:text-[#1DB954]/80 bg-[#1DB954]/15 hover:bg-[#1DB954]/25 shadow-[0_0_20px_rgba(29,185,84,0.4)] border border-[#1DB954]/30"
                    : "text-kiosk-text/85 hover:text-kiosk-text hover:bg-kiosk-surface/50"
                )}
              >
                {repeat === 'track' ? (
                  <Repeat1 className="w-4 h-4 drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]" />
                ) : (
                  <Repeat className={cn(
                    "w-4 h-4 transition-all duration-300",
                    repeat !== 'off' && "drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                  )} />
                )}
                {repeat !== 'off' && (
                  <>
                    <motion.span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1DB954] shadow-[0_0_6px_rgba(29,185,84,0.8)]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                    {/* Repeat mode badge */}
                    <motion.span
                      className="absolute -top-1 -right-1 text-[8px] font-bold bg-[#1DB954] text-white px-1 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {repeat === 'track' ? '1' : '∞'}
                    </motion.span>
                  </>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-slate-800 border-slate-700">
            <p>{repeatLabel}</p>
          </TooltipContent>
        </Tooltip>

        {/* Queue */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onQueueOpen}
                disabled={disabled}
                aria-label={t('player.openQueue')}
                data-testid="playback-queue"
                className="w-9 h-9 rounded-full text-kiosk-text/85 hover:text-kiosk-text hover:bg-kiosk-surface/50 transition-all duration-200"
              >
                <ListMusic className="w-4 h-4" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-slate-800 border-slate-700">
            <p>{t('player.openQueue')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
