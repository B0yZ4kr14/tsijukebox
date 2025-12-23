import { Music2, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RippleContainer } from '@/components/ui/RippleContainer';
import { useRipple, useSoundEffects } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { SpotifyTrack } from '@/lib/api/spotify';

interface SpotifyTrackRowProps {
  track: SpotifyTrack;
  onPlay: () => void;
  onAddToQueue: () => void;
}

export function SpotifyTrackRow({ track, onPlay, onAddToQueue }: SpotifyTrackRowProps) {
  const playRipple = useRipple();
  const queueRipple = useRipple();
  const { playSound } = useSoundEffects();
  const { soundEnabled, animationsEnabled } = useSettings();

  const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) playRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    onPlay();
  };

  const handleQueue = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) queueRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    onAddToQueue();
  };

  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors card-3d">
      <div className="relative w-10 h-10 flex-shrink-0">
        {track.albumImageUrl ? (
          <img 
            src={track.albumImageUrl} 
            alt={track.album}
            className="w-full h-full object-cover rounded shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-kiosk-surface rounded flex items-center justify-center">
            <Music2 className="w-4 h-4 text-kiosk-text/90" />
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded relative overflow-hidden"
        >
          <RippleContainer ripples={playRipple.ripples} color="spotify" />
          <Play className="w-4 h-4 text-white fill-white relative z-10" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-kiosk-text truncate">{track.name}</p>
        <p className="text-xs text-kiosk-text/85 truncate">{track.artist}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity button-3d relative overflow-hidden"
        onClick={handleQueue}
        aria-label="Adicionar à fila"
      >
        <RippleContainer ripples={queueRipple.ripples} color="spotify" />
        <Plus className="w-4 h-4 relative z-10" />
      </Button>
    </div>
  );
}

interface SpotifyTrackListProps {
  tracks: SpotifyTrack[];
  onPlayTrack: (track: SpotifyTrack) => void;
  onAddToQueue: (track: SpotifyTrack) => void;
  showRanking?: boolean;
}

export function SpotifyTrackList({ 
  tracks, 
  onPlayTrack, 
  onAddToQueue,
  showRanking = false 
}: SpotifyTrackListProps) {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, idx) => (
        showRanking ? (
          <div key={track.id} className="flex items-center gap-2">
            <span className="text-xs font-bold text-kiosk-primary w-5">{idx + 1}</span>
            <div className="flex-1">
              <SpotifyTrackRow
                track={track}
                onPlay={() => onPlayTrack(track)}
                onAddToQueue={() => onAddToQueue(track)}
              />
            </div>
          </div>
        ) : (
          <SpotifyTrackRow
            key={track.id}
            track={track}
            onPlay={() => onPlayTrack(track)}
            onAddToQueue={() => onAddToQueue(track)}
          />
        )
      ))}
    </div>
  );
}
