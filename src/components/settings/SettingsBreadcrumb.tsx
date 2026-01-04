import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsCategory } from './SettingsSidebar';

interface SettingsBreadcrumbProps {
  category: SettingsCategory;
  section?: string;
  onNavigateToCategory: (category: SettingsCategory) => void;
}

const categoryLabels: Record<SettingsCategory, string> = {
  dashboard: 'Dashboard',
  connections: 'Conexões',
  data: 'Dados & Backup',
  system: 'Sistema',
  appearance: 'Aparência',
  security: 'Segurança',
  integrations: 'Integrações',
};

export function SettingsBreadcrumb({ category, section, onNavigateToCategory }: SettingsBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4 px-1">
      <button
        onClick={() => onNavigateToCategory('dashboard')}
        className={cn(
          "flex items-center gap-1 transition-colors",
          category === 'dashboard' 
            ? "text-cyan-400" 
            : "text-kiosk-text/85 hover:text-cyan-400"
        )}
      >
        <Home aria-hidden="true" className="w-3.5 h-3.5" />
        <span>Configurações</span>
      </button>
      
      {category !== 'dashboard' && (
        <>
          <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-kiosk-text/80" />
          <button
            onClick={() => onNavigateToCategory(category)}
            className={cn(
              "transition-colors",
              section 
                ? "text-kiosk-text/85 hover:text-cyan-400" 
                : "text-cyan-400"
            )}
          >
            {categoryLabels[category]}
          </button>
        </>
      )}
      
      {section && (
        <>
          <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-kiosk-text/80" />
          <span className="text-kiosk-text">{section}</span>
        </>
      )}
    </nav>
  );
}
