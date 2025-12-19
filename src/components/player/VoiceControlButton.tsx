import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoiceControl } from '@/hooks/player/useVoiceControl';
import { cn } from '@/lib/utils';

interface VoiceControlButtonProps {
  className?: string;
  showFeedback?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const commandIcons: Record<string, React.ReactNode> = {
  play: <Play className="h-4 w-4" />,
  pause: <Pause className="h-4 w-4" />,
  next: <SkipForward className="h-4 w-4" />,
  previous: <SkipForward className="h-4 w-4 rotate-180" />,
  volumeUp: <Volume2 className="h-4 w-4" />,
  volumeDown: <Volume2 className="h-4 w-4" />,
};

const commandLabels: Record<string, string> = {
  play: 'Reproduzir',
  pause: 'Pausar',
  next: 'Próxima',
  previous: 'Anterior',
  volumeUp: 'Volume +',
  volumeDown: 'Volume -',
  mute: 'Mudo',
  shuffle: 'Aleatório',
  repeat: 'Repetir',
  stop: 'Parar',
};

export function VoiceControlButton({ 
  className, 
  showFeedback = true,
  size = 'md' 
}: VoiceControlButtonProps) {
  const { 
    settings,
    isListening, 
    isSupported, 
    lastCommand, 
    transcript,
    confidence,
    error,
    toggleListening 
  } = useVoiceControl();

  const [showCommandFeedback, setShowCommandFeedback] = useState(false);

  // Show feedback when command is recognized
  useEffect(() => {
    if (lastCommand && showFeedback) {
      setShowCommandFeedback(true);
      const timer = setTimeout(() => setShowCommandFeedback(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCommand, showFeedback]);

  if (!isSupported || !settings.enabled) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn('relative', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleListening}
              className={cn(
                sizeClasses[size],
                'rounded-full transition-all duration-300',
                isListening 
                  ? 'bg-kiosk-primary text-kiosk-primary-foreground shadow-lg shadow-kiosk-primary/30' 
                  : 'bg-kiosk-surface text-kiosk-text hover:bg-kiosk-surface/80',
                error && 'border-2 border-red-500'
              )}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mic className={iconSizes[size]} />
                </motion.div>
              ) : (
                <MicOff className={iconSizes[size]} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">
                {isListening ? 'Ouvindo...' : 'Clique para ativar voz'}
              </p>
              <p className="text-xs text-muted-foreground">
                Comandos: play, pause, próxima, anterior, volume
              </p>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Listening indicator pulse */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-kiosk-primary/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Transcript display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-kiosk-surface border border-kiosk-border shadow-lg whitespace-nowrap z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="text-sm text-kiosk-text">{transcript}</p>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-kiosk-surface border-l border-t border-kiosk-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command feedback */}
      <AnimatePresence>
        {showCommandFeedback && lastCommand && (
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-green-500/90 text-white shadow-lg flex items-center gap-2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            {commandIcons[lastCommand]}
            <span className="text-sm font-medium">
              {commandLabels[lastCommand] || lastCommand}
            </span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
