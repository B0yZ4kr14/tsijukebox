import { useState, useEffect } from 'react';
import { LineChart, Activity, ExternalLink, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface SystemUrls {
  dashboardUrl: string;
  datasourceUrl: string;
}

const DEFAULT_URLS: SystemUrls = {
  dashboardUrl: 'http://localhost:3000',
  datasourceUrl: 'http://localhost:9090',
};

export function SystemUrlsSection() {
  const { t } = useTranslation();
  const [urls, setUrls] = useState<SystemUrls>(DEFAULT_URLS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('system_urls');
    if (saved) {
      try {
        setUrls(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  const handleChange = (key: keyof SystemUrls, value: string) => {
    setUrls(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      // Basic URL validation
      new URL(urls.dashboardUrl);
      new URL(urls.datasourceUrl);
      
      localStorage.setItem('system_urls', JSON.stringify(urls));
      setHasChanges(false);
      toast.success(t('systemUrls.savedSuccess'));
    } catch {
      toast.error(t('systemUrls.invalidUrl'));
    }
  };

  const handleTestUrl = (url: string, name: string) => {
    try {
      new URL(url);
      window.open(url, '_blank');
    } catch {
      toast.error(t('systemUrls.invalidUrl'));
    }
  };

  return (
    <SettingsSection
      icon={<LineChart className="w-5 h-5 icon-neon-blue" />}
      title={t('systemUrls.title')}
      description={t('systemUrls.description')}
      delay={0.15}
      instructions={{
        title: "🔗 O que são URLs de Sistema?",
        steps: [
          "URLs são 'endereços' que permitem acessar diferentes partes do sistema.",
          "Dashboard (Grafana): Mostra gráficos de uso do servidor em tempo real.",
          "Datasource (Prometheus): Coleta métricas de performance do sistema.",
          "Você pode alterar essas URLs se seus serviços estiverem em outro endereço."
        ],
        tips: [
          "💡 As URLs padrão funcionam para instalação local",
          "💡 Use 'http://' para endereços locais e 'https://' para remotos"
        ]
      }}
    >
      <div className="space-y-4">
        {/* Dashboard URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 icon-neon-blue" />
            <Label htmlFor="dashboardUrl" className="text-label-yellow">
              {t('systemUrls.dashboardUrl')}
            </Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="dashboardUrl"
              value={urls.dashboardUrl}
              onChange={(e) => handleChange('dashboardUrl', e.target.value)}
              placeholder="http://localhost:3000"
              className="input-3d bg-kiosk-bg border-kiosk-surface text-kiosk-text font-mono text-sm flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestUrl(urls.dashboardUrl, 'Dashboard')}
              className="card-neon-border text-cyan-400 hover:bg-cyan-500/10"
              title={t('systemUrls.testUrl')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-settings-hint">
            {t('systemUrls.dashboardHint')}
          </p>
        </div>

        {/* Datasource URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 icon-neon-blue" />
            <Label htmlFor="datasourceUrl" className="text-label-yellow">
              {t('systemUrls.datasourceUrl')}
            </Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="datasourceUrl"
              value={urls.datasourceUrl}
              onChange={(e) => handleChange('datasourceUrl', e.target.value)}
              placeholder="http://localhost:9090"
              className="input-3d bg-kiosk-bg border-kiosk-surface text-kiosk-text font-mono text-sm flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestUrl(urls.datasourceUrl, 'Datasource')}
              className="card-neon-border text-cyan-400 hover:bg-cyan-500/10"
              title={t('systemUrls.testUrl')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-settings-hint">
            {t('systemUrls.datasourceHint')}
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('systemUrls.saveUrls')}
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
