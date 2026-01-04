import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, Trash2, CheckCircle2, XCircle, Clock, 
  TrendingUp, BarChart3, Filter, FileJson, FileSpreadsheet, List, PieChart
} from 'lucide-react';
import { useVoiceCommandHistory, VoiceCommandHistoryEntry } from '@/hooks/player/useVoiceCommandHistory';
import { VoiceAnalyticsCharts } from './VoiceAnalyticsCharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge, Button } from "@/components/ui/themed"

export function VoiceCommandHistory() {
  const { history, stats, analytics, clearHistory, exportAsJSON, exportAsCSV, getFilteredHistory } = useVoiceCommandHistory();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredHistory = getFilteredHistory({
    action: filterAction !== 'all' ? filterAction : undefined,
    successOnly: filterStatus === 'success',
    failedOnly: filterStatus === 'failed'
  }).slice(-50).reverse(); // Show last 50, newest first

  const uniqueActions = [...new Set(history.map(h => h.action).filter(Boolean))];

  const handleExportJSON = () => {
    const data = exportAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Histórico exportado como JSON');
  };

  const handleExportCSV = () => {
    const data = exportAsCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Histórico exportado como CSV');
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
      clearHistory();
      toast.success('Histórico limpo');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 aria-hidden="true" className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhum comando registrado ainda</p>
        <p className="text-xs mt-1">Os comandos de voz serão registrados aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-kiosk-background/50 rounded-lg p-3 border border-kiosk-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="text-xs">Total</span>
          </div>
          <p className="text-xl font-bold text-kiosk-text">{stats.totalCommands}</p>
        </div>
        
        <div className="bg-kiosk-background/50 rounded-lg p-3 border border-kiosk-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs">Taxa de Sucesso</span>
          </div>
          <p className="text-xl font-bold text-green-500">{stats.successRate}%</p>
        </div>
        
        <div className="bg-kiosk-background/50 rounded-lg p-3 border border-kiosk-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs">Confiança Média</span>
          </div>
          <p className="text-xl font-bold text-kiosk-primary">{stats.averageConfidence}%</p>
        </div>
        
        <div className="bg-kiosk-background/50 rounded-lg p-3 border border-kiosk-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Hoje</span>
          </div>
          <p className="text-xl font-bold text-kiosk-text">{stats.commandsToday}</p>
        </div>
      </div>

      {/* Most Used Commands */}
      {stats.mostUsedCommands.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Mais usados:</span>
          {stats.mostUsedCommands.slice(0, 3).map(({ action, count }) => (
            <Badge key={action} variant="secondary" className="text-xs">
              {action} ({count})
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs for List/Charts */}
      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <TabsList className="bg-kiosk-background/50">
            <TabsTrigger value="list" className="text-xs gap-1.5">
              <List className="h-3.5 w-3.5" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs gap-1.5">
              <PieChart className="h-3.5 w-3.5" />
              Gráficos
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-1">
            <Button variant="ghost" size="xs" className="h-8 w-8" onClick={handleExportJSON} title="Exportar JSON">
              <FileJson className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="xs" className="h-8 w-8" onClick={handleExportCSV} title="Exportar CSV">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="xs" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={handleClearHistory} title="Limpar histórico" aria-label="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="mt-4">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-3">
            <Filter aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-32 h-8 text-xs bg-kiosk-background border-kiosk-border">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ações</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action!}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 h-8 text-xs bg-kiosk-background border-kiosk-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* History List */}
          <ScrollArea className="h-64 rounded-lg border border-kiosk-border">
            <div className="p-2 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((entry, index) => (
                  <HistoryEntryCard key={entry.id} entry={entry} index={index} />
                ))}
              </AnimatePresence>
              
              {filteredHistory.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhum resultado para os filtros selecionados
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <VoiceAnalyticsCharts analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HistoryEntryCard({ entry, index }: { entry: VoiceCommandHistoryEntry; index: number }) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500 bg-green-500/10';
    if (confidence >= 0.6) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-start gap-3 p-2.5 rounded-lg bg-kiosk-background/30 hover:bg-kiosk-background/50 transition-colors"
    >
      <div className="flex-shrink-0 mt-0.5">
        {entry.success ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-kiosk-text truncate">"{entry.transcript}"</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {entry.action && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {entry.action}
            </Badge>
          )}
          {entry.searchQuery && (
            <Badge variant="outline" className="text-[10px] h-5">
              🔍 {entry.searchQuery}
            </Badge>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getConfidenceColor(entry.confidence)}`}>
            {Math.round(entry.confidence * 100)}%
          </span>
          {entry.processingTimeMs && (
            <span className="text-[10px] text-muted-foreground">
              {entry.processingTimeMs.toFixed(0)}ms
            </span>
          )}
        </div>
      </div>
      
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {formatTime(entry.timestamp)}
      </span>
    </motion.div>
  );
}
