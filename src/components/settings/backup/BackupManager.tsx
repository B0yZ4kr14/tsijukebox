import { Archive, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from '../SettingsSection';
import { BackupCard } from './BackupCard';
import { BackupActions } from './BackupActions';
import { BackupHistory } from './BackupHistory';
import { BackupScheduler } from './BackupScheduler';
import { useBackupManager } from './hooks/useBackupManager';
import { useTranslation } from '@/hooks';
import type { BackupProvider, BackupType } from './types';

interface BackupManagerProps {
  providers?: BackupProvider[];
  showScheduler?: boolean;
  showHistory?: boolean;
  maxHistoryItems?: number;
  isDemoMode?: boolean;
}

const instructions = {
  title: "💾 O que são Backups?",
  steps: [
    "Backup é uma 'cópia de segurança' dos seus dados - como tirar uma foto do sistema.",
    "Se algo der errado (computador quebrar, vírus, etc.), você pode restaurar tudo usando essa cópia.",
    "BACKUP COMPLETO: Copia TUDO. Leva mais tempo, mas é a forma mais segura.",
    "BACKUP INCREMENTAL: Copia apenas o que mudou desde o último backup. É mais rápido!"
  ],
  tips: [
    "💡 Faça backup completo toda semana",
    "💡 Faça backup incremental todo dia",
    "💡 Guarde cópias em lugares diferentes (pen drive, nuvem)"
  ],
  warning: "⚠️ Sem backup, se o computador quebrar, você perde TUDO! Não arrisque."
};

export function BackupManager({ 
  providers = ['local'], 
  showScheduler = true,
  showHistory = true,
  maxHistoryItems = 10,
  isDemoMode = false,
}: BackupManagerProps) {
  const { t } = useTranslation();
  const {
    backups,
    history,
    scheduleConfig,
    isLoading,
    createBackup,
    restoreBackup,
    deleteBackup,
    setScheduleConfig,
    getProviderBackups,
  } = useBackupManager({ enabledProviders: providers, isDemoMode });

  const handleBackup = async (provider: BackupProvider, type: BackupType) => {
    await createBackup(provider, type);
  };

  const handleRestore = async (provider: BackupProvider, backupId: string) => {
    await restoreBackup(provider, backupId);
  };

  const handleDelete = async (provider: BackupProvider, backupId: string) => {
    await deleteBackup(provider, backupId);
  };

  const showTabs = providers.length > 1;
  const defaultProvider = providers[0] || 'local';

  return (
    <SettingsSection
      icon={<Archive className="w-5 h-5 icon-neon-blue" />}
      title={t('backupLocal.title')}
      description={t('backupLocal.description')}
      instructions={instructions}
    >
      <div className="space-y-4" data-testid="backup-manager">
        {showTabs ? (
          <Tabs defaultValue={defaultProvider} className="w-full" data-testid="backup-tabs">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${providers.length}, 1fr)` }}>
              {providers.includes('local') && (
                <TabsTrigger value="local" data-testid="backup-tab-local">Local</TabsTrigger>
              )}
              {providers.includes('cloud') && (
                <TabsTrigger value="cloud" data-testid="backup-tab-cloud">Nuvem</TabsTrigger>
              )}
              {providers.includes('distributed') && (
                <TabsTrigger value="distributed" data-testid="backup-tab-distributed">Distribuído</TabsTrigger>
              )}
            </TabsList>

            {providers.map((provider) => (
              <TabsContent key={provider} value={provider} className="space-y-4 mt-4">
                <BackupActions
                  onBackup={(type) => handleBackup(provider, type)}
                  isLoading={isLoading}
                  disabled={isDemoMode}
                  showIncremental={provider === 'local'}
                />

                <ScrollArea className="h-48 rounded-lg card-option-dark-3d">
                  <div className="p-2 space-y-2">
                    {getProviderBackups(provider).length === 0 ? (
                      <p className="text-sm text-kiosk-text/60 text-center py-4">
                        {t('backupLocal.noBackups')}
                      </p>
                    ) : (
                      getProviderBackups(provider).map((backup) => (
                        <BackupCard
                          key={backup.id}
                          backup={backup}
                          onRestore={(id) => handleRestore(provider, id)}
                          onDelete={(id) => handleDelete(provider, id)}
                          isLoading={isLoading}
                          disabled={isDemoMode}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <>
            <BackupActions
              onBackup={(type) => handleBackup(defaultProvider, type)}
              isLoading={isLoading}
              disabled={isDemoMode}
            />

            <ScrollArea className="h-48 rounded-lg card-option-dark-3d">
              <div className="p-2 space-y-2">
                {getProviderBackups(defaultProvider).length === 0 ? (
                  <p className="text-sm text-kiosk-text/60 text-center py-4">
                    {t('backupLocal.noBackups')}
                  </p>
                ) : (
                  getProviderBackups(defaultProvider).map((backup) => (
                    <BackupCard
                      key={backup.id}
                      backup={backup}
                      onRestore={(id) => handleRestore(defaultProvider, id)}
                      onDelete={(id) => handleDelete(defaultProvider, id)}
                      isLoading={isLoading}
                      disabled={isDemoMode}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Scheduler */}
        {showScheduler && (
          <BackupScheduler
            config={scheduleConfig}
            onChange={setScheduleConfig}
            availableProviders={providers}
            disabled={isDemoMode}
          />
        )}

        {/* History */}
        {showHistory && history.length > 0 && (
          <BackupHistory items={history} maxItems={maxHistoryItems} />
        )}

        {/* Demo Warning */}
        {isDemoMode && (
          <div 
            className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            data-testid="backup-demo-warning"
          >
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-400">
              {t('backupLocal.demoWarning')}
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
