import { useState, useEffect } from 'react';
import { LineChart, Activity, ExternalLink, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks';
import { toast } from 'sonner';

interface SystemUrls {
  dashboardUrl: string;
  datasourceUrl: string;
}

const DEFAULT_URLS: SystemUrls = {
  dashboardUrl: 'http://localhost:3000',
  datasourceUrl: 'http://localhost:9090',
};

/**
 * SystemUrlsSection Component
 * 
 * Gerencia URLs de sistema (Dashboard e Datasource) com validação em tempo real.
 * Refatorado para usar design tokens do Design System.
 * 
 * @component
 */
export function SystemUrlsSection() {
  const { t } = useTranslation();
  const [urls, setUrls] = useState<SystemUrls>(DEFAULT_URLS);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    dashboard: boolean;
    datasource: boolean;
  }>({
    dashboard: true,
    datasource: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('system_urls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUrls(parsed);
        validateUrls(parsed);
      } catch {
        // Use defaults
      }
    }
  }, []);

  const validateUrls = (urlsToValidate: SystemUrls) => {
    try {
      new URL(urlsToValidate.dashboardUrl);
      setValidationStatus(prev => ({ ...prev, dashboard: true }));
    } catch {
      setValidationStatus(prev => ({ ...prev, dashboard: false }));
    }

    try {
      new URL(urlsToValidate.datasourceUrl);
      setValidationStatus(prev => ({ ...prev, datasource: true }));
    } catch {
      setValidationStatus(prev => ({ ...prev, datasource: false }));
    }
  };

  const handleChange = (key: keyof SystemUrls, value: string) => {
    const newUrls = { ...urls, [key]: value };
    setUrls(newUrls);
    setHasChanges(true);
    validateUrls(newUrls);
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
      icon={<LineChart className="w-5 h-5 text-accent-cyan drop-shadow-glow-cyan" />}
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
      <div className="space-y-6">
        {/* Dashboard URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-accent-cyan drop-shadow-glow-cyan" />
              <Label htmlFor="dashboardUrl" className="text-text-primary font-medium">
                {t('systemUrls.dashboardUrl')}
              </Label>
            </div>
            <Badge variant={validationStatus.dashboard ? "success" : "error"} size="sm">
              {validationStatus.dashboard ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Válida
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Inválida
                </>
              )}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              id="dashboardUrl"
              data-tour="system-dashboard-url"
              value={urls.dashboardUrl}
              onChange={(e) => handleChange('dashboardUrl', e.target.value)}
              placeholder="http://localhost:3000"
              className="flex-1 bg-bg-secondary/80 backdrop-blur-sm border-border-primary text-text-primary font-mono text-sm transition-all duration-normal focus:border-accent-cyan focus:shadow-glow-cyan"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestUrl(urls.dashboardUrl, 'Dashboard')}
              className="border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-glow-cyan transition-all duration-normal"
              title={t('systemUrls.testUrl')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            {t('systemUrls.dashboardHint')}
          </p>
        </div>

        {/* Datasource URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan drop-shadow-glow-cyan" />
              <Label htmlFor="datasourceUrl" className="text-text-primary font-medium">
                {t('systemUrls.datasourceUrl')}
              </Label>
            </div>
            <Badge variant={validationStatus.datasource ? "success" : "error"} size="sm">
              {validationStatus.datasource ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Válida
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Inválida
                </>
              )}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              id="datasourceUrl"
              data-tour="system-datasource-url"
              value={urls.datasourceUrl}
              onChange={(e) => handleChange('datasourceUrl', e.target.value)}
              placeholder="http://localhost:9090"
              className="flex-1 bg-bg-secondary/80 backdrop-blur-sm border-border-primary text-text-primary font-mono text-sm transition-all duration-normal focus:border-accent-cyan focus:shadow-glow-cyan"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestUrl(urls.datasourceUrl, 'Datasource')}
              className="border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-glow-cyan transition-all duration-normal"
              title={t('systemUrls.testUrl')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            {t('systemUrls.datasourceHint')}
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={!validationStatus.dashboard || !validationStatus.datasource}
            className="w-full bg-accent-cyan hover:bg-accent-cyan/90 text-text-primary shadow-glow-cyan transition-all duration-normal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('systemUrls.saveUrls')}
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
