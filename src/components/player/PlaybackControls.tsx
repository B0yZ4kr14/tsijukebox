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
  const repeatLabel = repeat === 'off' ? 'Desligado' : repeat === 'track' ? 'Faixa' : 'Playlist';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
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
                className={cn(
                  "w-12 h-12 rounded-full transition-all duration-300 relative",
                  shuffle
                    ? "text-[#1DB954] hover:text-[#1DB954]/80 bg-[#1DB954]/15 hover:bg-[#1DB954]/25 shadow-[0_0_20px_rgba(29,185,84,0.4)] border border-[#1DB954]/30"
                    : "text-kiosk-text/50 hover:text-kiosk-text hover:bg-kiosk-surface/50"
                )}
              >
                <Shuffle className={cn(
                  "w-5 h-5 transition-all duration-300",
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
            <p>Shuffle: {shuffle ? 'Ligado' : 'Desligado'}</p>
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
                className={cn(
                  "w-12 h-12 rounded-full transition-all duration-300 relative",
                  repeat !== 'off'
                    ? "text-[#1DB954] hover:text-[#1DB954]/80 bg-[#1DB954]/15 hover:bg-[#1DB954]/25 shadow-[0_0_20px_rgba(29,185,84,0.4)] border border-[#1DB954]/30"
                    : "text-kiosk-text/50 hover:text-kiosk-text hover:bg-kiosk-surface/50"
                )}
              >
                {repeat === 'track' ? (
                  <Repeat1 className="w-5 h-5 drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]" />
                ) : (
                  <Repeat className={cn(
                    "w-5 h-5 transition-all duration-300",
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
            <p>Repeat: {repeatLabel}</p>
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
                className="w-12 h-12 rounded-full text-kiosk-text/50 hover:text-kiosk-text hover:bg-kiosk-surface/50 transition-all duration-200"
              >
                <ListMusic className="w-5 h-5" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-slate-800 border-slate-700">
            <p>Fila de reprodução</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
