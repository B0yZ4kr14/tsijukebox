import { Play, User } from 'lucide-react';
import { SpotifyArtist } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';

interface ArtistCardProps {
  artist: SpotifyArtist;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
}

export function ArtistCard({ artist, onClick, onPlay, className }: ArtistCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-kiosk-surface/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-kiosk-surface hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      {/* Artist Image */}
      <div className="relative aspect-square mb-4 rounded-full overflow-hidden bg-kiosk-surface mx-auto">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-kiosk-text/50" />
          </div>
        )}
        
        {/* Play button overlay */}
        <button
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
        >
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </button>
      </div>

      {/* Info */}
      <div className="text-center space-y-1">
        <h3 className="font-semibold text-kiosk-text truncate">{artist.name}</h3>
        <p className="text-sm text-kiosk-text/60">Artista</p>
      </div>
    </div>
  );
}
