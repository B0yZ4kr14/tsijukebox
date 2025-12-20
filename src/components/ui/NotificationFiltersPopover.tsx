import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Filter,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  FileSearch,
  Wand2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type {
  NotificationFilters,
  NotificationType,
  NotificationSeverity,
} from '@/hooks/common/useNotifications';

interface NotificationFiltersPopoverProps {
  filters: NotificationFilters;
  activeFiltersCount: number;
  onFiltersChange: (filters: NotificationFilters) => void;
  onClearFilters: () => void;
}

const TYPE_OPTIONS: { value: NotificationType; label: string; icon: React.ReactNode }[] = [
  { value: 'critical_issue', label: 'Issue Crítica', icon: <AlertTriangle className="h-3 w-3 text-destructive" /> },
  { value: 'scan_complete', label: 'Scan Completo', icon: <FileSearch className="h-3 w-3 text-info" /> },
  { value: 'task_complete', label: 'Tarefa Concluída', icon: <CheckCircle className="h-3 w-3 text-success" /> },
  { value: 'refactor_ready', label: 'Refatoração Pronta', icon: <Wand2 className="h-3 w-3 text-primary" /> },
];

const SEVERITY_OPTIONS: { value: NotificationSeverity; label: string; icon: React.ReactNode }[] = [
  { value: 'critical', label: 'Crítico', icon: <AlertTriangle className="h-3 w-3 text-destructive" /> },
  { value: 'warning', label: 'Alerta', icon: <AlertCircle className="h-3 w-3 text-warning" /> },
  { value: 'info', label: 'Informação', icon: <Info className="h-3 w-3 text-info" /> },
];

const READ_STATUS_OPTIONS: { value: 'all' | 'read' | 'unread'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'read', label: 'Lidas' },
  { value: 'unread', label: 'Não lidas' },
];

export function NotificationFiltersPopover({
  filters,
  activeFiltersCount,
  onFiltersChange,
  onClearFilters,
}: NotificationFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<NotificationFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleTypeToggle = (type: NotificationType) => {
    const currentTypes = localFilters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    setLocalFilters({ ...localFilters, types: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleSeverityToggle = (severity: NotificationSeverity) => {
    const currentSeverities = localFilters.severities || [];
    const newSeverities = currentSeverities.includes(severity)
      ? currentSeverities.filter(s => s !== severity)
      : [...currentSeverities, severity];
    setLocalFilters({ ...localFilters, severities: newSeverities.length > 0 ? newSeverities : undefined });
  };

  const handleReadStatusChange = (status: 'all' | 'read' | 'unread') => {
    setLocalFilters({ ...localFilters, readStatus: status });
  };

  const handleDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    setLocalFilters({
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: date || null,
      },
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs relative"
          data-testid="notifications-filters-button"
        >
          <Filter className="h-3 w-3 mr-1" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0"
        data-testid="notifications-filters-popover"
      >
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="font-semibold text-sm">Filtros</h4>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClear}>
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <Accordion type="multiple" defaultValue={['type', 'severity']} className="w-full">
          {/* Type Filter */}
          <AccordionItem value="type" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
              Tipo
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2">
                {TYPE_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${option.value}`}
                      checked={localFilters.types?.includes(option.value) || false}
                      onCheckedChange={() => handleTypeToggle(option.value)}
                      data-testid={`filter-type-${option.value}`}
                    />
                    <Label
                      htmlFor={`type-${option.value}`}
                      className="flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      {option.icon}
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Severity Filter */}
          <AccordionItem value="severity" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
              Severidade
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2">
                {SEVERITY_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`severity-${option.value}`}
                      checked={localFilters.severities?.includes(option.value) || false}
                      onCheckedChange={() => handleSeverityToggle(option.value)}
                      data-testid={`filter-severity-${option.value}`}
                    />
                    <Label
                      htmlFor={`severity-${option.value}`}
                      className="flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      {option.icon}
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Read Status Filter */}
          <AccordionItem value="status" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
              Status de Leitura
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="flex gap-1">
                {READ_STATUS_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={localFilters.readStatus === option.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => handleReadStatusChange(option.value)}
                    data-testid={`filter-status-${option.value}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Date Range Filter */}
          <AccordionItem value="date">
            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
              Período
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Data inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs justify-start"
                        data-testid="filter-date-start"
                      >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {localFilters.dateRange?.start
                          ? format(localFilters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Selecionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.dateRange?.start || undefined}
                        onSelect={(date) => handleDateChange('start', date)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs justify-start"
                        data-testid="filter-date-end"
                      >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {localFilters.dateRange?.end
                          ? format(localFilters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Selecionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.dateRange?.end || undefined}
                        onSelect={(date) => handleDateChange('end', date)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <div className="p-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handleApply}
            data-testid="apply-filters-button"
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}