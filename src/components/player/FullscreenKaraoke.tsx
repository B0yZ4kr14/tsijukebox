import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/themed";
import { extractDominantColors, type ExtractedColors } from '@/lib/colorExtractor';
import { useLyrics } from '@/hooks/player';
import { useTranslation } from '@/hooks/common';

interface FullscreenKaraokeProps {
  isOpen: boolean;
  onClose: () => void;
  trackName?: string;
  artistName?: string;
  albumCover?: string;
  position: number;
  isPlaying: boolean;
}

// Floating particle component
function FloatingParticle({ delay, colors }: { delay: number; colors: ExtractedColors }) {
  const size = Math.random() * 6 + 2;
  const duration = Math.random() * 20 + 15;
  const startX = Math.random() * 100;
  
  return (
    <motion.div
      className="absolute rounded-full opacity-30 blur-[1px]"
      style={{
        width: size,
        height: size,
        background: Math.random() > 0.5 ? colors.primary : colors.accent,
        left: `${startX}%`,
        bottom: '-10%',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: '-120vh',
        opacity: [0, 0.4, 0.4, 0],
        x: [0, Math.sin(delay) * 50, Math.cos(delay) * 30, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export function FullscreenKaraoke({
  isOpen,
  onClose,
  trackName,
  artistName,
  albumCover,
  position,
  isPlaying,
}: FullscreenKaraokeProps) {
  const { t } = useTranslation();
  const [colors, setColors] = useState<ExtractedColors>({
    primary: 'hsl(195, 100%, 50%)',
    secondary: 'hsl(280, 100%, 50%)',
    accent: 'hsl(320, 100%, 60%)',
    isDark: true,
  });
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics
  const { data: lyricsData } = useLyrics(trackName || '', artistName || '');
  const lines = lyricsData?.lines || [];

  // Extract colors from album cover
  useEffect(() => {
    if (albumCover) {
      extractDominantColors(albumCover).then(setColors);
    }
  }, [albumCover]);

  // Update current line based on position
  useEffect(() => {
    if (lines.length === 0) return;

    const index = lines.findIndex((line, i) => {
      const nextLine = lines[i + 1];
      return position >= line.time && (!nextLine || position < nextLine.time);
    });

    if (index !== -1) {
      setCurrentLineIndex(index);
    }
  }, [position, lines]);

  // Handle ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Generate particles array
  const particles = Array.from({ length: 30 }, (_, i) => i * 0.5);

  if (!isOpen) return null;

  const currentLine = lines[currentLineIndex];
  const prevLine = lines[currentLineIndex - 1];
  const nextLine = lines[currentLineIndex + 1];

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
              `linear-gradient(180deg, ${colors.secondary} 0%, ${colors.accent} 50%, ${colors.primary} 100%)`,
              `linear-gradient(225deg, ${colors.accent} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
              `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Blur overlay for depth */}
        <div 
          className="absolute inset-0 backdrop-blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((delay, i) => (
            <FloatingParticle key={i} delay={delay} colors={colors} />
          ))}
        </div>

        {/* Album Cover with Glow */}
        {albumCover && (
          <motion.div
            className="absolute opacity-20"
            style={{
              width: '60vw',
              height: '60vw',
              maxWidth: '600px',
              maxHeight: '600px',
            }}
            animate={{
              scale: isPlaying ? [1, 1.05, 1] : 1,
              rotate: isPlaying ? [0, 1, -1, 0] : 0,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img
              src={albumCover}
              alt=""
              className="w-full h-full object-cover rounded-3xl blur-sm"
              style={{
                filter: `blur(2px) saturate(1.5)`,
                boxShadow: `0 0 100px 50px ${colors.primary}`,
              }}
            />
          </motion.div>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="xs"
          className="absolute top-6 right-6 z-10 text-white/80 hover:text-white hover:bg-white/10"
          onClick={onClose} aria-label="Fechar">
          <X aria-hidden="true" className="w-6 h-6" />
        </Button>

        {/* Exit Fullscreen Button */}
        <Button
          variant="ghost"
          size="xs"
          className="absolute top-6 left-6 z-10 text-white/80 hover:text-white hover:bg-white/10"
          onClick={onClose} aria-label="Minimizar">
          <Minimize2 aria-hidden="true" className="w-6 h-6" />
        </Button>

        {/* Track Info */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10">
          <motion.p
            className="text-white/60 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {artistName}
          </motion.p>
          <motion.p
            className="text-white font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {trackName}
          </motion.p>
        </div>

        {/* Lyrics Display */}
        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          {/* Previous Line */}
          <motion.p
            key={`prev-${currentLineIndex}`}
            className="text-2xl md:text-3xl text-white/30 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.3, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {prevLine?.text || '\u00A0'}
          </motion.p>

          {/* Current Line with Glow Effect */}
          <motion.p
            key={`current-${currentLineIndex}`}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              textShadow: isPlaying 
                ? [
                    `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}`,
                    `0 0 40px ${colors.accent}, 0 0 80px ${colors.accent}`,
                    `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}`,
                  ]
                : `0 0 20px ${colors.primary}`,
            }}
            transition={{
              textShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {currentLine?.text || (lines.length === 0 ? t('lyrics.notAvailable') : '♪')}
          </motion.p>

          {/* Next Line */}
          <motion.p
            key={`next-${currentLineIndex}`}
            className="text-2xl md:text-3xl text-white/30 mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.3, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {nextLine?.text || '\u00A0'}
          </motion.p>
        </div>

        {/* Bottom Glow Effect */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${colors.primary}40, transparent)`,
          }}
        />

        {/* Playing Indicator */}
        {isPlaying && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/60 rounded-full"
                animate={{
                  height: [8, 24, 8],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
