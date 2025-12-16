import { Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrackInfo } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface NowPlayingProps {
  track: TrackInfo | null;
  isPlaying: boolean;
}

export function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Album Cover - Static with 3D effects */}
      <div className="relative">
        {/* Outer glow when playing */}
        <motion.div
          className="absolute -inset-8 rounded-3xl bg-kiosk-primary/20 blur-3xl"
          animate={{
            opacity: isPlaying ? [0.15, 0.35, 0.15] : 0.05,
            scale: isPlaying ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Multiple shadow layers for extreme depth */}
        <div className="absolute -inset-1 rounded-2xl bg-black/60 blur-2xl" />
        <div className="absolute -inset-3 rounded-2xl bg-kiosk-primary/10 blur-3xl" />

        {/* Main album cover - 3D Frame */}
        <motion.div 
          className={cn(
            "w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden relative z-10",
            "bg-kiosk-surface border border-white/10",
            "album-frame-3d"
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {track?.cover ? (
              <motion.img
                key={track.cover}
                src={track.cover}
                alt={`${track.title} - ${track.artist}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <motion.div 
                key="placeholder"
                className="w-full h-full bg-gradient-to-br from-kiosk-surface to-kiosk-bg flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Music className="w-24 h-24 text-kiosk-primary/40" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
          
          {/* Inner shadow for inset effect */}
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] pointer-events-none rounded-2xl" />
        </motion.div>

        {/* Playing indicator - glowing pulse */}
        {isPlaying && (
          <motion.div
            className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-kiosk-primary z-20 button-primary-3d"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
              boxShadow: [
                '0 0 10px hsl(var(--kiosk-primary) / 0.5)',
                '0 0 25px hsl(var(--kiosk-primary) / 0.8)',
                '0 0 10px hsl(var(--kiosk-primary) / 0.5)',
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Track Info with 3D text shadow */}
      <div className="text-center space-y-2 max-w-md">
        <AnimatePresence mode="wait">
          <motion.h2 
            key={track?.title || 'no-track'}
            className="text-2xl md:text-3xl font-bold text-kiosk-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {track?.title || 'Nenhuma faixa'}
          </motion.h2>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.p 
            key={track?.artist || 'no-artist'}
            className="text-lg text-kiosk-text/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {track?.artist || 'Aguardando...'}
          </motion.p>
        </AnimatePresence>
        
        <AnimatePresence>
          {track?.album && (
            <motion.p 
              key={track.album}
              className="text-sm text-kiosk-text/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {track.album}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
