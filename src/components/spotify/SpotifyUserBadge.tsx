import { Link } from 'react-router-dom';
import { Disc3, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SpotifyUser } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';

interface SpotifyUserBadgeProps {
  user: SpotifyUser | null;
  isConnected: boolean;
  className?: string;
}

export function SpotifyUserBadge({ user, isConnected, className }: SpotifyUserBadgeProps) {
  if (!isConnected || !user) {
    return (
      <Link to="/settings">
        <motion.div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full bg-kiosk-surface/50 text-kiosk-text/60 hover:bg-kiosk-surface hover:text-kiosk-text transition-colors",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Disc3 className="w-4 h-4" />
          <span className="text-sm">Conectar Spotify</span>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to="/spotify">
      <motion.div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954]/30 transition-colors",
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.displayName}
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <Disc3 className="w-4 h-4" />
        )}
        <span className="text-sm font-medium max-w-[120px] truncate">{user.displayName}</span>
        <ChevronRight className="w-4 h-4" />
      </motion.div>
    </Link>
  );
}
