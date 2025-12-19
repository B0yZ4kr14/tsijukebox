import { useTranslation } from '@/hooks/common';

export function SkipLink() {
  const { t } = useTranslation();
  
  return (
    <a 
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-kiosk-surface focus:text-cyan-400 focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-cyan-500 focus:shadow-[0_0_10px_hsl(185_100%_50%/0.4)] focus:outline-none"
    >
      {t('accessibility.skipToContent')}
    </a>
  );
}
