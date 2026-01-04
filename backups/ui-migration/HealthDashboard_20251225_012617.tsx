import { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Wifi, WifiOff, AlertCircle, CheckCircle, 
  Clock, RefreshCw, Cpu, HardDrive, MemoryStick, Zap, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { useHealthMonitorWebSocket, HealthMetrics } from '@/hooks/system/useHealthMonitorWebSocket';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  tsijukebox: <Activity className="w-5 h-5" />,
  grafana: <Server className="w-5 h-5" />,
  prometheus: <Database className="w-5 h-5" />,
  spotify: <Zap className="w-5 h-5" />,
};

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400 border-green-500/50',
  inactive: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  failed: 'bg-red-500/20 text-red-400 border-red-500/50',
  unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

const STATUS_ICONS = {
  active: <CheckCircle className="w-4 h-4 text-green-400" />,
  inactive: <Clock className="w-4 h-4 text-yellow-400" />,
  failed: <AlertCircle className="w-4 h-4 text-red-400" />,
  unknown: <Clock className="w-4 h-4 text-slate-400" />,
};

function ServiceStatusCard({ 
  name, 
  status 
}: { 
  name: string; 
  status: 'active' | 'inactive' | 'failed' | 'unknown';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm
        ${STATUS_COLORS[status]}
        transition-all duration-300
      `}
    >
      <div className="p-2 rounded-lg bg-background/50">
        {SERVICE_ICONS[name.toLowerCase()] || <Server className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <p className="font-semibold capitalize">{name}</p>
        <p className="text-xs text-muted-foreground capitalize">{status}</p>
      </div>
      {STATUS_ICONS[status]}
    </motion.div>
  );
}

function MetricGauge({ 
  label, 
  value, 
  max = 100, 
  unit = '%',
  icon,
  color = 'cyan'
}: { 
  label: string; 
  value: number; 
  max?: number;
  unit?: string;
  icon: React.ReactNode;
  color?: 'cyan' | 'green' | 'amber' | 'red';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    cyan: 'text-cyan-400 from-cyan-500 to-cyan-600',
    green: 'text-green-400 from-green-500 to-green-600',
    amber: 'text-amber-400 from-amber-500 to-amber-600',
    red: 'text-red-400 from-red-500 to-red-600',
  };
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>
              {value.toFixed(1)}{unit}
            </p>
          </div>
        </div>
        <Progress 
          value={percentage} 
          className="h-2"
        />
      </CardContent>
    </Card>
  );
}

function ConnectionIndicator({ isConnected, onReconnect }: { isConnected: boolean; onReconnect: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 gap-1">
          <Wifi className="w-3 h-3" />
          Conectado
        </Badge>
      ) : (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/50 gap-1">
          <WifiOff className="w-3 h-3" />
          Desconectado
        </Badge>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReconnect}
        className="h-7 px-2"
      >
        <RefreshCw className="w-3 h-3" />
      </Button>
    </div>
  );
}

function MetricsChart({ history }: { history: HealthMetrics[] }) {
  const chartData = history.map((h) => ({
    time: format(new Date(h.timestamp), 'HH:mm'),
    cpu: h.metrics.cpuPercent,
    memory: h.metrics.memoryPercent,
    disk: ((h.metrics.diskTotalGb - h.metrics.diskFreeGb) / h.metrics.diskTotalGb) * 100,
  }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Histórico de Métricas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(195, 100%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(195, 100%, 50%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(141, 70%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(141, 70%, 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="hsl(0, 0%, 50%)" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(0, 0%, 50%)" 
                fontSize={10}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(240, 10%, 10%)', 
                  border: '1px solid hsl(240, 10%, 20%)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="hsl(195, 100%, 50%)" 
                fill="url(#cpuGradient)"
                name="CPU"
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stroke="hsl(141, 70%, 50%)" 
                fill="url(#memGradient)"
                name="Memória"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-xs text-muted-foreground">CPU</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Memória</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsTimeline({ alerts }: { alerts: HealthMetrics['alerts'] }) {
  if (alerts.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Alertas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mb-2 text-green-500/50" />
            <p>Nenhum alerta ativo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const severityColors = {
    info: 'border-l-blue-500 bg-blue-500/10',
    warn: 'border-l-yellow-500 bg-yellow-500/10',
    error: 'border-l-red-500 bg-red-500/10',
    critical: 'border-l-red-600 bg-red-600/20',
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          Alertas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${severityColors[alert.severity]}`}
            >
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(alert.timestamp), 'dd/MM HH:mm')}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HealthDashboard() {
  const { data, isConnected, error, reconnect, history } = useHealthMonitorWebSocket({
    enabled: true,
    onConnect: () => console.log('[HealthDashboard] WebSocket connected'),
    onDisconnect: () => console.log('[HealthDashboard] WebSocket disconnected'),
  });

  // Mock data for initial render
  const mockData: HealthMetrics = {
    timestamp: new Date().toISOString(),
    services: {
      tsijukebox: 'active',
      grafana: 'active',
      prometheus: 'inactive',
      spotify: 'active',
    },
    metrics: {
      cpuPercent: 25,
      memoryPercent: 48,
      diskFreeGb: 45.2,
      diskTotalGb: 100,
    },
    alerts: [],
  };

  const currentData = data || mockData;
  const diskUsedPercent = ((currentData.metrics.diskTotalGb - currentData.metrics.diskFreeGb) / currentData.metrics.diskTotalGb) * 100;

  return (
    <KioskLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real do sistema
              </p>
            </div>
          </div>
          <ConnectionIndicator isConnected={isConnected} onReconnect={reconnect} />
        </div>

        {/* Services Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Status dos Serviços</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(currentData.services).map(([name, status]) => (
              <ServiceStatusCard key={name} name={name} status={status} />
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricGauge
            label="CPU"
            value={currentData.metrics.cpuPercent}
            icon={<Cpu className="w-5 h-5" />}
            color={currentData.metrics.cpuPercent > 80 ? 'red' : currentData.metrics.cpuPercent > 60 ? 'amber' : 'cyan'}
          />
          <MetricGauge
            label="Memória"
            value={currentData.metrics.memoryPercent}
            icon={<MemoryStick className="w-5 h-5" />}
            color={currentData.metrics.memoryPercent > 80 ? 'red' : currentData.metrics.memoryPercent > 60 ? 'amber' : 'green'}
          />
          <MetricGauge
            label="Disco"
            value={diskUsedPercent}
            icon={<HardDrive className="w-5 h-5" />}
            color={diskUsedPercent > 90 ? 'red' : diskUsedPercent > 75 ? 'amber' : 'cyan'}
          />
        </div>

        {/* Charts & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricsChart history={history.length > 0 ? history : [mockData]} />
          <AlertsTimeline alerts={currentData.alerts} />
        </div>

        {/* Last Update */}
        <div className="text-center text-xs text-muted-foreground">
          Última atualização: {format(new Date(currentData.timestamp), 'dd/MM/yyyy HH:mm:ss')}
        </div>
      </div>
    </KioskLayout>
  );
}
