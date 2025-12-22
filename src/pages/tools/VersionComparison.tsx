import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/BackButton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useVersionMetrics, VersionMetrics } from "@/hooks/system/useVersionMetrics";

const COLORS = [
  "hsl(195, 100%, 50%)",   // Cyan
  "hsl(280, 80%, 60%)",    // Purple
  "hsl(45, 100%, 50%)",    // Gold
  "hsl(340, 80%, 55%)",    // Pink
];

function formatDuration(ms: number): string {
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

function TrendIndicator({ trend, label }: { trend: "improving" | "stable" | "degrading"; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {trend === "improving" ? (
        <TrendingDown className="h-4 w-4 text-green-400" />
      ) : trend === "degrading" ? (
        <TrendingUp className="h-4 w-4 text-red-400" />
      ) : (
        <Minus className="h-4 w-4 text-yellow-400" />
      )}
      <span className={`text-sm ${
        trend === "improving" ? "text-green-400" : 
        trend === "degrading" ? "text-red-400" : "text-yellow-400"
      }`}>
        {label}
      </span>
    </div>
  );
}

function VersionCard({ 
  version, 
  isSelected, 
  onToggle,
  color 
}: { 
  version: VersionMetrics; 
  isSelected: boolean;
  onToggle: () => void;
  color?: string;
}) {
  return (
    <div 
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected 
          ? "border-primary bg-primary/10" 
          : "border-border/50 hover:border-primary/50"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Checkbox checked={isSelected} />
          <span className="font-mono font-bold" style={{ color: isSelected ? color : undefined }}>
            v{version.version}
          </span>
        </div>
        <Badge variant="outline" className={version.successRate >= 90 ? "border-green-500/50 text-green-400" : version.successRate >= 70 ? "border-yellow-500/50 text-yellow-400" : "border-red-500/50 text-red-400"}>
          {version.successRate}%
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-400" />
          {version.successCount} sucesso
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-400" />
          {version.failedCount} falhas
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(version.avgDurationMs)}
        </div>
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {version.totalInstalls} total
        </div>
      </div>
    </div>
  );
}

export default function VersionComparison() {
  const {
    versions,
    selectedVersions,
    comparisonData,
    regressionAnalysis,
    selectVersion,
    deselectVersion,
    isLoading,
    refresh,
  } = useVersionMetrics();

  const [activeTab, setActiveTab] = useState("timeline");

  const handleToggleVersion = (version: string) => {
    if (selectedVersions.includes(version)) {
      deselectVersion(version);
    } else {
      selectVersion(version);
    }
  };

  const getVersionColor = (version: string) => {
    const index = selectedVersions.indexOf(version);
    return index >= 0 ? COLORS[index % COLORS.length] : undefined;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-settings-title flex items-center gap-2">
                <GitCompare className="h-6 w-6 text-primary" />
                Comparação de Versões
              </h1>
              <p className="text-muted-foreground">
                Compare métricas de performance entre diferentes versões do instalador
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Version Selector */}
          <Card className="lg:col-span-1 card-dark-neon-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Versões
              </CardTitle>
              <CardDescription>
                Selecione até 4 versões para comparar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {versions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isLoading ? "Carregando..." : "Nenhuma versão encontrada"}
                    </div>
                  ) : (
                    versions.map((version) => (
                      <VersionCard
                        key={version.version}
                        version={version}
                        isSelected={selectedVersions.includes(version.version)}
                        onToggle={() => handleToggleVersion(version.version)}
                        color={getVersionColor(version.version)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Regression Analysis */}
              {regressionAnalysis && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Análise de Tendência</h4>
                    <TrendIndicator 
                      trend={regressionAnalysis.trend} 
                      label={
                        regressionAnalysis.trend === "improving" 
                          ? "Performance melhorando" 
                          : regressionAnalysis.trend === "degrading"
                          ? "Performance degradando"
                          : "Performance estável"
                      }
                    />
                    <div className="text-xs text-muted-foreground">
                      R² = {regressionAnalysis.rSquared.toFixed(3)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          <Card className="lg:col-span-3 card-dark-neon-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Análise Comparativa</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVersions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <GitCompare className="h-12 w-12 mb-4 opacity-50" />
                  <p>Selecione versões para comparar</p>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="bars">Barras</TabsTrigger>
                    <TabsTrigger value="radar">Radar</TabsTrigger>
                    <TabsTrigger value="scatter">Regressão</TabsTrigger>
                  </TabsList>

                  {/* Timeline Chart */}
                  <TabsContent value="timeline" className="mt-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comparisonData?.timeSeriesData || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: number) => [`${value}%`, "Taxa de Sucesso"]}
                          />
                          <Legend />
                          {selectedVersions.map((version, index) => (
                            <Line
                              key={version}
                              type="monotone"
                              dataKey={version}
                              name={`v${version}`}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length], r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  {/* Bar Chart */}
                  <TabsContent value="bars" className="mt-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={selectedVersions.map((v, i) => {
                            const metrics = versions.find((vm) => vm.version === v);
                            return {
                              version: `v${v}`,
                              successRate: metrics?.successRate || 0,
                              avgDuration: (metrics?.avgDurationMs || 0) / 60000,
                              installs: metrics?.totalInstalls || 0,
                              fill: COLORS[i % COLORS.length],
                            };
                          })}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="version" 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis 
                            yAxisId="left"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `${value}min`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="successRate" name="Taxa de Sucesso (%)" fill="hsl(195, 100%, 50%)" />
                          <Bar yAxisId="right" dataKey="avgDuration" name="Duração Média (min)" fill="hsl(45, 100%, 50%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  {/* Radar Chart */}
                  <TabsContent value="radar" className="mt-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={comparisonData?.radarData || []}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis 
                            dataKey="metric" 
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          />
                          <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 100]}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                          />
                          {selectedVersions.map((version, index) => (
                            <Radar
                              key={version}
                              name={`v${version}`}
                              dataKey={version}
                              stroke={COLORS[index % COLORS.length]}
                              fill={COLORS[index % COLORS.length]}
                              fillOpacity={0.2}
                            />
                          ))}
                          <Legend />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  {/* Scatter/Regression Chart */}
                  <TabsContent value="scatter" className="mt-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            type="number" 
                            dataKey="installs" 
                            name="Instalações"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="successRate" 
                            name="Taxa de Sucesso"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number, name: string) => {
                              if (name === "Taxa de Sucesso") return [`${value}%`, name];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          {selectedVersions.map((version, index) => {
                            const metrics = versions.find((vm) => vm.version === version);
                            if (!metrics) return null;
                            return (
                              <Scatter
                                key={version}
                                name={`v${version}`}
                                data={[{
                                  installs: metrics.totalInstalls,
                                  successRate: metrics.successRate,
                                  duration: metrics.avgDurationMs / 60000,
                                }]}
                                fill={COLORS[index % COLORS.length]}
                              />
                            );
                          })}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Comparison Table */}
        {selectedVersions.length > 0 && (
          <Card className="card-dark-neon-border">
            <CardHeader>
              <CardTitle className="text-base">Comparação Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground font-medium">Métrica</th>
                      {selectedVersions.map((version, index) => (
                        <th 
                          key={version} 
                          className="text-center p-3 font-medium"
                          style={{ color: COLORS[index % COLORS.length] }}
                        >
                          v{version}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">Total de Instalações</td>
                      {selectedVersions.map((version) => {
                        const metrics = versions.find((v) => v.version === version);
                        return <td key={version} className="text-center p-3 font-mono">{metrics?.totalInstalls || 0}</td>;
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">Taxa de Sucesso</td>
                      {selectedVersions.map((version) => {
                        const metrics = versions.find((v) => v.version === version);
                        const rate = metrics?.successRate || 0;
                        return (
                          <td key={version} className="text-center p-3">
                            <Badge variant="outline" className={rate >= 90 ? "border-green-500/50 text-green-400" : rate >= 70 ? "border-yellow-500/50 text-yellow-400" : "border-red-500/50 text-red-400"}>
                              {rate}%
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">Tempo Médio</td>
                      {selectedVersions.map((version) => {
                        const metrics = versions.find((v) => v.version === version);
                        return <td key={version} className="text-center p-3 font-mono">{formatDuration(metrics?.avgDurationMs || 0)}</td>;
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">Tempo Mediano</td>
                      {selectedVersions.map((version) => {
                        const metrics = versions.find((v) => v.version === version);
                        return <td key={version} className="text-center p-3 font-mono">{formatDuration(metrics?.medianDurationMs || 0)}</td>;
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">Erros Mais Comuns</td>
                      {selectedVersions.map((version) => {
                        const metrics = versions.find((v) => v.version === version);
                        const topError = metrics?.topErrors[0];
                        return (
                          <td key={version} className="text-center p-3 text-xs">
                            {topError ? (
                              <span className="text-red-400">{topError.code} ({topError.count})</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">Período</td>
                      {selectedVersions.map((version) => {
                        const metrics = versions.find((v) => v.version === version);
                        return (
                          <td key={version} className="text-center p-3 text-xs text-muted-foreground">
                            {metrics ? new Date(metrics.firstSeen).toLocaleDateString() : "—"} - {metrics ? new Date(metrics.lastSeen).toLocaleDateString() : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
