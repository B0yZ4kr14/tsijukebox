import { LucideIcon, ArrowRight, Lightbulb, CheckCircle2, BookOpen, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { SettingsIllustration, IllustrationType } from './SettingsIllustration';

interface GuideSection {
  name: string;
  description: string;
  tips: string[];
}

interface SettingsGuide {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  longDescription: string;
  quickStartSteps: string[];
  sections: GuideSection[];
}

interface SettingsGuideModalProps {
  guide: SettingsGuide | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

// Map guide IDs to illustration types
const illustrationMap: Record<string, IllustrationType> = {
  connections: 'connections',
  data: 'data',
  system: 'system',
  appearance: 'appearance',
  security: 'security',
  integrations: 'integrations'
};

export function SettingsGuideModal({ guide, isOpen, onClose, onNavigate }: SettingsGuideModalProps) {
  if (!guide) return null;

  const Icon = guide.icon;
  const illustrationType = illustrationMap[guide.id];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-kiosk-surface border-cyan-500/30 text-kiosk-text max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <DialogTitle className="text-xl text-gold-neon">{guide.title}</DialogTitle>
                <p className="text-sm text-kiosk-text/85 mt-1">{guide.description}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 py-4">
            {/* Illustration */}
            {illustrationType && (
              <motion.div 
                className="flex justify-center p-4 rounded-lg bg-kiosk-background/30 border border-kiosk-border/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsIllustration type={illustrationType} size="lg" animated />
              </motion.div>
            )}

            {/* Long Description */}
            <div className="p-4 rounded-lg bg-kiosk-background/50 border border-kiosk-border">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-label-yellow">O que é isso?</span>
              </div>
              <p className="text-sm text-kiosk-text/80 leading-relaxed">
                {guide.longDescription}
              </p>
            </div>

            {/* Quick Start */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-label-yellow">Como começar</span>
              </div>
              <div className="space-y-2">
                {guide.quickStartSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-kiosk-background/30 border border-kiosk-border/50"
                  >
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 h-5 w-5 flex items-center justify-center p-0 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="text-sm text-kiosk-text/80">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sections */}
            {guide.sections.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-label-yellow">Seções disponíveis</span>
                </div>
                <div className="space-y-3">
                  {guide.sections.map((section, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-kiosk-background/30 border border-kiosk-border/50"
                    >
                      <h4 className="text-sm font-medium text-kiosk-text mb-1">{section.name}</h4>
                      <p className="text-xs text-kiosk-text/85 mb-3">{section.description}</p>
                      
                      {section.tips.length > 0 && (
                        <div className="space-y-1">
                          {section.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex items-start gap-2">
                              <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-kiosk-text/90">{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-kiosk-border">
          <div className="flex gap-3">
            <Button
              variant="kiosk-outline"
              onClick={onClose}
              className="flex-1 border-kiosk-border text-kiosk-text hover:bg-kiosk-surface"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                onNavigate();
                onClose();
              }}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Ir para Configuração
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
