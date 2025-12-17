import { motion, AnimatePresence } from 'framer-motion';
import type { Ripple } from '@/hooks/useRipple';

interface RippleContainerProps {
  ripples: Ripple[];
  color?: 'cyan' | 'amber' | 'white' | 'red' | 'primary' | 'green' | 'stop' | 'spotify';
}

const rippleColors = {
  cyan: 'ripple-cyan',
  amber: 'ripple-amber',
  white: 'ripple-white',
  red: 'ripple-red',
  primary: 'ripple-primary',
  green: 'ripple-green',
  stop: 'ripple-stop',
  spotify: 'ripple-spotify',
};

export function RippleContainer({ ripples, color = 'cyan' }: RippleContainerProps) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className={`absolute rounded-full ${rippleColors[color]}`}
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
