import { motion } from 'framer-motion';
import { 
  Shield, 
  Database, 
  Music, 
  Cloud, 
  Clock, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Download,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSettings } from '@/contexts/SettingsContext';
import { useSettingsStatus, SettingsCategoryId, StatusLevel } from '@/hooks/useSettingsStatus';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  type: 'security' | 'performance' | 'feature' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel: string;
  category: SettingsCategoryId;
  icon: React.ReactNode;
}

interface SettingsDashboardProps {
  onNavigateToCategory: (category: SettingsCategoryId) => void;
}

export function SettingsDashboard({ onNavigateToCategory }: SettingsDashboardProps) {
  const navigate = useNavigate();
  const { isDemoMode, spotify, weather } = useSettings();
  const { getAllStatuses, getOverallStatus, hasBackupSchedule, hasCustomUsers } = useSettingsStatus();
  
  const statuses = getAllStatuses();
  const overall = getOverallStatus();

  // Generate dynamic suggestions
  const getSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    if (!hasCustomUsers) {
      suggestions.push({
        id: 'default-credentials',
        type: 'security',
        priority: 'high',
        title: 'Credenciais Padrão em Uso',
        description: 'Crie usuários personalizados para maior segurança do sistema.',
        actionLabel: 'Gerenciar Usuários',
        category: 'security',
        icon: <Shield className="w-5 h-5" />,
      });
    }

    if (!hasBackupSchedule) {
      suggestions.push({
        id: 'no-backup',
        type: 'maintenance',
        priority: 'medium',
        title: 'Backup Não Agendado',
        description: 'Configure backups automáticos para proteger seus dados.',
        actionLabel: 'Configurar Backup',
        category: 'data',
        icon: <Database className="w-5 h-5" />,
      });
    }

    if (!spotify.isConnected) {
      suggestions.push({
        id: 'spotify-not-connected',
        type: 'feature',
        priority: 'low',
        title: 'Spotify Desconectado',
        description: 'Conecte sua conta para acessar playlists e biblioteca.',
        actionLabel: 'Conectar Spotify',
        category: 'integrations',
        icon: <Music className="w-5 h-5" />,
      });
    }

    if (!weather.isEnabled || !weather.apiKey) {
      suggestions.push({
        id: 'weather-disabled',
        type: 'feature',
        priority: 'low',
        title: 'Widget de Clima Desativado',
        description: 'Ative para ver previsão do tempo na tela inicial.',
        actionLabel: 'Configurar Clima',
        category: 'integrations',
        icon: <Cloud className="w-5 h-5" />,
      });
    }

    if (isDemoMode) {
      suggestions.push({
        id: 'demo-mode-active',
        type: 'performance',
        priority: 'medium',
        title: 'Modo Demo Ativo',
        description: 'Sistema usando dados simulados. Conecte ao backend real.',
        actionLabel: 'Configurar Backend',
        category: 'connections',
        icon: <Zap className="w-5 h-5" />,
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high' || s.priority === 'medium');
  const lowPrioritySuggestions = suggestions.filter(s => s.priority === 'low');

  const getStatusIcon = (level: StatusLevel) => {
    switch (level) {
      case 'ok': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-cyan-500/50 bg-cyan-500/10';
      default: return 'border-kiosk-border';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">ALTA</Badge>;
      case 'medium': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">MÉDIA</Badge>;
      case 'low': return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">BAIXA</Badge>;
      default: return null;
    }
  };

  const categoryLabels: Record<string, string> = {
    connections: 'Conexões',
    data: 'Dados',
    system: 'Sistema',
    appearance: 'Aparência',
    security: 'Segurança',
    integrations: 'Integrações',
  };

  const configuredPercent = Math.round((overall.okCount / overall.total) * 100);

  const handleResetTour = () => {
    localStorage.removeItem('jukebox_tour_complete');
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gold-neon flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" />
          Dashboard de Configurações
        </h2>
        <p className="text-kiosk-text/60 mt-1">Visão geral e sugestões inteligentes</p>
      </motion.div>

      {/* Overall Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 bg-kiosk-surface/50 border-cyan-500/30 card-option-neon">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-kiosk-text flex items-center gap-2">
              <Zap className="w-5 h-5 icon-neon-blue" />
              Visão Geral do Sistema
            </h3>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              {overall.okCount}/{overall.total} configurados
            </Badge>
          </div>

          <Progress value={configuredPercent} className="h-2 mb-4" />

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(statuses).map(([id, status]) => (
              <button
                key={id}
                onClick={() => onNavigateToCategory(id as SettingsCategoryId)}
                className={cn(
                  "p-3 rounded-lg border transition-all hover:scale-105",
                  status.level === 'ok' && "border-green-500/30 bg-green-500/5 hover:bg-green-500/10",
                  status.level === 'warning' && "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10",
                  status.level === 'error' && "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  {getStatusIcon(status.level)}
                  <span className="text-xs text-kiosk-text/80 truncate w-full text-center">
                    {categoryLabels[id]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* High Priority Suggestions */}
      {highPrioritySuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-label-orange mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            AÇÕES RECOMENDADAS ({highPrioritySuggestions.length})
          </h3>
          <div className="space-y-3">
            {highPrioritySuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className={cn("p-4 border", getPriorityColor(suggestion.priority))}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      suggestion.priority === 'high' ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {suggestion.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityBadge(suggestion.priority)}
                        <span className="font-medium text-kiosk-text">{suggestion.title}</span>
                      </div>
                      <p className="text-sm text-kiosk-text/70">{suggestion.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigateToCategory(suggestion.category)}
                      className="flex-shrink-0 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      {suggestion.actionLabel}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Low Priority / Feature Suggestions */}
      {lowPrioritySuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-label-yellow mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            OTIMIZAÇÕES SUGERIDAS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowPrioritySuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "p-3 border cursor-pointer transition-all hover:scale-[1.02]",
                    getPriorityColor(suggestion.priority)
                  )}
                  onClick={() => onNavigateToCategory(suggestion.category)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-kiosk-text text-sm">{suggestion.title}</span>
                      <p className="text-xs text-kiosk-text/60 truncate">{suggestion.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-kiosk-text/40" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Configured Message */}
      {suggestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-green-500/30 bg-green-500/5 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-400">Tudo Configurado!</h3>
            <p className="text-kiosk-text/70 text-sm mt-1">
              Todas as configurações estão otimizadas. Seu sistema está pronto.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-kiosk-text/60 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          ATALHOS RÁPIDOS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/5"
            onClick={handleResetTour}
          >
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <span className="text-xs">Reiniciar Tour</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/5"
            onClick={() => onNavigateToCategory('data')}
          >
            <Download className="w-5 h-5 text-cyan-400" />
            <span className="text-xs">Backup Manual</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/5"
            onClick={() => onNavigateToCategory('security')}
          >
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-xs">Gerenciar Usuários</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/5"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="text-xs">Ver Ajuda</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
