import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Clock,
  FileCode,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  Timer,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UseAutoSyncReturn } from '@/hooks/system/useAutoSync';

interface AutoSyncPanelProps {
  autoSync: UseAutoSyncReturn;
}

const INTERVAL_OPTIONS = [
  { value: '5', label: '5 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hora' },
  { value: '120', label: '2 horas' },
];

export function AutoSyncPanel({ autoSync }: AutoSyncPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const {
    isEnabled,
    isSyncing,
    lastSync,
    nextSync,
    pendingFiles,
    pendingCount,
    syncInterval,
    toggle,
    triggerSync,
    setSyncInterval,
    clearSyncedFiles,
    getTimeUntilNextSync
  } = autoSync;

  // Update countdown every second
  useEffect(() => {
    if (!isEnabled || !nextSync) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const seconds = getTimeUntilNextSync();
      setCountdown(seconds);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isEnabled, nextSync, getTimeUntilNextSync]);

  const formatCountdown = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressValue = (): number => {
    if (!countdown || !syncInterval) return 0;
    const totalSeconds = syncInterval * 60;
    const elapsed = totalSeconds - countdown;
    return Math.min(100, (elapsed / totalSeconds) * 100);
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'critical': return 'text-red-500';
      case 'important': return 'text-orange-500';
      case 'docs': return 'text-blue-500';
      case 'config': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
              Auto-Sync
              <Badge 
                variant={isEnabled ? 'default' : 'secondary'}
                className={isEnabled ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isEnabled ? 'ON' : 'OFF'}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Switch
                id="auto-sync-toggle"
                checked={isEnabled}
                onCheckedChange={toggle}
              />
              <Label htmlFor="auto-sync-toggle" className="sr-only">
                Auto-Sync
              </Label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Last Sync */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Último sync</p>
              <p className="text-sm font-medium">
                {lastSync 
                  ? formatDistanceToNow(lastSync, { addSuffix: true, locale: ptBR })
                  : 'Nunca'
                }
              </p>
            </div>

            {/* Next Sync Countdown */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Timer className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Próximo sync</p>
              <p className={`text-sm font-mono font-bold ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                {isEnabled ? formatCountdown(countdown) : '--:--'}
              </p>
            </div>

            {/* Pending Files */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <FileCode className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-sm font-bold">
                {pendingCount}
                {pendingCount > 0 && (
                  <span className="ml-1 inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar (when enabled) */}
          {isEnabled && (
            <div className="space-y-1">
              <Progress value={getProgressValue()} className="h-1" />
            </div>
          )}

          {/* Controls Row */}
          <div className="flex items-center gap-3">
            {/* Interval Selector */}
            <div className="flex items-center gap-2 flex-1">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                Intervalo:
              </Label>
              <Select
                value={syncInterval.toString()}
                onValueChange={(val) => setSyncInterval(parseInt(val))}
                disabled={isSyncing}
              >
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sync Now Button */}
            <Button
              size="sm"
              onClick={triggerSync}
              disabled={isSyncing || pendingCount === 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Zap className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          {/* Pending Files List (Collapsible) */}
          {pendingCount > 0 && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    {pendingCount} arquivo(s) pendente(s)
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <ScrollArea className="h-32 rounded-md border border-border/50 bg-muted/20 p-2">
                      <div className="space-y-1">
                        {pendingFiles.map((file, idx) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40 group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-1 ${getCategoryColor(file.category)}`}
                              >
                                {file.priority}
                              </Badge>
                              <code className="text-xs truncate flex-1">{file.file_path}</code>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-destructive hover:text-destructive"
                      onClick={clearSyncedFiles}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpar sincronizados
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Empty State */}
          {pendingCount === 0 && isEnabled && (
            <div className="text-center py-3 text-sm text-muted-foreground">
              <Check className="h-5 w-5 mx-auto mb-1 text-green-500" />
              Nenhum arquivo pendente
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
