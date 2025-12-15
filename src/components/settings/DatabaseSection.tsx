import { useState } from 'react';
import { Database, HardDrive, RefreshCw, Shield, BarChart3, Wrench, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SettingsSection } from './SettingsSection';
import { toast } from 'sonner';

interface DatabaseSectionProps {
  isDemoMode: boolean;
}

interface MaintenanceResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export function DatabaseSection({ isDemoMode }: DatabaseSectionProps) {
  const [dbPath, setDbPath] = useState('/var/lib/tsi-jukebox/database.db');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState({
    size: '2.4 MB',
    tables: 12,
    lastModified: new Date().toISOString(),
    version: 'SQLite 3.40.1',
  });

  const handleSavePath = () => {
    toast.success('Caminho do banco de dados salvo');
  };

  const runMaintenance = async (action: string, endpoint: string) => {
    if (isDemoMode) {
      toast.info(`Demo: Operação ${action} simulada`);
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
        toast.success(`${action} concluído com sucesso`);
      } else {
        toast.error(`Falha no ${action}: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Erro ao executar ${action}`);
    } finally {
      setIsLoading(null);
    }
  };

  const maintenanceTools = [
    {
      id: 'vacuum',
      label: 'Vacuum',
      description: 'Otimizar e compactar banco',
      icon: RefreshCw,
      endpoint: 'vacuum',
    },
    {
      id: 'integrity',
      label: 'Integrity Check',
      description: 'Verificar integridade dos dados',
      icon: Shield,
      endpoint: 'integrity',
    },
    {
      id: 'stats',
      label: 'Estatísticas',
      description: 'Analisar uso e performance',
      icon: BarChart3,
      endpoint: 'stats',
    },
    {
      id: 'reindex',
      label: 'Reindex',
      description: 'Reconstruir índices',
      icon: Wrench,
      endpoint: 'reindex',
    },
  ];

  return (
    <SettingsSection
      icon={<Database className="w-5 h-5 text-kiosk-primary" />}
      title="Banco de Dados"
      description="Configuração e manutenção do banco de dados SQLite"
      badge={
        <Badge variant="outline" className="ml-2 border-kiosk-primary/50 text-kiosk-primary">
          SQLite
        </Badge>
      }
      delay={0.15}
    >
      <div className="space-y-4">
        {/* Database Path */}
        <div className="space-y-2">
          <Label htmlFor="dbPath" className="text-kiosk-text">
            Caminho do Banco de Dados
          </Label>
          <div className="flex gap-2">
            <Input
              id="dbPath"
              value={dbPath}
              onChange={(e) => setDbPath(e.target.value)}
              placeholder="/path/to/database.db"
              className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm flex-1"
              disabled={isDemoMode}
            />
            <Button
              onClick={handleSavePath}
              disabled={isDemoMode}
              className="bg-kiosk-primary hover:bg-kiosk-primary/90"
            >
              Salvar
            </Button>
          </div>
          <p className="text-xs text-kiosk-text/50">
            O banco de dados é gerenciado pelo backend FastAPI
          </p>
        </div>

        {/* Database Info */}
        <div className="p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-kiosk-text/60" />
            <span className="text-sm font-medium text-kiosk-text">Informações do Banco</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-kiosk-text/60">Tamanho:</span>
              <span className="text-kiosk-text">{dbInfo.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kiosk-text/60">Tabelas:</span>
              <span className="text-kiosk-text">{dbInfo.tables}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kiosk-text/60">Versão:</span>
              <span className="text-kiosk-text">{dbInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kiosk-text/60">Modificado:</span>
              <span className="text-kiosk-text">
                {new Date(dbInfo.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-kiosk-border" />

        {/* Maintenance Tools */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-kiosk-text/60" />
            <span className="text-sm font-medium text-kiosk-text">Ferramentas de Manutenção</span>
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
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 border-kiosk-border hover:bg-kiosk-surface/80"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className={`w-4 h-4 text-kiosk-primary ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-sm text-kiosk-text">{tool.label}</span>
                  </div>
                  <span className="text-xs text-kiosk-text/50 text-left">
                    {tool.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {isDemoMode && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-500">
              Ferramentas de banco de dados indisponíveis no modo demo
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
