import { Play, Heart, Plus, ListPlus } from 'lucide-react';
import { YouTubeMusicTrack } from '@/lib/api/youtubeMusic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface YouTubeMusicTrackItemProps {
  track: YouTubeMusicTrack;
  index?: number;
  showAlbum?: boolean;
  showImage?: boolean;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onAddToPlaylist?: () => void;
  onAddToQueue?: () => void;
  className?: string;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function YouTubeMusicTrackItem({
  track,
  index,
  showAlbum = true,
  showImage = true,
  isLiked = false,
  onPlay,
  onLike,
  onAddToPlaylist,
  onAddToQueue,
  className,
}: YouTubeMusicTrackItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 px-4 py-2 rounded-md hover:bg-kiosk-surface/50 transition-colors",
        className
      )}
    >
      {/* Index / Play button */}
      <div className="w-8 text-center">
        {index !== undefined ? (
          <>
            <span className="text-kiosk-text/85 text-sm group-hover:hidden">{index + 1}</span>
            <button
              className="hidden group-hover:block text-kiosk-text hover:text-[#FF0000]"
              onClick={onPlay}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </>
        ) : (
          <button
            className="text-kiosk-text/85 hover:text-[#FF0000]"
            onClick={onPlay}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* Thumbnail */}
      {showImage && (
        <div className="w-10 h-10 rounded overflow-hidden bg-kiosk-surface flex-shrink-0">
          {track.thumbnailUrl ? (
            <img
              src={track.thumbnailUrl}
              alt={track.album}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-kiosk-text/85">♪</span>
            </div>
          )}
        </div>
      )}

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="text-kiosk-text font-medium truncate">{track.title}</p>
        <p className="text-sm text-kiosk-text/85 truncate">{track.artist}</p>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="hidden md:block flex-1 min-w-0">
          <p className="text-sm text-kiosk-text/85 truncate">{track.album}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-8 h-8",
            isLiked ? "text-[#FF0000]" : "text-kiosk-text/85 hover:text-kiosk-text"
          )}
          onClick={onLike}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-kiosk-text/85 hover:text-kiosk-text"
          onClick={onAddToQueue}
          title="Adicionar à fila"
        >
          <ListPlus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-kiosk-text/85 hover:text-kiosk-text"
          onClick={onAddToPlaylist}
          title="Adicionar à playlist"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Duration */}
      <span className="text-sm text-kiosk-text/85 w-12 text-right">
        {formatDuration(track.durationMs)}
      </span>
    </div>
  );
}
