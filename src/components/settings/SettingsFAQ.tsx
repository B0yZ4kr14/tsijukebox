import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Plug,
  Database,
  Settings2,
  Palette,
  Shield,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsCategoryId } from '@/hooks';
import { Badge, Button, Card, Input } from "@/components/ui/themed"

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: SettingsCategoryId;
  tags: string[];
  tips?: string[];
}

const faqItems: FAQItem[] = [
  // === CONEXÕES ===
  {
    id: 'faq-backend-offline',
    question: 'O que significa "Backend não disponível"?',
    answer: 'Indica que o sistema não consegue se comunicar com o servidor de música. Isso pode acontecer se o servidor estiver desligado ou se a URL estiver incorreta.',
    category: 'connections',
    tags: ['backend', 'conexão', 'erro', 'offline'],
    tips: ['Verifique se o servidor está rodando', 'Confirme a URL da API nas configurações', 'Ative o Modo Demo para testar a interface']
  },
  {
    id: 'faq-connection-timeout',
    question: 'O que fazer quando a conexão expira (timeout)?',
    answer: 'O timeout ocorre quando o servidor demora muito para responder. Pode ser problema de rede lenta, servidor sobrecarregado, ou firewall bloqueando.',
    category: 'connections',
    tags: ['timeout', 'erro', 'conexão', 'troubleshooting'],
    tips: ['Verifique sua conexão de internet', 'Teste se o servidor responde em outro navegador', 'Aumente o timeout nas configurações avançadas']
  },
  {
    id: 'faq-network-unreachable',
    question: 'Mensagem "Rede indisponível" ou "Network unreachable"',
    answer: 'Este erro indica que o dispositivo não consegue acessar a rede. Pode ser problema de Wi-Fi, cabo desconectado, ou configuração de IP incorreta.',
    category: 'connections',
    tags: ['rede', 'network', 'erro', 'offline', 'troubleshooting'],
    tips: ['Verifique a conexão Wi-Fi ou cabo', 'Reinicie o roteador', 'Confirme as configurações de IP']
  },
  {
    id: 'faq-backend-500-error',
    question: 'Erro 500 - "Internal Server Error"',
    answer: 'Este erro indica problema no servidor backend, não no cliente. O servidor encontrou uma condição inesperada que o impediu de completar a requisição.',
    category: 'connections',
    tags: ['500', 'servidor', 'erro', 'internal', 'troubleshooting'],
    tips: ['Verifique os logs do servidor', 'Reinicie o serviço backend', 'Contate o administrador do sistema']
  },
  {
    id: 'faq-cors-error',
    question: 'Erro de CORS - "Cross-Origin Request Blocked"',
    answer: 'Este erro ocorre quando o navegador bloqueia requisições entre domínios diferentes por segurança. O servidor precisa permitir o domínio do frontend.',
    category: 'connections',
    tags: ['cors', 'cross-origin', 'erro', 'troubleshooting'],
    tips: ['Configure CORS no servidor backend', 'Verifique se está usando HTTPS em ambos', 'Use o mesmo domínio para frontend e backend']
  },
  {
    id: 'faq-demo-mode',
    question: 'Quando devo usar o Modo Demo?',
    answer: 'O Modo Demo é ideal para testar a interface, fazer demonstrações ou quando você não tem acesso ao servidor real. Nesse modo, o sistema usa dados simulados.',
    category: 'connections',
    tags: ['demo', 'teste', 'simulação'],
    tips: ['Perfeito para aprender a usar o sistema', 'Não salva dados reais']
  },
  {
    id: 'faq-websocket-polling',
    question: 'Qual a diferença entre WebSocket e Polling?',
    answer: 'WebSocket mantém uma conexão constante permitindo atualizações instantâneas. Polling verifica periodicamente por mudanças. WebSocket é mais rápido, mas Polling pode ser mais estável.',
    category: 'connections',
    tags: ['websocket', 'polling', 'tempo real'],
    tips: ['Use WebSocket para melhor experiência', 'Polling é mais compatível com firewalls']
  },

  // === DADOS ===
  {
    id: 'faq-backup-frequency',
    question: 'Com que frequência devo fazer backup?',
    answer: 'Recomendamos backup diário automático para proteção ideal. Se você faz muitas alterações, considere backups mais frequentes. Mantenha pelo menos 3 cópias.',
    category: 'data',
    tags: ['backup', 'frequência', 'proteção'],
    tips: ['Configure backup automático', 'Mantenha cópias em locais diferentes']
  },
  {
    id: 'faq-database-corruption',
    question: 'Erro "Database corrupted" - Como recuperar?',
    answer: 'Se o banco de dados estiver corrompido, não entre em pânico. Primeiro, tente executar o comando de Integridade. Se não resolver, restaure o último backup válido.',
    category: 'data',
    tags: ['database', 'corrompido', 'erro', 'recuperar', 'troubleshooting'],
    tips: ['Execute verificação de integridade primeiro', 'Sempre mantenha backups atualizados', 'Não modifique arquivos .db manualmente']
  },
  {
    id: 'faq-vacuum-database',
    question: 'O que faz o comando "Vacuum" no banco de dados?',
    answer: 'Vacuum reorganiza e compacta o banco de dados, recuperando espaço e melhorando a performance. É como uma "faxina" no banco de dados.',
    category: 'data',
    tags: ['vacuum', 'otimização', 'database'],
    tips: ['Execute mensalmente', 'Pode demorar alguns minutos em bancos grandes']
  },
  {
    id: 'faq-backup-restore-failed',
    question: 'Restauração de backup falhou - O que fazer?',
    answer: 'Se a restauração falhou, verifique se o arquivo de backup está íntegro e completo. Tente restaurar um backup anterior. Se todos falharem, pode haver corrupção.',
    category: 'data',
    tags: ['backup', 'restore', 'falha', 'troubleshooting'],
    tips: ['Verifique se o arquivo não está corrompido', 'Tente backups anteriores', 'Mantenha múltiplas cópias']
  },
  {
    id: 'faq-cloud-backup',
    question: 'Preciso de backup na nuvem se já faço backup local?',
    answer: 'Backup na nuvem oferece proteção extra contra perda total (incêndio, roubo, falha de disco). É altamente recomendado ter ambos.',
    category: 'data',
    tags: ['cloud', 'nuvem', 'segurança'],
    tips: ['Google Drive e Dropbox oferecem planos gratuitos', 'Configure sincronização automática']
  },

  // === SISTEMA ===
  {
    id: 'faq-grafana-prometheus',
    question: 'Para que servem o Grafana e Prometheus?',
    answer: 'Grafana mostra gráficos do desempenho do sistema (CPU, memória). Prometheus coleta essas métricas. São ferramentas para administradores monitorarem a saúde do sistema.',
    category: 'system',
    tags: ['grafana', 'prometheus', 'monitoramento'],
    tips: ['Grafana fica em http://localhost:3000', 'Prometheus em http://localhost:9090']
  },
  {
    id: 'faq-system-slow',
    question: 'O sistema está lento - Como diagnosticar?',
    answer: 'Sistema lento pode ter várias causas: CPU alta, memória insuficiente, disco cheio, ou rede lenta. Use o Dashboard para ver métricas em tempo real.',
    category: 'system',
    tags: ['lento', 'performance', 'troubleshooting'],
    tips: ['Verifique uso de CPU e memória', 'Libere espaço em disco', 'Execute Vacuum no banco de dados']
  },
  {
    id: 'faq-ntp-sync',
    question: 'Por que sincronizar o horário (NTP)?',
    answer: 'Horário correto é importante para logs, agendamentos de backup e exibição da data/hora. O NTP sincroniza automaticamente com servidores de tempo.',
    category: 'system',
    tags: ['ntp', 'horário', 'sincronização'],
    tips: ['Mantenha sempre ativado', 'Útil para correlacionar eventos nos logs']
  },

  // === APARÊNCIA ===
  {
    id: 'faq-change-theme',
    question: 'Como mudar as cores do sistema?',
    answer: 'Vá em Configurações > Aparência > Tema de Cores. Escolha entre temas pré-definidos ou crie temas personalizados com gradientes e cores específicas.',
    category: 'appearance',
    tags: ['tema', 'cores', 'personalização'],
    tips: ['Temas escuros são melhores para ambientes com pouca luz', 'Salve temas personalizados para usar depois']
  },
  {
    id: 'faq-high-contrast',
    question: 'Quando usar o modo Alto Contraste?',
    answer: 'O modo Alto Contraste aumenta a diferença entre cores, tornando o texto mais legível. Recomendado para pessoas com dificuldades visuais.',
    category: 'appearance',
    tags: ['contraste', 'acessibilidade', 'visão'],
    tips: ['Combine com aumento de fonte se necessário']
  },

  // === SEGURANÇA ===
  {
    id: 'faq-default-credentials',
    question: 'Por que devo mudar as credenciais padrão?',
    answer: 'As credenciais padrão (tsi/connect) são conhecidas publicamente. Qualquer pessoa com acesso à rede poderia acessar seu sistema. Crie usuários personalizados.',
    category: 'security',
    tags: ['senha', 'credenciais', 'segurança'],
    tips: ['Use senhas com letras, números e símbolos', 'Cada pessoa deve ter seu próprio usuário']
  },
  {
    id: 'faq-user-roles',
    question: 'Qual a diferença entre Admin, Usuário e Novato?',
    answer: 'Admin: acesso total. Usuário: pode usar o sistema normalmente. Novato: acesso limitado, apenas para ouvir músicas sem alterar configurações.',
    category: 'security',
    tags: ['permissões', 'roles', 'acesso'],
    tips: ['Dê apenas as permissões necessárias', 'Admins devem ser pessoas de confiança']
  },
  {
    id: 'faq-session-expired',
    question: 'Mensagem "Sessão expirada" - Por que acontece?',
    answer: 'A sessão expira após um período de inatividade por segurança. Faça login novamente. Se acontece muito rápido, verifique as configurações de timeout.',
    category: 'security',
    tags: ['sessão', 'expirada', 'login', 'troubleshooting'],
    tips: ['Configure o tempo de sessão nas configurações', 'Logout sempre que sair do sistema']
  },

  // === INTEGRAÇÕES ===
  {
    id: 'faq-spotify-connect',
    question: 'Como conectar minha conta do Spotify?',
    answer: 'Crie um aplicativo no Spotify Developer Dashboard. Copie o Client ID e Client Secret para as configurações. Depois, clique em "Conectar com Spotify".',
    category: 'integrations',
    tags: ['spotify', 'conexão', 'música'],
    tips: ['Conta Premium oferece mais funcionalidades', 'O token expira - reconecte se necessário']
  },
  {
    id: 'faq-spotify-token-expired',
    question: 'O Spotify parou de funcionar - "Token expirado"',
    answer: 'O token de acesso do Spotify expira periodicamente. O sistema tenta renovar automaticamente, mas às vezes é necessário reconectar manualmente.',
    category: 'integrations',
    tags: ['spotify', 'token', 'erro', 'expirado', 'troubleshooting'],
    tips: ['Reconecte nas configurações de Integrações', 'Verifique se as credenciais estão corretas', 'Revogue e recrie tokens se persistir']
  },
  {
    id: 'faq-spotify-no-playback',
    question: 'Spotify conectado mas não reproduz música',
    answer: 'Verifique se o Spotify está aberto em algum dispositivo. O player precisa de um dispositivo ativo para controlar. Abra o app Spotify no celular ou desktop.',
    category: 'integrations',
    tags: ['spotify', 'reprodução', 'device', 'troubleshooting'],
    tips: ['Mantenha o Spotify aberto em algum dispositivo', 'Verifique se a conta é Premium', 'Selecione o dispositivo correto']
  },
  {
    id: 'faq-weather-api',
    question: 'Como configurar o widget de clima?',
    answer: 'Crie uma conta gratuita no OpenWeatherMap e obtenha uma API key. Cole a key nas configurações e informe sua cidade no formato "Cidade, País".',
    category: 'integrations',
    tags: ['clima', 'weather', 'api'],
    tips: ['API gratuita permite até 1000 consultas/dia', 'Formato da cidade: "São Paulo, BR"']
  },
  {
    id: 'faq-weather-api-limit',
    question: 'Widget de clima mostra erro de limite (rate limit)',
    answer: 'A API gratuita do OpenWeatherMap tem limite de requisições. Se exceder, aguarde alguns minutos ou considere um plano pago para mais consultas.',
    category: 'integrations',
    tags: ['clima', 'api', 'limite', 'erro', 'troubleshooting'],
    tips: ['Reduza a frequência de atualização', 'Considere plano pago para uso intenso', 'Aguarde 10 minutos e tente novamente']
  },
  {
    id: 'faq-spotify-premium',
    question: 'Preciso de Spotify Premium?',
    answer: 'Spotify Premium é recomendado para controle total da reprodução (pausar, pular, volume). Com conta gratuita, algumas funcionalidades podem ser limitadas.',
    category: 'integrations',
    tags: ['spotify', 'premium', 'limitações'],
    tips: ['Teste com conta gratuita primeiro', 'Premium permite controle remoto completo']
  }
];

const categoryInfo: Record<SettingsCategoryId, { icon: typeof Plug; label: string; color: string }> = {
  dashboard: { icon: HelpCircle, label: 'Dashboard', color: 'text-cyan-400' },
  connections: { icon: Plug, label: 'Conexões', color: 'text-cyan-400' },
  data: { icon: Database, label: 'Dados', color: 'text-green-400' },
  system: { icon: Settings2, label: 'Sistema', color: 'text-purple-400' },
  appearance: { icon: Palette, label: 'Aparência', color: 'text-pink-400' },
  security: { icon: Shield, label: 'Segurança', color: 'text-yellow-400' },
  integrations: { icon: Globe, label: 'Integrações', color: 'text-blue-400' }
};

interface SettingsFAQProps {
  filterCategory?: SettingsCategoryId;
}

export function SettingsFAQ({ filterCategory }: SettingsFAQProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategoryId | 'all'>(filterCategory || 'all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories: (SettingsCategoryId | 'all')[] = ['all', 'connections', 'data', 'system', 'appearance', 'security', 'integrations'];

  const filteredItems = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="p-5 bg-kiosk-surface/50 border-cyan-500/30 card-option-neon">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-kiosk-text flex items-center gap-2">
          <HelpCircle className="w-5 h-5 icon-neon-blue" />
          Perguntas Frequentes
        </h3>
        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
          {filteredItems.length} {filteredItems.length === 1 ? 'pergunta' : 'perguntas'}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/80" />
        <Input
          placeholder="Buscar no FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-kiosk-background/50 border-kiosk-border text-kiosk-text"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => {
          const info = cat === 'all' ? null : categoryInfo[cat];
          const Icon = info?.icon || HelpCircle;
          
          return (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "h-8 px-3 text-xs transition-all",
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-kiosk-background/30 text-kiosk-text/85 hover:text-kiosk-text hover:bg-kiosk-background/50"
              )}
            >
              {cat === 'all' ? (
                'Todas'
              ) : (
                <>
                  <Icon className={cn("w-3 h-3 mr-1", info?.color)} />
                  {info?.label}
                </>
              )}
            </Button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredItems.map((item) => {
            const catInfo = categoryInfo[item.category];
            const Icon = catInfo.icon;
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                layout
              >
                <div
                  className={cn(
                    "rounded-lg border transition-all",
                    isExpanded 
                      ? "bg-kiosk-background/60 border-cyan-500/40" 
                      : "bg-kiosk-background/30 border-kiosk-border/50 hover:border-kiosk-border"
                  )}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", catInfo.color)} />
                    <span className="flex-1 text-sm text-kiosk-text font-medium">
                      {item.question}
                    </span>
                    {isExpanded ? (
                      <ChevronUp aria-hidden="true" className="w-4 h-4 text-kiosk-text/85" />
                    ) : (
                      <ChevronDown aria-hidden="true" className="w-4 h-4 text-kiosk-text/85" />
                    )}
                  </button>

                  {/* Answer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 space-y-3">
                          <p className="text-sm text-kiosk-text/80 leading-relaxed pl-7">
                            {item.answer}
                          </p>
                          
                          {item.tips && item.tips.length > 0 && (
                            <div className="pl-7 space-y-1.5">
                              {item.tips.map((tip, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-kiosk-text/85">{tip}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="pl-7 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0 border-kiosk-border/50 text-kiosk-text/85"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-kiosk-text/85">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma pergunta encontrada</p>
            <p className="text-xs mt-1">Tente outros termos de busca</p>
          </div>
        )}
      </div>
    </Card>
  );
}
