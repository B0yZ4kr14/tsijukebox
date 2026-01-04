import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Download,
  HardDrive,
  Database,
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstallerMetrics, MetricsPeriod } from '@/hooks/system/useInstallerMetrics';
import { Badge, Button, Card } from "@/components/ui/themed"
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

export default function InstallerMetrics() {
  const { 
    metrics, 
    isLoading, 
    period, 
    setPeriod, 
    refreshMetrics,
    lastUpdated 
  } = useInstallerMetrics();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMetrics();
    setIsRefreshing(false);
  };

  // Use real data or fallback to empty
  const data = metrics || {
    totalInstalls: 0,
    successRate: 0,
    failureRate: 0,
    avgTimeMinutes: 0,
    todayInstalls: 0,
    weeklyGrowth: 0,
    installsByDay: [],
    installTimeHistory: [],
    distroData: [],
    databaseData: [],
    errorTypes: [],
  };

  return (
    <KioskLayout>
      <motion.div
        className="min-h-screen bg-kiosk-background p-4 md:p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LogoBrand size="md" variant="mirror" animate />
        </motion.div>

        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
            <Link to="/settings">
              <Button
                variant="ghost"
                size="xs"
                className="w-12 h-12 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80 button-3d"
              >
                <ArrowLeft className="w-6 h-6 text-kiosk-text" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gold-neon flex items-center gap-2">
                <BarChart3 className="w-6 h-6 icon-neon-blue" />
                Métricas do Instalador
              </h1>
              <p className="text-kiosk-text/85 text-sm">
                Analytics anonimizadas de instalação
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as MetricsPeriod)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="all">Tudo</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              )}
              Atualizar
            </Button>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto space-y-6 pb-8">
          {/* KPI Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-neon-border bg-kiosk-surface/80">
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-kiosk-text/70">Total Instalações</p>
                    <p className="text-2xl font-bold text-kiosk-text">{data.totalInstalls.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-neon-border bg-kiosk-surface/80">
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-kiosk-text/70">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-green-400">{data.successRate}%</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-neon-border bg-kiosk-surface/80">
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-kiosk-text/70">Tempo Médio</p>
                    <p className="text-2xl font-bold text-kiosk-text">{data.avgTimeMinutes} min</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-neon-border bg-kiosk-surface/80">
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-kiosk-text/70">Crescimento Semanal</p>
                    <p className="text-2xl font-bold text-purple-400">+{data.weeklyGrowth}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Installs by Day */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    <BarChart3 className="w-4 h-4 icon-neon-blue" />
                    Instalações por Dia
                  </h3>
                
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.installsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="success" stackId="a" fill="hsl(160, 80%, 45%)" name="Sucesso" />
                      <Bar dataKey="failed" stackId="a" fill="hsl(0, 80%, 50%)" name="Falha" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Installation Time Trend */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    <Clock className="w-4 h-4 icon-neon-blue" />
                    Tempo Médio de Instalação
                  </h3>
                
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.installTimeHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" min" />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgTime" 
                        stroke="hsl(195, 100%, 50%)" 
                        fill="hsl(195, 100%, 50%)" 
                        fillOpacity={0.2}
                        name="Tempo (min)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Distro Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    <HardDrive className="w-4 h-4 icon-neon-blue" />
                    Por Distribuição
                  </h3>
                
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.distroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.distroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {data.distroData.map((entry) => (
                      <Badge 
                        key={entry.name} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: entry.color, color: entry.color }}
                      >
                        {entry.name}: {entry.value}%
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Database Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    <Database className="w-4 h-4 icon-neon-blue" />
                    Por Banco de Dados
                  </h3>
                
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.databaseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.databaseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {data.databaseData.map((entry) => (
                      <Badge 
                        key={entry.name} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: entry.color, color: entry.color }}
                      >
                        {entry.name}: {entry.value}%
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Error Types */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    <XCircle className="w-4 h-4 icon-neon-blue" />
                    Tipos de Erros
                  </h3>
                
                <div className="mt-4">
                  <div className="space-y-3">
                    {data.errorTypes.map((error) => (
                      <div key={error.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-kiosk-text">{error.name}</span>
                          <span className="text-kiosk-text/70">{error.count} ({error.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-kiosk-bg rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-red-500/70 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${error.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Info Note */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-kiosk-surface/50 border-cyan-500/20">
              <div className="mt-4">
                <p className="text-sm text-kiosk-text/70 text-center">
                  📊 Dados coletados anonimamente pelo módulo analytics.py do instalador. 
                  Nenhuma informação pessoal é armazenada. 
                  Ative com <code className="text-cyan-400">--analytics</code> durante a instalação.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </KioskLayout>
  );
}
