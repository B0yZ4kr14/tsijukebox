import { useState, useEffect } from 'react';
import { 
  HardDrive, Cloud, RefreshCw, AlertTriangle, Check,
  ArrowRight, Download, Upload, Shield, Clock, Trash2
} from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type BackupStrategy = 'round-robin' | 'mirror-all' | 'primary-secondary';
type SyncSchedule = 'hourly' | 'daily' | 'weekly';

interface BackupReplica {
  clientId: string;
  clientName: string;
  lastSync: string | null;
  status: 'synced' | 'pending' | 'error' | 'syncing';
  size: string;
}

interface DistributedBackupConfig {
  enabled: boolean;
  strategy: BackupStrategy;
  primaryClientId: string;
  replicaCount: number;
  syncSchedule: SyncSchedule;
  encryptBackups: boolean;
  compressionLevel: 'none' | 'fast' | 'best';
  lastFullSync: string | null;
  replicas: BackupReplica[];
}

const STORAGE_KEY = 'distributed_backup_config';

const defaultConfig: DistributedBackupConfig = {
  enabled: false,
  strategy: 'round-robin',
  primaryClientId: '',
  replicaCount: 2,
  syncSchedule: 'daily',
  encryptBackups: true,
  compressionLevel: 'fast',
  lastFullSync: null,
  replicas: [],
};

const strategies: { id: BackupStrategy; name: string; description: string }[] = [
  { id: 'round-robin', name: 'Round Robin', description: 'Distribui backups entre clientes de forma rotativa' },
  { id: 'mirror-all', name: 'Espelhar Todos', description: 'Replica backup para todos os clientes' },
  { id: 'primary-secondary', name: 'Primário/Secundário', description: 'Um cliente master com réplicas secundárias' },
];

const schedules: { id: SyncSchedule; name: string }[] = [
  { id: 'hourly', name: 'A cada hora' },
  { id: 'daily', name: 'Diário' },
  { id: 'weekly', name: 'Semanal' },
];

export function DistributedBackupSection() {
  const [config, setConfig] = useState<DistributedBackupConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Mock clients for demo
  const [clients] = useState(() => {
    try {
      const saved = localStorage.getItem('tsi_jukebox_clients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveConfig = (newConfig: DistributedBackupConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const handleSyncNow = async () => {
    if (clients.length === 0) {
      toast.error('Nenhum cliente cadastrado para sincronização');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    toast.info('Iniciando sincronização distribuída...');

    // Simulate sync progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSyncProgress(i);
    }

    const newReplicas: BackupReplica[] = clients.slice(0, config.replicaCount).map((c: any) => ({
      clientId: c.id,
      clientName: c.name,
      lastSync: new Date().toISOString(),
      status: 'synced' as const,
      size: `${Math.floor(Math.random() * 500) + 100} MB`,
    }));

    saveConfig({
      ...config,
      lastFullSync: new Date().toISOString(),
      replicas: newReplicas,
    });

    setIsSyncing(false);
    setSyncProgress(0);
    toast.success(`Backup distribuído para ${newReplicas.length} cliente(s)`);
  };

  const handleDeleteReplica = (clientId: string) => {
    saveConfig({
      ...config,
      replicas: config.replicas.filter(r => r.clientId !== clientId),
    });
    toast.success('Réplica removida');
  };

  const syncedCount = config.replicas.filter(r => r.status === 'synced').length;
  const totalReplicas = config.replicaCount;

  return (
    <SettingsSection
      icon={<Cloud className="w-5 h-5 icon-neon-blue" />}
      title="Backup Distribuído"
      description="Redundância entre clientes TSiJUKEBOX"
    >
      <div className="space-y-4">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 icon-neon-blue" />
            <div>
              <p className="text-sm font-medium text-label-yellow">Backup Distribuído</p>
              <p className="text-xs text-settings-hint">Replica dados entre terminais</p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => saveConfig({ ...config, enabled })}
          />
        </div>

        {config.enabled && (
          <>
            {/* Strategy Selection */}
            <div className="space-y-2">
              <Label className="text-label-yellow">Estratégia de Backup</Label>
              <RadioGroup
                value={config.strategy}
                onValueChange={(v) => saveConfig({ ...config, strategy: v as BackupStrategy })}
                className="grid grid-cols-3 gap-2"
              >
                {strategies.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      "flex flex-col p-3 rounded-lg cursor-pointer transition-all text-center",
                      config.strategy === s.id ? "card-option-selected-3d" : "card-option-dark-3d"
                    )}
                  >
                    <RadioGroupItem value={s.id} className="sr-only" />
                    <span className="text-sm font-medium text-neon-white">{s.name}</span>
                    <span className="text-xs text-settings-hint mt-1">{s.description}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-label-yellow">Número de Réplicas</Label>
                <Select
                  value={String(config.replicaCount)}
                  onValueChange={(v) => saveConfig({ ...config, replicaCount: parseInt(v) })}
                >
                  <SelectTrigger className="bg-kiosk-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} réplica(s)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-label-yellow">Agendamento</Label>
                <Select
                  value={config.syncSchedule}
                  onValueChange={(v) => saveConfig({ ...config, syncSchedule: v as SyncSchedule })}
                >
                  <SelectTrigger className="bg-kiosk-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="encrypt"
                  checked={config.encryptBackups}
                  onCheckedChange={(v) => saveConfig({ ...config, encryptBackups: v })}
                />
                <Label htmlFor="encrypt" className="text-sm text-label-yellow">Criptografar</Label>
              </div>
              <Select
                value={config.compressionLevel}
                onValueChange={(v) => saveConfig({ ...config, compressionLevel: v as any })}
              >
                <SelectTrigger className="w-[140px] bg-kiosk-surface/50">
                  <SelectValue placeholder="Compressão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem compressão</SelectItem>
                  <SelectItem value="fast">Compressão rápida</SelectItem>
                  <SelectItem value="best">Melhor compressão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Visualization */}
            <div className="card-option-dark-3d rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-label-yellow flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Status das Réplicas
                </h4>
                <Badge variant="outline" className={cn(
                  syncedCount === totalReplicas ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                )}>
                  {syncedCount}/{totalReplicas} sincronizadas
                </Badge>
              </div>

              {/* Visual Diagram */}
              <div className="flex items-center justify-center gap-2 py-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-kiosk-text/60 mt-1">Master</span>
                </div>

                <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />

                <div className="flex gap-2">
                  {Array.from({ length: config.replicaCount }).map((_, i) => {
                    const replica = config.replicas[i];
                    const isActive = replica?.status === 'synced';
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-lg border flex items-center justify-center",
                          isActive ? "bg-green-500/20 border-green-500/50" : "bg-slate-500/20 border-slate-500/30"
                        )}>
                          <Cloud className={cn("w-5 h-5", isActive ? "text-green-400" : "text-slate-400")} />
                        </div>
                  <span className="text-xs text-neon-white mt-1">
                    {replica?.clientName?.slice(0, 8) || `Réplica ${i + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Replicas List */}
              {config.replicas.length > 0 && (
                <div className="space-y-2 border-t border-kiosk-border pt-3">
                  {config.replicas.map((replica) => (
                    <div key={replica.clientId} className="flex items-center justify-between p-2 rounded bg-kiosk-surface/30">
                      <div className="flex items-center gap-2">
                        {replica.status === 'synced' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : replica.status === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                        )}
                        <span className="text-sm text-neon-white">{replica.clientName}</span>
                        <span className="text-xs text-settings-hint">{replica.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {replica.lastSync && (
                          <span className="text-xs text-settings-hint">
                            {new Date(replica.lastSync).toLocaleString()}
                          </span>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleDeleteReplica(replica.clientId)}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {config.replicas.length === 0 && (
                <p className="text-sm text-center text-settings-hint py-2">
                  Nenhuma réplica sincronizada. Clique em "Sincronizar Agora".
                </p>
              )}
            </div>

            {/* Sync Progress */}
            {isSyncing && (
              <div className="space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <p className="text-xs text-center text-kiosk-text/50">
                  Sincronizando... {syncProgress}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSyncNow}
                disabled={isSyncing || clients.length === 0}
                className="button-primary-glow-3d"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </Button>

              {config.lastFullSync && (
                <span className="text-xs text-settings-hint flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Última sync: {new Date(config.lastFullSync).toLocaleString()}
                </span>
              )}
            </div>

            {clients.length === 0 && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Cadastre clientes TSiJUKEBOX para usar backup distribuído
              </p>
            )}
          </>
        )}
      </div>
    </SettingsSection>
  );
}
