import { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Database, Server, Cloud, HardDrive, Save, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type DatabaseType = 'sqlite-local' | 'sqlite-remote' | 'supabase' | 'lovable-cloud';

interface DatabaseConfig {
  type: DatabaseType;
  sqlitePath: string;
  sqliteHost: string;
  sqlitePort: string;
  sqliteUsername: string;
  sqlitePassword: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
}

const defaultConfig: DatabaseConfig = {
  type: 'sqlite-local',
  sqlitePath: '/var/lib/jukebox/jukebox.db',
  sqliteHost: '',
  sqlitePort: '22',
  sqliteUsername: '',
  sqlitePassword: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseServiceKey: '',
};

interface DatabaseConfigSectionProps {
  isDemoMode?: boolean;
}

/**
 * DatabaseConfigSection Component
 * 
 * Configuration panel for database connection settings.
 * Supports SQLite (local/remote), Supabase, and Lovable Cloud.
 * Integrated with TSiJUKEBOX Design System tokens.
 */
export function DatabaseConfigSection({ isDemoMode = false }: DatabaseConfigSectionProps) {
  const [config, setConfig] = useState<DatabaseConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('database_config');
    if (saved) {
      setConfig({ ...defaultConfig, ...JSON.parse(saved) });
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

  const instructions = {
    title: "📚 O que é um Banco de Dados?",
    steps: [
      "O banco de dados é onde todas as suas músicas, playlists e configurações são guardadas de forma segura.",
      "Pense nele como uma 'caixa organizadora digital' que mantém tudo em ordem para você.",
      "SQLite Local: Seus dados ficam salvos no próprio computador do Jukebox - simples e rápido!",
      "SQLite Remoto: Seus dados ficam em outro computador, acessados de forma segura via SSH.",
      "Supabase: Banco de dados profissional na nuvem com painel de administração visual.",
      "Lovable Cloud: Solução gerenciada automaticamente - não precisa configurar nada!"
    ],
    tips: [
      "💡 Para uso caseiro simples, SQLite Local é perfeito!",
      "💡 Para estabelecimentos comerciais, Lovable Cloud oferece backup automático",
      "💡 Supabase é ideal se você quer mais controle sobre seus dados"
    ],
    warning: "⚠️ Mudar o tipo de banco pode afetar suas músicas e playlists salvas. Faça backup primeiro!"
  };

  return (
    <SettingsSection
      title="Banco de Dados"
      description="Configure onde seus dados serão armazenados"
      icon={<Database className="w-5 h-5 text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />}
      instructions={instructions}
    >
      <div className="space-y-6">
        <RadioGroup
          value={config.type}
          onValueChange={(value) => updateConfig('type', value)}
          className="grid grid-cols-1 gap-3"
        >
          {/* SQLite Local */}
          <div 
            className={cn(
              "flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all duration-normal",
              "border backdrop-blur-sm",
              config.type === 'sqlite-local' 
                ? "bg-accent-cyan/10 border-accent-cyan/50 shadow-glow-cyan" 
                : "bg-bg-tertiary/50 border-[#333333] hover:bg-bg-tertiary hover:border-accent-cyan/30"
            )}
            onClick={() => updateConfig('type', 'sqlite-local')}
          >
            <RadioGroupItem value="sqlite-local" id="sqlite-local" />
            <Label htmlFor="sqlite-local" className="flex items-center gap-3 cursor-pointer flex-1">
              <HardDrive className={cn(
                "w-5 h-5 transition-all duration-normal",
                config.type === 'sqlite-local' && "text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">SQLite Local</p>
                  <Badge variant="info" size="sm">Simples</Badge>
                </div>
                <p className="text-sm text-text-secondary">Arquivo no servidor local - Simples e rápido</p>
              </div>
            </Label>
          </div>

          {/* SQLite Remote */}
          <div 
            className={cn(
              "flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all duration-normal",
              "border backdrop-blur-sm",
              config.type === 'sqlite-remote' 
                ? "bg-accent-cyan/10 border-accent-cyan/50 shadow-glow-cyan" 
                : "bg-bg-tertiary/50 border-[#333333] hover:bg-bg-tertiary hover:border-accent-cyan/30"
            )}
            onClick={() => updateConfig('type', 'sqlite-remote')}
          >
            <RadioGroupItem value="sqlite-remote" id="sqlite-remote" />
            <Label htmlFor="sqlite-remote" className="flex items-center gap-3 cursor-pointer flex-1">
              <Server className={cn(
                "w-5 h-5 transition-all duration-normal",
                config.type === 'sqlite-remote' && "text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">SQLite Remoto</p>
                  <Badge variant="warning" size="sm">Avançado</Badge>
                </div>
                <p className="text-sm text-text-secondary">Arquivo em servidor externo via SSH</p>
              </div>
            </Label>
          </div>

          {/* Supabase */}
          <div 
            className={cn(
              "flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all duration-normal",
              "border backdrop-blur-sm",
              config.type === 'supabase' 
                ? "bg-accent-cyan/10 border-accent-cyan/50 shadow-glow-cyan" 
                : "bg-bg-tertiary/50 border-[#333333] hover:bg-bg-tertiary hover:border-accent-cyan/30"
            )}
            onClick={() => updateConfig('type', 'supabase')}
          >
            <RadioGroupItem value="supabase" id="supabase" />
            <Label htmlFor="supabase" className="flex items-center gap-3 cursor-pointer flex-1">
              <Sparkles className={cn(
                "w-5 h-5 transition-all duration-normal",
                config.type === 'supabase' && "text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">Supabase</p>
                  <Badge variant="primary" size="sm">Cloud</Badge>
                </div>
                <p className="text-sm text-text-secondary">Banco PostgreSQL na nuvem com painel admin</p>
              </div>
            </Label>
          </div>

          {/* Lovable Cloud */}
          <div 
            className={cn(
              "flex items-center space-x-3 rounded-lg p-4 cursor-pointer transition-all duration-normal",
              "border backdrop-blur-sm",
              config.type === 'lovable-cloud' 
                ? "bg-accent-cyan/10 border-accent-cyan/50 shadow-glow-cyan" 
                : "bg-bg-tertiary/50 border-[#333333] hover:bg-bg-tertiary hover:border-accent-cyan/30"
            )}
            onClick={() => updateConfig('type', 'lovable-cloud')}
          >
            <RadioGroupItem value="lovable-cloud" id="lovable-cloud" />
            <Label htmlFor="lovable-cloud" className="flex items-center gap-3 cursor-pointer flex-1">
              <Cloud className={cn(
                "w-5 h-5 transition-all duration-normal",
                config.type === 'lovable-cloud' && "text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">Lovable Cloud</p>
                  <Badge variant="success" size="sm">Gerenciado</Badge>
                </div>
                <p className="text-sm text-text-secondary">100% gerenciado - Zero configuração</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* SQLite Local Config */}
        {config.type === 'sqlite-local' && (
          <div className="space-y-4 pt-4 border-t border-[#333333]">
            <div className="space-y-2">
              <Label htmlFor="sqlite-path" className="text-brand-gold">Caminho do arquivo</Label>
              <Input
                id="sqlite-path"
                value={config.sqlitePath}
                onChange={(e) => updateConfig('sqlitePath', e.target.value)}
                placeholder="/var/lib/jukebox/jukebox.db"
                disabled={isDemoMode}
                variant="default"
              />
              <p className="text-xs text-text-tertiary">
                Caminho completo para o arquivo SQLite no computador
              </p>
            </div>
          </div>
        )}

        {/* SQLite Remote Config */}
        {config.type === 'sqlite-remote' && (
          <div className="space-y-4 pt-4 border-t border-[#333333]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sqlite-host" className="text-brand-gold">Endereço do Servidor</Label>
                <Input
                  id="sqlite-host"
                  value={config.sqliteHost}
                  onChange={(e) => updateConfig('sqliteHost', e.target.value)}
                  placeholder="192.168.1.100"
                  disabled={isDemoMode}
                  variant="default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sqlite-port" className="text-brand-gold">Porta SSH</Label>
                <Input
                  id="sqlite-port"
                  value={config.sqlitePort}
                  onChange={(e) => updateConfig('sqlitePort', e.target.value)}
                  placeholder="22"
                  disabled={isDemoMode}
                  variant="default"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sqlite-path-remote" className="text-brand-gold">Caminho do arquivo</Label>
              <Input
                id="sqlite-path-remote"
                value={config.sqlitePath}
                onChange={(e) => updateConfig('sqlitePath', e.target.value)}
                placeholder="/var/lib/jukebox/jukebox.db"
                disabled={isDemoMode}
                variant="default"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sqlite-username" className="text-brand-gold">Usuário SSH</Label>
                <Input
                  id="sqlite-username"
                  value={config.sqliteUsername}
                  onChange={(e) => updateConfig('sqliteUsername', e.target.value)}
                  placeholder="admin"
                  disabled={isDemoMode}
                  variant="default"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sqlite-password" className="text-brand-gold">Senha SSH</Label>
                <Input
                  id="sqlite-password"
                  type="password"
                  value={config.sqlitePassword}
                  onChange={(e) => updateConfig('sqlitePassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={isDemoMode}
                  variant="default"
                />
              </div>
            </div>
          </div>
        )}

        {/* Supabase Config */}
        {config.type === 'supabase' && (
          <div className="space-y-4 pt-4 border-t border-[#333333]">
            <div className="space-y-2">
              <Label htmlFor="supabase-url" className="text-brand-gold">URL do Projeto Supabase</Label>
              <Input
                id="supabase-url"
                value={config.supabaseUrl}
                onChange={(e) => updateConfig('supabaseUrl', e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                disabled={isDemoMode}
                variant="default"
              />
              <p className="text-xs text-text-tertiary">
                Encontre isso em: Supabase Dashboard → Settings → API
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-anon-key" className="text-brand-gold">Chave Pública (anon key)</Label>
              <Input
                id="supabase-anon-key"
                value={config.supabaseAnonKey}
                onChange={(e) => updateConfig('supabaseAnonKey', e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                disabled={isDemoMode}
                variant="default"
                className="font-mono text-xs"
              />
              <p className="text-xs text-text-tertiary">
                Esta chave é segura para usar no frontend
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-service-key" className="text-brand-gold">Chave de Serviço (service_role)</Label>
              <Input
                id="supabase-service-key"
                type="password"
                value={config.supabaseServiceKey}
                onChange={(e) => updateConfig('supabaseServiceKey', e.target.value)}
                placeholder="••••••••"
                disabled={isDemoMode}
                variant="default"
              />
              <div className="flex items-start gap-2 p-3 rounded-lg bg-state-warning/10 border border-state-warning/30">
                <AlertTriangle className="w-4 h-4 text-state-warning shrink-0 mt-0.5" />
                <p className="text-xs text-state-warning">
                  NUNCA compartilhe esta chave - ela tem acesso total!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lovable Cloud Info */}
        {config.type === 'lovable-cloud' && (
          <div className="space-y-4 pt-4 border-t border-[#333333]">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-state-success/10 border border-state-success/30">
              <CheckCircle2 className="w-6 h-6 text-state-success shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-state-success">✨ Conectado ao Lovable Cloud</p>
                <p className="text-sm text-text-secondary mt-1">
                  Banco de dados gerenciado automaticamente. Nenhuma configuração necessária!
                </p>
                <ul className="mt-3 text-xs text-text-tertiary space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-state-success"></span>
                    Backup automático diário
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-state-success"></span>
                    Escalabilidade ilimitada
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-state-success"></span>
                    Segurança de nível empresarial
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-state-success"></span>
                    Suporte técnico incluído
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {config.type !== 'lovable-cloud' && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isDemoMode}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        )}

        {isDemoMode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-state-warning/10 border border-state-warning/30">
            <AlertTriangle className="w-4 h-4 text-state-warning shrink-0" />
            <p className="text-xs text-state-warning">
              Configuração de banco de dados desabilitada no modo demo
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
