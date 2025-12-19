import { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { t as translate, Language, TranslationKeys } from '@/i18n';

export function useTranslation() {
  const { language } = useSettings();
  
  const t = useCallback((path: string): string => {
    return translate(language, path);
  }, [language]);

  return { t, language };
}

// Type-safe translation hook for specific sections
export function useT() {
  const { language } = useSettings();
  
  return {
    common: (key: keyof TranslationKeys['common']) => translate(language, `common.${key}`),
    player: (key: keyof TranslationKeys['player']) => translate(language, `player.${key}`),
    settings: (key: keyof TranslationKeys['settings']) => translate(language, `settings.${key}`),
    weather: (key: keyof TranslationKeys['weather']) => translate(language, `weather.${key}`),
    spotify: (key: keyof TranslationKeys['spotify']) => translate(language, `spotify.${key}`),
    dashboard: (key: keyof TranslationKeys['dashboard']) => translate(language, `dashboard.${key}`),
    admin: (key: keyof TranslationKeys['admin']) => translate(language, `admin.${key}`),
    auth: (key: keyof TranslationKeys['auth']) => translate(language, `auth.${key}`),
    commandDeck: (key: keyof TranslationKeys['commandDeck']) => translate(language, `commandDeck.${key}`),
    system: (key: keyof TranslationKeys['system']) => translate(language, `system.${key}`),
    spicetify: (key: keyof TranslationKeys['spicetify']) => translate(language, `spicetify.${key}`),
    storj: (key: keyof TranslationKeys['storj']) => translate(language, `storj.${key}`),
    localMusic: (key: keyof TranslationKeys['localMusic']) => translate(language, `localMusic.${key}`),
    language,
  };
}
