import { Monitor } from 'lucide-react';
import { Toggle } from "@/components/ui/themed";
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface HighContrastToggleProps {
  variant?: 'compact' | 'full';
  showLabel?: boolean;
  className?: string;
}

/**
 * Toggle component for enabling/disabling high contrast mode.
 * 
 * @param variant - 'compact' renders an icon button, 'full' renders a switch with label
 * @param showLabel - Whether to show the label text (only applies to 'full' variant)
 * @param className - Additional CSS classes
 */
export function HighContrastToggle({ 
  variant = 'full',
  showLabel = true,
  className 
}: HighContrastToggleProps) {
  const { highContrast, setHighContrast } = useTheme();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setHighContrast(!highContrast)}
        className={cn(
          "p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kiosk-primary",
          highContrast 
            ? "bg-white text-black hover:bg-gray-100" 
            : "bg-kiosk-surface text-kiosk-text hover:bg-kiosk-surface/80",
          className
        )}
        aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
        aria-pressed={highContrast}
      >
        <Monitor className="w-5 h-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <Monitor 
          className={cn(
            "w-5 h-5 transition-colors",
            highContrast ? "text-white" : "icon-neon-blue"
          )} 
          aria-hidden="true"
        />
        {showLabel && (
          <Label 
            htmlFor="high-contrast-toggle"
            className="text-label-yellow font-medium cursor-pointer"
          >
            Alto Contraste
          </Label>
        )}
      </div>
      <Switch
        id="high-contrast-toggle"
        checked={highContrast}
        onCheckedChange={setHighContrast}
        aria-label="Alternar modo de alto contraste"
        className="data-[state=checked]:bg-kiosk-primary"
      />
    </div>
  );
}
