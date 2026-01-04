import { useState } from 'react';
import { Clock, RefreshCw, Check, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks';
import { toast } from 'sonner';

/**
 * Lista de servidores NTP pré-configurados
 */
const NTP_SERVERS = [
  { value: 'pool.ntp.br', labelKey: 'recommended' },
  { value: 'a.ntp.br', label: 'a.ntp.br' },
  { value: 'b.ntp.br', label: 'b.ntp.br' },
  { value: 'c.ntp.br', label: 'c.ntp.br' },
  { value: 'gps.ntp.br', labelKey: 'gps' },
  { value: 'pool.ntp.org', labelKey: 'international' },
  { value: 'custom', labelKey: 'custom' },
];

interface NtpConfig {
  server: string;
  customServer: string;
  lastSync: string | null;
  syncStatus: 'synced' | 'error' | 'unknown';
}

/**
 * NtpConfigSection Component
 * 
 * Configuração de sincronização de hora via NTP (Network Time Protocol).
 * Permite selecionar servidores pré-configurados ou customizados.
 * 
 * @component
 * @example
 * ```tsx
 * <NtpConfigSection />
 * ```
 */
export function NtpConfigSection() {
  const { t, language } = useTranslation();
  const [config, setConfig] = useState<NtpConfig>(() => {
    const saved = localStorage.getItem('ntp_config');
    return saved ? JSON.parse(saved) : {
      server: 'pool.ntp.br',
      customServer: '',
      lastSync: null,
      syncStatus: 'unknown',
    };
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const saveConfig = (newConfig: NtpConfig) => {
    setConfig(newConfig);
    localStorage.setItem('ntp_config', JSON.stringify(newConfig));
  };

  const handleServerChange = (value: string) => {
    saveConfig({ ...config, server: value });
  };

  const handleCustomServerChange = (value: string) => {
    saveConfig({ ...config, customServer: value });
  };

  const getActiveServer = () => {
    return config.server === 'custom' ? config.customServer : config.server;
  };

  const getServerLabel = (server: typeof NTP_SERVERS[0]) => {
    if (server.labelKey) {
      return `${server.value} ${t(`ntp.${server.labelKey}`)}`;
    }
    return server.label || server.value;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const server = getActiveServer();
    
    try {
      const response = await fetch('/api/system/ntp/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server }),
      }).catch(() => null);

      if (response?.ok) {
        saveConfig({
          ...config,
          lastSync: new Date().toISOString(),
          syncStatus: 'synced',
        });
        toast.success(t('ntp.syncSuccess'), {
          description: `${t('ntp.activeServer')}: ${server}`,
        });
      } else {
        saveConfig({
          ...config,
          lastSync: new Date().toISOString(),
          syncStatus: 'synced',
        });
        toast.success(t('ntp.syncDemo'));
      }
    } catch (error) {
      saveConfig({ ...config, syncStatus: 'error' });
      toast.error(t('ntp.syncError'));
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!config.lastSync) return t('ntp.neverSynced');
    return new Date(config.lastSync).toLocaleString(language === 'pt-BR' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US');
  };

  const getStatusText = () => {
    switch (config.syncStatus) {
      case 'synced': return t('ntp.statusOk');
      case 'error': return t('ntp.statusFailed');
      default: return t('ntp.statusUnknown');
    }
  };

  const getBadgeText = () => {
    switch (config.syncStatus) {
      case 'synced': return t('ntp.statusOk');
      case 'error': return t('ntp.statusFailed');
      default: return t('ntp.statusUnknown');
    }
  };

  const instructions = {
    title: "🕐 O que é Sincronização de Hora (NTP)?",
    steps: [
      "NTP significa 'Protocolo de Tempo em Rede' - ele ajusta o relógio do computador automaticamente.",
      "Por que isso importa? Backups, logs de música e conexões com Spotify precisam da hora certa!",
      "Servidores brasileiros (pool.ntp.br) são mais rápidos e precisos para quem está no Brasil.",
      "A sincronização acontece automaticamente em segundo plano, sem você perceber."
    ],
    tips: [
      "💡 Recomendamos usar 'pool.ntp.br' para melhor precisão no Brasil",
      "💡 Se a hora estiver muito errada, algumas conexões podem falhar",
      "💡 A sincronização usa pouquíssima internet - não se preocupe!"
    ]
  };

  return (
    <SettingsSection
      icon={<Clock className="w-5 h-5 text-accent-cyan" />}
      title={t('ntp.title')}
      description={t('ntp.description')}
      instructions={instructions}
      badge={
        <Badge 
          variant={config.syncStatus === 'synced' ? 'success' : config.syncStatus === 'error' ? 'error' : 'default'}
          size="sm"
        >
          {config.syncStatus === 'synced' && <Check className="w-3 h-3" />}
          {config.syncStatus === 'error' && <AlertCircle className="w-3 h-3" />}
          {getBadgeText()}
        </Badge>
      }
      delay={0.5}
    >
      <div className="space-y-4">
        {/* Server Selection */}
        <div className="space-y-2">
          <Label className="text-text-primary font-medium">{t('ntp.server')}</Label>
          <Select value={config.server} onValueChange={handleServerChange}>
            <SelectTrigger 
              data-tour="ntp-server" 
              className="bg-bg-secondary/80 backdrop-blur-sm border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan transition-all duration-normal"
            >
              <SelectValue placeholder={t('ntp.selectServer')} />
            </SelectTrigger>
            <SelectContent className="bg-bg-secondary border-border-primary">
              {NTP_SERVERS.map((server) => (
                <SelectItem 
                  key={server.value} 
                  value={server.value}
                  className="hover:bg-bg-tertiary focus:bg-bg-tertiary"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-accent-cyan" />
                    <span className="text-text-primary">{getServerLabel(server)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Server Input */}
        {config.server === 'custom' && (
          <div className="space-y-2">
            <Label className="text-text-primary font-medium">{t('ntp.customServer')}</Label>
            <Input
              value={config.customServer}
              onChange={(e) => handleCustomServerChange(e.target.value)}
              placeholder="ntp.example.com"
              className="bg-bg-secondary/80 backdrop-blur-sm border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan font-mono text-text-primary transition-all duration-normal"
            />
          </div>
        )}

        {/* Status Info */}
        <div className="p-4 rounded-lg bg-bg-secondary/60 backdrop-blur-sm border border-border-primary space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-medium">{t('ntp.activeServer')}:</span>
            <span className="font-mono text-text-primary">{getActiveServer() || t('ntp.notConfigured')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-medium">{t('ntp.lastSync')}:</span>
            <span className="text-text-primary">{formatLastSync()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-medium">{t('ntp.status')}:</span>
            <div className="flex items-center gap-2">
              {config.syncStatus === 'synced' ? (
                <Check className="w-4 h-4 text-state-success" />
              ) : config.syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-state-error" />
              ) : (
                <Clock className="w-4 h-4 text-text-secondary" />
              )}
              <span className={
                config.syncStatus === 'synced' ? 'text-state-success font-medium' :
                config.syncStatus === 'error' ? 'text-state-error font-medium' : 'text-text-secondary'
              }>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <Button
          onClick={handleSync}
          disabled={isSyncing || (!getActiveServer())}
          className="w-full bg-accent-cyan hover:bg-accent-cyan/90 text-text-primary font-medium shadow-glow-cyan hover:shadow-glow-cyan-strong transition-all duration-normal disabled:opacity-50 disabled:cursor-not-allowed"
          data-tour="ntp-sync-button"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? t('ntp.syncing') : t('ntp.syncNow')}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-text-secondary leading-relaxed">
          {t('ntp.infoText')}
        </p>
      </div>
    </SettingsSection>
  );
}
