import { useState, useEffect } from 'react';
import { LineChart, Activity, ExternalLink, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
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
      toast.success('URLs salvas com sucesso');
    } catch {
      toast.error('URL inválida. Verifique o formato.');
    }
  };

  const handleTestUrl = (url: string, name: string) => {
    try {
      new URL(url);
      window.open(url, '_blank');
    } catch {
      toast.error(`URL inválida para ${name}`);
    }
  };

  return (
    <SettingsSection
      icon={<LineChart className="w-5 h-5 text-cyan-400" />}
      title="URLs do Sistema"
      description="Configure os endereços dos painéis de monitoramento"
      delay={0.15}
    >
      <div className="space-y-4">
        {/* Dashboard URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-cyan-400" />
            <Label htmlFor="dashboardUrl" className="text-kiosk-text">
              Dashboard URL
            </Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="dashboardUrl"
              value={urls.dashboardUrl}
              onChange={(e) => handleChange('dashboardUrl', e.target.value)}
              placeholder="http://localhost:3000"
              className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestUrl(urls.dashboardUrl, 'Dashboard')}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              title="Testar URL"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-kiosk-text/70">
            Painel de visualização de métricas e gráficos
          </p>
        </div>

        {/* Datasource URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <Label htmlFor="datasourceUrl" className="text-kiosk-text">
              Datasource URL
            </Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="datasourceUrl"
              value={urls.datasourceUrl}
              onChange={(e) => handleChange('datasourceUrl', e.target.value)}
              placeholder="http://localhost:9090"
              className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestUrl(urls.datasourceUrl, 'Datasource')}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              title="Testar URL"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-kiosk-text/70">
            Fonte de dados e métricas do sistema
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar URLs
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
