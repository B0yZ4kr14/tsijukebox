import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Trash2, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, Button, Card } from "@/components/ui/themed"

interface ConnectionHistoryEntry {
  timestamp: string;
  latency: number;
  success: boolean;
  engine: string;
}

interface DatabaseConnectionHistoryProps {
  engine: string;
  onNewEntry?: (entry: ConnectionHistoryEntry) => void;
}

const STORAGE_KEY = 'db_connection_history';
const MAX_ENTRIES = 50;

export function DatabaseConnectionHistory({ engine }: DatabaseConnectionHistoryProps) {
  const [history, setHistory] = useState<ConnectionHistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ConnectionHistoryEntry[];
        setHistory(parsed.filter(e => e.engine === engine).slice(-MAX_ENTRIES));
      } catch {
        setHistory([]);
      }
    }
  }, [engine]);

  const clearHistory = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ConnectionHistoryEntry[];
        const filtered = parsed.filter(e => e.engine !== engine);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch {
        // ignore
      }
    }
    setHistory([]);
  };

  const chartData = history.map((entry, index) => ({
    index,
    time: new Date(entry.timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    latency: entry.latency,
    success: entry.success ? 1 : 0
  }));

  const avgLatency = history.length > 0 
    ? Math.round(history.reduce((sum, e) => sum + e.latency, 0) / history.length)
    : 0;

  const successRate = history.length > 0
    ? Math.round((history.filter(e => e.success).length / history.length) * 100)
    : 0;

  const lastLatency = history.length > 0 ? history[history.length - 1].latency : 0;
  const prevLatency = history.length > 1 ? history[history.length - 2].latency : lastLatency;
  const latencyTrend = lastLatency - prevLatency;

  if (history.length === 0) {
    return (
      <Card className="p-4 bg-kiosk-surface/30 border-cyan-500/20">
        <div className="text-center py-6">
          <Activity className="w-8 h-8 mx-auto text-kiosk-text/85 mb-2" />
          <p className="text-sm text-settings-hint">
            Nenhum histórico de conexão disponível
          </p>
          <p className="text-xs text-kiosk-text/85 mt-1">
            Execute um teste de conexão para começar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-kiosk-surface/30 border-cyan-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white">Histórico de Conexões</h4>
          <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
            {history.length} registros
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Limpar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-kiosk-bg/50 border border-cyan-500/20">
          <p className="text-xs text-label-neon mb-1">Latência Média</p>
          <p className="text-lg font-bold text-cyan-400">{avgLatency}ms</p>
        </div>
        <div className="p-3 rounded-lg bg-kiosk-bg/50 border border-cyan-500/20">
          <p className="text-xs text-label-neon mb-1">Taxa de Sucesso</p>
          <p className={cn(
            "text-lg font-bold",
            successRate >= 90 ? "text-green-400" : successRate >= 70 ? "text-yellow-400" : "text-red-400"
          )}>
            {successRate}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-kiosk-bg/50 border border-cyan-500/20">
          <p className="text-xs text-label-neon mb-1">Tendência</p>
          <div className="flex items-center gap-1">
            {latencyTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-400" />
            ) : latencyTrend < 0 ? (
              <TrendingDown className="w-4 h-4 text-green-400" />
            ) : (
              <Activity className="w-4 h-4 text-kiosk-text/85" />
            )}
            <span className={cn(
              "text-lg font-bold",
              latencyTrend > 0 ? "text-red-400" : latencyTrend < 0 ? "text-green-400" : "text-kiosk-text/85"
            )}>
              {latencyTrend > 0 ? '+' : ''}{latencyTrend}ms
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(0, 0%, 50%)"
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 50%)"
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
              label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: 'hsl(0, 0%, 60%)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(220, 25%, 12%)', 
                border: '1px solid hsl(185, 100%, 50%, 0.3)',
                borderRadius: '8px',
                color: 'white'
              }}
              labelStyle={{ color: 'hsl(185, 100%, 70%)' }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="hsl(185, 100%, 50%)" 
              fillOpacity={1}
              fill="url(#latencyGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// Helper function to add a new entry to history
export function addConnectionHistoryEntry(entry: Omit<ConnectionHistoryEntry, 'timestamp'>) {
  const fullEntry: ConnectionHistoryEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const history: ConnectionHistoryEntry[] = saved ? JSON.parse(saved) : [];
    history.push(fullEntry);
    
    // Keep only last MAX_ENTRIES per engine
    const grouped: Record<string, ConnectionHistoryEntry[]> = {};
    history.forEach(e => {
      if (!grouped[e.engine]) grouped[e.engine] = [];
      grouped[e.engine].push(e);
    });
    
    const trimmed: ConnectionHistoryEntry[] = [];
    Object.values(grouped).forEach(entries => {
      trimmed.push(...entries.slice(-MAX_ENTRIES));
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}
