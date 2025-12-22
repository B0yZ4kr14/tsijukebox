import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Server,
  History,
  Zap,
  Shield,
} from 'lucide-react';
import { useKioskMonitor, type KioskConnection } from '@/hooks/system/useKioskMonitor';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';

export default function KioskMonitorDashboard() {
  const { 
    kiosks, 
    metrics, 
    isLoading, 
    error, 
    refetch,
    getTimeSinceHeartbeat,
    getStatusColor,
    getStatusIcon,
    formatUptime,
  } = useKioskMonitor();
  
  const [selectedKiosk, setSelectedKiosk] = useState<KioskConnection | null>(null);
  const [activeTab, setActiveTab] = useState('kiosks');

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erro ao Carregar Kiosks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Monitor className="h-8 w-8 text-primary" />
            Monitor de Kiosks
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real de instalações kiosk conectadas
          </p>
        </div>
        <Button onClick={refetch} disabled={isLoading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total"
          value={metrics?.total || 0}
          icon={<Server className="h-5 w-5" />}
          color="text-primary"
        />
        <MetricCard
          title="Online"
          value={metrics?.online || 0}
          icon={<Wifi className="h-5 w-5" />}
          color="text-green-500"
        />
        <MetricCard
          title="Offline"
          value={metrics?.offline || 0}
          icon={<WifiOff className="h-5 w-5" />}
          color="text-red-500"
        />
        <MetricCard
          title="Com Erro"
          value={metrics?.error || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-yellow-500"
        />
        <MetricCard
          title="Uptime Total"
          value={`${metrics?.total_uptime_hours || 0}h`}
          icon={<Clock className="h-5 w-5" />}
          color="text-blue-500"
        />
        <MetricCard
          title="Crashes 24h"
          value={metrics?.total_crashes || 0}
          icon={<Zap className="h-5 w-5" />}
          color="text-orange-500"
        />
      </div>

      {/* Tabs: Kiosks / Auditoria */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kiosks" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Kiosks
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kiosks" className="mt-6">
          {/* Lista de Kiosks */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Kiosks Conectados
                  </CardTitle>
                  <CardDescription>
                    Clique em um kiosk para ver detalhes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : kiosks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum kiosk conectado ainda.</p>
                      <p className="text-sm mt-2">
                        Instale o TSiJUKEBOX em modo kiosk para ver os dispositivos aqui.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        <AnimatePresence>
                          {kiosks.map((kiosk) => (
                            <motion.div
                              key={kiosk.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <KioskRow
                                kiosk={kiosk}
                                isSelected={selectedKiosk?.id === kiosk.id}
                                onClick={() => setSelectedKiosk(kiosk)}
                                getTimeSinceHeartbeat={getTimeSinceHeartbeat}
                                getStatusIcon={getStatusIcon}
                                formatUptime={formatUptime}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Kiosk Selecionado */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Detalhes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedKiosk ? (
                    <KioskDetails 
                      kiosk={selectedKiosk} 
                      getStatusColor={getStatusColor}
                      formatUptime={formatUptime}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Selecione um kiosk para ver detalhes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogViewer category="kiosk" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de Métrica
function MetricCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`${color} opacity-80`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Linha do Kiosk
function KioskRow({ 
  kiosk, 
  isSelected, 
  onClick,
  getTimeSinceHeartbeat,
  getStatusIcon,
  formatUptime,
}: { 
  kiosk: KioskConnection; 
  isSelected: boolean; 
  onClick: () => void;
  getTimeSinceHeartbeat: (date: string | null) => string;
  getStatusIcon: (status: KioskConnection['status']) => string;
  formatUptime: (seconds: number) => string;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getStatusIcon(kiosk.status)}</span>
          <div>
            <p className="font-medium">{kiosk.hostname}</p>
            <p className="text-xs text-muted-foreground">
              {kiosk.ip_address || 'IP desconhecido'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant={kiosk.status === 'online' ? 'default' : 'secondary'}>
            {kiosk.status}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {getTimeSinceHeartbeat(kiosk.last_heartbeat)}
          </p>
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <span>⏱️ {formatUptime(kiosk.uptime_seconds)}</span>
        <span>💥 {kiosk.crash_count} crashes</span>
        {kiosk.last_event && <span>📝 {kiosk.last_event}</span>}
      </div>
    </div>
  );
}

// Componente de Detalhes do Kiosk
function KioskDetails({ 
  kiosk, 
  getStatusColor,
  formatUptime,
}: { 
  kiosk: KioskConnection;
  getStatusColor: (status: KioskConnection['status']) => string;
  formatUptime: (seconds: number) => string;
}) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
        <TabsTrigger value="metrics" className="flex-1">Métricas</TabsTrigger>
        <TabsTrigger value="events" className="flex-1">Eventos</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Hostname</div>
          <div className="font-medium">{kiosk.hostname}</div>
          
          <div className="text-muted-foreground">Machine ID</div>
          <div className="font-mono text-xs truncate">{kiosk.machine_id}</div>
          
          <div className="text-muted-foreground">IP</div>
          <div>{kiosk.ip_address || '-'}</div>
          
          <div className="text-muted-foreground">Status</div>
          <div className={getStatusColor(kiosk.status)}>{kiosk.status}</div>
          
          <div className="text-muted-foreground">Uptime</div>
          <div>{formatUptime(kiosk.uptime_seconds)}</div>
          
          <div className="text-muted-foreground">Crashes</div>
          <div>{kiosk.crash_count}</div>
          
          <div className="text-muted-foreground">Último Evento</div>
          <div>{kiosk.last_event || '-'}</div>
          
          <div className="text-muted-foreground">Conectado em</div>
          <div>{new Date(kiosk.created_at).toLocaleDateString('pt-BR')}</div>
        </div>
      </TabsContent>

      <TabsContent value="metrics" className="mt-4">
        {kiosk.metrics && Object.keys(kiosk.metrics).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(kiosk.metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">
            Sem métricas disponíveis
          </p>
        )}
      </TabsContent>

      <TabsContent value="events" className="mt-4">
        <ScrollArea className="h-[200px]">
          {kiosk.events && kiosk.events.length > 0 ? (
            <div className="space-y-2">
              {kiosk.events.slice(0, 20).map((event, idx) => (
                <div key={idx} className="text-sm border-l-2 border-primary/30 pl-2">
                  <div className="flex items-center gap-2">
                    <History className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{event.event}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">
              Sem eventos registrados
            </p>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
