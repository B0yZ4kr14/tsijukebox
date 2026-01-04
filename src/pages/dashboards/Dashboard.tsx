import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BarChart3, 
  Activity, 
  Music2, 
  Clock, 
  Cpu, 
  HardDrive, 
  Thermometer,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useStatus, useTranslation } from '@/hooks';
import { ComponentBoundary } from '@/components/errors/SuspenseBoundary';
import { Button, Card } from "@/components/ui/themed"

// Generate mock data for charts
function generateSystemData() {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    return {
      time: hour.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 40 + 20),
      memory: Math.floor(Math.random() * 30 + 40),
      temp: Math.floor(Math.random() * 15 + 45),
    };
  });
}

function generatePlaybackData() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return days.map((day) => ({
    day,
    songs: Math.floor(Math.random() * 50 + 10),
    hours: Math.floor(Math.random() * 4 + 1),
  }));
}

function generateGenreData() {
  return [
    { name: 'Rock', value: 35, color: 'hsl(0, 85%, 55%)' },
    { name: 'Pop', value: 25, color: 'hsl(280, 85%, 65%)' },
    { name: 'Soul', value: 15, color: 'hsl(35, 90%, 55%)' },
    { name: 'Hip-Hop', value: 15, color: 'hsl(160, 80%, 45%)' },
    { name: 'Ballad', value: 10, color: 'hsl(210, 70%, 60%)' },
  ];
}

function generateHourlyActivity() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}h`,
    activity: i >= 8 && i <= 22 
      ? Math.floor(Math.random() * 80 + 20) 
      : Math.floor(Math.random() * 20),
  }));
}

function generateTopTracks() {
  return [
    { name: 'Bohemian Rhapsody', artist: 'Queen', plays: 156 },
    { name: 'Stairway to Heaven', artist: 'Led Zeppelin', plays: 142 },
    { name: 'Hotel California', artist: 'Eagles', plays: 128 },
    { name: 'Sweet Child O Mine', artist: "Guns N' Roses", plays: 115 },
    { name: 'Back in Black', artist: 'AC/DC', plays: 103 },
    { name: 'Smells Like Teen Spirit', artist: 'Nirvana', plays: 98 },
    { name: 'November Rain', artist: "Guns N' Roses", plays: 94 },
    { name: 'Wish You Were Here', artist: 'Pink Floyd', plays: 89 },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const statusResult = useStatus();
  const status = statusResult.data;
  
  const systemData = useMemo(() => generateSystemData(), []);
  const playbackData = useMemo(() => generatePlaybackData(), []);
  const genreData = useMemo(() => generateGenreData(), []);
  const hourlyActivity = useMemo(() => generateHourlyActivity(), []);
  const topTracks = useMemo(() => generateTopTracks(), []);

  const chartTooltipStyle = {
    background: 'hsl(240, 10%, 15%)',
    border: '1px solid hsl(240, 10%, 25%)',
    borderRadius: '8px',
    color: 'hsl(0, 0%, 93%)',
    fontSize: '12px',
  };

  return (
    <div className="min-h-screen bg-kiosk-bg text-kiosk-text p-6">
      {/* Logo centralizado no topo */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LogoBrand size="md" variant="metal" animate />
      </motion.div>

      {/* Header */}
      <motion.header
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/')}
            className="button-3d" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gold-neon">
              <BarChart3 className="w-6 h-6 icon-neon-blue" />
              {t('dashboard.title')}
            </h1>
            <p className="text-sm text-kiosk-text/90">Estatísticas e monitoramento do sistema</p>
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl badge-3d">
            <Cpu className="w-4 h-4 icon-neon-blue" />
            <span className="font-mono font-bold">{status?.cpu || 0}%</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl badge-3d">
            <HardDrive className="w-4 h-4 icon-neon-blue" />
            <span className="font-mono font-bold">{status?.memory || 0}%</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl badge-3d">
            <Thermometer className="w-4 h-4 icon-neon-blue" />
            <span className="font-mono font-bold">{status?.temp || 0}°C</span>
          </div>
        </div>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* System Usage Chart */}
        <ComponentBoundary loadingMessage="Carregando gráfico do sistema...">
          <motion.div
            className="col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-admin-extreme-3d h-full">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <Activity className="w-5 h-5 icon-neon-blue" />
                  {t('dashboard.systemUsage')} - {t('dashboard.last24h')}
                </h3>
              
              <div className="mt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={systemData}>
                      <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} fill="url(#cpuGradient)" name="CPU" />
                      <Area type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} fill="url(#memGradient)" name="Memória" />
                      <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fill="url(#tempGradient)" name="Temp °C" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400" aria-hidden="true" />
                    <span className="text-xs text-kiosk-text/90">CPU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400" aria-hidden="true" />
                    <span className="text-xs text-kiosk-text/90">Memória</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" aria-hidden="true" />
                    <span className="text-xs text-kiosk-text/90">Temperatura</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </ComponentBoundary>

        {/* Genre Distribution */}
        <ComponentBoundary loadingMessage="Carregando gêneros...">
          <motion.div
            className="col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-admin-extreme-3d h-full">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <PieChartIcon className="w-5 h-5 icon-neon-blue" />
                  {t('dashboard.genres')}
                </h3>
              
              <div className="mt-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {genreData.map((genre) => (
                    <div key={genre.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: genre.color }} aria-hidden="true" />
                      <span className="text-xs text-kiosk-text/90">{genre.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </ComponentBoundary>

        {/* Playback Stats */}
        <ComponentBoundary loadingMessage="Carregando estatísticas...">
          <motion.div
            className="col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-admin-extreme-3d h-full">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <Music2 className="w-5 h-5 icon-neon-blue" />
                  {t('dashboard.playbackStats')} - {t('dashboard.last7days')}
                </h3>
              
              <div className="mt-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={playbackData}>
                      <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="songs" fill="hsl(346, 84%, 61%)" radius={[4, 4, 0, 0]} name="Músicas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>
        </ComponentBoundary>

        {/* Hourly Activity */}
        <ComponentBoundary loadingMessage="Carregando atividade...">
          <motion.div
            className="col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-admin-extreme-3d h-full">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <Clock className="w-5 h-5 icon-neon-blue" />
                  {t('dashboard.activity')} por Hora
                </h3>
              
              <div className="mt-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyActivity}>
                      <XAxis dataKey="hour" tick={{ fill: '#888', fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line 
                        type="monotone" 
                        dataKey="activity" 
                        stroke="hsl(346, 84%, 61%)" 
                        strokeWidth={2}
                        dot={false}
                        name="Atividade"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>
        </ComponentBoundary>

        {/* Top Tracks */}
        <ComponentBoundary loadingMessage="Carregando top tracks...">
          <motion.div
            className="col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-admin-extreme-3d">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <TrendingUp className="w-5 h-5 icon-neon-blue" />
                  {t('dashboard.topTracks')} - {t('dashboard.thisMonth')}
                </h3>
              
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-4">
                  {topTracks.map((track, index) => (
                    <motion.div
                      key={track.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/50 border border-kiosk-surface"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <span className="text-lg font-bold text-kiosk-primary w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kiosk-text truncate">{track.name}</p>
                        <p className="text-xs text-kiosk-text/80 truncate">{track.artist}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-kiosk-text">{track.plays}</p>
                        <p className="text-xs text-kiosk-text/85">plays</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </ComponentBoundary>
      </div>
    </div>
  );
}
