import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { CurrentTrack, PlaybackState } from '@/hooks/jam/useJamSession';
import { cn } from '@/lib/utils';
import { Button, Slider } from "@/components/ui/themed"

interface JamPlayerProps {
  currentTrack: CurrentTrack | null;
  playbackState: PlaybackState;
  isHost: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkip: () => void;
  onSeek: (positionMs: number) => void;
}

export function JamPlayer({
  currentTrack,
  playbackState,
  isHost,
  onPlay,
  onPause,
  onSkip,
  onSeek,
}: JamPlayerProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentTrack?.duration_ms
    ? (playbackState.position_ms / currentTrack.duration_ms) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6"
    >
      {currentTrack ? (
        <div className="space-y-4">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            {currentTrack.album_art ? (
              <img
                src={currentTrack.album_art}
                alt={currentTrack.track_name}
                className="w-20 h-20 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <Volume2 aria-hidden="true" className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground truncate">
                {currentTrack.track_name}
              </h3>
              <p className="text-muted-foreground truncate">
                {currentTrack.artist_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {playbackState.is_playing ? (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Tocando agora
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Pausado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              disabled={!isHost}
              onValueChange={([value]) => {
                if (currentTrack?.duration_ms) {
                  onSeek((value / 100) * currentTrack.duration_ms);
                }
              }}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(playbackState.position_ms)}</span>
              <span>{formatTime(currentTrack.duration_ms)}</span>
            </div>
          </div>

          {/* Controls */}
          {isHost && (
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={playbackState.is_playing ? onPause : onPlay}
                className="w-14 h-14 rounded-full button-jam-silver-neon"
              >
                {playbackState.is_playing ? (
                  <Pause className="w-6 h-6 text-zinc-300" />
                ) : (
                  <Play className="w-6 h-6 text-zinc-300 ml-1" />
                )}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={onSkip}
                className="rounded-full" aria-label="Próxima música">
                <SkipForward aria-hidden="true" className="w-5 h-5" />
              </Button>
            </div>
          )}

          {!isHost && (
            <p className="text-center text-sm text-muted-foreground">
              Apenas o host pode controlar a reprodução
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Volume2 aria-hidden="true" className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Nenhuma música tocando</h3>
          <p className="text-sm text-muted-foreground">
            Adicione músicas à fila para começar
          </p>
        </div>
      )}
    </motion.div>
  );
}
