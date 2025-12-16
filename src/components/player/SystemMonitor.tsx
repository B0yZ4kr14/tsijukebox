import { motion } from 'framer-motion';
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

function getStatusGlow(value: number, thresholds: { warning: number; danger: number }) {
  if (value >= thresholds.danger) return 'drop-shadow-[0_0_8px_hsl(0_84%_60%)]';
  if (value >= thresholds.warning) return 'drop-shadow-[0_0_8px_hsl(45_93%_58%)]';
  return 'drop-shadow-[0_0_8px_hsl(142_71%_45%)]';
}

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export function SystemMonitor({ cpu, memory, temp }: SystemMonitorProps) {
  return (
    <motion.div 
      className="flex items-center gap-3 badge-3d backdrop-blur-sm rounded-full px-4 py-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* CPU */}
      <motion.div 
        className="flex items-center gap-1.5"
        variants={itemVariants}
      >
        <Cpu className={cn(
          "w-4 h-4 transition-all duration-300",
          getStatusColor(cpu, { warning: 70, danger: 90 }),
          getStatusGlow(cpu, { warning: 70, danger: 90 })
        )} />
        <motion.span 
          className="text-xs font-bold text-kiosk-text/70 tabular-nums"
          key={cpu.toFixed(0)}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {cpu.toFixed(0)}%
        </motion.span>
      </motion.div>

      <div className="w-px h-4 bg-kiosk-text/20" />

      {/* Memory */}
      <motion.div 
        className="flex items-center gap-1.5"
        variants={itemVariants}
      >
        <HardDrive className={cn(
          "w-4 h-4 transition-all duration-300",
          getStatusColor(memory, { warning: 75, danger: 90 }),
          getStatusGlow(memory, { warning: 75, danger: 90 })
        )} />
        <motion.span 
          className="text-xs font-bold text-kiosk-text/70 tabular-nums"
          key={memory.toFixed(0)}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {memory.toFixed(0)}%
        </motion.span>
      </motion.div>

      <div className="w-px h-4 bg-kiosk-text/20" />

      {/* Temperature */}
      <motion.div 
        className="flex items-center gap-1.5"
        variants={itemVariants}
      >
        <Thermometer className={cn(
          "w-4 h-4 transition-all duration-300",
          getStatusColor(temp, { warning: 60, danger: 75 }),
          getStatusGlow(temp, { warning: 60, danger: 75 })
        )} />
        <motion.span 
          className="text-xs font-bold text-kiosk-text/70 tabular-nums"
          key={temp.toFixed(0)}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {temp.toFixed(0)}°C
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
