import { Clock, Calendar, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { ScheduleConfig, BackupProvider, SyncSchedule } from './types';

interface BackupSchedulerProps {
  config: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  availableProviders: BackupProvider[];
  disabled?: boolean;
}

const frequencyOptions: { value: SyncSchedule; label: string }[] = [
  { value: 'hourly', label: 'A cada hora' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
];

const providerLabels: Record<BackupProvider, string> = {
  local: 'Local',
  cloud: 'Nuvem',
  distributed: 'Distribuído',
};

export function BackupScheduler({ 
  config, 
  onChange, 
  availableProviders,
  disabled = false 
}: BackupSchedulerProps) {
  const handleProviderToggle = (provider: BackupProvider, checked: boolean) => {
    const providers = checked
      ? [...config.providers, provider]
      : config.providers.filter(p => p !== provider);
    onChange({ ...config, providers });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg card-option-dark-3d" data-testid="backup-scheduler">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 icon-neon-blue" />
          <Label className="text-label-yellow">Agendamento Automático</Label>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled) => onChange({ ...config, enabled })}
          disabled={disabled}
          data-testid="schedule-toggle"
        />
      </div>

      {config.enabled && (
        <div className="space-y-4 pt-2">
          {/* Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-kiosk-text/80">Frequência</Label>
              <Select
                value={config.frequency}
                onValueChange={(v) => onChange({ ...config, frequency: v as SyncSchedule })}
                disabled={disabled}
              >
                <SelectTrigger className="bg-kiosk-surface/50" data-testid="schedule-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-kiosk-text/80">Horário</Label>
              <Input
                type="time"
                value={config.time}
                onChange={(e) => onChange({ ...config, time: e.target.value })}
                className="bg-kiosk-surface/50"
                disabled={disabled}
                data-testid="schedule-time"
              />
            </div>
          </div>

          {/* Retention */}
          <div className="space-y-2">
            <Label className="text-sm text-kiosk-text/80">Retenção (dias)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={config.retention}
              onChange={(e) => onChange({ ...config, retention: parseInt(e.target.value) || 7 })}
              className="bg-kiosk-surface/50 w-24"
              disabled={disabled}
              data-testid="schedule-retention"
            />
          </div>

          {/* Providers */}
          <div className="space-y-2">
            <Label className="text-sm text-kiosk-text/80">Provedores</Label>
            <div className="flex flex-wrap gap-3">
              {availableProviders.map((provider) => (
                <div key={provider} className="flex items-center gap-2">
                  <Checkbox
                    id={`schedule-${provider}`}
                    checked={config.providers.includes(provider)}
                    onCheckedChange={(checked) => handleProviderToggle(provider, checked === true)}
                    disabled={disabled}
                    data-testid={`schedule-provider-${provider}`}
                  />
                  <Label 
                    htmlFor={`schedule-${provider}`} 
                    className="text-sm text-kiosk-text/80 cursor-pointer"
                  >
                    {providerLabels[provider]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
