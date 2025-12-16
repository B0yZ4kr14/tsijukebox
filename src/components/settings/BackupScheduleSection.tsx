import { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from './SettingsSection';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { useTranslation } from '@/hooks/useTranslation';

interface BackupSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  retention: number; // Number of backups to keep
}

const defaultSchedule: BackupSchedule = {
  enabled: false,
  frequency: 'daily',
  time: '03:00',
  retention: 7,
};

export function BackupScheduleSection() {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState<BackupSchedule>(defaultSchedule);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = [
    { value: '0', label: t('backup.days.sunday') },
    { value: '1', label: t('backup.days.monday') },
    { value: '2', label: t('backup.days.tuesday') },
    { value: '3', label: t('backup.days.wednesday') },
    { value: '4', label: t('backup.days.thursday') },
    { value: '5', label: t('backup.days.friday') },
    { value: '6', label: t('backup.days.saturday') },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('backup_schedule');
    if (saved) {
      setSchedule(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('backup_schedule', JSON.stringify(schedule));
      
      // Call backend API to configure cron job
      await api.setBackupSchedule({
        enabled: schedule.enabled,
        frequency: schedule.frequency,
        time: schedule.time,
        retention: schedule.retention,
      });
      
      toast.success(t('backup.savedSuccess'));
    } catch (error) {
      // Silently fail in demo mode, still save to localStorage
      if (import.meta.env.DEV) console.error('Failed to save backup schedule to API:', error);
      toast.success(t('backup.savedLocal'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSchedule(defaultSchedule);
    localStorage.removeItem('backup_schedule');
    toast.info(t('backup.reset'));
  };

  const getScheduleSummary = () => {
    if (schedule.frequency === 'daily') {
      return t('backup.summaryDaily').replace('{time}', schedule.time);
    }
    if (schedule.frequency === 'weekly') {
      const day = daysOfWeek[schedule.dayOfWeek ?? 0]?.label;
      return t('backup.summaryWeekly').replace('{day}', day).replace('{time}', schedule.time);
    }
    if (schedule.frequency === 'monthly') {
      return t('backup.summaryMonthly').replace('{day}', String(schedule.dayOfMonth)).replace('{time}', schedule.time);
    }
    return '';
  };

  return (
    <SettingsSection
      title={t('backup.title')}
      description={t('backup.description')}
      icon={<Calendar className="w-5 h-5 icon-neon-blue" />}
    >
      <div className="space-y-4">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d">
          <Label htmlFor="schedule-enabled" className="text-sm text-label-yellow">
            {t('backup.automatic')}
          </Label>
          <Switch
            id="schedule-enabled"
            checked={schedule.enabled}
            onCheckedChange={(enabled) => setSchedule({ ...schedule, enabled })}
          />
        </div>

        {schedule.enabled && (
          <div className="space-y-4 p-3 rounded-lg card-option-dark-3d">
            {/* Frequency */}
            <div className="space-y-2">
              <Label className="text-sm text-label-yellow">{t('backup.frequency')}</Label>
              <Select
                value={schedule.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  setSchedule({ ...schedule, frequency: value })
                }
              >
                <SelectTrigger className="input-3d bg-kiosk-bg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-kiosk-surface border-kiosk-border">
                  <SelectItem value="daily">{t('backup.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('backup.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('backup.monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day of Week (for weekly) */}
            {schedule.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label className="text-sm text-label-yellow">{t('backup.dayOfWeek')}</Label>
                <Select
                  value={String(schedule.dayOfWeek ?? 0)}
                  onValueChange={(value) => 
                    setSchedule({ ...schedule, dayOfWeek: parseInt(value) })
                  }
                >
                  <SelectTrigger className="input-3d bg-kiosk-bg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-kiosk-surface border-kiosk-border">
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Day of Month (for monthly) */}
            {schedule.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label className="text-sm text-label-yellow">{t('backup.dayOfMonth')}</Label>
                <Select
                  value={String(schedule.dayOfMonth ?? 1)}
                  onValueChange={(value) => 
                    setSchedule({ ...schedule, dayOfMonth: parseInt(value) })
                  }
                >
                  <SelectTrigger className="input-3d bg-kiosk-bg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-kiosk-surface border-kiosk-border">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {t('backup.day')} {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Time */}
            <div className="space-y-2">
              <Label className="text-sm text-label-yellow flex items-center gap-2">
                <Clock className="w-4 h-4 icon-neon-blue" />
                {t('backup.time')}
              </Label>
              <Input
                type="time"
                value={schedule.time}
                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                className="input-3d bg-kiosk-bg"
              />
            </div>

            {/* Retention */}
            <div className="space-y-2">
              <Label className="text-sm text-label-yellow">
                {t('backup.retention')}
              </Label>
              <Select
                value={String(schedule.retention)}
                onValueChange={(value) => 
                  setSchedule({ ...schedule, retention: parseInt(value) })
                }
              >
                <SelectTrigger className="input-3d bg-kiosk-bg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-kiosk-surface border-kiosk-border">
                  <SelectItem value="3">3 {t('backup.backups')}</SelectItem>
                  <SelectItem value="5">5 {t('backup.backups')}</SelectItem>
                  <SelectItem value="7">7 {t('backup.backups')}</SelectItem>
                  <SelectItem value="14">14 {t('backup.backups')}</SelectItem>
                  <SelectItem value="30">30 {t('backup.backups')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-settings-hint">
                {t('backup.retentionHint')}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 button-primary-glow-3d ripple-effect"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
          <Button
            onClick={handleReset}
            className="button-outline-neon ripple-effect"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Schedule Summary */}
        {schedule.enabled && (
          <div className="p-3 rounded-lg card-option-dark-3d border-l-4 border-l-cyan-500/50">
            <p className="text-sm text-cyan-300">
              {getScheduleSummary()}
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}