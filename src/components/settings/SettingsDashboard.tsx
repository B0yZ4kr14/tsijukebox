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
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useSettings } from '@/contexts/SettingsContext';
import { useSettingsStatus, SettingsCategoryId, StatusLevel } from '@/hooks/useSettingsStatus';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SettingsGuideCard } from './SettingsGuideCard';
import { SettingsGuideModal } from './SettingsGuideModal';
import { ConfigBackupSection } from './ConfigBackupSection';

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
    description: 'Configure como o sistema se comunica com o servidor',
    longDescription: 'As configurações de conexão controlam como o jukebox se comunica com o servidor de música (Backend FastAPI). Pense nisso como conectar um cabo entre dois aparelhos - o jukebox precisa saber onde encontrar o servidor para funcionar corretamente.',
    quickStartSteps: [
      'Verifique se o servidor Backend está rodando no seu computador',
      'Confirme a URL da API (normalmente já vem configurada)',
      'Escolha entre WebSocket (mais rápido) ou Polling (mais estável)',
      'Use o Modo Demo para testar sem servidor'
    ],
    sections: [
      {
        name: 'Backend FastAPI',
        description: 'O "cérebro" do sistema que controla a reprodução de músicas',
        tips: ['Use WebSocket para atualizações em tempo real', 'Ative Demo Mode para testar a interface']
      },
      {
        name: 'Lovable Cloud',
        description: 'Banco de dados na nuvem (configuração automática)',
        tips: ['Configuração automática, você não precisa fazer nada', 'Sincroniza dados entre dispositivos']
      }
    ]
  },
  {
    id: 'data',
    title: 'Dados & Backup',
    icon: Database,
    description: 'Gerencie backups e banco de dados',
    longDescription: 'Aqui você configura como seus dados são armazenados e protegidos. O backup é como fazer uma cópia de segurança das suas fotos - se algo der errado, você pode recuperar tudo.',
    quickStartSteps: [
      'Configure o caminho do banco de dados SQLite',
      'Agende backups automáticos (recomendado: diário)',
      'Configure backup na nuvem para maior segurança',
      'Teste a restauração para garantir que funciona'
    ],
    sections: [
      {
        name: 'Banco de Dados',
        description: 'Onde suas músicas e configurações são armazenadas',
        tips: ['Execute "Vacuum" mensalmente para otimizar', 'Verifique integridade após quedas de energia']
      },
      {
        name: 'Backup Local',
        description: 'Cópias de segurança no seu computador',
        tips: ['Mantenha pelo menos 3 backups recentes', 'Faça backup antes de atualizações']
      },
      {
        name: 'Backup na Nuvem',
        description: 'Cópias de segurança online (Google Drive, Dropbox, etc)',
        tips: ['Ideal para recuperação de desastres', 'Configure sincronização automática']
      }
    ]
  },
  {
    id: 'system',
    title: 'Sistema',
    icon: Settings2,
    description: 'URLs, horário e informações do sistema',
    longDescription: 'Configurações técnicas do sistema, como URLs de monitoramento e sincronização de horário. Normalmente você não precisa mexer aqui, mas pode ser útil para administradores.',
    quickStartSteps: [
      'Configure as URLs do Dashboard (Grafana) e Datasource (Prometheus)',
      'Verifique se o horário está sincronizado (NTP)',
      'Use o Modo Demo para testar sem backend'
    ],
    sections: [
      {
        name: 'URLs do Sistema',
        description: 'Links para painéis de monitoramento',
        tips: ['Grafana mostra gráficos de uso', 'Prometheus coleta métricas']
      },
      {
        name: 'NTP (Horário)',
        description: 'Sincronização automática do relógio',
        tips: ['Mantenha ativado para horário correto', 'Útil para logs e agendamentos']
      }
    ]
  },
  {
    id: 'appearance',
    title: 'Aparência',
    icon: Palette,
    description: 'Temas, idioma e acessibilidade',
    longDescription: 'Personalize a aparência do jukebox! Escolha cores, idioma e ajuste configurações de acessibilidade. Deixe o sistema do seu jeito.',
    quickStartSteps: [
      'Escolha um tema de cores (Azul, Verde, Roxo, etc)',
      'Selecione seu idioma preferido',
      'Ajuste contraste e tamanho de fonte se necessário'
    ],
    sections: [
      {
        name: 'Tema de Cores',
        description: 'Mude as cores do sistema',
        tips: ['Temas escuros são melhores para ambientes com pouca luz', 'Crie temas personalizados com gradientes']
      },
      {
        name: 'Idioma',
        description: 'Português, Inglês ou Espanhol',
        tips: ['A interface será traduzida automaticamente']
      },
      {
        name: 'Acessibilidade',
        description: 'Ajustes para melhor visibilidade',
        tips: ['Aumente o contraste se tiver dificuldade para ler', 'Ative modo de alto contraste se necessário']
      }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    icon: Shield,
    description: 'Usuários, senhas e permissões',
    longDescription: 'Controle quem pode usar o sistema e o que cada pessoa pode fazer. Crie usuários com diferentes níveis de acesso para maior segurança.',
    quickStartSteps: [
      'Crie um usuário administrador personalizado',
      'Configure senhas fortes para cada usuário',
      'Defina permissões (Admin, Usuário, Novato)',
      'Remova as credenciais padrão (tsi/connect)'
    ],
    sections: [
      {
        name: 'Gerenciar Usuários',
        description: 'Criar, editar e remover usuários',
        tips: ['Cada pessoa deve ter seu próprio usuário', 'Admins podem acessar todas as configurações']
      },
      {
        name: 'Chaves de API',
        description: 'Gerenciar tokens de acesso',
        tips: ['Nunca compartilhe suas chaves', 'Regenere chaves comprometidas']
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrações',
    icon: Globe,
    description: 'Spotify, clima e serviços externos',
    longDescription: 'Conecte serviços externos para expandir as funcionalidades do jukebox. O Spotify permite acessar milhões de músicas, e o widget de clima mostra a previsão na tela inicial.',
    quickStartSteps: [
      'Crie um app no Spotify Developer Dashboard',
      'Cole o Client ID e Client Secret',
      'Clique em "Conectar com Spotify"',
      'Para clima, obtenha uma API key gratuita do OpenWeatherMap'
    ],
    sections: [
      {
        name: 'Spotify',
        description: 'Acesse playlists e biblioteca de músicas',
        tips: ['Conta Premium é necessária para controle total', 'Reconecte se o token expirar']
      },
      {
        name: 'Widget de Clima',
        description: 'Previsão do tempo na tela inicial',
        tips: ['API gratuita do OpenWeatherMap funciona bem', 'Configure sua cidade para previsão local']
      }
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
        <p className="text-kiosk-text/60 mt-1">Guia completo e status do sistema</p>
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
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-kiosk-text">{configuredPercent}%</span>
                  <span className="text-xs text-kiosk-text/60">configurado</span>
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
              <span className="text-kiosk-text/60">Progresso geral</span>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/40" />
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
              const status = statuses[guide.id];
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
                    status={status?.level || 'error'}
                    statusMessage={status?.message || 'Não configurado'}
                    onClick={() => setSelectedGuide(guide)}
                  />
                </motion.div>
              );
            })}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-8 text-kiosk-text/60">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
        <ConfigBackupSection />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-kiosk-text/60 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          AÇÕES RÁPIDAS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="text-xs">Manual Completo</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-kiosk-border hover:border-cyan-500/50 hover:bg-cyan-500/5"
            onClick={() => navigate('/')}
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-xs">Voltar ao Player</span>
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
