import { motion, AnimatePresence } from 'framer-motion';
import { Music, ThumbsUp, Trash2, Play } from 'lucide-react';
import { Button } from "@/components/ui/themed";
import { JamQueueItem } from '@/hooks/jam/useJamQueue';
import { cn } from '@/lib/utils';

interface JamQueueProps {
  queue: JamQueueItem[];
  isHost: boolean;
  currentParticipantId: string | null;
  onVote: (queueItemId: string) => void;
  onRemove: (queueItemId: string) => void;
  onPlay: (queueItem: JamQueueItem) => void;
  onAddTrack: () => void;
}

export function JamQueue({
  queue,
  isHost,
  currentParticipantId,
  onVote,
  onRemove,
  onPlay,
  onAddTrack,
}: JamQueueProps) {
  const formatDuration = (ms: number | null) => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Music className="w-4 h-4" />
          Fila ({queue.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTrack}
          className="gap-1"
        >
          <Music className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {queue.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors",
                "bg-background/50 hover:bg-background/80",
                index === 0 && "ring-1 ring-primary/30 bg-primary/5"
              )}
            >
              {/* Position */}
              <span className="w-6 text-center text-sm font-mono text-muted-foreground">
                {index + 1}
              </span>

              {/* Album Art */}
              {item.album_art ? (
                <img
                  src={item.album_art}
                  alt={item.track_name}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                  <Music className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">
                  {item.track_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.artist_name}
                </p>
                {item.added_by_nickname && (
                  <p className="text-xs text-muted-foreground">
                    Adicionado por <span className="text-primary">{item.added_by_nickname}</span>
                  </p>
                )}
              </div>

              {/* Duration */}
              <span className="text-xs text-muted-foreground">
                {formatDuration(item.duration_ms)}
              </span>

              {/* Vote Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(item.id)}
                className="gap-1 text-muted-foreground hover:text-primary"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{item.votes}</span>
              </Button>

              {/* Actions */}
              {(isHost || item.added_by === currentParticipantId) && (
                <div className="flex items-center gap-1">
                  {isHost && index === 0 && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onPlay(item)}
                      className="w-8 h-8 text-primary hover:text-primary" aria-label="Reproduzir">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive" aria-label="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {queue.length === 0 && (
          <div className="text-center py-8">
            <Music className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              A fila está vazia
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione músicas para começar
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
