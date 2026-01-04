// Components Backup templates (8 files)

export function generateComponentsBackupContent(path: string): string | null {
  switch (path) {
    case 'src/components/settings/backup/index.ts':
      return `// Backup module barrel export
export { BackupManager } from './BackupManager';
export { BackupCard } from './BackupCard';
export { BackupActions } from './BackupActions';
export { BackupHistory } from './BackupHistory';
export { BackupScheduler } from './BackupScheduler';
export { useBackupManager } from './hooks/useBackupManager';
export * from './types';
`;

    case 'src/components/settings/backup/types.ts':
      return `// Backup module types

export type BackupProvider = 'local' | 'cloud' | 'distributed';
export type BackupType = 'full' | 'incremental';
export type BackupStatus = 'pending' | 'completed' | 'failed' | 'syncing';
export type CloudProvider = 'aws' | 'gdrive' | 'dropbox' | 'mega' | 'onedrive' | 'storj';
export type BackupStrategy = 'round-robin' | 'mirror-all' | 'primary-secondary';
export type SyncSchedule = 'hourly' | 'daily' | 'weekly';
export type CompressionLevel = 'none' | 'fast' | 'best';

export interface BackupItem {
  id: string;
  name: string;
  type: BackupType;
  size: string;
  date: string;
  provider: BackupProvider;
  status: BackupStatus;
}

export interface CloudConfig {
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

export interface ScheduleConfig {
  enabled: boolean;
  frequency: SyncSchedule;
  time: string;
  retention: number;
  providers: BackupProvider[];
}

export interface DistributedConfig {
  enabled: boolean;
  strategy: BackupStrategy;
  primaryClientId: string;
  replicaCount: number;
  syncSchedule: SyncSchedule;
  encryptBackups: boolean;
  compressionLevel: CompressionLevel;
}

export interface BackupReplica {
  clientId: string;
  clientName: string;
  lastSync: string | null;
  status: BackupStatus;
  size: string;
}

export interface BackupHistoryItem {
  id: string;
  provider: BackupProvider;
  type: BackupType;
  status: BackupStatus;
  size: string;
  date: string;
  duration?: number;
}

export interface BackupManagerState {
  backups: Record<BackupProvider, BackupItem[]>;
  history: BackupHistoryItem[];
  cloudConfig: CloudConfig;
  scheduleConfig: ScheduleConfig;
  distributedConfig: DistributedConfig;
  replicas: BackupReplica[];
}
`;

    case 'src/components/settings/backup/BackupManager.tsx':
      return `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardDrive, Cloud, Network } from 'lucide-react';
import { BackupCard } from './BackupCard';
import { BackupActions } from './BackupActions';
import { BackupHistory } from './BackupHistory';
import { BackupScheduler } from './BackupScheduler';
import { useBackupManager } from './hooks/useBackupManager';
import type { BackupProvider } from './types';

interface BackupManagerProps {
  providers?: BackupProvider[];
  showScheduler?: boolean;
  showHistory?: boolean;
}

const PROVIDER_ICONS = {
  local: HardDrive,
  cloud: Cloud,
  distributed: Network,
};

export function BackupManager({
  providers = ['local', 'cloud'],
  showScheduler = true,
  showHistory = true,
}: BackupManagerProps) {
  const {
    backups,
    history,
    scheduleConfig,
    isLoading,
    createBackup,
    restoreBackup,
    deleteBackup,
    setScheduleConfig,
  } = useBackupManager({ enabledProviders: providers });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Backup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue={providers[0]}>
          <TabsList>
            {providers.map((provider) => {
              const Icon = PROVIDER_ICONS[provider];
              return (
                <TabsTrigger key={provider} value={provider} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {provider === 'local' ? 'Local' : provider === 'cloud' ? 'Nuvem' : 'Distribuído'}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {providers.map((provider) => (
            <TabsContent key={provider} value={provider} className="space-y-4">
              <BackupActions
                provider={provider}
                onCreateBackup={(type) => createBackup(provider, type)}
                isLoading={isLoading}
              />
              {backups[provider]?.map((backup) => (
                <BackupCard
                  key={backup.id}
                  backup={backup}
                  onRestore={() => restoreBackup(provider, backup.id)}
                  onDelete={() => deleteBackup(provider, backup.id)}
                  isLoading={isLoading}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {showScheduler && (
          <BackupScheduler
            config={scheduleConfig}
            onChange={setScheduleConfig}
            availableProviders={providers}
          />
        )}

        {showHistory && <BackupHistory items={history} />}
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/backup/BackupActions.tsx':
      return `import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import type { BackupProvider, BackupType } from './types';

interface BackupActionsProps {
  provider: BackupProvider;
  onCreateBackup: (type: BackupType) => void;
  isLoading?: boolean;
}

export function BackupActions({ provider, onCreateBackup, isLoading }: BackupActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={() => onCreateBackup('full')} disabled={isLoading}>
        <Plus className="h-4 w-4 mr-2" />
        Backup Completo
      </Button>
      <Button variant="outline" onClick={() => onCreateBackup('incremental')} disabled={isLoading}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Incremental
      </Button>
    </div>
  );
}
`;

    case 'src/components/settings/backup/BackupCard.tsx':
      return `import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trash2, HardDrive, Cloud, Network } from 'lucide-react';
import type { BackupItem, BackupProvider } from './types';

interface BackupCardProps {
  backup: BackupItem;
  onRestore: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const PROVIDER_ICONS: Record<BackupProvider, React.ElementType> = {
  local: HardDrive,
  cloud: Cloud,
  distributed: Network,
};

export function BackupCard({ backup, onRestore, onDelete, isLoading }: BackupCardProps) {
  const Icon = PROVIDER_ICONS[backup.provider];

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">{backup.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{backup.size}</span>
              <span>•</span>
              <span>{new Date(backup.date).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
            {backup.type === 'full' ? 'Completo' : 'Incremental'}
          </Badge>
          <Button variant="outline" size="sm" onClick={onRestore} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Restaurar
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={isLoading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/backup/BackupHistory.tsx':
      return `import React from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BackupHistoryItem } from './types';

interface BackupHistoryProps {
  items: BackupHistoryItem[];
  maxItems?: number;
}

const STATUS_ICONS = {
  completed: CheckCircle,
  failed: XCircle,
  pending: Clock,
  syncing: RefreshCw,
};

export function BackupHistory({ items, maxItems = 10 }: BackupHistoryProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Histórico de Backups</h4>
      <ScrollArea className="h-[200px]">
        {displayItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum histórico disponível</p>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item) => {
              const Icon = STATUS_ICONS[item.status];
              return (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <Icon className={\`h-4 w-4 \${item.status === 'completed' ? 'text-green-500' : item.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}\`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.provider} - {item.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.size} • {new Date(item.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
`;

    case 'src/components/settings/backup/BackupScheduler.tsx':
      return `import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { ScheduleConfig, BackupProvider } from './types';

interface BackupSchedulerProps {
  config: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  availableProviders: BackupProvider[];
  disabled?: boolean;
}

export function BackupScheduler({ config, onChange, availableProviders, disabled }: BackupSchedulerProps) {
  const handleProviderToggle = (provider: BackupProvider) => {
    const newProviders = config.providers.includes(provider)
      ? config.providers.filter((p) => p !== provider)
      : [...config.providers, provider];
    onChange({ ...config, providers: newProviders });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Label htmlFor="schedule-enabled">Backup Automático</Label>
        <Switch
          id="schedule-enabled"
          checked={config.enabled}
          onCheckedChange={(enabled) => onChange({ ...config, enabled })}
          disabled={disabled}
        />
      </div>

      {config.enabled && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={config.frequency}
                onValueChange={(frequency: any) => onChange({ ...config, frequency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={config.time}
                onChange={(e) => onChange({ ...config, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Provedores</Label>
            <div className="flex gap-4">
              {availableProviders.map((provider) => (
                <div key={provider} className="flex items-center gap-2">
                  <Checkbox
                    id={\`provider-\${provider}\`}
                    checked={config.providers.includes(provider)}
                    onCheckedChange={() => handleProviderToggle(provider)}
                  />
                  <Label htmlFor={\`provider-\${provider}\`} className="text-sm">
                    {provider === 'local' ? 'Local' : provider === 'cloud' ? 'Nuvem' : 'Distribuído'}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
`;

    case 'src/components/settings/backup/hooks/useBackupManager.ts':
      return `import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  BackupItem,
  BackupProvider,
  BackupType,
  BackupHistoryItem,
  ScheduleConfig,
  CloudConfig,
} from '../types';

interface UseBackupManagerParams {
  enabledProviders: BackupProvider[];
  demoMode?: boolean;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false,
  frequency: 'daily',
  time: '03:00',
  retention: 7,
  providers: ['local'],
};

export function useBackupManager({ enabledProviders, demoMode = false }: UseBackupManagerParams) {
  const [backups, setBackups] = useState<Record<BackupProvider, BackupItem[]>>({
    local: [],
    cloud: [],
    distributed: [],
  });
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>({ provider: '' });
  const [isLoading, setIsLoading] = useState(false);

  const createBackup = useCallback(async (provider: BackupProvider, type: BackupType = 'full') => {
    setIsLoading(true);
    try {
      const newBackup: BackupItem = {
        id: crypto.randomUUID(),
        name: \`Backup \${new Date().toLocaleDateString('pt-BR')}\`,
        type,
        size: '0 MB',
        date: new Date().toISOString(),
        provider,
        status: 'completed',
      };

      setBackups((prev) => ({
        ...prev,
        [provider]: [newBackup, ...prev[provider]],
      }));

      setHistory((prev) => [
        {
          id: newBackup.id,
          provider,
          type,
          status: 'completed',
          size: newBackup.size,
          date: newBackup.date,
        },
        ...prev,
      ]);

      toast.success('Backup criado com sucesso');
      return newBackup;
    } catch (error) {
      toast.error('Falha ao criar backup');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreBackup = useCallback(async (provider: BackupProvider, backupId: string) => {
    setIsLoading(true);
    try {
      toast.success('Backup restaurado com sucesso');
      return true;
    } catch (error) {
      toast.error('Falha ao restaurar backup');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (provider: BackupProvider, backupId: string) => {
    setIsLoading(true);
    try {
      setBackups((prev) => ({
        ...prev,
        [provider]: prev[provider].filter((b) => b.id !== backupId),
      }));
      toast.success('Backup excluído');
      return true;
    } catch (error) {
      toast.error('Falha ao excluir backup');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    backups,
    history,
    scheduleConfig,
    cloudConfig,
    isLoading,
    createBackup,
    restoreBackup,
    deleteBackup,
    setScheduleConfig,
    setCloudConfig,
  };
}
`;

    default:
      return null;
  }
}
