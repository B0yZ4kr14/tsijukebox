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

/**
 * BackupScheduler Component
 * 
 * Configuração de agendamento automático de backups.
 * Permite definir frequência, horário, retenção e provedores.
 * 
 * @component
 * @example
 * ```tsx
 * <BackupScheduler
 *   config={scheduleConfig}
 *   onChange={setScheduleConfig}
 *   availableProviders={['local', 'cloud']}
 * />
 * ```
 */
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
    <div 
      className="space-y-4 p-4 rounded-lg bg-bg-secondary/60 backdrop-blur-sm border border-border-primary" 
      data-testid="backup-scheduler"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent-cyan" />
          <Label className="text-text-primary font-medium">Agendamento Automático</Label>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled) => onChange({ ...config, enabled })}
          disabled={disabled}
          data-testid="schedule-toggle"
          className="data-[state=checked]:bg-accent-cyan"
        />
      </div>

      {config.enabled && (
        <div className="space-y-4 pt-2 border-t border-border-primary/50">
          {/* Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-text-secondary font-medium">Frequência</Label>
              <Select
                value={config.frequency}
                onValueChange={(v) => onChange({ ...config, frequency: v as SyncSchedule })}
                disabled={disabled}
              >
                <SelectTrigger 
                  className="bg-bg-secondary/80 backdrop-blur-sm border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan transition-all duration-normal" 
                  data-testid="schedule-frequency"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-primary">
                  {frequencyOptions.map((opt) => (
                    <SelectItem 
                      key={opt.value} 
                      value={opt.value}
                      className="hover:bg-bg-tertiary focus:bg-bg-tertiary text-text-primary"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-text-secondary font-medium">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                <Input
                  type="time"
                  value={config.time}
                  onChange={(e) => onChange({ ...config, time: e.target.value })}
                  className="bg-bg-secondary/80 backdrop-blur-sm border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan text-text-primary pl-10 transition-all duration-normal"
                  disabled={disabled}
                  data-testid="schedule-time"
                />
              </div>
            </div>
          </div>

          {/* Retention */}
          <div className="space-y-2">
            <Label className="text-sm text-text-secondary font-medium">Retenção (dias)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={config.retention}
              onChange={(e) => onChange({ ...config, retention: parseInt(e.target.value) || 7 })}
              className="bg-bg-secondary/80 backdrop-blur-sm border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan text-text-primary w-24 transition-all duration-normal"
              disabled={disabled}
              data-testid="schedule-retention"
            />
            <p className="text-xs text-text-secondary">
              Backups mais antigos serão automaticamente removidos
            </p>
          </div>

          {/* Providers */}
          <div className="space-y-2">
            <Label className="text-sm text-text-secondary font-medium">Provedores</Label>
            <div className="flex flex-wrap gap-3">
              {availableProviders.map((provider) => (
                <div 
                  key={provider} 
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-tertiary/50 border border-border-primary hover:border-accent-cyan/50 transition-all duration-normal"
                >
                  <Checkbox
                    id={`schedule-${provider}`}
                    checked={config.providers.includes(provider)}
                    onCheckedChange={(checked) => handleProviderToggle(provider, checked === true)}
                    disabled={disabled}
                    data-testid={`schedule-provider-${provider}`}
                    className="border-border-primary data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                  />
                  <Label 
                    htmlFor={`schedule-${provider}`} 
                    className="text-sm text-text-primary cursor-pointer"
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
