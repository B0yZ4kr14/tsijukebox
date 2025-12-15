import { Shuffle, Repeat, Repeat1, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  return (
    <div className="flex items-center gap-2">
      {/* Shuffle */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        animate={shuffle ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onShuffleToggle}
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-full transition-all duration-200 relative",
            shuffle
              ? "text-[#1DB954] hover:text-[#1DB954]/80 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 shadow-[0_0_12px_rgba(29,185,84,0.3)]"
              : "text-kiosk-text/50 hover:text-kiosk-text hover:bg-kiosk-surface/50"
          )}
          title={shuffle ? "Shuffle: Ligado" : "Shuffle: Desligado"}
        >
          <Shuffle className={cn("w-5 h-5", shuffle && "drop-shadow-[0_0_4px_rgba(29,185,84,0.5)]")} />
          {shuffle && (
            <motion.span
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Button>
      </motion.div>

      {/* Repeat */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        animate={repeat !== 'off' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onRepeatToggle}
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-full transition-all duration-200 relative",
            repeat !== 'off'
              ? "text-[#1DB954] hover:text-[#1DB954]/80 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 shadow-[0_0_12px_rgba(29,185,84,0.3)]"
              : "text-kiosk-text/50 hover:text-kiosk-text hover:bg-kiosk-surface/50"
          )}
          title={
            repeat === 'off' ? "Repeat: Desligado" :
            repeat === 'track' ? "Repeat: Faixa" : "Repeat: Contexto"
          }
        >
          {repeat === 'track' ? (
            <Repeat1 className={cn("w-5 h-5", "drop-shadow-[0_0_4px_rgba(29,185,84,0.5)]")} />
          ) : (
            <Repeat className={cn("w-5 h-5", repeat !== 'off' && "drop-shadow-[0_0_4px_rgba(29,185,84,0.5)]")} />
          )}
          {repeat !== 'off' && (
            <motion.span
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Button>
      </motion.div>

      {/* Queue */}
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onQueueOpen}
          disabled={disabled}
          className="w-10 h-10 rounded-full text-kiosk-text/50 hover:text-kiosk-text hover:bg-kiosk-surface/50 transition-all duration-200"
          title="Fila de reprodução"
        >
          <ListMusic className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
