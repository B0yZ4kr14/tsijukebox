import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Palette, 
  Music, 
  Settings, 
  User, 
  Zap,
  BookOpen
} from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { BrandText, BrandTextSize } from '@/components/ui/BrandText';
import { CodePlayground, PropDefinition } from '@/components/docs/CodePlayground';

// Component categories
const categories = [
  { id: 'ui', label: 'UI Base', icon: Palette },
  { id: 'player', label: 'Player', icon: Music },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'auth', label: 'Auth', icon: User },
];

// Sample components for showcase
const showcaseComponents = {
  ui: [
    {
      id: 'button',
      title: 'Button',
      description: 'Botão interativo com múltiplas variantes',
      code: `<Button 
  variant={variant} 
  size={size}
  disabled={disabled}
>
  {children}
</Button>`,
      props: [
        { 
          name: 'variant', 
          type: 'select' as const, 
          default: 'default',
          options: ['default', 'outline', 'ghost', 'destructive', 'secondary'],
          description: 'Estilo visual do botão'
        },
        { 
          name: 'size', 
          type: 'select' as const, 
          default: 'default',
          options: ['default', 'sm', 'lg', 'icon'],
          description: 'Tamanho do botão'
        },
        { 
          name: 'disabled', 
          type: 'boolean' as const, 
          default: false,
          description: 'Desabilitar interação'
        },
        { 
          name: 'children', 
          type: 'string' as const, 
          default: 'Click me',
          description: 'Texto do botão'
        },
      ],
      renderPreview: (props: Record<string, unknown>) => (
        <Button 
          variant={props.variant as 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'}
          size={props.size as 'default' | 'sm' | 'lg' | 'icon'}
          disabled={props.disabled as boolean}
        >
          {props.children as string}
        </Button>
      ),
    },
    {
      id: 'badge',
      title: 'Badge',
      description: 'Etiqueta para status e categorias',
      code: `<Badge variant={variant}>
  {children}
</Badge>`,
      props: [
        { 
          name: 'variant', 
          type: 'select' as const, 
          default: 'default',
          options: ['default', 'outline', 'secondary', 'destructive'],
        },
        { 
          name: 'children', 
          type: 'string' as const, 
          default: 'Badge',
        },
      ],
      renderPreview: (props: Record<string, unknown>) => (
        <Badge variant={props.variant as 'default' | 'outline' | 'secondary' | 'destructive'}>
          {props.children as string}
        </Badge>
      ),
    },
    {
      id: 'logo',
      title: 'LogoBrand',
      description: 'Logo TSiJUKEBOX com variantes',
      code: `<LogoBrand 
  size={size} 
  variant={variant} 
  animate={animate}
/>`,
      props: [
        { 
          name: 'size', 
          type: 'select' as const, 
          default: 'md',
          options: ['sm', 'md', 'lg', 'xl'],
        },
        { 
          name: 'variant', 
          type: 'select' as const, 
          default: 'mirror',
          options: ['default', 'ultra', 'bulge', 'mirror', 'mirror-dark', 'silver', 'metal'],
        },
        { 
          name: 'animate', 
          type: 'boolean' as const, 
          default: true,
        },
      ],
      renderPreview: (props: Record<string, unknown>) => (
        <LogoBrand 
          size={props.size as 'sm' | 'md' | 'lg' | 'xl'}
          variant={props.variant as 'default' | 'ultra' | 'bulge' | 'mirror' | 'mirror-dark' | 'silver' | 'metal'}
          animate={props.animate as boolean}
        />
      ),
    },
    {
      id: 'brand-text',
      title: 'BrandText',
      description: 'Texto estilizado da marca TSiJUKEBOX com shimmer metálico',
      code: `<BrandText 
  size={size} 
  noShimmer={noShimmer}
/>`,
      props: [
        { 
          name: 'size', 
          type: 'select' as const, 
          default: 'md',
          options: ['sm', 'md', 'lg', 'xl'],
          description: 'Tamanho do texto'
        },
        { 
          name: 'noShimmer', 
          type: 'boolean' as const, 
          default: false,
          description: 'Desativar animação shimmer'
        },
      ],
      renderPreview: (props: Record<string, unknown>) => (
        <BrandText 
          size={props.size as BrandTextSize}
          noShimmer={props.noShimmer as boolean}
        />
      ),
    },
  ],
  player: [
    {
      id: 'playback-button',
      title: 'Playback Button',
      description: 'Botão de controle de reprodução',
      code: `<Button 
  variant="ghost" 
  size="icon"
  className="w-{size}px h-{size}px rounded-full button-3d"
>
  <Play className="w-6 h-6" />
</Button>`,
      props: [
        { 
          name: 'size', 
          type: 'number' as const, 
          default: 48,
          min: 32,
          max: 80,
        },
      ],
      renderPreview: (props: Record<string, unknown>) => (
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full bg-primary/20 hover:bg-primary/30"
          style={{ 
            width: props.size as number, 
            height: props.size as number 
          }}
        >
          <Zap className="w-6 h-6 text-primary" />
        </Button>
      ),
    },
  ],
  settings: [],
  auth: [],
};

export default function ComponentsShowcase() {
  const [activeCategory, setActiveCategory] = useState('ui');

  const currentComponents = showcaseComponents[activeCategory as keyof typeof showcaseComponents] || [];

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
          className="flex items-center gap-4 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Link to="/wiki">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80"
            >
              <ArrowLeft className="w-6 h-6 text-kiosk-text" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gold-neon flex items-center gap-2">
              <BookOpen className="w-6 h-6 icon-neon-blue" />
              Components Showcase
            </h1>
            <p className="text-kiosk-text/85 text-sm">
              Documentação interativa com exemplos ao vivo
            </p>
          </div>
        </motion.header>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            {/* Category Tabs */}
            <TabsList className="bg-kiosk-surface/50 p-1 mb-6">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="gap-2 data-[state=active]:bg-primary/20"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Content */}
            {categories.map(cat => (
              <TabsContent key={cat.id} value={cat.id}>
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-6 pr-4 pb-8">
                    {showcaseComponents[cat.id as keyof typeof showcaseComponents]?.length > 0 ? (
                      showcaseComponents[cat.id as keyof typeof showcaseComponents].map(component => (
                        <motion.div
                          key={component.id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                        >
                          <CodePlayground
                            title={component.title}
                            description={component.description}
                            code={component.code}
                            props={component.props as PropDefinition[]}
                            renderPreview={component.renderPreview}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-kiosk-text/50">
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Componentes em desenvolvimento</p>
                        <p className="text-sm mt-1">Em breve: mais exemplos interativos</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.div>
    </KioskLayout>
  );
}
