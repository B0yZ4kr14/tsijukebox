import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useJam } from '@/contexts/JamContext';
import { useJamReactions, REACTION_EMOJIS, ReactionEmoji } from '@/hooks/jam/useJamReactions';
import { cn } from '@/lib/utils';

interface JamReactionsProps {
  trackId?: string;
}

export function JamReactions({ trackId }: JamReactionsProps) {
  const { session, participantId, nickname } = useJam();
  const { reactions, reactionCounts, sendReaction, isOnCooldown } = useJamReactions(
    session?.id || null,
    participantId,
    nickname
  );

  const handleReaction = async (emoji: ReactionEmoji) => {
    await sendReaction(emoji, trackId);
  };

  return (
    <div className="relative">
      {/* Floating Reactions Animation Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-32 -top-32">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                opacity: 0, 
                y: 100, 
                x: `${reaction.position?.x || 50}%`,
                scale: 0.5 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: [100, 0, -20, -60],
                scale: [0.5, 1.2, 1, 0.8]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                duration: 2.5,
                ease: 'easeOut',
                times: [0, 0.2, 0.7, 1]
              }}
              className="absolute bottom-0 text-4xl"
              style={{ left: `${reaction.position?.x || 50}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="drop-shadow-lg">{reaction.emoji}</span>
                <span className="text-xs text-primary/80 font-medium bg-background/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {reaction.participant_nickname}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
      >
        <TooltipProvider delayDuration={300}>
          {REACTION_EMOJIS.map((emoji) => {
            const count = reactionCounts[emoji] || 0;
            const onCooldown = isOnCooldown[emoji];

            return (
              <Tooltip key={emoji}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(emoji)}
                    disabled={onCooldown}
                    className={cn(
                      'relative text-2xl h-12 w-12 rounded-full transition-all duration-200',
                      'hover:scale-110 hover:bg-primary/20',
                      'active:scale-95',
                      onCooldown && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <motion.span
                      whileTap={{ scale: 1.5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      {emoji}
                    </motion.span>
                    
                    {/* Count Badge */}
                    <AnimatePresence>
                      {count > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1"
                        >
                          {count > 99 ? '99+' : count}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-sm">
                  {getEmojiLabel(emoji)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </motion.div>
    </div>
  );
}

function getEmojiLabel(emoji: ReactionEmoji): string {
  const labels: Record<ReactionEmoji, string> = {
    '🔥': 'Fire! 🔥',
    '👏': 'Aplausos',
    '❤️': 'Amei',
    '😂': 'Haha',
    '🎵': 'Curtindo',
    '💯': 'Perfeito',
  };
  return labels[emoji];
}
