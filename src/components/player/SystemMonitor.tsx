import { Cpu, HardDrive, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemMonitorProps {
  cpu: number;
  memory: number;
  temp: number;
}

function getStatusColor(value: number, thresholds: { warning: number; danger: number }) {
  if (value >= thresholds.danger) return 'text-destructive';
  if (value >= thresholds.warning) return 'text-yellow-500';
  return 'text-green-500';
}

export function SystemMonitor({ cpu, memory, temp }: SystemMonitorProps) {
  return (
    <div className="flex items-center gap-3 bg-kiosk-surface/30 backdrop-blur-sm rounded-full px-4 py-2">
      {/* CPU */}
      <div className="flex items-center gap-1.5">
        <Cpu className={cn(
          "w-4 h-4",
          getStatusColor(cpu, { warning: 70, danger: 90 })
        )} />
        <span className="text-xs text-kiosk-text/70">{cpu.toFixed(0)}%</span>
      </div>

      <div className="w-px h-4 bg-kiosk-text/20" />

      {/* Memory */}
      <div className="flex items-center gap-1.5">
        <HardDrive className={cn(
          "w-4 h-4",
          getStatusColor(memory, { warning: 75, danger: 90 })
        )} />
        <span className="text-xs text-kiosk-text/70">{memory.toFixed(0)}%</span>
      </div>

      <div className="w-px h-4 bg-kiosk-text/20" />

      {/* Temperature */}
      <div className="flex items-center gap-1.5">
        <Thermometer className={cn(
          "w-4 h-4",
          getStatusColor(temp, { warning: 60, danger: 75 })
        )} />
        <span className="text-xs text-kiosk-text/70">{temp.toFixed(0)}°C</span>
      </div>
    </div>
  );
}
