import { useSettings } from '@/contexts/SettingsContext';

export type StatusLevel = 'ok' | 'warning' | 'error';
export type SettingsCategoryId = 'dashboard' | 'connections' | 'data' | 'system' | 'appearance' | 'security' | 'integrations';

export interface CategoryStatus {
  level: StatusLevel;
  message: string;
  configured: number;
  total: number;
}

export function useSettingsStatus() {
  const {
    isDemoMode,
    apiUrl,
    spotify,
    weather,
  } = useSettings();

  // Check backup schedule from localStorage
  const backupSchedule = localStorage.getItem('backup_schedule');
  const hasBackupSchedule = backupSchedule ? JSON.parse(backupSchedule)?.enabled : false;

  // Check if custom users exist
  const users = localStorage.getItem('jukebox_users');
  const hasCustomUsers = users ? JSON.parse(users)?.length > 1 : false;

  // Cloud backup config
  const cloudBackup = localStorage.getItem('cloud_backup_config');
  const hasCloudBackup = cloudBackup ? JSON.parse(cloudBackup)?.provider : false;

  const getCategoryStatus = (categoryId: SettingsCategoryId): CategoryStatus => {
    switch (categoryId) {
      case 'dashboard':
        return { level: 'ok', message: 'Visão geral', configured: 0, total: 0 };

      case 'connections': {
        const hasBackend = !isDemoMode && apiUrl;
        const hasCloud = true; // Lovable Cloud is always connected
        
        if (isDemoMode) {
          return { level: 'warning', message: 'Modo demo ativo', configured: 1, total: 2 };
        }
        if (hasBackend && hasCloud) {
          return { level: 'ok', message: 'Todas conexões ativas', configured: 2, total: 2 };
        }
        return { level: 'error', message: 'Backend não configurado', configured: hasCloud ? 1 : 0, total: 2 };
      }

      case 'data': {
        let configured = 1; // Database is always there
        const total = 3;
        
        if (hasBackupSchedule) configured++;
        if (hasCloudBackup) configured++;
        
        if (configured === total) {
          return { level: 'ok', message: 'Backup completo configurado', configured, total };
        }
        if (!hasBackupSchedule) {
          return { level: 'warning', message: 'Backup não agendado', configured, total };
        }
        return { level: 'ok', message: `${configured}/${total} configurados`, configured, total };
      }

      case 'system':
        return { level: 'ok', message: 'Sistema operacional', configured: 3, total: 3 };

      case 'appearance':
        return { level: 'ok', message: 'Personalizado', configured: 3, total: 3 };

      case 'security': {
        if (!hasCustomUsers) {
          return { level: 'warning', message: 'Credenciais padrão', configured: 1, total: 2 };
        }
        return { level: 'ok', message: 'Usuários configurados', configured: 2, total: 2 };
      }

      case 'integrations': {
        const spotifyOk = spotify.isConnected;
        const weatherOk = weather.isEnabled && weather.apiKey;
        const configured = (spotifyOk ? 1 : 0) + (weatherOk ? 1 : 0);
        
        if (spotifyOk && weatherOk) {
          return { level: 'ok', message: 'Todas integrações ativas', configured: 2, total: 2 };
        }
        if (spotifyOk || weatherOk) {
          return { level: 'warning', message: `${configured}/2 conectados`, configured, total: 2 };
        }
        return { level: 'error', message: 'Nenhuma integração', configured: 0, total: 2 };
      }

      default:
        return { level: 'ok', message: '', configured: 0, total: 0 };
    }
  };

  const getAllStatuses = () => {
    const categories: SettingsCategoryId[] = ['connections', 'data', 'system', 'appearance', 'security', 'integrations'];
    return categories.reduce((acc, id) => {
      acc[id] = getCategoryStatus(id);
      return acc;
    }, {} as Record<SettingsCategoryId, CategoryStatus>);
  };

  const getOverallStatus = () => {
    const statuses = getAllStatuses();
    const errorCount = Object.values(statuses).filter(s => s.level === 'error').length;
    const warningCount = Object.values(statuses).filter(s => s.level === 'warning').length;
    const okCount = Object.values(statuses).filter(s => s.level === 'ok').length;

    return {
      errorCount,
      warningCount,
      okCount,
      total: 6,
      configured: okCount,
    };
  };

  return {
    getCategoryStatus,
    getAllStatuses,
    getOverallStatus,
    hasBackupSchedule,
    hasCustomUsers,
    hasCloudBackup,
  };
}
