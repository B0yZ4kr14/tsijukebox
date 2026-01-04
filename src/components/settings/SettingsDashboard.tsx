import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plug, 
  Database, 
  Settings2, 
  Palette, 
  Shield, 
  Globe,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Search,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Rocket,
  Stethoscope
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSettingsStatus, SettingsCategoryId, StatusLevel, type CategoryStatus } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SettingsGuideCard } from './SettingsGuideCard';
import { SettingsGuideModal } from './SettingsGuideModal';
import { BackupManager } from './backup';
import { SettingsFAQ } from './SettingsFAQ';
import { SettingsNotificationBanner } from './SettingsNotificationBanner';
import { Button, Card, Input } from "@/components/ui/themed"

interface SettingsGuide {
  id: SettingsCategoryId;
  title: string;
  icon: typeof Plug;
  description: string;
  longDescription: string;
  quickStartSteps: string[];
  sections: {
    name: string;
    description: string;
    tips: string[];
  }[];
}

const settingsGuides: SettingsGuide[] = [
  {
    id: 'connections',
    title: 'Conexões',
    icon: Plug,
    description: 'Comunicação com servidor e APIs',
    longDescription: 'Configure URL da API e modo de comunicação (WebSocket/Polling).',
    quickStartSteps: [
      'Confirme URL da API',
      'Escolha WebSocket ou Polling',
      'Teste a conexão'
    ],
    sections: [
      { name: 'Backend FastAPI', description: 'Servidor de reprodução', tips: ['Use WebSocket para tempo real'] },
      { name: 'Lovable Cloud', description: 'Banco na nuvem (automático)', tips: ['Sincroniza dados entre dispositivos'] }
    ]
  },
  {
    id: 'data',
    title: 'Dados & Backup',
    icon: Database,
    description: 'Backups e banco de dados',
    longDescription: 'Configure armazenamento e cópias de segurança.',
    quickStartSteps: [
      'Configure caminho do banco',
      'Agende backups automáticos',
      'Configure backup na nuvem'
    ],
    sections: [
      { name: 'Banco de Dados', description: 'Armazenamento local', tips: ['Execute VACUUM mensalmente'] },
      { name: 'Backup', description: 'Cópias de segurança', tips: ['Mantenha 3+ backups recentes'] }
    ]
  },
  {
    id: 'system',
    title: 'Sistema',
    icon: Settings2,
    description: 'URLs e horário do sistema',
    longDescription: 'Configure URLs de monitoramento e sincronização de horário.',
    quickStartSteps: ['Configure URLs do Dashboard', 'Verifique sincronização NTP'],
    sections: [
      { name: 'URLs do Sistema', description: 'Monitoramento', tips: ['Grafana para gráficos'] },
      { name: 'NTP', description: 'Sincronização de horário', tips: ['Mantenha ativado'] }
    ]
  },
  {
    id: 'appearance',
    title: 'Aparência',
    icon: Palette,
    description: 'Temas, idioma e acessibilidade',
    longDescription: 'Personalize cores, idioma e acessibilidade.',
    quickStartSteps: ['Escolha um tema', 'Selecione idioma', 'Ajuste acessibilidade'],
    sections: [
      { name: 'Tema', description: 'Cores do sistema', tips: ['Temas escuros para pouca luz'] },
      { name: 'Idioma', description: 'PT-BR, EN, ES', tips: ['Tradução automática'] }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    icon: Shield,
    description: 'Usuários e permissões',
    longDescription: 'Controle acesso e crie usuários.',
    quickStartSteps: ['Crie usuário admin', 'Configure permissões'],
    sections: [
      { name: 'Usuários', description: 'Gerenciar acessos', tips: ['Cada pessoa = 1 usuário'] },
      { name: 'Chaves API', description: 'Tokens de acesso', tips: ['Nunca compartilhe'] }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrações',
    icon: Globe,
    description: 'Spotify e serviços externos',
    longDescription: 'Conecte Spotify e widgets externos.',
    quickStartSteps: ['Configure Spotify', 'Adicione widget de clima'],
    sections: [
      { name: 'Spotify', description: 'Acesso a músicas', tips: ['Premium para controle total'] },
      { name: 'Clima', description: 'Widget de temperatura', tips: ['API gratuita OpenWeatherMap'] }
    ]
  }
];

interface SettingsDashboardProps {
  onNavigateToCategory: (category: SettingsCategoryId) => void;
}

export function SettingsDashboard({ onNavigateToCategory }: SettingsDashboardProps) {
  const navigate = useNavigate();
  const { getAllStatuses, getOverallStatus } = useSettingsStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<SettingsGuide | null>(null);
  
  const statuses = getAllStatuses();
  const overall = getOverallStatus();
  const configuredPercent = Math.round((overall.okCount / overall.total) * 100);

  // Chart data
  const chartData = [
    { name: 'Configurado', value: overall.okCount, color: '#22c55e' },
    { name: 'Atenção', value: overall.warningCount, color: '#eab308' },
    { name: 'Pendente', value: overall.errorCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Filter guides by search
  const filteredGuides = settingsGuides.filter(guide => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query) ||
      guide.sections.some(s => s.name.toLowerCase().includes(query))
    );
  });

  const handleResetTour = () => {
    localStorage.removeItem('jukebox_tour_complete');
    navigate('/');
  };

  const getStatusIcon = (level: StatusLevel) => {
    switch (level) {
      case 'ok': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Banner */}
      <SettingsNotificationBanner onNavigateToCategory={onNavigateToCategory} />

      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gold-neon flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" />
          Central de Configurações
        </h2>
        <p className="text-kiosk-text/85 mt-1">Guia completo e status do sistema</p>
      </motion.div>

      {/* Status Overview with Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 bg-kiosk-surface/50 border-cyan-500/30 card-option-neon">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-kiosk-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5 icon-neon-blue" />
              Status do Sistema
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220 25% 12%)', 
                        border: '1px solid hsl(185 100% 50% / 0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col" role="presentation">
                  <span className="text-2xl font-bold text-kiosk-text">{configuredPercent}%</span>
                  <span className="text-xs text-kiosk-text/85">configurado</span>
                </div>
              </div>
            </div>

            {/* Category Status List */}
            <div className="space-y-2">
              {Object.entries(statuses).map(([id, status]) => {
                const guide = settingsGuides.find(g => g.id === id);
                if (!guide) return null;
                const Icon = guide.icon;
                
                return (
                  <button
                    key={id}
                    onClick={() => onNavigateToCategory(id as SettingsCategoryId)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:scale-[1.02]",
                      status.level === 'ok' && "border-green-500/20 bg-green-500/5 hover:bg-green-500/10",
                      status.level === 'warning' && "border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10",
                      status.level === 'error' && "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4",
                      status.level === 'ok' && "text-green-400",
                      status.level === 'warning' && "text-yellow-400",
                      status.level === 'error' && "text-red-400"
                    )} />
                    <span className="flex-1 text-left text-sm text-kiosk-text">{guide.title}</span>
                    {getStatusIcon(status.level)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-4 border-t border-kiosk-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-kiosk-text/85">Progresso geral</span>
              <span className="text-cyan-400">{overall.okCount} de {overall.total} categorias</span>
            </div>
            <Progress value={configuredPercent} className="h-2" />
          </div>
        </Card>
      </motion.div>

      {/* Settings Guide Wiki */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 bg-kiosk-surface/50 border-cyan-500/30 card-option-neon">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-kiosk-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 icon-neon-blue" />
              Guia de Configurações
            </h3>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/80" />
            <Input
              placeholder="Buscar nos guias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-kiosk-background/50 border-kiosk-border text-kiosk-text"
            />
          </div>

          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGuides.map((guide, index) => {
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <SettingsGuideCard
                  id={guide.id}
                  title={guide.title}
                  description={guide.description}
                  icon={guide.icon}
                  onClick={() => setSelectedGuide(guide)}
                />
              </motion.div>
            );
          })}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-8 text-kiosk-text/85">
              <Search aria-hidden="true" className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum guia encontrado para "{searchQuery}"</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Config Backup Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BackupManager providers={['local']} showScheduler={false} />
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SettingsFAQ />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          AÇÕES RÁPIDAS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button
            variant="ghost"
            className="h-auto py-3 flex-col gap-2 bg-[hsl(220_25%_12%)] border border-kiosk-border hover:border-green-500/50 hover:bg-green-500/10"
            onClick={() => navigate('/setup')}
          >
            <Rocket className="w-5 h-5 text-green-400" />
            <span className="text-xs font-bold text-neon-action-label-gold">Wizard de Setup</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex-col gap-2 bg-[hsl(220_25%_12%)] border border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/10"
            onClick={handleResetTour}
          >
            <RefreshCw aria-hidden="true" className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-neon-action-label">Reiniciar Tour</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex-col gap-2 bg-[hsl(220_25%_12%)] border border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/10"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-neon-action-label">Manual Completo</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex-col gap-2 bg-[hsl(220_25%_12%)] border border-kiosk-border hover:border-purple-500/50 hover:bg-purple-500/10"
            onClick={() => navigate('/settings/diagnostics')}
          >
            <Stethoscope className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold text-neon-action-label-purple">Diagnóstico</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex-col gap-2 bg-[hsl(220_25%_12%)] border border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/10"
            onClick={() => navigate('/')}
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-neon-action-label">Voltar ao Player</span>
          </Button>
        </div>
      </motion.div>

      {/* Guide Modal */}
      <SettingsGuideModal
        guide={selectedGuide}
        isOpen={!!selectedGuide}
        onClose={() => setSelectedGuide(null)}
        onNavigate={() => selectedGuide && onNavigateToCategory(selectedGuide.id)}
      />
    </div>
  );
}
