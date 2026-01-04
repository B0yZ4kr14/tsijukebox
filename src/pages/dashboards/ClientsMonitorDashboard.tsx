import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Wifi, WifiOff, Activity, Cpu, 
  HardDrive, Thermometer, RefreshCw, Filter, List, Map,
  AlertTriangle, CheckCircle2, Clock, Building2, Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { BrandText } from '@/components/ui/BrandText';
import { useClientWebSocket } from '@/hooks';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, Input } from "@/components/ui/themed"

interface JukeboxClient {
  id: string;
  name: string;
  address: string;
  city: string;
  apiUrl: string;
  latitude?: number;
  longitude?: number;
  status: 'online' | 'offline' | 'unknown';
  version: string;
}

const STORAGE_KEY = 'tsi_jukebox_clients';

// Mock coordinates for demo (São Paulo region)
const mockCoordinates: Record<string, { lat: number; lng: number }> = {
  'Montes Claros': { lat: -16.7281, lng: -43.8619 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
};

export default function ClientsMonitorDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const [clients, setClients] = useState<JukeboxClient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      // Add mock coordinates
      return parsed.map((c: JukeboxClient) => {
        const cityCoords = Object.entries(mockCoordinates).find(
          ([city]) => c.city?.toLowerCase().includes(city.toLowerCase())
        );
        return {
          ...c,
          latitude: cityCoords?.[1].lat || -16.7 + Math.random() * 0.1,
          longitude: cityCoords?.[1].lng || -43.8 + Math.random() * 0.1,
        };
      });
    } catch {
      return [];
    }
  });

  // WebSocket for real-time status
  const { clientStatuses, reconnectClient } = useClientWebSocket(
    clients.map(c => ({ id: c.id, apiUrl: c.apiUrl, name: c.name })),
    { enabled: clients.length > 0 }
  );

  // Update clients with WebSocket status
  const enrichedClients = useMemo(() => {
    return clients.map(client => {
      const wsStatus = clientStatuses[client.id];
      return {
        ...client,
        status: wsStatus?.status || client.status,
        metrics: wsStatus?.metrics,
      };
    });
  }, [clients, clientStatuses]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return enrichedClients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedClients, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: enrichedClients.length,
    online: enrichedClients.filter(c => c.status === 'online').length,
    offline: enrichedClients.filter(c => c.status === 'offline').length,
    unknown: enrichedClients.filter(c => c.status === 'unknown').length,
  }), [enrichedClients]);

  const handleRefreshAll = () => {
    clients.forEach(c => reconnectClient({ id: c.id, apiUrl: c.apiUrl, name: c.name }));
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    unknown: 'bg-cyan-500',
  };

  const statusBadgeColors = {
    online: 'bg-green-500/20 text-green-400 border-green-500/30',
    offline: 'bg-red-500/20 text-red-400 border-red-500/30',
    unknown: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="min-h-screen bg-kiosk-bg p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/settings')}
              className="text-kiosk-text/90 hover:text-kiosk-text" aria-label="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neon-action-label flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Monitoramento de Clientes
              </h1>
              <p className="text-sm text-kiosk-text/85">
                Status em tempo real dos terminais <BrandText />
              </p>
            </div>
          </div>
          <LogoBrand variant="metal" size="sm" />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kiosk-text">{stats.total}</p>
                <p className="text-xs text-kiosk-text/85">Total</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-kiosk-surface/50 border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wifi className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.online}</p>
                <p className="text-xs text-kiosk-text/85">Online</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-kiosk-surface/50 border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <WifiOff className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.offline}</p>
                <p className="text-xs text-kiosk-text/85">Offline</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-kiosk-surface/50 border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{stats.unknown}</p>
                <p className="text-xs text-kiosk-text/85">Desconhecido</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-kiosk-background/50"
              />

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[150px] bg-kiosk-background/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 border rounded-lg p-1 bg-kiosk-background/50">
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="kiosk-outline"
                size="sm"
                onClick={handleRefreshAll}
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Todos
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'map' ? (
            /* Map View */
            <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
              <div className="relative aspect-video bg-kiosk-background rounded-lg overflow-hidden" role="presentation">
                {/* Simple Map Placeholder - Replace with actual map library */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
                  <svg viewBox="0 0 800 500" className="w-full h-full opacity-20">
                    <path
                      d="M100,400 Q200,300 300,350 T500,300 T700,350"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-cyan-500"
                    />
                  </svg>
                </div>

                {/* Client Markers */}
                {filteredClients.map((client, i) => {
                  const x = 100 + (i % 4) * 180 + Math.random() * 50;
                  const y = 100 + Math.floor(i / 4) * 150 + Math.random() * 50;
                  
                  return (
                    <motion.div
                      key={client.id}
                      className="absolute cursor-pointer"
                      style={{ left: x, top: y }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedClient(client.id === selectedClient ? null : client.id)}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 border-white shadow-lg",
                        statusColors[client.status],
                        client.status === 'online' && "animate-pulse"
                      )} />
                      
                      {selectedClient === client.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-48 p-3 rounded-lg bg-kiosk-surface border border-cyan-500/30 shadow-xl"
                        >
                          <p className="font-medium text-sm text-kiosk-text truncate">{client.name}</p>
                          <p className="text-xs text-kiosk-text/85">{client.city}</p>
                          <Badge className={cn("mt-2 text-xs", statusBadgeColors[client.status])}>
                            {client.status}
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}

                {filteredClients.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center" role="presentation">
                    <p className="text-kiosk-text/90">Nenhum cliente encontrado</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-kiosk-text/90 mt-2">
                Clique nos marcadores para ver detalhes. Mapa interativo em desenvolvimento.
              </p>
            </Card>
          ) : (
            /* List View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => {
                const metrics = (client as any).metrics;
                
                return (
                  <Card
                    key={client.id}
                    className={cn(
                      "p-4 border transition-all hover:scale-[1.02]",
                      client.status === 'online' 
                        ? "bg-kiosk-surface/50 border-green-500/30" 
                        : client.status === 'offline'
                        ? "bg-kiosk-surface/50 border-red-500/30"
                        : "bg-kiosk-surface/50 border-slate-500/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          statusColors[client.status],
                          client.status === 'online' && "animate-pulse"
                        )} />
                        <h4 className="font-medium text-kiosk-text">{client.name}</h4>
                      </div>
                      <Badge className={cn("text-xs", statusBadgeColors[client.status])}>
                        {client.status === 'online' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                        {client.status}
                      </Badge>
                    </div>

                    {client.city && (
                      <p className="text-xs text-kiosk-text/85 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {client.address}, {client.city}
                      </p>
                    )}

                    <p className="text-xs text-cyan-400/80 font-mono mb-3">{client.apiUrl}</p>

                    {/* Metrics */}
                    {metrics && (
                      <div className="space-y-2 pt-2 border-t border-kiosk-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-kiosk-text/85 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> CPU
                          </span>
                          <span className={cn(
                            metrics.cpu > 80 ? "text-red-400" : metrics.cpu > 50 ? "text-yellow-400" : "text-green-400"
                          )}>{metrics.cpu}%</span>
                        </div>
                        <Progress value={metrics.cpu} className="h-1" />

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-kiosk-text/85 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> Memória
                          </span>
                          <span className={cn(
                            metrics.memory > 80 ? "text-red-400" : metrics.memory > 50 ? "text-yellow-400" : "text-green-400"
                          )}>{metrics.memory}%</span>
                        </div>
                        <Progress value={metrics.memory} className="h-1" />

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-kiosk-text/85 flex items-center gap-1">
                            <Thermometer className="w-3 h-3" /> Temp
                          </span>
                          <span className={cn(
                            metrics.temp > 70 ? "text-red-400" : metrics.temp > 50 ? "text-yellow-400" : "text-green-400"
                          )}>{metrics.temp}°C</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-kiosk-border">
                      <span className="text-xs text-kiosk-text/85">v{client.version}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => reconnectClient({ id: client.id, apiUrl: client.apiUrl, name: client.name })}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reconectar
                      </Button>
                    </div>
                  </Card>
                );
              })}

              {filteredClients.length === 0 && (
                <Card className="col-span-full p-8 bg-kiosk-surface/50 border-cyan-500/20 text-center">
                  {/* WCAG Exception: /30 decorative Building2 icon for empty state, not critical content */}
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-kiosk-text/30" />
                  <p className="text-kiosk-text/85">Nenhum cliente encontrado</p>
                  <Button
                    variant="kiosk-outline"
                    className="mt-4"
                    onClick={() => navigate('/settings')}
                  >
                    Cadastrar Clientes
                  </Button>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
