import { useMemo, useState, useCallback } from 'react';
import { useSettingsStatus, SettingsCategoryId } from './useSettingsStatus';
import { useSettings } from '@/contexts/SettingsContext';

export interface SettingsNotification {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: SettingsCategoryId;
  title: string;
  message: string;
  actionLabel?: string;
  dismissible?: boolean;
  priority: number; // Higher = more important
}

const DISMISSED_KEY = 'settings_notifications_dismissed';

export function useSettingsNotifications() {
  const { getAllStatuses, hasCustomUsers, hasBackupSchedule, hasCloudBackup } = useSettingsStatus();
  const { isDemoMode, spotify, weather } = useSettings();
  
  // Load dismissed notifications from localStorage
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const notifications = useMemo(() => {
    const list: SettingsNotification[] = [];
    const statuses = getAllStatuses();

    // Security: Default credentials
    if (!hasCustomUsers) {
      list.push({
        id: 'default-credentials',
        type: 'warning',
        category: 'security',
        title: 'Credenciais Padrão em Uso',
        message: 'Você está usando tsi/connect. Crie usuários personalizados para maior segurança.',
        actionLabel: 'Gerenciar Usuários',
        dismissible: true,
        priority: 90
      });
    }

    // Data: No backup schedule
    if (!hasBackupSchedule) {
      list.push({
        id: 'no-backup-schedule',
        type: 'warning',
        category: 'data',
        title: 'Backup Não Agendado',
        message: 'Configure backups automáticos para proteger seus dados contra perda.',
        actionLabel: 'Configurar Backup',
        dismissible: true,
        priority: 80
      });
    }

    // Data: No cloud backup
    if (!hasCloudBackup && hasBackupSchedule) {
      list.push({
        id: 'no-cloud-backup',
        type: 'info',
        category: 'data',
        title: 'Backup na Nuvem Recomendado',
        message: 'Adicione backup na nuvem para proteção extra contra desastres.',
        actionLabel: 'Configurar Nuvem',
        dismissible: true,
        priority: 40
      });
    }

    // Connections: Demo mode active
    if (isDemoMode) {
      list.push({
        id: 'demo-mode-active',
        type: 'info',
        category: 'connections',
        title: 'Modo Demo Ativo',
        message: 'O sistema está usando dados simulados. Conecte ao backend para funcionalidade completa.',
        actionLabel: 'Configurar Conexão',
        dismissible: true,
        priority: 50
      });
    }

    // Integrations: Spotify not connected
    if (!spotify.isConnected) {
      list.push({
        id: 'spotify-not-connected',
        type: 'info',
        category: 'integrations',
        title: 'Spotify Desconectado',
        message: 'Conecte sua conta do Spotify para acessar sua biblioteca de músicas.',
        actionLabel: 'Conectar Spotify',
        dismissible: true,
        priority: 60
      });
    }

    // Integrations: Weather not configured
    if (!weather.isEnabled || !weather.apiKey) {
      list.push({
        id: 'weather-not-configured',
        type: 'info',
        category: 'integrations',
        title: 'Widget de Clima Desativado',
        message: 'Configure o widget de clima para ver a previsão do tempo na tela inicial.',
        actionLabel: 'Configurar Clima',
        dismissible: true,
        priority: 30
      });
    }

    // Filter out dismissed notifications and sort by priority
    return list
      .filter(n => !dismissed.includes(n.id))
      .sort((a, b) => b.priority - a.priority);
  }, [getAllStatuses, hasCustomUsers, hasBackupSchedule, hasCloudBackup, isDemoMode, spotify.isConnected, weather.isEnabled, weather.apiKey, dismissed]);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const newDismissed = [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed));
      return newDismissed;
    });
  }, []);

  const dismissAll = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setDismissed(prev => {
      const newDismissed = [...new Set([...prev, ...allIds])];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed));
      return newDismissed;
    });
  }, [notifications]);

  const resetDismissed = useCallback(() => {
    setDismissed([]);
    localStorage.removeItem(DISMISSED_KEY);
  }, []);

  const warningCount = notifications.filter(n => n.type === 'warning').length;
  const errorCount = notifications.filter(n => n.type === 'error').length;
  const infoCount = notifications.filter(n => n.type === 'info').length;

  return {
    notifications,
    dismiss,
    dismissAll,
    resetDismissed,
    warningCount,
    errorCount,
    infoCount,
    totalCount: notifications.length,
    hasWarnings: warningCount > 0,
    hasErrors: errorCount > 0
  };
}
