import { useState, useRef } from 'react';
import { Download, Upload, FileJson, AlertTriangle, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SettingsExport {
  version: string;
  exportedAt: string;
  settings: {
    isDemoMode: boolean;
    apiUrl: string;
    useWebSocket: boolean;
    pollingInterval: number;
    spotify: {
      clientId: string;
      clientSecret?: string; // Masked by default
    };
    weather: {
      apiKey?: string; // Masked by default
      city: string;
      isEnabled: boolean;
    };
    language: string;
    theme: string;
    soundEnabled: boolean;
    animationsEnabled: boolean;
    // Custom settings from localStorage
    backupSchedule?: unknown;
    customUsers?: unknown;
    cloudBackup?: unknown;
  };
}

export function ConfigBackupSection() {
  const settings = useSettings();
  const [includeSecrets, setIncludeSecrets] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportSettings = () => {
    setIsExporting(true);
    
    try {
      const backupSchedule = localStorage.getItem('jukebox_backup_schedule');
      const customUsers = localStorage.getItem('jukebox_custom_users');
      const cloudBackup = localStorage.getItem('jukebox_cloud_backup');

      const exportData: SettingsExport = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: {
          isDemoMode: settings.isDemoMode,
          apiUrl: settings.apiUrl,
          useWebSocket: settings.useWebSocket,
          pollingInterval: settings.pollingInterval,
          spotify: {
            clientId: settings.spotify.clientId,
            clientSecret: includeSecrets ? settings.spotify.clientSecret : '***MASKED***',
          },
          weather: {
            apiKey: includeSecrets ? settings.weather.apiKey : '***MASKED***',
            city: settings.weather.city,
            isEnabled: settings.weather.isEnabled,
          },
          language: settings.language,
          theme: settings.theme,
          soundEnabled: settings.soundEnabled,
          animationsEnabled: settings.animationsEnabled,
          backupSchedule: backupSchedule ? JSON.parse(backupSchedule) : undefined,
          customUsers: customUsers ? JSON.parse(customUsers) : undefined,
          cloudBackup: cloudBackup ? JSON.parse(cloudBackup) : undefined,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tsi-jukebox-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Configurações exportadas com sucesso!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Falha ao exportar configurações');
    } finally {
      setIsExporting(false);
    }
  };

  const importSettings = async (file: File) => {
    setIsImporting(true);
    
    try {
      const content = await file.text();
      const data: SettingsExport = JSON.parse(content);

      // Validate version
      if (!data.version || !data.settings) {
        throw new Error('Arquivo de configuração inválido');
      }

      // Apply settings
      const { settings: imported } = data;

      if (imported.isDemoMode !== undefined) settings.setDemoMode(imported.isDemoMode);
      if (imported.apiUrl) settings.setApiUrl(imported.apiUrl);
      if (imported.useWebSocket !== undefined) settings.setUseWebSocket(imported.useWebSocket);
      if (imported.pollingInterval) settings.setPollingInterval(imported.pollingInterval);
      if (imported.language) settings.setLanguage(imported.language as any);
      if (imported.theme) settings.setTheme(imported.theme as any);
      if (imported.soundEnabled !== undefined) settings.setSoundEnabled(imported.soundEnabled);
      if (imported.animationsEnabled !== undefined) settings.setAnimationsEnabled(imported.animationsEnabled);

      // Apply Spotify credentials (only if not masked)
      if (imported.spotify?.clientId && imported.spotify?.clientSecret && imported.spotify.clientSecret !== '***MASKED***') {
        settings.setSpotifyCredentials(imported.spotify.clientId, imported.spotify.clientSecret);
      } else if (imported.spotify?.clientId) {
        settings.setSpotifyCredentials(imported.spotify.clientId, settings.spotify.clientSecret);
      }

      // Apply Weather config (only if not masked)
      if (imported.weather) {
        const weatherConfig: any = { 
          city: imported.weather.city, 
          isEnabled: imported.weather.isEnabled 
        };
        if (imported.weather.apiKey && imported.weather.apiKey !== '***MASKED***') {
          weatherConfig.apiKey = imported.weather.apiKey;
        }
        settings.setWeatherConfig(weatherConfig);
      }

      // Apply localStorage settings
      if (imported.backupSchedule) {
        localStorage.setItem('jukebox_backup_schedule', JSON.stringify(imported.backupSchedule));
      }
      if (imported.customUsers) {
        localStorage.setItem('jukebox_custom_users', JSON.stringify(imported.customUsers));
      }
      if (imported.cloudBackup) {
        localStorage.setItem('jukebox_cloud_backup', JSON.stringify(imported.cloudBackup));
      }

      toast.success(`Configurações importadas! (versão ${data.version}, exportado em ${new Date(data.exportedAt).toLocaleDateString('pt-BR')})`);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Falha ao importar: arquivo inválido ou corrompido');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error('Por favor, selecione um arquivo JSON');
        return;
      }
      importSettings(file);
    }
  };

  return (
    <Card className="p-5 bg-kiosk-surface/50 border-cyan-500/30 card-option-neon">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <FileJson className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold text-kiosk-text">Backup de Configurações</h3>
          <p className="text-xs text-kiosk-text/60">Exporte ou importe suas preferências em JSON</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Export Section */}
        <div className="p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-kiosk-text">Exportar</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              id="includeSecrets"
              checked={includeSecrets}
              onCheckedChange={(checked) => setIncludeSecrets(checked === true)}
            />
            <Label htmlFor="includeSecrets" className="text-xs text-kiosk-text/70 cursor-pointer">
              Incluir chaves secretas (API keys)
            </Label>
          </div>

          {includeSecrets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/90">
                Atenção: O arquivo conterá suas chaves secretas. Guarde-o em local seguro!
              </p>
            </motion.div>
          )}

          <Button
            onClick={exportSettings}
            disabled={isExporting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isExporting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Import Section */}
        <div className="p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-kiosk-text">Importar</span>
          </div>

          <p className="text-xs text-kiosk-text/60 mb-3">
            Selecione um arquivo JSON exportado anteriormente para restaurar suas configurações.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            variant="outline"
            className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            {isImporting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo JSON
              </>
            )}
          </Button>
        </div>

        {/* Security Info */}
        <div className="flex items-start gap-2 p-2 rounded bg-kiosk-surface/30 border border-kiosk-border">
          <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-kiosk-text/60">
            Por padrão, chaves secretas são mascaradas na exportação. Ative a opção acima apenas para backup completo.
          </p>
        </div>
      </div>
    </Card>
  );
}
