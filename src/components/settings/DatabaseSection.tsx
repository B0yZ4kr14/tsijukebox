import { useState } from 'react';
import { Database, HardDrive, RefreshCw, Shield, BarChart3, Wrench, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks';
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
  const { t } = useTranslation();
  const [dbPath, setDbPath] = useState('/var/lib/tsi-jukebox/database.db');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState({
    size: '2.4 MB',
    tables: 12,
    lastModified: new Date().toISOString(),
    version: 'SQLite 3.40.1',
  });

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
    } catch (error) {
      toast.error(t('database.operationError').replace('{action}', action));
    } finally {
      setIsLoading(null);
    }
  };

  const maintenanceTools = [
    {
      id: 'vacuum',
      label: t('database.vacuum'),
      description: t('database.vacuumDesc'),
      icon: RefreshCw,
      endpoint: 'vacuum',
    },
    {
      id: 'integrity',
      label: t('database.integrity'),
      description: t('database.integrityDesc'),
      icon: Shield,
      endpoint: 'integrity',
    },
    {
      id: 'stats',
      label: t('database.stats'),
      description: t('database.statsDesc'),
      icon: BarChart3,
      endpoint: 'stats',
    },
    {
      id: 'reindex',
      label: t('database.reindex'),
      description: t('database.reindexDesc'),
      icon: Wrench,
      endpoint: 'reindex',
    },
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
      delay={0.15}
    >
      <div className="space-y-4">
        {/* Database Path */}
        <div className="space-y-2">
          <Label htmlFor="dbPath" className="text-label-yellow">
            {t('database.path')}
          </Label>
          <div className="flex gap-2">
            <Input
              id="dbPath"
              value={dbPath}
              onChange={(e) => setDbPath(e.target.value)}
              placeholder="/path/to/database.db"
              className="input-3d bg-kiosk-bg border-kiosk-surface text-kiosk-text font-mono text-sm flex-1"
              disabled={isDemoMode}
            />
            <Button
              onClick={handleSavePath}
              disabled={isDemoMode}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {t('common.save')}
            </Button>
          </div>
          <p className="text-xs text-settings-hint">
            {t('database.pathHint')}
          </p>
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
              <span className="text-neon-white">
                {new Date(dbInfo.lastModified).toLocaleDateString()}
              </span>
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
                  variant="kiosk-outline"
                  onClick={() => runMaintenance(tool.label, tool.endpoint)}
                  disabled={isDemoMode || loading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 card-neon-border bg-kiosk-bg/30 hover:bg-kiosk-surface/50"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className={`w-4 h-4 icon-neon-blue ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-sm text-label-yellow font-medium">{tool.label}</span>
                  </div>
                  <span className="text-xs text-settings-hint text-left">
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
              {t('database.demoWarning')}
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
