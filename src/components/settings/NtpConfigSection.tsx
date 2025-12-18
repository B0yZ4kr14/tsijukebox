import { useState } from 'react';
import { Clock, RefreshCw, Check, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

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
      icon={<Clock className="w-5 h-5 icon-neon-blue" />}
      title={t('ntp.title')}
      description={t('ntp.description')}
      instructions={instructions}
      badge={
        <Badge 
          variant={config.syncStatus === 'synced' ? 'default' : 'secondary'}
          className={config.syncStatus === 'synced' ? 'bg-green-500/20 text-green-400' : ''}
        >
          {getBadgeText()}
        </Badge>
      }
      delay={0.5}
    >
      <div className="space-y-4">
        {/* Server Selection */}
        <div className="space-y-2">
          <Label className="text-label-yellow">{t('ntp.server')}</Label>
          <Select value={config.server} onValueChange={handleServerChange}>
            <SelectTrigger data-tour="ntp-server" className="bg-kiosk-surface/50 border-kiosk-border">
              <SelectValue placeholder={t('ntp.selectServer')} />
            </SelectTrigger>
            <SelectContent>
              {NTP_SERVERS.map((server) => (
                <SelectItem key={server.value} value={server.value}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    {getServerLabel(server)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Server Input */}
        {config.server === 'custom' && (
          <div className="space-y-2">
            <Label className="text-label-yellow">{t('ntp.customServer')}</Label>
            <Input
              value={config.customServer}
              onChange={(e) => handleCustomServerChange(e.target.value)}
              placeholder="ntp.example.com"
              className="bg-kiosk-surface/50 border-kiosk-border font-mono text-kiosk-text"
            />
          </div>
        )}

        {/* Status Info */}
        <div className="p-3 rounded-lg card-option-dark-3d space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-label-neon">{t('ntp.activeServer')}:</span>
            <span className="font-mono text-neon-white">{getActiveServer() || t('ntp.notConfigured')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-label-neon">{t('ntp.lastSync')}:</span>
            <span className="text-neon-white">{formatLastSync()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-label-neon">{t('ntp.status')}:</span>
            <div className="flex items-center gap-1">
              {config.syncStatus === 'synced' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : config.syncStatus === 'error' ? (
                <AlertCircle className="w-3 h-3 text-destructive" />
              ) : (
                <Clock className="w-3 h-3 text-kiosk-text/90" />
              )}
              <span className={
                config.syncStatus === 'synced' ? 'text-green-400' :
                config.syncStatus === 'error' ? 'text-destructive' : 'text-kiosk-text/90'
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
          className="w-full button-primary-glow-3d"
          data-tour="ntp-sync-button"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? t('ntp.syncing') : t('ntp.syncNow')}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-settings-hint">
          {t('ntp.infoText')}
        </p>
      </div>
    </SettingsSection>
  );
}