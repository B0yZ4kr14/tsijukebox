import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useSettings } from '@/contexts/SettingsContext';
import { languages, Language } from '@/i18n';
import { cn } from '@/lib/utils';

export function LanguageSection() {
  const { language, setLanguage } = useSettings();

  return (
    <SettingsSection
      icon={<Globe className="w-5 h-5 text-amber-400" />}
      title="Idioma / Language"
      description="Selecione o idioma da interface"
    >
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(languages) as Language[]).map((lang) => (
          <Button
            key={lang}
            variant={language === lang ? 'default' : 'outline'}
            className={cn(
              "flex flex-col items-center gap-2 h-auto py-4 button-3d",
              language === lang && "bg-kiosk-primary hover:bg-kiosk-primary/90"
            )}
            onClick={() => setLanguage(lang)}
          >
            <span className="text-2xl">{languages[lang].flag}</span>
            <span className="text-xs font-medium">{languages[lang].name}</span>
          </Button>
        ))}
      </div>
    </SettingsSection>
  );
}
