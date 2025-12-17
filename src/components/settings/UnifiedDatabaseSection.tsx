import { useState, useEffect } from 'react';
import { Database, HardDrive, Server, Cloud, Sparkles, Save, CheckCircle2, RefreshCw, Shield, BarChart3, Wrench, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

type DatabaseType = 'sqlite-local' | 'sqlite-remote' | 'lovable-cloud';

interface DatabaseConfig {
  type: DatabaseType;
  sqlitePath: string;
  sqliteHost: string;
  sqlitePort: string;
  sqliteUsername: string;
  sqlitePassword: string;
}

const defaultConfig: DatabaseConfig = {
  type: 'sqlite-local',
  sqlitePath: '/var/lib/jukebox/jukebox.db',
  sqliteHost: '',
  sqlitePort: '22',
  sqliteUsername: '',
  sqlitePassword: '',
};

interface UnifiedDatabaseSectionProps {
  isDemoMode: boolean;
}

interface MaintenanceResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export function UnifiedDatabaseSection({ isDemoMode }: UnifiedDatabaseSectionProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<DatabaseConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [dbPath, setDbPath] = useState('/var/lib/tsi-jukebox/database.db');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [dbInfo] = useState({
    size: '2.4 MB',
    tables: 12,
    lastModified: new Date().toISOString(),
    version: 'SQLite 3.40.1',
  });

  useEffect(() => {
    const saved = localStorage.getItem('database_config');
    if (saved) {
      setConfig({ ...defaultConfig, ...JSON.parse(saved) });
    }
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('database_config', JSON.stringify(config));
      toast.success('Configuração salva com sucesso');
    } catch {
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePath = () => {
    toast.success(t('database.pathSaved'));
  };

  const runMaintenance = async (action: string, endpoint: string) => {
    if (isDemoMode) {
      toast.info(t('database.demoOperation').replace('{action}', action));
      return;
    }

    setIsLoading(action);
    try {
      const response = await fetch(`/api/database/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result: MaintenanceResult = await response.json();
      
      if (result.success) {
        toast.success(t('database.operationSuccess').replace('{action}', action));
      } else {
        toast.error(t('database.operationError').replace('{action}', action));
      }
    } catch {
      toast.error(t('database.operationError').replace('{action}', action));
    } finally {
      setIsLoading(null);
    }
  };

  const updateConfig = (key: keyof DatabaseConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const maintenanceTools = [
    { id: 'vacuum', label: t('database.vacuum'), description: t('database.vacuumDesc'), icon: RefreshCw, endpoint: 'vacuum' },
    { id: 'integrity', label: t('database.integrity'), description: t('database.integrityDesc'), icon: Shield, endpoint: 'integrity' },
    { id: 'stats', label: t('database.stats'), description: t('database.statsDesc'), icon: BarChart3, endpoint: 'stats' },
    { id: 'reindex', label: t('database.reindex'), description: t('database.reindexDesc'), icon: Wrench, endpoint: 'reindex' },
  ];

  return (
    <SettingsSection
      icon={<Database className="w-5 h-5 icon-neon-blue" />}
      title={t('database.title')}
      description={t('database.description')}
      badge={
        <Badge variant="outline" className="ml-2 border-cyan-400/50 text-cyan-400">
          SQLite
        </Badge>
      }
    >
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-kiosk-bg/50">
          <TabsTrigger value="config" data-tour="database-config-tab">Configuração</TabsTrigger>
          <TabsTrigger value="maintenance" data-tour="database-maintenance-tab">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4 mt-4">
          <RadioGroup
            value={config.type}
            onValueChange={(value) => updateConfig('type', value)}
            className="grid grid-cols-1 gap-3"
            data-tour="database-type-selector"
          >
            {/* SQLite Local */}
            <div 
              className={`flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all ripple-effect ${
                config.type === 'sqlite-local' ? 'card-option-selected-3d' : 'card-option-dark-3d'
              }`}
              onClick={() => updateConfig('type', 'sqlite-local')}
            >
              <RadioGroupItem value="sqlite-local" id="sqlite-local" />
              <Label htmlFor="sqlite-local" className="flex items-center gap-3 cursor-pointer flex-1">
                <HardDrive className="w-5 h-5 icon-neon-blue" />
                <div>
                  <p className="font-medium text-kiosk-text">SQLite Local</p>
                  <p className="text-sm text-kiosk-text/75">Arquivo no servidor local - Simples e rápido</p>
                </div>
              </Label>
            </div>

            {/* SQLite Remote */}
            <div 
              className={`flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all ripple-effect ${
                config.type === 'sqlite-remote' ? 'card-option-selected-3d' : 'card-option-dark-3d'
              }`}
              onClick={() => updateConfig('type', 'sqlite-remote')}
            >
              <RadioGroupItem value="sqlite-remote" id="sqlite-remote" />
              <Label htmlFor="sqlite-remote" className="flex items-center gap-3 cursor-pointer flex-1">
                <Server className="w-5 h-5 icon-neon-blue" />
                <div>
                  <p className="font-medium text-kiosk-text">SQLite Remoto</p>
                  <p className="text-sm text-kiosk-text/75">Arquivo em servidor externo via SSH</p>
                </div>
              </Label>
            </div>

            {/* Lovable Cloud */}
            <div 
              className={`flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all ripple-effect ${
                config.type === 'lovable-cloud' ? 'card-option-selected-3d' : 'card-option-dark-3d'
              }`}
              onClick={() => updateConfig('type', 'lovable-cloud')}
            >
              <RadioGroupItem value="lovable-cloud" id="lovable-cloud" />
              <Label htmlFor="lovable-cloud" className="flex items-center gap-3 cursor-pointer flex-1">
                <Cloud className="w-5 h-5 icon-neon-blue" />
                <div>
                  <p className="font-medium text-kiosk-text">Lovable Cloud</p>
                  <p className="text-sm text-kiosk-text/75">100% gerenciado - Zero configuração</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* SQLite Local Config */}
          {config.type === 'sqlite-local' && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="sqlite-path" className="text-label-yellow">Caminho do arquivo</Label>
                <Input
                  id="sqlite-path"
                  value={config.sqlitePath}
                  onChange={(e) => updateConfig('sqlitePath', e.target.value)}
                  placeholder="/var/lib/jukebox/jukebox.db"
                  disabled={isDemoMode}
                  className="input-3d bg-kiosk-bg"
                  data-tour="database-path"
                />
              </div>
            </div>
          )}

          {/* SQLite Remote Config */}
          {config.type === 'sqlite-remote' && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label-yellow">Endereço do Servidor</Label>
                  <Input
                    value={config.sqliteHost}
                    onChange={(e) => updateConfig('sqliteHost', e.target.value)}
                    placeholder="192.168.1.100"
                    disabled={isDemoMode}
                    className="input-3d bg-kiosk-bg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-label-yellow">Porta SSH</Label>
                  <Input
                    value={config.sqlitePort}
                    onChange={(e) => updateConfig('sqlitePort', e.target.value)}
                    placeholder="22"
                    disabled={isDemoMode}
                    className="input-3d bg-kiosk-bg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-label-yellow">Caminho do arquivo</Label>
                <Input
                  value={config.sqlitePath}
                  onChange={(e) => updateConfig('sqlitePath', e.target.value)}
                  placeholder="/var/lib/jukebox/jukebox.db"
                  disabled={isDemoMode}
                  className="input-3d bg-kiosk-bg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label-yellow">Usuário SSH</Label>
                  <Input
                    value={config.sqliteUsername}
                    onChange={(e) => updateConfig('sqliteUsername', e.target.value)}
                    placeholder="admin"
                    disabled={isDemoMode}
                    className="input-3d bg-kiosk-bg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-label-yellow">Senha SSH</Label>
                  <Input
                    type="password"
                    value={config.sqlitePassword}
                    onChange={(e) => updateConfig('sqlitePassword', e.target.value)}
                    placeholder="••••••••"
                    disabled={isDemoMode}
                    className="input-3d bg-kiosk-bg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lovable Cloud Info */}
          {config.type === 'lovable-cloud' && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 p-4 rounded-lg card-option-selected-3d">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">✨ Conectado ao Lovable Cloud</p>
                  <p className="text-sm text-kiosk-text/75 mt-1">
                    Banco de dados gerenciado automaticamente. Nenhuma configuração necessária!
                  </p>
                  <ul className="mt-2 text-xs text-kiosk-text/60 space-y-1">
                    <li>• Backup automático diário</li>
                    <li>• Escalabilidade ilimitada</li>
                    <li>• Segurança de nível empresarial</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {config.type !== 'lovable-cloud' && (
            <Button 
              onClick={handleSaveConfig} 
              disabled={isSaving || isDemoMode}
              className="w-full button-primary-glow-3d ripple-effect"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4 mt-4">
          {/* Database Path */}
          <div className="space-y-2">
            <Label htmlFor="dbPath" className="text-label-yellow">{t('database.path')}</Label>
            <div className="flex gap-2">
              <Input
                id="dbPath"
                value={dbPath}
                onChange={(e) => setDbPath(e.target.value)}
                placeholder="/path/to/database.db"
                className="input-3d bg-kiosk-bg border-kiosk-surface text-kiosk-text font-mono text-sm flex-1"
                disabled={isDemoMode}
              />
              <Button onClick={handleSavePath} disabled={isDemoMode} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {t('common.save')}
              </Button>
            </div>
          </div>

          {/* Database Info */}
          <div className="p-3 rounded-lg bg-kiosk-bg/50 card-neon-border">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 icon-neon-blue" />
              <span className="text-sm font-medium title-neon-blue">{t('database.info')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-label-neon">{t('database.size')}:</span>
                <span className="text-neon-white">{dbInfo.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-neon">{t('database.tables')}:</span>
                <span className="text-neon-white">{dbInfo.tables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-neon">{t('database.version')}:</span>
                <span className="text-neon-white">{dbInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-neon">{t('database.modified')}:</span>
                <span className="text-neon-white">{new Date(dbInfo.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-kiosk-border" />

          {/* Maintenance Tools */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 icon-neon-blue" />
              <span className="text-sm font-medium title-neon-blue">{t('database.maintenance')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {maintenanceTools.map((tool) => {
                const Icon = tool.icon;
                const loading = isLoading === tool.id;
                return (
                  <Button
                    key={tool.id}
                    variant="outline"
                    onClick={() => runMaintenance(tool.label, tool.endpoint)}
                    disabled={isDemoMode || loading}
                    className="h-auto py-3 px-4 flex flex-col items-start gap-1 card-neon-border bg-kiosk-bg/30 hover:bg-kiosk-surface/50"
                    data-tour={`database-${tool.id}`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className={`w-4 h-4 icon-neon-blue ${loading ? 'animate-spin' : ''}`} />
                      <span className="text-sm text-label-yellow font-medium">{tool.label}</span>
                    </div>
                    <span className="text-xs text-settings-hint text-left">{tool.description}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {isDemoMode && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-500">{t('database.demoWarning')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </SettingsSection>
  );
}
