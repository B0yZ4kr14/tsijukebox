import { Play, Heart, Plus } from 'lucide-react';
import { SpotifyTrack } from '@/lib/api/spotify';
import { Button } from "@/components/ui/themed";
import { cn } from '@/lib/utils';

interface TrackItemProps {
  track: SpotifyTrack;
  index?: number;
  showAlbum?: boolean;
  showImage?: boolean;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onAddToPlaylist?: () => void;
  className?: string;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TrackItem({
  track,
  index,
  showAlbum = true,
  showImage = true,
  isLiked = false,
  onPlay,
  onLike,
  onAddToPlaylist,
  className,
}: TrackItemProps) {
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
              className="hidden group-hover:block text-kiosk-text hover:text-[#1DB954]"
              onClick={onPlay}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </>
        ) : (
          <button
            className="text-kiosk-text/85 hover:text-[#1DB954]"
            onClick={onPlay}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* Album art */}
      {showImage && (
        <div className="w-10 h-10 rounded overflow-hidden bg-kiosk-surface flex-shrink-0" aria-hidden="true">
          {track.albumImageUrl ? (
            <img
              src={track.albumImageUrl}
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
        <p className="text-kiosk-text font-medium truncate">
          {track.name}
          {track.explicit && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-kiosk-text/20 rounded text-kiosk-text/90">
              E
            </span>
          )}
        </p>
        <p className="text-sm text-kiosk-text/85 truncate">{track.artist}</p>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="hidden md:block flex-1 min-w-0">
          <p className="text-sm text-kiosk-text/85 truncate">{track.album}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="xs"
          className={cn(
            "w-8 h-8",
            isLiked ? "text-[#1DB954]" : "text-kiosk-text/85 hover:text-kiosk-text"
          )}
          onClick={onLike} aria-label="Favoritar">
          <Heart aria-hidden="true" className={cn("w-4 h-4", isLiked && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="w-8 h-8 text-kiosk-text/85 hover:text-kiosk-text"
          onClick={onAddToPlaylist} aria-label="Adicionar">
          <Plus aria-hidden="true" className="w-4 h-4" />
        </Button>
      </div>

      {/* Duration */}
      <span className="text-sm text-kiosk-text/85 w-12 text-right">
        {formatDuration(track.durationMs)}
      </span>
    </div>
  );
}
