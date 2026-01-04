import { LucideIcon, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/themed";
import { cn } from '@/lib/utils';

/**
 * SettingsGuideCard Component - TSiJUKEBOX
 * 
 * Card de navegação para seções de configuração.
 * Refatorado para usar os novos componentes com Design Tokens.
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 */

interface SettingsGuideCardProps {
  id: string;
  title: string;
  description?: string; // Optional - not displayed, kept for compatibility
  icon: LucideIcon;
  onClick: () => void;
}

export function SettingsGuideCard({ 
  title, 
  icon: Icon, 
  onClick 
}: SettingsGuideCardProps) {
  return (
    <Card
      variant="interactive"
      padding="sm"
      clickable
      onClick={onClick}
      className={cn(
        "group",
        // Usando design tokens via Tailwind
        "bg-bg-secondary/50 border-accent-cyan/30 hover:border-accent-cyan/50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon with neon cyan effect - usando design tokens */}
        <div className="p-2.5 rounded-lg bg-accent-cyan/10 shadow-glow-cyan flex-shrink-0 transition-all group-hover:shadow-glow-cyan group-hover:bg-accent-cyan/15">
          <Icon className="w-5 h-5 text-accent-cyan transition-transform group-hover:scale-110" />
        </div>
        
        {/* Title - usando design tokens */}
        <h4 className="font-semibold text-text-primary text-small flex-1 transition-colors group-hover:text-accent-cyan">
          {title}
        </h4>
        
        {/* Arrow icon - usando design tokens */}
        <ArrowRight className="w-4 h-4 text-accent-cyan/50 group-hover:text-accent-cyan transition-all group-hover:translate-x-1 flex-shrink-0" />
      </div>
    </Card>
  );
}
