import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  History, 
  Sparkles, 
  Bug, 
  AlertTriangle,
  Zap,
  Shield,
  Palette,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter
} from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { Badge, Button, Card } from "@/components/ui/themed"

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  description: string;
  changes: {
    type: 'feature' | 'fix' | 'breaking' | 'security' | 'improvement' | 'style';
    text: string;
  }[];
  link?: string;
}

const changelogData: ChangelogEntry[] = [
  {
    version: '4.0.0',
    date: '2024-12-19',
    type: 'major',
    title: 'Enterprise Release',
    description: 'Lançamento completo da versão Enterprise com novo design system e funcionalidades avançadas.',
    changes: [
      { type: 'feature', text: 'Nova página Brand Guidelines com export de paleta' },
      { type: 'feature', text: 'Sistema de autenticação local robusto' },
      { type: 'feature', text: 'Módulo de analytics anonimizado para instalador' },
      { type: 'feature', text: 'Componentes Showcase com playground interativo' },
      { type: 'feature', text: 'Changelog Timeline visual' },
      { type: 'style', text: 'Temas simplificados: Dark Neon e Light Neon Silver' },
      { type: 'improvement', text: 'Wiki expandida com documentação técnica' },
      { type: 'security', text: 'RLS policies reforçadas no Supabase' },
    ],
  },
  {
    version: '3.5.0',
    date: '2024-11-15',
    type: 'minor',
    title: 'Acessibilidade & Performance',
    description: 'Melhorias significativas em acessibilidade WCAG 2.1 AA e otimizações de performance.',
    changes: [
      { type: 'feature', text: 'Dashboard de acessibilidade A11y' },
      { type: 'feature', text: 'Modo de alto contraste' },
      { type: 'improvement', text: 'Lazy loading de páginas' },
      { type: 'fix', text: 'Contraste de cores em componentes UI' },
      { type: 'improvement', text: 'Navegação por teclado aprimorada' },
    ],
  },
  {
    version: '3.4.0',
    date: '2024-10-20',
    type: 'minor',
    title: 'Integrações de Música',
    description: 'Novas integrações com serviços de streaming e melhorias no player.',
    changes: [
      { type: 'feature', text: 'Integração YouTube Music' },
      { type: 'feature', text: 'Spicetify com extensões customizadas' },
      { type: 'feature', text: 'Visualizador de áudio' },
      { type: 'improvement', text: 'Sincronização de letras em tempo real' },
      { type: 'fix', text: 'Estabilidade do WebSocket' },
    ],
  },
  {
    version: '3.3.2',
    date: '2024-09-30',
    type: 'patch',
    title: 'Correções de Bugs',
    description: 'Correções de bugs reportados pela comunidade.',
    changes: [
      { type: 'fix', text: 'Vazamento de memória no player' },
      { type: 'fix', text: 'Erro de autenticação em refresh' },
      { type: 'fix', text: 'Responsividade em dispositivos móveis' },
    ],
  },
  {
    version: '3.3.0',
    date: '2024-09-01',
    type: 'minor',
    title: 'Sistema de Temas',
    description: 'Novo sistema de personalização de temas com gradientes.',
    changes: [
      { type: 'feature', text: 'Temas com gradiente (Aurora, Sunset, Ocean)' },
      { type: 'feature', text: 'Salvamento de temas personalizados' },
      { type: 'style', text: 'Novas variantes de logo (mirror, metal)' },
      { type: 'improvement', text: 'Transições suaves entre temas' },
    ],
  },
  {
    version: '3.0.0',
    date: '2024-07-15',
    type: 'major',
    title: 'Reescrita Completa',
    description: 'Migração para React 18 com nova arquitetura de hooks.',
    changes: [
      { type: 'breaking', text: 'Migração para React 18' },
      { type: 'breaking', text: 'Nova estrutura de hooks modulares' },
      { type: 'feature', text: 'Supabase como backend' },
      { type: 'feature', text: 'PWA com suporte offline' },
      { type: 'security', text: 'Autenticação via Supabase Auth' },
    ],
  },
];

const changeTypeIcons = {
  feature: Sparkles,
  fix: Bug,
  breaking: AlertTriangle,
  security: Shield,
  improvement: Zap,
  style: Palette,
};

const changeTypeColors = {
  feature: 'text-green-400 bg-green-500/20 border-green-500/30',
  fix: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  breaking: 'text-red-400 bg-red-500/20 border-red-500/30',
  security: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  improvement: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  style: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
};

const versionTypeColors = {
  major: 'bg-gradient-to-br from-amber-500 to-orange-600',
  minor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  patch: 'bg-gradient-to-br from-gray-500 to-gray-600',
};

type FilterType = 'all' | 'feature' | 'fix' | 'breaking' | 'security';

export default function ChangelogTimeline() {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set([changelogData[0]?.version])
  );
  const [filter, setFilter] = useState<FilterType>('all');

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const filteredData = changelogData.map(entry => ({
    ...entry,
    changes: filter === 'all' 
      ? entry.changes 
      : entry.changes.filter(c => c.type === filter),
  })).filter(entry => entry.changes.length > 0 || filter === 'all');

  return (
    <KioskLayout>
      <motion.div
        className="min-h-screen bg-kiosk-background p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LogoBrand size="md" variant="mirror" animate />
        </motion.div>

        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Link to="/wiki">
            <Button
              variant="ghost"
              size="xs"
              className="w-12 h-12 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80" aria-label="Voltar">
              <ArrowLeft className="w-6 h-6 text-kiosk-text" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gold-neon flex items-center gap-2">
              <History className="w-6 h-6 icon-neon-blue" />
              Changelog
            </h1>
            <p className="text-kiosk-text/85 text-sm">
              Histórico de versões e atualizações
            </p>
          </div>
        </motion.header>

        {/* Filters */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-6"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mr-2">
            <Filter className="w-4 h-4 text-kiosk-text/70" />
            <span className="text-sm text-kiosk-text/70">Filtrar:</span>
          </div>
          {(['all', 'feature', 'fix', 'breaking', 'security'] as FilterType[]).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="h-7 text-xs"
            >
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="relative pl-8 pr-4 pb-8">
              {/* Vertical Line */}
              <div className="absolute left-[14px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
              
              {filteredData.map((entry, index) => {
                const isExpanded = expandedVersions.has(entry.version);
                
                return (
                  <motion.div
                    key={entry.version}
                    className="relative mb-6"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute left-[-22px] w-5 h-5 rounded-full ${versionTypeColors[entry.type]} shadow-lg flex items-center justify-center`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
                    </div>
                    
                    {/* Card */}
                    <Card className="card-neon-border overflow-hidden">
                      <button
                        onClick={() => toggleVersion(entry.version)}
                        className="w-full text-left p-4 hover:bg-kiosk-surface/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={versionTypeColors[entry.type]}>
                              v{entry.version}
                            </Badge>
                            <span className="font-semibold text-kiosk-text">
                              {entry.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-kiosk-text/60">
                              {entry.date}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-kiosk-text/60" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-kiosk-text/60" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-kiosk-text/70 mt-1">
                          {entry.description}
                        </p>
                      </button>
                      
                      {/* Expanded Content */}
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4">
                          <div className="border-t border-border pt-4 space-y-2">
                            {entry.changes.map((change, i) => {
                              const Icon = changeTypeIcons[change.type];
                              return (
                                <div 
                                  key={i}
                                  className="flex items-start gap-2"
                                >
                                  <div className={`p-1 rounded ${changeTypeColors[change.type]} mt-0.5`}>
                                    <Icon className="w-3 h-3" />
                                  </div>
                                  <span className="text-sm text-kiosk-text/85">
                                    {change.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {entry.link && (
                            <a
                              href={entry.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                            >
                              Ver detalhes <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </KioskLayout>
  );
}
