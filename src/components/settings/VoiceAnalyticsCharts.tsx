import { Card } from "@/components/ui/themed";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell, Legend, CartesianGrid
} from 'recharts';
import { Clock, TrendingUp, Target, PieChartIcon } from 'lucide-react';
import type { VoiceAnalyticsData } from '@/hooks/player/useVoiceCommandHistory';

interface VoiceAnalyticsChartsProps {
  analytics: VoiceAnalyticsData;
}

export function VoiceAnalyticsCharts({ analytics }: VoiceAnalyticsChartsProps) {
  const hasData = analytics.commandsByHour.some(h => h.count > 0);

  if (!hasData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <PieChartIcon aria-hidden="true" className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Dados insuficientes para análise</p>
        <p className="text-xs mt-1">Use mais comandos de voz para gerar gráficos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Commands by Hour - Area Chart */}
      <Card className="bg-kiosk-background/50 border-kiosk-border">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Clock className="h-4 w-4 text-kiosk-primary" />
            Comandos por Hora (24h)
          </h3>
        
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={analytics.commandsByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stackId="1" 
                fill="hsl(142.1 76.2% 36.3%)" 
                stroke="hsl(142.1 76.2% 36.3%)"
                fillOpacity={0.6}
                name="Sucesso"
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                stackId="1" 
                fill="hsl(var(--destructive))" 
                stroke="hsl(var(--destructive))"
                fillOpacity={0.6}
                name="Falha"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Success Rate Over Time - Line Chart */}
      <Card className="bg-kiosk-background/50 border-kiosk-border">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <TrendingUp className="h-4 w-4 text-kiosk-primary" />
            Taxa de Sucesso (7 dias)
          </h3>
        
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={analytics.successRateOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={35}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value}%`, 'Taxa']}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confidence Distribution - Horizontal Bar Chart */}
        <Card className="bg-kiosk-background/50 border-kiosk-border">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <Target className="h-4 w-4 text-kiosk-primary" />
              Distribuição de Confiança
            </h3>
          
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={analytics.confidenceDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="range" 
                  type="category" 
                  width={55}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.percentage}%)`, 
                    'Comandos'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Command Distribution - Pie Chart */}
        <Card className="bg-kiosk-background/50 border-kiosk-border">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <PieChartIcon aria-hidden="true" className="h-4 w-4 text-kiosk-primary" />
              Comandos por Tipo
            </h3>
          
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={analytics.commandDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  dataKey="count"
                  paddingAngle={2}
                  label={({ action, count }) => count > 0 ? `${action}` : ''}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                >
                  {analytics.commandDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    value, 
                    props.payload.action
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}