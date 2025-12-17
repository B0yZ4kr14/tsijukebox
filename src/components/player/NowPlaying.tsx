import { Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import type { TrackInfo } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface NowPlayingProps {
  track: TrackInfo | null;
  isPlaying: boolean;
}

// Floating particle component
const FloatingParticle = ({ 
  delay, 
  x, 
  startY, 
  color 
}: { 
  delay: number; 
  x: number; 
  startY: number;
  color: 'cyan' | 'pink' | 'gold';
}) => {
  const colorClasses = {
    cyan: 'floating-particle-cyan',
    pink: 'floating-particle-pink',
    gold: 'floating-particle-gold',
  };

  return (
    <motion.div
      className={`absolute w-1.5 h-1.5 rounded-full ${colorClasses[color]} pointer-events-none`}
      style={{ left: `${x}%` }}
      initial={{ y: startY, opacity: 0, scale: 0 }}
      animate={{
        y: [startY, startY - 120, startY - 180],
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0.5],
        x: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 1.5,
        ease: 'easeOut',
      }}
    />
  );
};

export function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  const { animationsEnabled } = useSettings();

  // Generate floating particles
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      startY: 280 + Math.random() * 40,
      delay: Math.random() * 2,
      color: (['cyan', 'pink', 'gold'] as const)[i % 3],
    })),
  []);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Floating particles container - only shows when playing and animations enabled */}
      <AnimatePresence>
        {isPlaying && animationsEnabled && (
          <motion.div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {particles.map(p => (
              <FloatingParticle
                key={p.id}
                x={p.x}
                startY={p.startY}
                delay={p.delay}
                color={p.color}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Main album cover - 3D Frame with SOLID dark background */}
        <motion.div 
          className={cn(
            "w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden relative z-10",
            "album-frame-extreme-3d"
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Multiple SOLID dark background layers - prevents any transparency */}
          <div className="absolute inset-0 bg-[#050508]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] to-[#000000]" />
          
          <AnimatePresence mode="wait">
            {track?.cover ? (
              <motion.img
                key={track.cover}
                src={track.cover}
                alt={`${track.title} - ${track.artist}`}
                className="w-full h-full object-cover relative z-10"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <motion.div 
                key="placeholder"
                className="w-full h-full bg-gradient-to-br from-kiosk-surface to-[#050508] flex items-center justify-center relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Music className="w-24 h-24 text-kiosk-primary/40" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay gradient for depth - enhanced darkening effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/60 via-transparent to-[#050508]/40 pointer-events-none z-20" />
          
          {/* Inner shadow for extreme inset effect */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] pointer-events-none rounded-2xl z-20" />
        </motion.div>

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
