/**
 * DesignSystem Page
 * 
 * Comprehensive showcase of the TSiJUKEBOX Design System
 * Including colors, typography, components, icons, and spacing
 * 
 * @author B0.y_Z4kr14
 * @version 1.0.0
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Box, 
  Layers, 
  Grid3X3, 
  Sparkles,
  Copy,
  Check,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SectionIconsShowcase, sectionIcons } from '@/components/ui/SectionIconsShowcase';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { BackButton } from '@/components/ui/BackButton';
import { toast } from 'sonner';

// Color Palette Data
const colorPalette = {
  backgrounds: [
    { name: 'Primary', variable: '--background', value: '#0a0a0a', description: 'Fundo principal' },
    { name: 'Secondary', variable: '--bg-secondary', value: '#1a1a1a', description: 'Cards e painéis' },
    { name: 'Tertiary', variable: '--bg-tertiary', value: '#2a2a2a', description: 'Hover states' },
  ],
  accents: [
    { name: 'Cyan', variable: '--accent-cyan', value: '#00d4ff', description: 'Cor primária, botões, links' },
    { name: 'Green Neon', variable: '--accent-greenNeon', value: '#00ff88', description: 'Sucesso, instalação' },
    { name: 'Magenta', variable: '--accent-magenta', value: '#ff00d4', description: 'Karaoke, destaques' },
    { name: 'Yellow Gold', variable: '--accent-yellowGold', value: '#ffd400', description: 'Avisos, desenvolvimento' },
    { name: 'Purple', variable: '--accent-purple', value: '#d400ff', description: 'API, dados' },
    { name: 'Orange', variable: '--accent-orange', value: '#ff4400', description: 'Segurança, alertas' },
    { name: 'Green Lime', variable: '--accent-greenLime', value: '#00ff44', description: 'Monitoramento, ativo' },
    { name: 'Blue Electric', variable: '--accent-blueElectric', value: '#4400ff', description: 'Testes, QA' },
  ],
  brands: [
    { name: 'Spotify', variable: '--brand-spotify', value: '#1DB954', description: 'Integração Spotify' },
    { name: 'YouTube', variable: '--brand-youtube', value: '#FF0000', description: 'Integração YouTube' },
    { name: 'GitHub', variable: '--brand-github', value: '#24292e', description: 'Integração GitHub' },
  ],
  states: [
    { name: 'Success', variable: '--state-success', value: '#00ff44', description: 'Operações bem-sucedidas' },
    { name: 'Warning', variable: '--state-warning', value: '#ffd400', description: 'Avisos e atenção' },
    { name: 'Error', variable: '--state-error', value: '#ff4444', description: 'Erros e falhas' },
    { name: 'Info', variable: '--state-info', value: '#00d4ff', description: 'Informações neutras' },
  ],
};

// Typography Data
const typography = {
  sizes: [
    { name: 'H1', size: '3rem (48px)', weight: '700', usage: 'Títulos principais' },
    { name: 'H2', size: '2.25rem (36px)', weight: '600', usage: 'Títulos de seção' },
    { name: 'H3', size: '1.875rem (30px)', weight: '600', usage: 'Subtítulos' },
    { name: 'H4', size: '1.5rem (24px)', weight: '500', usage: 'Títulos de card' },
    { name: 'Body', size: '1rem (16px)', weight: '400', usage: 'Texto padrão' },
    { name: 'Small', size: '0.875rem (14px)', weight: '400', usage: 'Texto secundário' },
    { name: 'XS', size: '0.75rem (12px)', weight: '400', usage: 'Metadados' },
  ],
  fonts: [
    { name: 'Sans', family: 'Inter, Noto Sans, system-ui', usage: 'Texto geral' },
    { name: 'Mono', family: 'Fira Code, JetBrains Mono', usage: 'Código, dados técnicos' },
  ],
};

// Spacing Data
const spacing = [
  { name: 'xs', value: '0.25rem (4px)' },
  { name: 'sm', value: '0.5rem (8px)' },
  { name: 'md', value: '1rem (16px)' },
  { name: 'lg', value: '1.5rem (24px)' },
  { name: 'xl', value: '2rem (32px)' },
  { name: '2xl', value: '3rem (48px)' },
  { name: '3xl', value: '4rem (64px)' },
];

// Border Radius Data
const borderRadius = [
  { name: 'sm', value: '0.25rem (4px)' },
  { name: 'md', value: '0.5rem (8px)' },
  { name: 'lg', value: '0.75rem (12px)' },
  { name: 'xl', value: '1rem (16px)' },
  { name: '2xl', value: '1.5rem (24px)' },
  { name: 'full', value: '9999px' },
];

// Color Swatch Component
function ColorSwatch({ name, value, description, variable }: { 
  name: string; 
  value: string; 
  description: string;
  variable: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${value} copiado!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-3 rounded-lg bg-bg-secondary/50 border border-border-default hover:border-border-hover transition-all cursor-pointer"
      onClick={copyToClipboard}
    >
      <div 
        className="w-12 h-12 rounded-lg border border-white/10"
        style={{ backgroundColor: value, boxShadow: `0 0 20px ${value}40` }}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{name}</span>
          <span className="text-xs font-mono text-text-tertiary">{value}</span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        <p className="text-xs font-mono text-text-tertiary mt-0.5">{variable}</p>
      </div>
      <div className="text-text-tertiary">
        {copied ? <Check className="w-4 h-4 text-accent-greenNeon" /> : <Copy className="w-4 h-4" />}
      </div>
    </motion.div>
  );
}

// Section Header Component
function SectionHeader({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <p className="text-text-secondary mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function DesignSystem() {
  const [activeTab, setActiveTab] = useState('colors');

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent-cyan" />
                  Design System
                </h1>
                <p className="text-sm text-text-secondary">TSiJUKEBOX v4.2.1</p>
              </div>
            </div>
            <LogoBrand size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <TabsList className="grid grid-cols-6 gap-2 bg-bg-secondary p-2 rounded-xl">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="icons" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Ícones
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Espaçamento
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Efeitos
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-8">
            <SectionHeader 
              icon={<Palette className="w-6 h-6" />}
              title="Paleta de Cores"
              description="Sistema de cores completo com backgrounds, accents, brands e estados"
            />

            {/* Backgrounds */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Backgrounds</CardTitle>
                <CardDescription>Cores de fundo para diferentes níveis de hierarquia</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colorPalette.backgrounds.map((color) => (
                  <ColorSwatch key={color.name} {...color} />
                ))}
              </CardContent>
            </Card>

            {/* Accent Colors */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Cores de Destaque (Accent)</CardTitle>
                <CardDescription>Cores vibrantes neon para elementos interativos e destaques</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {colorPalette.accents.map((color) => (
                  <ColorSwatch key={color.name} {...color} />
                ))}
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Cores de Marca (Brands)</CardTitle>
                <CardDescription>Cores oficiais das integrações de terceiros</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colorPalette.brands.map((color) => (
                  <ColorSwatch key={color.name} {...color} />
                ))}
              </CardContent>
            </Card>

            {/* State Colors */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Cores de Estado</CardTitle>
                <CardDescription>Cores semânticas para feedback visual</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {colorPalette.states.map((color) => (
                  <ColorSwatch key={color.name} {...color} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-8">
            <SectionHeader 
              icon={<Type className="w-6 h-6" />}
              title="Tipografia"
              description="Hierarquia tipográfica com 7 níveis e 2 famílias de fontes"
            />

            {/* Font Families */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Famílias de Fontes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {typography.fonts.map((font) => (
                  <div key={font.name} className="p-4 rounded-lg bg-bg-tertiary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">{font.name}</span>
                      <Badge variant="outline">{font.usage}</Badge>
                    </div>
                    <p 
                      className="text-2xl text-text-secondary"
                      style={{ fontFamily: font.family }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-xs font-mono text-text-tertiary mt-2">{font.family}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Font Sizes */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Hierarquia de Tamanhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typography.sizes.map((item) => (
                  <div key={item.name} className="flex items-center gap-4 p-3 rounded-lg bg-bg-tertiary">
                    <div className="w-16 text-center">
                      <span className="text-xs font-mono text-accent-cyan">{item.name}</span>
                    </div>
                    <div className="flex-1">
                      <p 
                        className="text-text-primary"
                        style={{ 
                          fontSize: item.size.split(' ')[0], 
                          fontWeight: parseInt(item.weight) 
                        }}
                      >
                        TSiJUKEBOX
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">{item.size}</p>
                      <p className="text-xs text-text-tertiary">Weight: {item.weight}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            <SectionHeader 
              icon={<Box className="w-6 h-6" />}
              title="Componentes"
              description="Biblioteca de componentes UI reutilizáveis"
            />

            {/* Buttons */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Botões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button disabled>Disabled</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-accent-cyan text-black">Cyan</Badge>
                <Badge className="bg-accent-greenNeon text-black">Success</Badge>
                <Badge className="bg-accent-yellowGold text-black">Warning</Badge>
              </CardContent>
            </Card>

            {/* Inputs */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <Input placeholder="Input padrão" />
                <Input placeholder="Input desabilitado" disabled />
                <div className="flex items-center gap-4">
                  <Switch />
                  <span className="text-text-secondary">Toggle Switch</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-8">
            <SectionHeader 
              icon={<Layers className="w-6 h-6" />}
              title="Ícones das Seções"
              description="8 ícones modernos com cores vibrantes neon para as seções da documentação"
            />

            {/* Grid Variant */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Variante Grid</CardTitle>
                <CardDescription>Layout em grade 4x2 para exibição compacta</CardDescription>
              </CardHeader>
              <CardContent>
                <SectionIconsShowcase variant="grid" />
              </CardContent>
            </Card>

            {/* List Variant */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Variante Lista</CardTitle>
                <CardDescription>Layout em lista com descrições detalhadas</CardDescription>
              </CardHeader>
              <CardContent>
                <SectionIconsShowcase variant="list" />
              </CardContent>
            </Card>

            {/* Color Reference */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Referência de Cores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sectionIcons.map((icon) => (
                    <div 
                      key={icon.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: icon.hex }}
                      />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{icon.name}</p>
                        <p className="text-xs font-mono text-text-tertiary">{icon.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-8">
            <SectionHeader 
              icon={<Grid3X3 className="w-6 h-6" />}
              title="Espaçamento"
              description="Sistema de espaçamento com 7 tokens e border radius"
            />

            {/* Spacing Scale */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Escala de Espaçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spacing.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-16 text-right">
                      <span className="text-sm font-mono text-accent-cyan">{item.name}</span>
                    </div>
                    <div 
                      className="h-8 bg-accent-cyan/30 rounded"
                      style={{ width: item.value.split(' ')[0] === '0.25rem' ? '16px' : 
                               item.value.split(' ')[0] === '0.5rem' ? '32px' :
                               item.value.split(' ')[0] === '1rem' ? '64px' :
                               item.value.split(' ')[0] === '1.5rem' ? '96px' :
                               item.value.split(' ')[0] === '2rem' ? '128px' :
                               item.value.split(' ')[0] === '3rem' ? '192px' : '256px'
                      }}
                    />
                    <span className="text-sm text-text-secondary">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Border Radius */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Border Radius</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6">
                {borderRadius.map((item) => (
                  <div key={item.name} className="text-center">
                    <div 
                      className="w-16 h-16 bg-accent-cyan/30 border-2 border-accent-cyan mb-2"
                      style={{ 
                        borderRadius: item.value.split(' ')[0]
                      }}
                    />
                    <p className="text-sm font-mono text-accent-cyan">{item.name}</p>
                    <p className="text-xs text-text-tertiary">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-8">
            <SectionHeader 
              icon={<Sparkles className="w-6 h-6" />}
              title="Efeitos Visuais"
              description="Sombras, glows e animações do Design System"
            />

            {/* Glow Effects */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Efeitos de Glow</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Cyan', color: '#00d4ff' },
                  { name: 'Green', color: '#00ff88' },
                  { name: 'Magenta', color: '#ff00d4' },
                  { name: 'Yellow', color: '#ffd400' },
                ].map((glow) => (
                  <div key={glow.name} className="text-center">
                    <div 
                      className="w-20 h-20 mx-auto rounded-xl bg-bg-tertiary border border-white/10"
                      style={{ boxShadow: `0 0 30px ${glow.color}60` }}
                    />
                    <p className="text-sm font-medium text-text-primary mt-3">{glow.name}</p>
                    <p className="text-xs font-mono text-text-tertiary">{glow.color}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shadows */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Sombras</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-6">
                {[
                  { name: 'Small', shadow: '0 2px 4px rgba(0, 0, 0, 0.3)' },
                  { name: 'Medium', shadow: '0 4px 8px rgba(0, 0, 0, 0.4)' },
                  { name: 'Large', shadow: '0 8px 16px rgba(0, 0, 0, 0.5)' },
                ].map((item) => (
                  <div key={item.name} className="text-center">
                    <div 
                      className="w-24 h-24 mx-auto rounded-xl bg-bg-tertiary"
                      style={{ boxShadow: item.shadow }}
                    />
                    <p className="text-sm font-medium text-text-primary mt-3">{item.name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Animations */}
            <Card className="bg-bg-secondary border-border-default">
              <CardHeader>
                <CardTitle className="text-lg">Animações</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-6">
                <motion.div 
                  className="w-20 h-20 mx-auto rounded-xl bg-accent-cyan/30 border border-accent-cyan"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="w-20 h-20 mx-auto rounded-xl bg-accent-magenta/30 border border-accent-magenta"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="w-20 h-20 mx-auto rounded-xl bg-accent-greenNeon/30 border border-accent-greenNeon"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-default py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-text-secondary">
            TSiJUKEBOX Design System v4.2.1
          </p>
          <p className="text-xs text-text-tertiary mt-2">
            Desenvolvido por B0.y_Z4kr14 • TSI Telecom
          </p>
        </div>
      </footer>
    </div>
  );
}
