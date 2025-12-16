import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <div className={cn("flex items-center gap-2 badge-3d px-4 py-2 rounded-xl", className)}>
      <div className="flex flex-col items-end">
        <span className={cn(
          "text-2xl font-mono font-bold tabular-nums tracking-wider",
          "text-kiosk-primary clock-led"
        )}>
          {formatTime()}
        </span>
        {showDate && (
          <span className="text-[10px] text-kiosk-text/60 uppercase tracking-wide font-medium">
            {formatDate()}
          </span>
        )}
      </div>
    </div>
  );
}
