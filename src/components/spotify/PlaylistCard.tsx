import { motion } from 'framer-motion';
import { Play, MoreHorizontal, Music } from 'lucide-react';
import { SpotifyPlaylist } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
}

export function PlaylistCard({ playlist, onClick, onPlay, className }: PlaylistCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative bg-kiosk-surface/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-kiosk-surface",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Album Art */}
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-kiosk-surface">
        {playlist.imageUrl ? (
          <img
            src={playlist.imageUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-12 h-12 text-kiosk-text/30" />
          </div>
        )}
        
        {/* Play button overlay */}
        <motion.button
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl"
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ scale: 1.1 }}
          animate={{ opacity: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          style={{ opacity: 'var(--play-opacity, 0)' }}
        >
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </motion.button>
        
        <style>{`
          .group:hover {
            --play-opacity: 1;
          }
        `}</style>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-kiosk-text truncate">{playlist.name}</h3>
        <p className="text-sm text-kiosk-text/60 truncate">
          {playlist.owner} • {playlist.tracksTotal} faixas
        </p>
      </div>
    </motion.div>
  );
}
