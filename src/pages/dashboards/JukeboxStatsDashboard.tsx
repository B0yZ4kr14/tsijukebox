import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Music, 
  Users, 
  Clock, 
  TrendingUp,
  BarChart3,
  Disc3,
  RefreshCw
} from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlaybackStats, StatsPeriod } from '@/hooks/system/usePlaybackStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge, Button, Card } from "@/components/ui/themed"

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const periodLabels: Record<StatsPeriod, string> = {
  today: 'Hoje',
  week: 'Esta Semana',
  month: 'Este Mês',
  all: 'Todo Período'
};

export default function JukeboxStatsDashboard() {
  const { stats, isLoading, error, period, setPeriod, refetch } = usePlaybackStats('week');

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <KioskLayout>
      <div className="min-h-screen bg-kiosk-background p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="xs" className="text-kiosk-text hover:bg-kiosk-surface" aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-kiosk-text flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-kiosk-primary" />
                Estatísticas da Jukebox
              </h1>
              <p className="text-sm text-muted-foreground">
                Análise de reproduções e tendências
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as StatsPeriod)}>
              <TabsList className="bg-kiosk-surface">
                {Object.entries(periodLabels).map(([key, label]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="data-[state=active]:bg-kiosk-primary data-[state=active]:text-kiosk-primary-foreground"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <Button 
              variant="outline" 
              size="xs"
              onClick={() => refetch()}
              className="border-kiosk-border" aria-label="Atualizar">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
            <div className="mt-4">
              <p className="text-red-500">Erro ao carregar estatísticas: {error.message}</p>
            </div>
          </Card>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total de Plays', value: stats?.totalPlays, icon: Music, color: 'text-violet-500' },
            { label: 'Músicas Únicas', value: stats?.uniqueTracks, icon: Disc3, color: 'text-cyan-500' },
            { label: 'Artistas', value: stats?.uniqueArtists, icon: Users, color: 'text-emerald-500' },
            { label: 'Tempo Total', value: stats ? formatDuration(stats.totalMinutes) : null, icon: Clock, color: 'text-amber-500' }
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-kiosk-surface border-kiosk-border">
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-kiosk-text">{kpi.value || 0}</p>
                      )}
                    </div>
                    <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-50`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hourly Activity Chart */}
          <Card className="lg:col-span-2 bg-kiosk-surface border-kiosk-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <TrendingUp className="h-5 w-5 text-kiosk-primary" />
                Atividade por Hora
              </h3>
            
            <div className="mt-4">
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : stats?.hourlyActivity ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(h) => `${h}h`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--kiosk-surface))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(h) => `${h}:00`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--kiosk-primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Reproduções"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
              )}
            </div>
          </Card>

          {/* Provider Distribution */}
          <Card className="bg-kiosk-surface border-kiosk-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Por Provedor</h3>
            
            <div className="mt-4">
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : stats?.providerStats && stats.providerStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.providerStats}
                      dataKey="plays"
                      nameKey="provider"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      label={({ provider }) => provider}
                    >
                      {stats.providerStats.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Sem dados</p>
              )}
            </div>
          </Card>
        </div>

        {/* Top Tracks & Artists */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Top Tracks */}
          <Card className="bg-kiosk-surface border-kiosk-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Music className="h-5 w-5 text-kiosk-primary" />
                Top 10 Músicas
              </h3>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stats?.topTracks && stats.topTracks.length > 0 ? (
                <div className="space-y-2">
                  {stats.topTracks.map((track, i) => (
                    <motion.div
                      key={track.track_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-kiosk-background/50 hover:bg-kiosk-background transition-colors"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-5">
                        {i + 1}
                      </span>
                      {track.album_art ? (
                        <img 
                          src={track.album_art} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-kiosk-border flex items-center justify-center" aria-hidden="true">
                          <Music className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kiosk-text truncate">
                          {track.track_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artist_name}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-kiosk-primary/20 text-kiosk-primary">
                        {track.plays}x
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma música reproduzida</p>
              )}
            </div>
          </Card>

          {/* Top Artists */}
          <Card className="bg-kiosk-surface border-kiosk-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Users className="h-5 w-5 text-kiosk-primary" />
                Top 10 Artistas
              </h3>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : stats?.topArtists && stats.topArtists.length > 0 ? (
                <div className="space-y-2">
                  {stats.topArtists.map((artist, i) => (
                    <motion.div
                      key={artist.artist_name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-kiosk-background/50"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-5">
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kiosk-primary to-kiosk-primary/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-kiosk-primary-foreground">
                          {artist.artist_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kiosk-text truncate">
                          {artist.artist_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-kiosk-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-kiosk-primary rounded-full"
                            style={{ 
                              width: `${(artist.plays / (stats.topArtists[0]?.plays || 1)) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {artist.plays}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum artista encontrado</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Plays */}
        <Card className="mt-6 bg-kiosk-surface border-kiosk-border">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <Clock className="h-5 w-5 text-kiosk-primary" />
              Reproduções Recentes
            </h3>
          
          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.recentPlays && stats.recentPlays.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.recentPlays.slice(0, 12).map((play, i) => (
                  <motion.div
                    key={play.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-kiosk-background/50"
                  >
                    {play.album_art ? (
                      <img 
                        src={play.album_art} 
                        alt="" 
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-kiosk-border flex items-center justify-center">
                        <Music className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-kiosk-text truncate">
                        {play.track_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {play.artist_name}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(play.played_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma reprodução recente</p>
            )}
          </div>
        </Card>
      </div>
    </KioskLayout>
  );
}
