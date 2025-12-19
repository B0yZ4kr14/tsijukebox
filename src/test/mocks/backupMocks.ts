import { vi } from 'vitest';
import type { BackupItem, BackupProvider, BackupType, BackupHistoryItem, ScheduleConfig, CloudConfig } from '@/components/settings/backup/types';

export const mockBackupItem: BackupItem = {
  id: 'backup-1',
  name: 'backup_2024-01-15_full.db',
  type: 'full',
  size: '25.3 MB',
  date: '2024-01-15T10:30:00Z',
  provider: 'local',
  status: 'completed',
};

export const mockIncrementalBackup: BackupItem = {
  id: 'backup-2',
  name: 'backup_2024-01-16_inc.db',
  type: 'incremental',
  size: '5.2 MB',
  date: '2024-01-16T14:00:00Z',
  provider: 'local',
  status: 'completed',
};

export const mockCloudBackup: BackupItem = {
  id: 'cloud-backup-1',
  name: 'cloud_backup_2024-01-15.db',
  type: 'full',
  size: '30.1 MB',
  date: '2024-01-15T12:00:00Z',
  provider: 'cloud',
  status: 'completed',
};

export const mockDistributedBackup: BackupItem = {
  id: 'dist-backup-1',
  name: 'distributed_backup_2024-01-15.db',
  type: 'full',
  size: '28.5 MB',
  date: '2024-01-15T15:00:00Z',
  provider: 'distributed',
  status: 'syncing',
};

export const mockHistoryItem: BackupHistoryItem = {
  id: 'history-1',
  provider: 'local',
  type: 'full',
  status: 'completed',
  size: '25.3 MB',
  date: '2024-01-15T10:30:00Z',
};

export const mockScheduleConfig: ScheduleConfig = {
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  retention: 30,
  providers: ['local'],
};

export const mockCloudConfig: CloudConfig = {
  provider: 'storj',
  storjAccessGrant: 'test-access-grant',
};

export const mockBackupApiResponse = {
  success: true,
  id: 'backup-new',
  name: 'backup_2024-01-15_full.db',
  size: '25.3 MB',
};

export const mockFailedApiResponse = {
  success: false,
  message: 'Storage quota exceeded',
};

export const createMockFetch = (response: unknown, ok = true) => {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
  });
};

export const createMockBackups = (provider: BackupProvider, count: number): BackupItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${provider}-backup-${i + 1}`,
    name: `${provider}_backup_${i + 1}.db`,
    type: (i % 2 === 0 ? 'full' : 'incremental') as BackupType,
    size: `${(10 + i * 5).toFixed(1)} MB`,
    date: new Date(2024, 0, 15 + i).toISOString(),
    provider,
    status: 'completed' as const,
  }));
};
