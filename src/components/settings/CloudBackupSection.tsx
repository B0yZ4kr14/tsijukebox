import { useState } from 'react';
import { Cloud, CloudUpload, Settings, Check, AlertCircle, Eye, EyeOff, FolderSync, Package, Lock, CloudCog, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SettingsSection } from './SettingsSection';
import { CloudProviderHelp } from './CloudProviderHelp';
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

const cloudProviders: { id: CloudProvider; name: string; icon: React.ReactNode; needsOAuth: boolean }[] = [
  { id: 'aws', name: 'AWS S3', icon: <Cloud className="w-4 h-4 icon-neon-blue" />, needsOAuth: false },
  { id: 'gdrive', name: 'Google Drive', icon: <FolderSync className="w-4 h-4 icon-neon-blue" />, needsOAuth: true },
  { id: 'dropbox', name: 'Dropbox', icon: <Package className="w-4 h-4 icon-neon-blue" />, needsOAuth: true },
  { id: 'mega', name: 'MEGA', icon: <Lock className="w-4 h-4 icon-neon-blue" />, needsOAuth: false },
  { id: 'onedrive', name: 'OneDrive', icon: <CloudCog className="w-4 h-4 icon-neon-blue" />, needsOAuth: true },
  { id: 'storj', name: 'Storj', icon: <Satellite className="w-4 h-4 icon-neon-blue" />, needsOAuth: false },
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
          <Badge variant="outline" className="ml-2 border-cyan-500/50 text-cyan-400">
            {currentProvider?.name}
          </Badge>
        ) : null
      }
      delay={0.25}
    >
      <div className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-label-yellow">{t('cloudBackup.provider')}</Label>
            {config.provider && <CloudProviderHelp provider={config.provider as CloudProvider} />}
          </div>
          <Select value={config.provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="input-3d bg-kiosk-bg border-kiosk-border text-white">
              <SelectValue placeholder={t('cloudBackup.selectProvider')} />
            </SelectTrigger>
            <SelectContent>
              {cloudProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <span className="flex items-center gap-2">
                    {provider.icon}
                    <span>{provider.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Provider-specific Configuration */}
        {config.provider === 'aws' && (
          <div className="space-y-3 p-3 rounded-lg card-option-dark-3d">
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.bucketName')}</Label>
              <Input
                value={config.awsBucket || ''}
                onChange={(e) => setConfig({ ...config, awsBucket: e.target.value })}
                placeholder="my-backup-bucket"
                className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm"
                disabled={isDemoMode}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.accessKey')}</Label>
              <Input
                value={config.awsAccessKey || ''}
                onChange={(e) => setConfig({ ...config, awsAccessKey: e.target.value })}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm font-mono"
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
                  className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm font-mono pr-10"
                  disabled={isDemoMode}
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 button-action-neon"
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
                className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm"
                disabled={isDemoMode}
              />
            </div>
          </div>
        )}

        {config.provider === 'mega' && (
          <div className="space-y-3 p-3 rounded-lg card-option-dark-3d">
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.email')}</Label>
              <Input
                type="email"
                value={config.megaEmail || ''}
                onChange={(e) => setConfig({ ...config, megaEmail: e.target.value })}
                placeholder="seu@email.com"
                className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm"
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
                  className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm pr-10"
                  disabled={isDemoMode}
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 button-action-neon"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {config.provider === 'storj' && (
          <div className="space-y-3 p-3 rounded-lg card-option-dark-3d">
            <div className="space-y-2">
              <Label className="text-label-yellow text-sm">{t('cloudBackup.accessGrant')}</Label>
              <div className="relative">
                <Input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.storjAccessGrant || ''}
                  onChange={(e) => setConfig({ ...config, storjAccessGrant: e.target.value })}
                  placeholder="1DZZn..."
                  className="input-3d bg-kiosk-bg border-kiosk-border text-kiosk-text text-sm font-mono pr-10"
                  disabled={isDemoMode}
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 button-action-neon"
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
          <div className="p-3 rounded-lg card-option-dark-3d">
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
                className={config.isOAuthConnected ? 'button-action-neon' : 'button-primary-glow-3d'}
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
                className="flex-1 button-primary-glow-3d ripple-effect"
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
                className="flex-1 button-outline-neon ripple-effect"
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