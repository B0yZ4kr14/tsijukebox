import { motion, AnimatePresence } from 'framer-motion';
import { Crown, User } from 'lucide-react';
import { JamParticipant } from '@/hooks/jam/useJamParticipants';
import { cn } from '@/lib/utils';

interface JamParticipantsListProps {
  participants: JamParticipant[];
  currentParticipantId: string | null;
}

export function JamParticipantsList({ participants, currentParticipantId }: JamParticipantsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-4"
    >
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <User aria-hidden="true" className="w-4 h-4" />
        Participantes ({participants.length})
      </h3>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                participant.id === currentParticipantId 
                  ? "bg-primary/10 border border-primary/20" 
                  : "hover:bg-muted/50"
              )}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: participant.avatar_color }}
              >
                {participant.nickname.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground truncate">
                    {participant.nickname}
                  </span>
                  {participant.is_host && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  {participant.id === currentParticipantId && (
                    <span className="text-xs text-primary">(você)</span>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>
          ))}
        </AnimatePresence>

        {participants.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum participante ainda
          </p>
        )}
      </div>
    </motion.div>
  );
}
