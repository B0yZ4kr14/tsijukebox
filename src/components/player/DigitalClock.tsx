import { useState, useEffect } from 'react';
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

export function DigitalClock({ 
  showSeconds = false, 
  showDate = true,
  className = '' 
}: DigitalClockProps) {
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);

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
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="calendar-pro pointer-events-auto"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
