import { useState } from 'react';
import { Cloud, CloudUpload, Settings, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface CloudBackupSectionProps {
  isDemoMode: boolean;
}

type CloudProvider = 'aws' | 'gdrive' | 'dropbox' | 'mega' | 'onedrive' | 'storj';

interface CloudConfig {
  provider: CloudProvider | '';
  awsBucket?: string;
  awsAccessKey?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  megaEmail?: string;
  megaPassword?: string;
  storjAccessGrant?: string;
  isOAuthConnected?: boolean;
}

const cloudProviders = [
  { id: 'aws', name: 'AWS S3', icon: '☁️', needsOAuth: false },
  { id: 'gdrive', name: 'Google Drive', icon: '📁', needsOAuth: true },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', needsOAuth: true },
  { id: 'mega', name: 'MEGA', icon: '🔒', needsOAuth: false },
  { id: 'onedrive', name: 'OneDrive', icon: '☁️', needsOAuth: true },
  { id: 'storj', name: 'Storj', icon: '🛰️', needsOAuth: false },
];

export function CloudBackupSection({ isDemoMode }: CloudBackupSectionProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<CloudConfig>({ provider: '' });
  const [showSecrets, setShowSecrets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleProviderChange = (provider: string) => {
    setConfig({ provider: provider as CloudProvider });
  };

  const handleSaveConfig = async () => {
    if (isDemoMode) {
      toast.info(`Demo: ${t('cloudBackup.configSaved')}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/backup/cloud/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(t('cloudBackup.configSaved'));
      } else {
        toast.error(`${t('cloudBackup.syncError')}: ${result.message}`);
      }
    } catch (error) {
      toast.error(t('cloudBackup.syncError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthConnect = async (provider: CloudProvider) => {
    if (isDemoMode) {
      toast.info(`Demo: ${t('cloudBackup.authenticate')}`);
      return;
    }

    try {
      const response = await fetch(`/api/backup/cloud/oauth/${provider}`, {
        method: 'GET',
      });
      const result = await response.json();
      
      if (result.authUrl) {
        window.location.href = result.authUrl;
      }
    } catch (error) {
      toast.error(t('cloudBackup.syncError'));
    }
  };

  const handleSync = async () => {
    if (isDemoMode) {
      toast.info(`Demo: ${t('cloudBackup.syncNow')}`);
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/backup/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(t('cloudBackup.syncSuccess'));
      } else {
        toast.error(`${t('cloudBackup.syncError')}: ${result.message}`);
      }
    } catch (error) {
      toast.error(t('cloudBackup.syncError'));
    } finally {
      setIsSyncing(false);
    }
  };

  const currentProvider = cloudProviders.find(p => p.id === config.provider);

  return (
    <SettingsSection
      icon={<Cloud className="w-5 h-5 icon-neon-blue" />}
      title={t('cloudBackup.title')}
      description={t('cloudBackup.description')}
      badge={
        config.provider ? (
          <Badge variant="outline" className="ml-2 border-kiosk-primary/50 text-kiosk-primary">
            {currentProvider?.name}
          </Badge>
        ) : null
      }
      delay={0.25}
    >
      <div className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label className="text-label-yellow">{t('cloudBackup.provider')}</Label>
          <Select value={config.provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="bg-kiosk-background border-kiosk-border text-kiosk-text">
              <SelectValue placeholder={t('cloudBackup.selectProvider')} />
            </SelectTrigger>
            <SelectContent>
              {cloudProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <span className="flex items-center gap-2">
                    <span>{provider.icon}</span>
                    <span>{provider.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Provider-specific Configuration */}
        {config.provider === 'aws' && (
          <div className="space-y-3 p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border card-option-neon">
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.bucketName')}</Label>
              <Input
                value={config.awsBucket || ''}
                onChange={(e) => setConfig({ ...config, awsBucket: e.target.value })}
                placeholder="my-backup-bucket"
                className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm"
                disabled={isDemoMode}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.accessKey')}</Label>
              <Input
                value={config.awsAccessKey || ''}
                onChange={(e) => setConfig({ ...config, awsAccessKey: e.target.value })}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm font-mono"
                disabled={isDemoMode}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.secretKey')}</Label>
              <div className="relative">
                <Input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.awsSecretKey || ''}
                  onChange={(e) => setConfig({ ...config, awsSecretKey: e.target.value })}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm font-mono pr-10"
                  disabled={isDemoMode}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-kiosk-text/50 hover:text-kiosk-text"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.region')}</Label>
              <Input
                value={config.awsRegion || ''}
                onChange={(e) => setConfig({ ...config, awsRegion: e.target.value })}
                placeholder="us-east-1"
                className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm"
                disabled={isDemoMode}
              />
            </div>
          </div>
        )}

        {config.provider === 'mega' && (
          <div className="space-y-3 p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border card-option-neon">
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.email')}</Label>
              <Input
                type="email"
                value={config.megaEmail || ''}
                onChange={(e) => setConfig({ ...config, megaEmail: e.target.value })}
                placeholder="seu@email.com"
                className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm"
                disabled={isDemoMode}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.password')}</Label>
              <div className="relative">
                <Input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.megaPassword || ''}
                  onChange={(e) => setConfig({ ...config, megaPassword: e.target.value })}
                  placeholder="••••••••"
                  className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm pr-10"
                  disabled={isDemoMode}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-kiosk-text/50 hover:text-kiosk-text"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {config.provider === 'storj' && (
          <div className="space-y-3 p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border card-option-neon">
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.accessGrant')}</Label>
              <div className="relative">
                <Input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.storjAccessGrant || ''}
                  onChange={(e) => setConfig({ ...config, storjAccessGrant: e.target.value })}
                  placeholder="1DZZn..."
                  className="bg-kiosk-background border-kiosk-border text-kiosk-text text-sm font-mono pr-10"
                  disabled={isDemoMode}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-kiosk-text/50 hover:text-kiosk-text"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* OAuth Providers */}
        {currentProvider?.needsOAuth && (
          <div className="p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border card-option-neon">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-kiosk-text">
                  {currentProvider.icon} {currentProvider.name}
                </p>
                <p className="text-xs text-kiosk-text/75">
                  {config.isOAuthConnected ? t('cloudBackup.authenticated') : t('cloudBackup.authenticate')}
                </p>
              </div>
              <Button
                onClick={() => handleOAuthConnect(config.provider as CloudProvider)}
                disabled={isDemoMode}
                variant={config.isOAuthConnected ? 'outline' : 'default'}
                className={config.isOAuthConnected ? 'border-green-500/50 text-green-400' : 'bg-kiosk-primary hover:bg-kiosk-primary/90'}
              >
                {config.isOAuthConnected ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('cloudBackup.authenticated')}
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('cloudBackup.authenticate')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {config.provider && (
          <>
            <Separator className="bg-kiosk-border" />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSaveConfig}
                disabled={isDemoMode || isLoading}
                className="flex-1 bg-kiosk-primary hover:bg-kiosk-primary/90"
              >
                {isLoading ? (
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                {t('cloudBackup.saveConfig')}
              </Button>
              <Button
                onClick={handleSync}
                disabled={isDemoMode || isSyncing}
                variant="outline"
                className="flex-1 border-kiosk-border hover:bg-kiosk-surface/80"
              >
                {isSyncing ? (
                  <CloudUpload className="w-4 h-4 mr-2 animate-bounce" />
                ) : (
                  <CloudUpload className="w-4 h-4 mr-2" />
                )}
                {t('cloudBackup.syncNow')}
              </Button>
            </div>
          </>
        )}

        {isDemoMode && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-400">
              {t('cloudBackup.demoWarning')}
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}