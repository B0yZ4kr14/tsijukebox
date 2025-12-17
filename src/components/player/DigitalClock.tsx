import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DigitalClockProps {
  showSeconds?: boolean;
  showDate?: boolean;
  className?: string;
}

// Sparkle particle component
const Sparkle = ({ x, y, delay, color }: { x: number; y: number; delay: number; color: 'cyan' | 'gold' }) => (
  <motion.div
    className={`absolute w-2 h-2 rounded-full ${color === 'cyan' ? 'calendar-sparkle-cyan' : 'calendar-sparkle-gold'}`}
    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0.8, 0],
      scale: [0, 1.5, 1, 0],
      y: [0, -8, -4, 0]
    }}
    transition={{
      duration: 1.8,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.5 + 0.3
    }}
  />
);

export function DigitalClock({ 
  showSeconds = false, 
  showDate = true,
  className = '' 
}: DigitalClockProps) {
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // Generate sparkle particles
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 280,
      y: (Math.random() - 0.5) * 320,
      delay: Math.random() * 0.6,
      color: (i % 2 === 0 ? 'cyan' : 'gold') as 'cyan' | 'gold'
    })), 
  []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: false,
    };
    return time.toLocaleTimeString('pt-BR', options);
  };

  const formatDate = () => {
    return time.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const timeKey = formatTime();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div 
          className={cn(
            "flex items-center gap-1 px-2 py-px rounded-md cursor-pointer",
            "bg-slate-900/80 backdrop-blur-sm",
            "border border-cyan-500/30",
            "shadow-[0_0_12px_hsl(185_100%_50%/0.15)]",
            "hover:border-cyan-500/50 hover:shadow-[0_0_18px_hsl(185_100%_50%/0.25)]",
            "transition-all duration-200",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-1.5 w-full justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={timeKey}
                initial={{ opacity: 0.6, y: -1 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.6, y: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="text-sm font-mono font-bold tabular-nums tracking-wider text-gold-neon clock-gold"
              >
                {timeKey}
              </motion.span>
            </AnimatePresence>
            
            {showDate && (
              <>
                <div className="w-px h-2.5 bg-cyan-500/30" />
                <span className="text-[9px] uppercase tracking-wide font-medium clock-date-neon whitespace-nowrap">
                  {formatDate()}
                </span>
              </>
            )}
          </div>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-2xl calendar-container-pro" 
        align="center"
        sideOffset={10}
      >
        {/* Sparkle particles */}
        <AnimatePresence>
          {isOpen && (
            <div className="sparkles-container">
              {particles.map(p => (
                <Sparkle key={p.id} x={p.x} y={p.y} delay={p.delay} color={p.color} />
              ))}
            </div>
          )}
        </AnimatePresence>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="calendar-pro pointer-events-auto relative z-10"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
