import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, GitCommit, Clock, FileCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSyncHistory } from '@/hooks/system/useSyncHistory';
import { Badge, Button, Card } from "@/components/ui/themed"

export function SyncHistoryPanel() {
  const { history, isLoading, refetch } = useSyncHistory(15);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          <Clock className="h-5 w-5 text-primary" />
          Histórico de Sincronizações
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      
      <div className="mt-4">
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitCommit className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sincronização registrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {entry.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : entry.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <GitCommit className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={entry.sync_type === 'auto' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {entry.sync_type === 'auto' ? '🤖 Auto' : 
                         entry.sync_type === 'webhook' ? '🔗 Webhook' : '👤 Manual'}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <FileCode className="h-3 w-3" />
                        {entry.files_synced} arquivos
                      </Badge>
                      {entry.files_skipped > 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {entry.files_skipped} ignorados
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {entry.commit_message || 'Sem mensagem'}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(entry.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </span>
                      {entry.duration_ms && (
                        <span>• {(entry.duration_ms / 1000).toFixed(1)}s</span>
                      )}
                      <code className="font-mono text-xs">
                        {entry.commit_sha.substring(0, 7)}
                      </code>
                    </div>
                  </div>
                  
                  {entry.commit_url && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(entry.commit_url!, '_blank')} aria-label="Abrir em nova aba">
                      <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}
