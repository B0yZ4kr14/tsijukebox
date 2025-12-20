import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { useStatus, useLogs } from '@/hooks';
import { Cpu, HardDrive, Thermometer, Music, Play, Pause, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentBoundary } from '@/components/errors/SuspenseBoundary';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  status 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  status?: 'good' | 'warning' | 'danger';
}) {
  return (
    <Card className="card-admin-extreme-3d">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-label-yellow">{title}</CardTitle>
        <Icon className={cn(
          "h-4 w-4 icon-neon-blue",
          status === 'good' && "text-green-400",
          status === 'warning' && "text-yellow-400",
          status === 'danger' && "text-destructive"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function getStatus(value: number, thresholds: { warning: number; danger: number }) {
  if (value >= thresholds.danger) return 'danger';
  if (value >= thresholds.warning) return 'warning';
  return 'good';
}

export default function Admin() {
  const { data: status } = useStatus();
  const { data: logs } = useLogs(10);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <LogoBrand size="sm" variant="metal" centered={false} animate={false} />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gold-neon">Dashboard</h2>
            <p className="text-kiosk-text/90">Visão geral do sistema</p>
          </div>
        </div>

        {/* Stats Grid */}
        <ComponentBoundary loadingMessage="Carregando estatísticas...">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="CPU"
              value={`${status?.cpu?.toFixed(1) ?? 0}%`}
              icon={Cpu}
              status={getStatus(status?.cpu ?? 0, { warning: 70, danger: 90 })}
            />
            <StatCard
              title="Memória"
              value={`${status?.memory?.toFixed(1) ?? 0}%`}
              icon={HardDrive}
              status={getStatus(status?.memory ?? 0, { warning: 75, danger: 90 })}
            />
            <StatCard
              title="Temperatura"
              value={`${status?.temp?.toFixed(1) ?? 0}°C`}
              icon={Thermometer}
              status={getStatus(status?.temp ?? 0, { warning: 60, danger: 75 })}
            />
            <StatCard
              title="Player"
              value={status?.playing ? 'Tocando' : 'Parado'}
              icon={status?.playing ? Play : Pause}
              status={status?.playing ? 'good' : undefined}
            />
          </div>
        </ComponentBoundary>

        {/* Current Track */}
        <ComponentBoundary loadingMessage="Carregando faixa atual...">
          <Card className="card-admin-extreme-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold-neon">
                <Music className="h-5 w-5 icon-neon-blue" />
                Faixa Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status?.track ? (
                <div className="flex items-center gap-4">
                  {status.track.cover ? (
                    <img 
                      src={status.track.cover} 
                      alt="Album cover"
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                      <Music className="w-8 h-8 icon-neon-blue" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{status.track.title}</p>
                    <p className="text-sm text-kiosk-text/85">{status.track.artist}</p>
                    {status.track.album && (
                      <p className="text-sm text-kiosk-text/85">{status.track.album}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-kiosk-text/85">Nenhuma faixa em reprodução</p>
              )}
            </CardContent>
          </Card>
        </ComponentBoundary>

        {/* Recent Logs */}
        <ComponentBoundary loadingMessage="Carregando logs...">
          <Card className="card-admin-extreme-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold-neon">
                <AlertCircle className="h-5 w-5 icon-neon-blue" />
                Logs Recentes
              </CardTitle>
              <CardDescription>Últimas 10 entradas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs?.slice(0, 10).map((log) => (
                  <div 
                    key={log.id}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md text-sm",
                      log.level === 'ERROR' && "bg-destructive/10",
                      log.level === 'WARNING' && "bg-yellow-500/10",
                      log.level === 'INFO' && "bg-muted"
                    )}
                  >
                    <span className={cn(
                      "font-mono text-xs px-1.5 py-0.5 rounded",
                      log.level === 'ERROR' && "bg-destructive text-destructive-foreground",
                      log.level === 'WARNING' && "bg-yellow-500 text-black",
                      log.level === 'INFO' && "bg-primary text-primary-foreground"
                    )}>
                      {log.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{log.message}</p>
                      <p className="text-xs text-kiosk-text/85">{log.module} • {log.timestamp}</p>
                    </div>
                  </div>
                )) ?? (
                  <p className="text-kiosk-text/85">Nenhum log disponível</p>
                )}
              </div>
            </CardContent>
          </Card>
        </ComponentBoundary>
      </div>
    </AdminLayout>
  );
}
