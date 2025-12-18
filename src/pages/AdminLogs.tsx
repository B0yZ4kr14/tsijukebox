import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLogs } from '@/hooks/useLogs';
import { FileText, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogLevel = 'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';

export default function AdminLogs() {
  const [limit, setLimit] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
  
  const { data: logs, isLoading, refetch, isFetching } = useLogs(limit, autoRefresh);

  const filteredLogs = logs?.filter(log => 
    levelFilter === 'ALL' || log.level === levelFilter
  ) ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gold-neon">Logs do Sistema</h2>
          <p className="text-kiosk-text/70">Visualize os logs de atividade do sistema</p>
        </div>

        <Card className="card-admin-extreme-3d">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gold-neon">Registros</CardTitle>
                <CardDescription className="text-kiosk-text/70">
                  {filteredLogs.length} entradas {levelFilter !== 'ALL' && `(filtrado: ${levelFilter})`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {/* Auto-refresh toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
                </div>

                {/* Level filter */}
                <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="WARNING">WARNING</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                    <SelectItem value="DEBUG">DEBUG</SelectItem>
                  </SelectContent>
                </Select>

                {/* Limit selector */}
                <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Limite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>

                {/* Manual refresh */}
                <Button
                  variant="kiosk-outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className={cn("w-4 h-4 icon-neon-blue", isFetching && "animate-spin")} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin icon-neon-blue" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="w-12 h-12 icon-neon-blue mb-4" />
                <p className="text-kiosk-text/70">Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Nível</TableHead>
                      <TableHead className="w-40">Timestamp</TableHead>
                      <TableHead className="w-32">Módulo</TableHead>
                      <TableHead>Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <span className={cn(
                            "font-mono text-xs px-2 py-0.5 rounded",
                            log.level === 'ERROR' && "bg-destructive text-destructive-foreground",
                            log.level === 'WARNING' && "bg-yellow-500 text-black",
                            log.level === 'INFO' && "bg-blue-500 text-white",
                            log.level === 'DEBUG' && "bg-muted text-muted-foreground"
                          )}>
                            {log.level}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.timestamp}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.module}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
