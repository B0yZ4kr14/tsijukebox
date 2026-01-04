import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Settings, 
  Music, 
  BarChart3, 
  Palette, 
  Github,
  ChevronRight,
  Monitor,
  Sparkles
} from 'lucide-react';

interface DemoScreen {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  features: string[];
}

const DEMO_SCREENS: DemoScreen[] = [
  {
    id: 'setup',
    title: 'Setup Wizard',
    icon: Settings,
    color: '#00ff88',
    description: 'Configuração em 9 passos simples',
    features: ['Modo Kiosk', 'Provider Selection', 'Audio Config'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    color: '#00d4ff',
    description: 'Monitoramento em tempo real',
    features: ['CPU/RAM/Temp', 'Top Tracks', 'Uptime'],
  },
  {
    id: 'spotify',
    title: 'Spotify Connect',
    icon: Music,
    color: '#1DB954',
    description: 'Integração completa com Spotify',
    features: ['Playlists', 'Now Playing', 'Queue'],
  },
  {
    id: 'brand',
    title: 'Brand Guidelines',
    icon: Palette,
    color: '#ff00ff',
    description: 'Design System completo',
    features: ['Cores Neon', 'Typography', 'Components'],
  },
  {
    id: 'github',
    title: 'GitHub Dashboard',
    icon: Github,
    color: '#f0f0f0',
    description: 'Sincronização com repositório',
    features: ['Commits', 'Branches', 'Deploy'],
  },
];

const DemoAnimated: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEMO_SCREENS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentScreen = DEMO_SCREENS[currentIndex];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-t-xl border border-zinc-700">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Traffic Lights */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          </div>
          
          {/* URL Bar */}
          <div className="flex-1 mx-4">
            <div className="bg-zinc-950 rounded-md px-4 py-1.5 text-xs font-mono text-zinc-400 flex items-center gap-2">
              <Monitor className="w-3 h-3" />
              <span>tsijukebox.local/{currentScreen.id}</span>
            </div>
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
          >
            <Play className={`w-4 h-4 ${isPlaying ? 'text-green-400' : 'text-zinc-400'}`} />
          </button>
        </div>
      </div>

      {/* Screen Content */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-x border-b border-zinc-700 rounded-b-xl overflow-hidden aspect-video" role="presentation">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${currentScreen.color}40, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwTDYwIDYwTTYwIDBMMCA2MCIgc3Ryb2tlPSIjMjIyIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3N2Zz4=')] opacity-10" />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center justify-center h-full p-8"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div 
                className="p-6 rounded-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${currentScreen.color}20, transparent)`,
                  boxShadow: `0 0 60px ${currentScreen.color}30`,
                }}
              >
                <currentScreen.icon 
                  className="w-16 h-16"
                  style={{ color: currentScreen.color }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
              style={{ color: currentScreen.color }}
            >
              {currentScreen.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 text-lg mb-6"
            >
              {currentScreen.description}
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              {currentScreen.features.map((feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="px-3 py-1 rounded-full text-sm border"
                  style={{ 
                    borderColor: `${currentScreen.color}40`,
                    color: currentScreen.color,
                  }}
                >
                  {feature}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Sparkle Effect */}
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-4 right-4"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {DEMO_SCREENS.map((screen, index) => (
          <button
            key={screen.id}
            onClick={() => {
              setCurrentIndex(index);
              setIsPlaying(false);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8' 
                : 'hover:opacity-80'
            }`}
            style={{ 
              backgroundColor: index === currentIndex ? currentScreen.color : '#555',
            }}
          />
        ))}
      </div>

      {/* Screen Labels */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {DEMO_SCREENS.map((screen, index) => (
          <button
            key={screen.id}
            onClick={() => {
              setCurrentIndex(index);
              setIsPlaying(false);
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
              index === currentIndex 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <screen.icon className="w-3 h-3" />
            {screen.title}
            {index === currentIndex && (
              <ChevronRight aria-hidden="true" className="w-3 h-3 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DemoAnimated;
