import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GripVertical, Cloud, Hand, Bookmark, Sparkles, 
  Copy, Check, Eye, EyeOff,
  VolumeX, Library, Building2, Music, Search, Plus, Loader2, Wand2
} from 'lucide-react';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { PageTitle } from '@/components/ui/PageTitle';
import { WcagExceptionComment } from '@/components/ui/WcagExceptionComment';
import { BackButton } from '@/components/ui/BackButton';
import { toast } from 'sonner';
import { Badge, Button, Card } from "@/components/ui/themed"

interface WcagException {
  id: string;
  file: string;
  opacity: string;
  element: string;
  justification: string;
  hasHoverState: boolean;
  hoverColor?: string;
  category: 'decorative' | 'state-change' | 'disabled' | 'secondary';
}

// 13 exceções WCAG documentadas conforme ACCESSIBILITY.md
const WCAG_EXCEPTIONS: WcagException[] = [
  // 1. QueuePanel - GripVertical
  {
    id: 'queue-grip',
    file: 'QueuePanel.tsx',
    opacity: '/20',
    element: 'GripVertical icon',
    justification: 'Ícone de drag-drop invisível por padrão, aparece no group-hover',
    hasHoverState: true,
    hoverColor: 'opacity-100',
    category: 'state-change',
  },
  // 2. CloudConnectionSection - Cloud icon
  {
    id: 'cloud-unconfigured',
    file: 'CloudConnectionSection.tsx',
    opacity: '/20',
    element: 'Cloud icon',
    justification: 'Ícone decorativo em estado não configurado',
    hasHoverState: false,
    category: 'decorative',
  },
  // 3. InteractiveTestMode - Gesture icons
  {
    id: 'gesture-demo',
    file: 'InteractiveTestMode.tsx',
    opacity: '/40',
    element: 'Hand gesture icons',
    justification: 'Demonstração visual de gestos, não é conteúdo crítico',
    hasHoverState: false,
    category: 'decorative',
  },
  // 4. WikiArticle - Bookmark
  {
    id: 'bookmark-inactive',
    file: 'WikiArticle.tsx',
    opacity: '/40',
    element: 'Bookmark icon',
    justification: 'Estado inativo com transição para yellow-500 no hover',
    hasHoverState: true,
    hoverColor: 'text-yellow-500',
    category: 'state-change',
  },
  // 5. LogoBrand - Tagline
  {
    id: 'logo-tagline',
    file: 'LogoBrand.tsx',
    opacity: '/60',
    element: 'Tagline text',
    justification: 'Texto secundário; logo principal tem contraste adequado',
    hasHoverState: false,
    category: 'secondary',
  },
  // 6. AccessibilitySection - VolumeX
  {
    id: 'accessibility-volumex',
    file: 'AccessibilitySection.tsx',
    opacity: '/80',
    element: 'VolumeX icon',
    justification: 'Estado desabilitado distinto do ativado',
    hasHoverState: false,
    category: 'disabled',
  },
  // 7. AccessibilitySection - Sparkles
  {
    id: 'accessibility-sparkles',
    file: 'AccessibilitySection.tsx',
    opacity: '/80',
    element: 'Sparkles icon',
    justification: 'Estado desabilitado distinto do ativado',
    hasHoverState: false,
    category: 'disabled',
  },
  // 8. YouTubeMusicBrowser - Library icon
  {
    id: 'youtube-library',
    file: 'YouTubeMusicBrowser.tsx',
    opacity: '/30',
    element: 'Library icon',
    justification: 'Ícone decorativo em estado vazio',
    hasHoverState: false,
    category: 'decorative',
  },
  // 9. SetupWizard - Achievement locked
  {
    id: 'setup-achievement',
    file: 'SetupWizard.tsx',
    opacity: '/30',
    element: 'Achievement locked badge',
    justification: 'Estado bloqueado; desbloqueado usa yellow-400',
    hasHoverState: false,
    category: 'state-change',
  },
  // 10. ClientsMonitorDashboard - Building2
  {
    id: 'clients-building',
    file: 'ClientsMonitorDashboard.tsx',
    opacity: '/30',
    element: 'Building2 icon',
    justification: 'Ícone decorativo em estado vazio',
    hasHoverState: false,
    category: 'decorative',
  },
  // 11. SpotifySearch - Music/Search icons
  {
    id: 'spotify-search-icons',
    file: 'SpotifySearch.tsx',
    opacity: '/30',
    element: 'Music/Search icons',
    justification: 'Ícones decorativos em estados vazios',
    hasHoverState: false,
    category: 'decorative',
  },
  // 12. SpotifyPanel - Botão desconectado
  {
    id: 'spotify-disconnected',
    file: 'SpotifyPanel.tsx',
    opacity: '/40',
    element: 'Disconnected button',
    justification: 'Hover aumenta contraste; estado conectado usa #1DB954',
    hasHoverState: true,
    hoverColor: 'text-kiosk-text/60',
    category: 'state-change',
  },
  // 13. AddToPlaylistModal - Loader2/Plus
  {
    id: 'playlist-modal-icons',
    file: 'AddToPlaylistModal.tsx',
    opacity: '/30',
    element: 'Loader2/Plus icons',
    justification: 'Tornam-se visíveis quando adicionado',
    hasHoverState: true,
    hoverColor: 'text-green-500',
    category: 'state-change',
  },
];

const ExceptionDemo = ({ exception }: { exception: WcagException }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const renderIcon = () => {
    const baseClass = `w-8 h-8 transition-all duration-300`;
    const normalClass = `text-kiosk-text${exception.opacity.replace('opacity-', '/')}`;
    const hoverClass = isHovered && exception.hasHoverState 
      ? exception.hoverColor 
      : normalClass;
    
    switch (exception.id) {
      case 'queue-grip':
        return <GripVertical className={`${baseClass} ${hoverClass}`} />;
      case 'cloud-unconfigured':
        return <Cloud className={`${baseClass} ${hoverClass}`} />;
      case 'gesture-demo':
        return <Hand className={`${baseClass} ${hoverClass}`} />;
      case 'bookmark-inactive':
        return <Bookmark className={`${baseClass} ${hoverClass}`} />;
      case 'logo-tagline':
        return <Sparkles className={`${baseClass} ${hoverClass}`} />;
      case 'accessibility-volumex':
        return <VolumeX className={`${baseClass} ${hoverClass}`} />;
      case 'accessibility-sparkles':
        return <Sparkles className={`${baseClass} ${hoverClass}`} />;
      case 'youtube-library':
        return <Library className={`${baseClass} ${hoverClass}`} />;
      case 'setup-achievement':
        return <Sparkles className={`${baseClass} ${hoverClass}`} />;
      case 'clients-building':
        return <Building2 className={`${baseClass} ${hoverClass}`} />;
      case 'spotify-search-icons':
        return <Music className={`${baseClass} ${hoverClass}`} />;
      case 'spotify-disconnected':
        return <Search className={`${baseClass} ${hoverClass}`} />;
      case 'playlist-modal-icons':
        return <Plus className={`${baseClass} ${hoverClass}`} />;
      default:
        return <Sparkles className={`${baseClass} ${hoverClass}`} />;
    }
  };

  const commentCode = `{/* WCAG Exception: ${exception.opacity} ${exception.element} - ${exception.justification} */}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(commentCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card 
      className="card-neon-border bg-kiosk-surface/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{exception.file}</h3>
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
            {exception.opacity}
          </Badge>
        </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-4">
          {/* Normal State */}
          <div className="flex flex-col items-center p-4 bg-kiosk-bg/50 rounded-lg flex-1">
            <span className="text-xs text-description-visible mb-2 flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Normal
            </span>
            <div className={`text-kiosk-text${exception.opacity}`}>{renderIcon()}</div>
          </div>
          
          {/* Arrow */}
          {exception.hasHoverState && (
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-cyan-400 text-xl"
            >
              →
            </motion.div>
          )}
          
          {/* Hover State */}
          {exception.hasHoverState && (
            <div className="flex flex-col items-center p-4 bg-kiosk-bg/50 rounded-lg border border-cyan-500/30 flex-1">
              <span className="text-xs text-description-visible mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Hover
              </span>
              <div className={exception.hoverColor}>{renderIcon()}</div>
            </div>
          )}
        </div>
        
        <p className="text-sm text-description-visible">{exception.justification}</p>
        
        <div className="relative">
          <div className="p-2 bg-kiosk-bg rounded text-xs font-mono text-cyan-400/80 pr-10 overflow-x-auto">
            {commentCode}
          </div>
          <Button 
            size="xs" 
            variant="ghost" 
            className="absolute right-1 top-1 h-6 w-6"
            onClick={handleCopy} aria-label="Confirmar">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function WcagExceptions() {
  
  const categories = {
    'decorative': { label: 'Decorativos', description: 'Ícones puramente visuais sem informação crítica', color: 'text-purple-400' },
    'state-change': { label: 'Mudança de Estado', description: 'Elementos com hover/focus que aumentam contraste', color: 'text-cyan-400' },
    'disabled': { label: 'Desabilitados', description: 'Estados desabilitados intencionalmente dimmed', color: 'text-gray-400' },
    'secondary': { label: 'Secundários', description: 'Informação secundária com elemento principal visível', color: 'text-amber-400' },
  };

  const getCategoryCount = (category: string) => 
    WCAG_EXCEPTIONS.filter(e => e.category === category).length;

  return (
    <div className="min-h-screen bg-kiosk-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton className="text-nav-neon-white hover:text-kiosk-text" />
          <LogoBrand variant="metal" size="sm" />
        </div>
        
        <PageTitle 
          title="Exceções WCAG Documentadas"
          subtitle="Visualização interativa de todos os elementos com contraste reduzido intencional"
        />
        
        {/* Criteria Card */}
        <Card className="card-neon-border bg-kiosk-surface/30 my-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Critérios para Exceções Válidas</h3>
          
          <div className="mt-4">
            {Object.entries(categories).map(([key, { label, description, color }]) => (
              <div key={key} className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded-lg">
                <Badge variant="outline" className={`${color} border-current/30`}>
                  {getCategoryCount(key)}
                </Badge>
                <div>
                  <h4 className="text-nav-neon-white font-medium">{label}</h4>
                  <p className="text-sm text-description-visible">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-kiosk-surface/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-kiosk-primary/20">
              Todas ({WCAG_EXCEPTIONS.length})
            </TabsTrigger>
            {Object.entries(categories).map(([key, { label }]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className="data-[state=active]:bg-kiosk-primary/20"
              >
                {label} ({getCategoryCount(key)})
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="generator" 
              className="data-[state=active]:bg-green-500/20 text-green-400"
            >
              <Wand2 className="w-4 h-4 mr-1" />
              Gerar Nova
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WCAG_EXCEPTIONS.map(exception => (
                <ExceptionDemo key={exception.id} exception={exception} />
              ))}
            </div>
          </TabsContent>
          
          {Object.keys(categories).map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WCAG_EXCEPTIONS.filter(e => e.category === category).map(exception => (
                  <ExceptionDemo key={exception.id} exception={exception} />
                ))}
              </div>
              {getCategoryCount(category) === 0 && (
                <div className="text-center py-12 text-description-visible">
                  Nenhuma exceção nesta categoria
                </div>
              )}
            </TabsContent>
          ))}

          {/* Generator Tab */}
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WcagExceptionComment />
              
              <Card className="card-neon-border bg-kiosk-surface/30">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Instruções de Uso</h3>
                
                <div className="mt-4">
                  <div className="space-y-2">
                    <h4 className="text-nav-neon-white font-medium">1. Preencha os campos</h4>
                    <p className="text-sm text-description-visible">
                      Informe o arquivo, opacidade, elemento e justificativa para a exceção WCAG.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-nav-neon-white font-medium">2. Selecione a categoria</h4>
                    <p className="text-sm text-description-visible">
                      Escolha a categoria que melhor descreve o motivo da exceção.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-nav-neon-white font-medium">3. Escolha o formato</h4>
                    <p className="text-sm text-description-visible">
                      <strong>JSX Inline:</strong> Comentário curto para colocar acima do elemento<br />
                      <strong>JSX Multi-linha:</strong> Comentário detalhado com todas as informações<br />
                      <strong>JS/TS:</strong> Comentário para arquivos JavaScript/TypeScript
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-nav-neon-white font-medium">4. Copie e cole</h4>
                    <p className="text-sm text-description-visible">
                      Clique em "Copiar Comentário" e cole na linha anterior ao elemento com contraste reduzido.
                    </p>
                  </div>

                  <div className="p-3 bg-kiosk-bg/50 rounded-lg border border-amber-500/30">
                    <p className="text-sm text-amber-400/90">
                      <strong>Importante:</strong> Após adicionar o comentário, execute{' '}
                      <code className="bg-kiosk-bg px-1 rounded text-cyan-400">npm run wcag:validate</code>{' '}
                      para verificar se a exceção está corretamente documentada.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer info */}
        <Card className="card-neon-border bg-kiosk-surface/30 mt-8">
          <div className="mt-4">
            <h3 className="text-gold-neon font-medium mb-2">Como Documentar uma Nova Exceção</h3>
            <ol className="text-sm text-description-visible space-y-2 list-decimal list-inside">
              <li>Adicione um comentário WCAG na linha anterior ao elemento</li>
              <li>Inclua a opacidade, elemento e justificativa</li>
              <li>Execute <code className="bg-kiosk-bg px-1 rounded text-cyan-400">npm run wcag:validate</code> para verificar</li>
              <li>Atualize esta página com a nova exceção se necessário</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
