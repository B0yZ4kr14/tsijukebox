import { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Database, Server, Cloud, HardDrive, Save, CheckCircle2 } from 'lucide-react';

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

interface DatabaseConfigSectionProps {
  isDemoMode?: boolean;
}

export function DatabaseConfigSection({ isDemoMode = false }: DatabaseConfigSectionProps) {
  const [config, setConfig] = useState<DatabaseConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('database_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      localStorage.setItem('database_config', JSON.stringify(config));
      toast.success('Configuração salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof DatabaseConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsSection
      title="Banco de Dados"
      description="Configure a conexão com o banco de dados SQLite"
      icon={<Database className="w-5 h-5" />}
    >
      <div className="space-y-6">
        <RadioGroup
          value={config.type}
          onValueChange={(value) => updateConfig('type', value)}
          className="grid grid-cols-1 gap-3"
        >
          {/* SQLite Local */}
          <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
            config.type === 'sqlite-local' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}>
            <RadioGroupItem value="sqlite-local" id="sqlite-local" />
            <Label htmlFor="sqlite-local" className="flex items-center gap-3 cursor-pointer flex-1">
              <HardDrive className="w-5 h-5 text-kiosk-text/80" />
              <div>
                <p className="font-medium text-kiosk-text">SQLite Local</p>
                <p className="text-sm text-kiosk-text/75">Arquivo no servidor local</p>
              </div>
            </Label>
          </div>

          {/* SQLite Remote */}
          <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
            config.type === 'sqlite-remote' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}>
            <RadioGroupItem value="sqlite-remote" id="sqlite-remote" />
            <Label htmlFor="sqlite-remote" className="flex items-center gap-3 cursor-pointer flex-1">
              <Server className="w-5 h-5 text-kiosk-text/80" />
              <div>
                <p className="font-medium text-kiosk-text">SQLite Remoto</p>
                <p className="text-sm text-kiosk-text/75">Arquivo em servidor externo via SSH</p>
              </div>
            </Label>
          </div>

          {/* Lovable Cloud */}
          <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
            config.type === 'lovable-cloud' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}>
            <RadioGroupItem value="lovable-cloud" id="lovable-cloud" />
            <Label htmlFor="lovable-cloud" className="flex items-center gap-3 cursor-pointer flex-1">
              <Cloud className="w-5 h-5 text-kiosk-text/80" />
              <div>
                <p className="font-medium text-kiosk-text">Lovable Cloud</p>
                <p className="text-sm text-kiosk-text/75">Banco de dados gerenciado na nuvem</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* SQLite Local Config */}
        {config.type === 'sqlite-local' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="sqlite-path">Caminho do arquivo</Label>
              <Input
                id="sqlite-path"
                value={config.sqlitePath}
                onChange={(e) => updateConfig('sqlitePath', e.target.value)}
                placeholder="/var/lib/jukebox/jukebox.db"
                disabled={isDemoMode}
              />
              <p className="text-xs text-kiosk-text/70">
                Caminho absoluto para o arquivo SQLite no servidor
              </p>
            </div>
          </div>
        )}

        {/* SQLite Remote Config */}
        {config.type === 'sqlite-remote' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sqlite-host">Host</Label>
                <Input
                  id="sqlite-host"
                  value={config.sqliteHost}
                  onChange={(e) => updateConfig('sqliteHost', e.target.value)}
                  placeholder="192.168.1.100"
                  disabled={isDemoMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sqlite-port">Porta SSH</Label>
                <Input
                  id="sqlite-port"
                  value={config.sqlitePort}
                  onChange={(e) => updateConfig('sqlitePort', e.target.value)}
                  placeholder="22"
                  disabled={isDemoMode}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sqlite-path-remote">Caminho do arquivo</Label>
              <Input
                id="sqlite-path-remote"
                value={config.sqlitePath}
                onChange={(e) => updateConfig('sqlitePath', e.target.value)}
                placeholder="/var/lib/jukebox/jukebox.db"
                disabled={isDemoMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sqlite-username">Usuário SSH</Label>
                <Input
                  id="sqlite-username"
                  value={config.sqliteUsername}
                  onChange={(e) => updateConfig('sqliteUsername', e.target.value)}
                  placeholder="admin"
                  disabled={isDemoMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sqlite-password">Senha SSH</Label>
                <Input
                  id="sqlite-password"
                  type="password"
                  value={config.sqlitePassword}
                  onChange={(e) => updateConfig('sqlitePassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={isDemoMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lovable Cloud Info */}
        {config.type === 'lovable-cloud' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-primary">Conectado ao Lovable Cloud</p>
                <p className="text-sm text-kiosk-text/75">
                  Banco de dados gerenciado automaticamente. Nenhuma configuração adicional necessária.
                </p>
              </div>
            </div>
          </div>
        )}

        {config.type !== 'lovable-cloud' && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isDemoMode}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        )}

        {isDemoMode && (
          <p className="text-xs text-amber-500 text-center">
            Configuração de banco de dados desabilitada no modo demo
          </p>
        )}
      </div>
    </SettingsSection>
  );
}
