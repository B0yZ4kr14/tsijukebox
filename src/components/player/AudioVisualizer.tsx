import { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MusicGenre } from '@/lib/api/types';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  genre?: MusicGenre;
}

// Genre-specific visual configurations
const genreConfig: Record<MusicGenre, {
  color: string;
  speed: number;
  intensity: number;
  pattern: 'wave' | 'pulse' | 'bounce' | 'smooth';
}> = {
  'rock': {
    color: 'from-[hsl(var(--genre-rock))] to-[hsl(var(--genre-rock)/0.5)]',
    speed: 300,
    intensity: 0.6,
    pattern: 'bounce',
  },
  'pop': {
    color: 'from-[hsl(var(--genre-pop))] to-[hsl(var(--genre-pop)/0.5)]',
    speed: 400,
    intensity: 0.5,
    pattern: 'wave',
  },
  'soul': {
    color: 'from-[hsl(var(--genre-soul))] to-[hsl(var(--genre-soul)/0.5)]',
    speed: 600,
    intensity: 0.4,
    pattern: 'smooth',
  },
  'hip-hop': {
    color: 'from-[hsl(var(--genre-hip-hop))] to-[hsl(var(--genre-hip-hop)/0.5)]',
    speed: 250,
    intensity: 0.7,
    pattern: 'pulse',
  },
  'ballad': {
    color: 'from-[hsl(var(--genre-ballad))] to-[hsl(var(--genre-ballad)/0.5)]',
    speed: 800,
    intensity: 0.3,
    pattern: 'smooth',
  },
  'classic-rock': {
    color: 'from-[hsl(var(--genre-classic-rock))] to-[hsl(var(--genre-classic-rock)/0.5)]',
    speed: 350,
    intensity: 0.55,
    pattern: 'wave',
  },
};

const defaultConfig = {
  color: 'from-kiosk-primary to-kiosk-primary/50',
  speed: 500,
  intensity: 0.4,
  pattern: 'wave' as const,
};

export function AudioVisualizer({ 
  isPlaying, 
  barCount = 32,
  className,
  genre,
}: AudioVisualizerProps) {
  const config = useMemo(() => genre ? genreConfig[genre] : defaultConfig, [genre]);
  
  const [bars, setBars] = useState<number[]>(() => 
    Array(barCount).fill(0).map(() => Math.random() * 0.3 + 0.1)
  );
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      setBars(prev => prev.map(h => Math.max(h * 0.95, 0.05)));
      return;
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdateRef.current = timestamp;

      setBars(prev => prev.map((_, i) => {
        const centerBoost = 1 - Math.abs(i - barCount / 2) / (barCount / 2) * 0.3;
        let value: number;

        switch (config.pattern) {
          case 'bounce':
            // Rock: sharp, energetic bounces
            const bounce = Math.abs(Math.sin(timestamp / config.speed + i * 0.5));
            value = (bounce * config.intensity + Math.random() * 0.3) * centerBoost;
            break;
          case 'pulse':
            // Hip-hop: rhythmic pulses
            const pulse = Math.pow(Math.sin(timestamp / config.speed + i * 0.2), 2);
            value = (0.2 + pulse * config.intensity + Math.random() * 0.25) * centerBoost;
            break;
          case 'smooth':
            // Ballad/Soul: gentle, flowing motion
            const smooth = Math.sin(timestamp / config.speed + i * 0.15) * 0.5 + 0.5;
            value = (0.15 + smooth * config.intensity + Math.random() * 0.15) * centerBoost;
            break;
          case 'wave':
          default:
            // Pop/Classic-rock: classic wave pattern
            const wave = Math.sin(timestamp / config.speed + i * 0.3) * 0.2;
            value = (0.3 + wave + Math.random() * config.intensity) * centerBoost;
            break;
        }

        return Math.min(Math.max(0.1, value), 1);
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, barCount, config]);

  return (
    <div className={cn(
      "flex items-end justify-center gap-[1px] h-6",
      className
    )}>
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={cn("w-1 rounded-full bg-gradient-to-t", config.color)}
          initial={{ height: '10%' }}
          animate={{ 
            height: `${height * 100}%`,
            opacity: isPlaying ? 0.8 + height * 0.2 : 0.3,
          }}
          transition={{ 
            type: 'spring',
            stiffness: config.pattern === 'smooth' ? 200 : 300,
            damping: config.pattern === 'bounce' ? 15 : 20,
          }}
        />
      ))}
    </div>
  );
}
