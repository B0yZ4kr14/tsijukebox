import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsSectionProps {
  icon: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  delay?: number;
}

export function SettingsSection({
  icon,
  title,
  description,
  badge,
  children,
  defaultOpen = true,
  delay = 0,
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
    >
      <Card className="card-settings-3d bg-kiosk-surface/90 backdrop-blur-sm border-kiosk-surface/50 card-neon-border overflow-hidden">
        <CardHeader 
          className="cursor-pointer hover:bg-kiosk-surface/50 transition-all duration-300 rounded-t-lg group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gold-neon">
              {icon}
              {title}
              {badge}
            </CardTitle>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-kiosk-text/70" />
            </motion.div>
          </div>
          {description && (
            <CardDescription className="text-kiosk-text/80">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <CardContent className="pt-0">{children}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
