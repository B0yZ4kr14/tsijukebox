import { useState, useRef } from 'react';
import { Cloud, CloudUpload, Settings, Check, AlertCircle, Eye, EyeOff, FolderSync, Package, Lock, CloudCog, Satellite, Download, Upload, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { SettingsSection } from './SettingsSection';
import { CloudProviderHelp } from './CloudProviderHelp';
import { useTranslation } from '@/hooks';
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
  const [includeCredentials, setIncludeCredentials] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export config to JSON
  const handleExportConfig = () => {
    if (!config.provider) {
      toast.error(t('cloudBackup.selectProviderFirst'));
      return;
    }

    const exportData = {
      version: '1.0',
      application: 'TSiJUKEBOX',
      exportedAt: new Date().toISOString(),
      provider: config.provider,
      config: {
        provider: config.provider,
        awsBucket: config.awsBucket || undefined,
        awsAccessKey: config.awsAccessKey || undefined,
        awsSecretKey: includeCredentials ? config.awsSecretKey : (config.awsSecretKey ? '***MASKED***' : undefined),
        awsRegion: config.awsRegion || undefined,
        megaEmail: config.megaEmail || undefined,
        megaPassword: includeCredentials ? config.megaPassword : (config.megaPassword ? '***MASKED***' : undefined),
        storjAccessGrant: includeCredentials ? config.storjAccessGrant : (config.storjAccessGrant ? '***MASKED***' : undefined),
        isOAuthConnected: config.isOAuthConnected || undefined,
      },
      notes: includeCredentials 
        ? 'ATENÇÃO: Este arquivo contém credenciais sensíveis. Mantenha em local seguro!'
        : 'Credenciais sensíveis foram mascaradas. Preencha-as manualmente após importar.',
    };

    // Remove undefined values
    Object.keys(exportData.config).forEach(key => {
      if (exportData.config[key as keyof typeof exportData.config] === undefined) {
        delete exportData.config[key as keyof typeof exportData.config];
      }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tsi-jukebox-cloud-backup-${config.provider}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t('cloudBackup.exportSuccess'));
  };

  // Import config from JSON
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        // Validate structure
        if (!imported.provider || !imported.config) {
          toast.error(t('cloudBackup.importInvalidFormat'));
          return;
        }

        // Check version compatibility
        if (imported.version && imported.version !== '1.0') {
          toast.warning(t('cloudBackup.importVersionWarning'));
        }

        const newConfig: CloudConfig = {
          provider: imported.provider as CloudProvider,
          awsBucket: imported.config.awsBucket,
          awsAccessKey: imported.config.awsAccessKey,
          awsSecretKey: imported.config.awsSecretKey === '***MASKED***' ? '' : imported.config.awsSecretKey,
          awsRegion: imported.config.awsRegion,
          megaEmail: imported.config.megaEmail,
          megaPassword: imported.config.megaPassword === '***MASKED***' ? '' : imported.config.megaPassword,
          storjAccessGrant: imported.config.storjAccessGrant === '***MASKED***' ? '' : imported.config.storjAccessGrant,
          isOAuthConnected: imported.config.isOAuthConnected,
        };

        setConfig(newConfig);

        // Check if masked credentials need to be filled
        const hasMasked = imported.config.awsSecretKey === '***MASKED***' || 
                         imported.config.megaPassword === '***MASKED***' || 
                         imported.config.storjAccessGrant === '***MASKED***';

        if (hasMasked) {
          toast.success(t('cloudBackup.importSuccessWithMasked'));
        } else {
          toast.success(t('cloudBackup.importSuccess'));
        }
      } catch (error) {
        toast.error(t('cloudBackup.importError'));
      }
    };
    reader.readAsText(file);

    // Reset input value to allow importing the same file again
    event.target.value = '';
  };

  const handleProviderChange = (provider: string) => {
    setConfig({ provider: provider as CloudProvider });
  };

  // Validate required fields
  const validateConfig = (): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    if (!config.provider) {
      missingFields.push(t('cloudBackup.provider'));
      return { isValid: false, missingFields };
    }

    switch (config.provider) {
      case 'aws':
        if (!config.awsBucket?.trim()) missingFields.push(t('cloudBackup.bucketName'));
        if (!config.awsAccessKey?.trim()) missingFields.push(t('cloudBackup.accessKey'));
        if (!config.awsSecretKey?.trim()) missingFields.push(t('cloudBackup.secretKey'));
        if (!config.awsRegion?.trim()) missingFields.push(t('cloudBackup.region'));
        break;
      case 'mega':
        if (!config.megaEmail?.trim()) missingFields.push(t('cloudBackup.email'));
        if (!config.megaPassword?.trim()) missingFields.push(t('cloudBackup.password'));
        break;
      case 'storj':
        if (!config.storjAccessGrant?.trim()) missingFields.push(t('cloudBackup.accessGrant'));
        break;
      case 'gdrive':
      case 'dropbox':
      case 'onedrive':
        if (!config.isOAuthConnected) missingFields.push(t('cloudBackup.oauthRequired'));
        break;
    }

    return { isValid: missingFields.length === 0, missingFields };
  };

  const handleSaveConfig = async () => {
    const { isValid, missingFields } = validateConfig();

    if (!isValid) {
      toast.error(
        <div>
          <p className="font-semibold">{t('cloudBackup.missingFieldsTitle')}</p>
          <ul className="list-disc list-inside mt-1 text-sm">
            {missingFields.map((field, i) => (
              <li key={i}>{field}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

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
                <p className="text-xs text-kiosk-text/90">
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

        {/* Migration Section */}
        <Separator className="bg-kiosk-border" />
        
        <div className="space-y-3">
          <Label className="text-label-orange flex items-center gap-2">
            <Download className="w-4 h-4 icon-neon-blue" />
            {t('cloudBackup.migration.title')}
          </Label>
          
          <p className="text-xs text-kiosk-text/90">
            {t('cloudBackup.migration.description')}
          </p>

          {/* Include credentials checkbox */}
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Checkbox
              id="includeCredentials"
              checked={includeCredentials}
              onCheckedChange={(checked) => setIncludeCredentials(checked === true)}
              className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <div className="flex-1">
              <label
                htmlFor="includeCredentials"
                className="text-sm text-amber-400 cursor-pointer"
              >
                {t('cloudBackup.migration.includeCredentials')}
              </label>
              <p className="text-xs text-amber-400/70">
                {t('cloudBackup.migration.includeCredentialsWarning')}
              </p>
            </div>
          </div>

          {/* Export/Import buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExportConfig}
              disabled={!config.provider}
              className="flex-1 button-outline-neon ripple-effect"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('cloudBackup.migration.export')}
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 button-outline-neon ripple-effect"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('cloudBackup.migration.import')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-cyan-400">
              {t('cloudBackup.migration.info')}
            </p>
          </div>
        </div>

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