import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col items-end">
        <span className="text-2xl font-mono font-bold text-kiosk-primary tabular-nums tracking-wider drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
          {formatTime()}
        </span>
        {showDate && (
          <span className="text-[10px] text-kiosk-text/60 uppercase tracking-wide">
            {formatDate()}
          </span>
        )}
      </div>
    </div>
  );
}
