import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Eye,
  Image,
  Accessibility,
  FileCode,
  PieChart,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { BackButton } from '@/components/ui/BackButton';
import { useA11yStats } from '@/hooks';
import { Badge, Button, Card } from "@/components/ui/themed"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function A11yDashboard() {
  const {
    stats,
    isLoading,
    runScan,
    violationsByType,
    violationsBySeverity,
    complianceData,
    opacityChartData,
    coverageChartData,
  } = useA11yStats();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info': return <Info className="w-4 h-4 text-cyan-500" />;
      default: return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return variants[severity] || variants.info;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-kiosk-bg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <BackButton className="text-nav-neon-white hover:text-kiosk-text" />
          <div>
            <h1 className="text-2xl font-bold text-gold-neon flex items-center gap-2">
              <Accessibility className="w-6 h-6 icon-neon-blue" />
              Dashboard de Acessibilidade
            </h1>
            <p className="text-description-visible text-sm">
              Estatísticas WCAG e conformidade do projeto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LogoBrand variant="metal" size="sm" showTagline={false} />
          <Button
            onClick={runScan}
            disabled={isLoading}
            className="button-control-extreme-3d"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Escaneando...' : 'Executar Scan'}
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="card-dark-neon-border">
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-yellow text-sm font-semibold">PONTUAÇÃO GERAL</p>
                    <p className={`text-4xl font-bold ${getScoreColor(stats.overallScore)}`}>
                      {stats.overallScore}%
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center" aria-hidden="true">
                    <TrendingUp className="w-8 h-8 icon-neon-blue" />
                  </div>
                </div>
                <Progress value={stats.overallScore} className="mt-4 h-2" />
              </div>
            </Card>

            <Card className="card-dark-neon-border">
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-yellow text-sm font-semibold">ELEMENTOS</p>
                    <p className="text-4xl font-bold text-kiosk-text">
                      {stats.totalElements.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center" aria-hidden="true">
                    <FileCode className="w-8 h-8 icon-neon-blue" />
                  </div>
                </div>
                <p className="text-description-visible text-sm mt-2">
                  {stats.conformingElements.toLocaleString()} conformes
                </p>
              </div>
            </Card>

            <Card className="card-dark-neon-border">
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-yellow text-sm font-semibold">VIOLAÇÕES</p>
                    <p className="text-4xl font-bold text-amber-400">
                      {stats.violations.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center" aria-hidden="true">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {violationsBySeverity.error} erros
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {violationsBySeverity.warning} avisos
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="card-dark-neon-border">
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-yellow text-sm font-semibold">RATIO MÉDIO</p>
                    <p className="text-4xl font-bold text-green-400">
                      {stats.contrastStats.averageRatio}:1
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center" aria-hidden="true">
                    <Eye className="w-8 h-8 icon-neon-blue" />
                  </div>
                </div>
                <p className="text-description-visible text-sm mt-2">
                  WCAG AA requer 4.5:1
                </p>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Compliance Pie Chart */}
            <Card className="card-dark-neon-border">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <PieChart className="w-5 h-5 icon-neon-blue" />
                  Conformidade Geral
                </h3>
              
              <div className="mt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {complianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(220 25% 12%)',
                          border: '1px solid hsl(185 80% 50% / 0.3)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Opacity Distribution */}
            <Card className="card-dark-neon-border">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <BarChart3 className="w-5 h-5 icon-neon-blue" />
                  Distribuição de Opacidades
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Classes de opacidade text-*/* usadas
                </p>
              
              <div className="mt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={opacityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 25%)" />
                      <XAxis dataKey="opacity" stroke="hsl(0 0% 70%)" />
                      <YAxis stroke="hsl(0 0% 70%)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(220 25% 12%)',
                          border: '1px solid hsl(185 80% 50% / 0.3)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(185 80% 50%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Coverage Stats */}
            <Card className="card-dark-neon-border">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <Image className="w-5 h-5 icon-neon-blue" />
                  Cobertura de Atributos
                </h3>
              
              <div className="mt-4">
                <div className="space-y-6">
                  {coverageChartData.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-kiosk-text font-medium">{item.name}</span>
                        <span className={`font-bold ${item.percentage >= 90 ? 'text-green-400' : 'text-amber-400'}`}>
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-3" />
                      <div className="flex justify-between mt-1 text-xs text-description-visible">
                        <span>{item.covered} cobertos</span>
                        <span>{item.missing} faltando</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Violations by Type */}
            <Card className="card-dark-neon-border">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <AlertTriangle className="w-5 h-5 icon-neon-blue" />
                  Violações por Tipo
                </h3>
              
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(violationsByType).map(([type, count]) => (
                    <div 
                      key={type}
                      className="p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20"
                    >
                      <p className="text-description-visible text-sm capitalize">{type}</p>
                      <p className="text-2xl font-bold text-kiosk-text">{count as number}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Violations Table */}
          <Card className="card-dark-neon-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <FileCode className="w-5 h-5 icon-neon-blue" />
                Lista de Violações
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Problemas detectados no último scan
              </p>
            
            <div className="mt-4">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/20">
                      <TableHead className="text-label-yellow">Severidade</TableHead>
                      <TableHead className="text-label-yellow">Tipo</TableHead>
                      <TableHead className="text-label-yellow">Arquivo</TableHead>
                      <TableHead className="text-label-yellow">Elemento</TableHead>
                      <TableHead className="text-label-yellow">Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.violations.map((violation) => (
                      <TableRow key={violation.id} className="border-cyan-500/10">
                        <TableCell>
                          <Badge className={getSeverityBadge(violation.severity)}>
                            {getSeverityIcon(violation.severity)}
                            <span className="ml-1 capitalize">{violation.severity}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-description-visible capitalize">
                          {violation.type}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-cyan-400">
                          {violation.file}
                          {violation.line && `:${violation.line}`}
                        </TableCell>
                        <TableCell className="text-description-visible">
                          <code className="bg-kiosk-surface/50 px-2 py-1 rounded text-xs">
                            {violation.element}
                          </code>
                        </TableCell>
                        <TableCell className="text-description-visible text-sm">
                          {violation.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </Card>

          {/* Scan Info */}
          <div className="mt-6 text-center text-description-visible text-sm">
            <p>
              Último scan: {stats.lastScanDate?.toLocaleString('pt-BR')} • 
              WCAG Exceptions documentadas: {stats.wcagExceptionsCount} • 
              Elementos nativos detectados: {stats.nativeElementsCount}
            </p>
          </div>
        </>
      )}

      {!stats && !isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Accessibility className="w-16 h-16 text-secondary-visible mx-auto mb-4" />
            <p className="text-nav-neon-white">Clique em "Executar Scan" para analisar a acessibilidade</p>
          </div>
        </div>
      )}
    </div>
  );
}
