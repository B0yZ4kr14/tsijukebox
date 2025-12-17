import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Instructions {
  title: string;
  steps: string[];
  tips?: string[];
  warning?: string;
}

interface SettingsSectionProps {
  icon: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  delay?: number;
  instructions?: Instructions;
}

export function SettingsSection({
  icon,
  title,
  description,
  badge,
  children,
  defaultOpen = false,
  delay = 0,
  instructions,
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showInstructions, setShowInstructions] = useState(false);

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
            <CardTitle className="flex items-center gap-2 text-gold-neon-hover">
              <span className="icon-neon-blue-hover">{icon}</span>
              {title}
              {badge}
            </CardTitle>
            <div className="flex items-center gap-2">
              {instructions && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstructions(!showInstructions);
                  }}
                  className="p-1.5 rounded-full hover:bg-kiosk-surface/80 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HelpCircle className={`w-4 h-4 icon-neon-blue transition-opacity ${showInstructions ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} />
                </motion.button>
              )}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-kiosk-text/70" />
              </motion.div>
            </div>
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
              <CardContent className="pt-0 space-y-4">
                {/* Instructions Panel */}
                <AnimatePresence>
                  {instructions && showInstructions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="instructions-panel space-y-4">
                        {/* Title */}
                        <h4 className="text-sm font-medium text-label-yellow">
                          {instructions.title}
                        </h4>

                        {/* Steps */}
                        <div className="space-y-2">
                          {instructions.steps.map((step, index) => (
                            <div key={index} className="instructions-step">
                              <span className="instructions-step-number">
                                {index + 1}
                              </span>
                              <p className="text-sm text-kiosk-text/85 leading-relaxed">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Tips */}
                        {instructions.tips && instructions.tips.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-kiosk-surface/50">
                            {instructions.tips.map((tip, index) => (
                              <div key={index} className="instructions-tip">
                                <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-kiosk-text/80">
                                  {tip}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Warning */}
                        {instructions.warning && (
                          <div className="instructions-warning">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">
                              {instructions.warning}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Content */}
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
