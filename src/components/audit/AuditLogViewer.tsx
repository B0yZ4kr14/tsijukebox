import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  History,
  RefreshCw,
  Filter,
  Download,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useAuditLogs, type AuditLog } from '@/hooks/useAuditLogs';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge, Button, Card, Input } from "@/components/ui/themed"

interface AuditLogViewerProps {
  targetId?: string;
  category?: string;
  compact?: boolean;
}

const CATEGORIES = [
  { value: 'kiosk', label: 'Kiosk' },
  { value: 'user', label: 'Usuário' },
  { value: 'system', label: 'Sistema' },
  { value: 'security', label: 'Segurança' },
];

const SEVERITIES = [
  { value: 'info', label: 'Info', color: 'bg-blue-500' },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failure':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'kiosk':
      return '🖥️';
    case 'user':
      return '👤';
    case 'security':
      return '🔐';
    case 'system':
      return '⚙️';
    default:
      return '📋';
  }
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/kiosk /i, '')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function AuditLogViewer({ targetId, category: initialCategory, compact = false }: AuditLogViewerProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    logs,
    isLoading,
    error,
    filters,
    hasMore,
    stats,
    fetchLogs,
    loadMore,
    updateFilters,
    clearFilters,
  } = useAuditLogs({
    targetId,
    category: initialCategory,
  });

  const handleSearch = () => {
    updateFilters({ search: searchTerm });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    link.click();
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Ação', 'Categoria', 'Severidade', 'Alvo', 'Status', 'Ator'];
    const rows = logs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.action,
      log.category,
      log.severity,
      log.target_name || log.target_id || '-',
      log.status,
      log.actor_email || '-',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw aria-hidden="true" className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Nenhum log de auditoria encontrado
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {logs.slice(0, 20).map((log) => (
                <AuditLogRow key={log.id} log={log} compact />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <Shield className="h-5 w-5" />
              Logs de Auditoria
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Rastreamento de ações administrativas e eventos do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter aria-hidden="true" className="h-4 w-4 mr-1" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download aria-hidden="true" className="h-4 w-4 mr-1" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download aria-hidden="true" className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
              <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por ação, alvo ou ator..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button variant="secondary" size="sm" onClick={handleSearch}>
                      <Search aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Select 
                  value={filters.category || 'all'} 
                  onValueChange={(v) => updateFilters({ category: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.severity || 'all'} 
                  onValueChange={(v) => updateFilters({ severity: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {SEVERITIES.map(sev => (
                      <SelectItem key={sev.value} value={sev.value}>{sev.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  Total: <strong>{stats.total}</strong>
                </span>
                {stats.bySeverity.critical > 0 && (
                  <span className="text-destructive">
                    Críticos: <strong>{stats.bySeverity.critical}</strong>
                  </span>
                )}
                {stats.bySeverity.warning > 0 && (
                  <span className="text-yellow-500">
                    Avisos: <strong>{stats.bySeverity.warning}</strong>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      

      <div className="mt-4">
        {error ? (
          <div className="text-center py-8 text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchLogs}>
              Tentar Novamente
            </Button>
          </div>
        ) : isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw aria-hidden="true" className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum log de auditoria encontrado</p>
            {Object.keys(filters).length > 0 && (
              <Button variant="ghost" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <AuditLogRow log={log} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {hasMore && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function AuditLogRow({ log, compact = false }: { log: AuditLog; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="text-sm border-l-2 border-primary/30 pl-2 py-1">
        <div className="flex items-center gap-2">
          {getSeverityIcon(log.severity)}
          <span className="font-medium">{formatAction(log.action)}</span>
          {log.target_name && (
            <span className="text-muted-foreground">→ {log.target_name}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(log.timestamp), "HH:mm:ss", { locale: ptBR })}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        p-3 rounded-lg border transition-all cursor-pointer
        ${log.severity === 'critical' ? 'border-destructive/50 bg-destructive/5' : ''}
        ${log.severity === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' : ''}
        hover:bg-accent/50
      `}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">{getCategoryIcon(log.category)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {getSeverityIcon(log.severity)}
              <span className="font-medium">{formatAction(log.action)}</span>
              {log.target_name && (
                <span className="text-muted-foreground">→ {log.target_name}</span>
              )}
              {getStatusIcon(log.status)}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>
                {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
              </span>
              {log.actor_email && (
                <span>por {log.actor_email}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {log.category}
          </Badge>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t text-sm space-y-2"
          >
            {log.target_id && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Target ID:</span>
                <code className="text-xs bg-muted px-1 rounded">{log.target_id}</code>
              </div>
            )}
            {log.error_message && (
              <div className="p-2 rounded bg-destructive/10 text-destructive text-xs">
                {log.error_message}
              </div>
            )}
            {Object.keys(log.details).length > 0 && (
              <div>
                <span className="text-muted-foreground">Detalhes:</span>
                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AuditLogViewer;