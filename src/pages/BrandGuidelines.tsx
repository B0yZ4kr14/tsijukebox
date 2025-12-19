import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Palette, Type, Shield, Download, Info, Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { LogoDownload } from '@/components/ui/LogoDownload';
import { BrandText, BrandTextWeight } from '@/components/ui/BrandText';
import { BrandTagline, TaglineVariant, BrandWithTagline, BrandAnimationType } from '@/components/ui/BrandTagline';
import { BrandLogo, LogoAnimationType } from '@/components/ui/BrandLogo';

// Color data for the palette
const neonColors = [
  { name: 'Cyan Neon', hsl: '195 100% 50%', hex: '#00BFFF', cssVar: '--kiosk-accent', tailwind: 'cyan-500', category: 'accent' },
  { name: 'Gold Neon', hsl: '45 100% 65%', hex: '#FFD700', cssVar: '--gold-neon', tailwind: 'yellow-400', category: 'accent' },
  { name: 'Blue Neon', hsl: '210 100% 70%', hex: '#66B3FF', cssVar: '--blue-neon', tailwind: 'blue-400', category: 'accent' },
  { name: 'Green Spotify', hsl: '141 70% 45%', hex: '#1DB954', cssVar: '--spotify-green', tailwind: 'green-500', category: 'brand' },
  { name: 'Red Alert', hsl: '0 100% 50%', hex: '#FF0000', cssVar: '--destructive', tailwind: 'red-500', category: 'status' },
  { name: 'Amber Warning', hsl: '38 100% 60%', hex: '#FFB347', cssVar: '--amber-warning', tailwind: 'amber-400', category: 'status' },
];

const baseColors = [
  { name: 'Background', hsl: '240 10% 10%', hex: '#19191F', cssVar: '--kiosk-bg', tailwind: 'kiosk-bg', usage: 'Fundo principal' },
  { name: 'Surface', hsl: '240 10% 15%', hex: '#242430', cssVar: '--kiosk-surface', tailwind: 'kiosk-surface', usage: 'Cards e painéis' },
  { name: 'Text', hsl: '0 0% 96%', hex: '#F5F5F5', cssVar: '--kiosk-text', tailwind: 'kiosk-text', usage: 'Texto principal' },
  { name: 'Border', hsl: '240 10% 25%', hex: '#3A3A48', cssVar: '--kiosk-border', tailwind: 'kiosk-border', usage: 'Bordas padrão' },
  { name: 'Primary', hsl: '330 100% 65%', hex: '#FF66B2', cssVar: '--kiosk-primary', tailwind: 'kiosk-primary', usage: 'Cor primária (rosa)' },
];

const typographyClasses = [
  { class: 'text-gold-neon', description: 'Títulos de página principais', demo: 'Dashboard' },
  { class: 'text-title-white-neon', description: 'Títulos de track/destaque máximo', demo: 'Now Playing' },
  { class: 'text-artist-neon-blue', description: 'Nomes de artistas', demo: 'Artist Name' },
  { class: 'text-label-yellow', description: 'Labels obrigatórios', demo: 'Campo Obrigatório' },
  { class: 'text-label-neon', description: 'Labels de status', demo: 'Online' },
  { class: 'text-neon-action-label', description: 'Labels de ações', demo: 'PLAY' },
];

function ColorSwatch({ color, showCopy = true }: { color: typeof neonColors[0] | typeof baseColors[0]; showCopy?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="bg-kiosk-surface/50 border-kiosk-border/30 overflow-hidden">
      <div 
        className="h-20 w-full" 
        style={{ backgroundColor: `hsl(${color.hsl})` }}
      />
      <CardContent className="p-3 space-y-2">
        <h4 className="font-semibold text-kiosk-text">{color.name}</h4>
        {'usage' in color && (
          <p className="text-xs text-kiosk-text/60">{color.usage}</p>
        )}
        
        {showCopy && (
          <div className="space-y-1.5">
            <button
              onClick={() => copyToClipboard(`hsl(${color.hsl})`, 'HSL')}
              className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-kiosk-bg/50 hover:bg-kiosk-bg/80 transition-colors"
            >
              <span className="text-kiosk-text/70">HSL</span>
              <span className="font-mono text-kiosk-text/90">{color.hsl}</span>
              {copied === 'HSL' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-kiosk-text/50" />}
            </button>
            
            <button
              onClick={() => copyToClipboard(color.hex, 'HEX')}
              className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-kiosk-bg/50 hover:bg-kiosk-bg/80 transition-colors"
            >
              <span className="text-kiosk-text/70">HEX</span>
              <span className="font-mono text-kiosk-text/90">{color.hex}</span>
              {copied === 'HEX' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-kiosk-text/50" />}
            </button>
            
            <button
              onClick={() => copyToClipboard(`var(${color.cssVar})`, 'CSS')}
              className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-kiosk-bg/50 hover:bg-kiosk-bg/80 transition-colors"
            >
              <span className="text-kiosk-text/70">CSS</span>
              <span className="font-mono text-kiosk-text/90 truncate">{color.cssVar}</span>
              {copied === 'CSS' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-kiosk-text/50" />}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to download files
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BrandGuidelines() {
  const exportAsJSON = () => {
    const palette = {
      version: '4.0',
      name: 'TSiJUKEBOX Design System',
      neon: neonColors.reduce((acc, c) => ({ 
        ...acc, 
        [c.name.toLowerCase().replace(/\s+/g, '_')]: { 
          hsl: c.hsl, 
          hex: c.hex, 
          cssVar: c.cssVar,
          tailwind: c.tailwind 
        }
      }), {}),
      base: baseColors.reduce((acc, c) => ({ 
        ...acc, 
        [c.name.toLowerCase().replace(/\s+/g, '_')]: { 
          hsl: c.hsl, 
          hex: c.hex, 
          cssVar: c.cssVar,
          tailwind: c.tailwind,
          usage: c.usage 
        }
      }), {})
    };
    downloadFile(JSON.stringify(palette, null, 2), 'tsijukebox-palette.json', 'application/json');
    toast.success('Paleta JSON exportada!');
  };

  const exportAsCSS = () => {
    const cssContent = `/* TSiJUKEBOX Design System v4.0 */
/* Generated: ${new Date().toISOString()} */

:root {
  /* Neon Colors */
${neonColors.map(c => `  ${c.cssVar}: ${c.hsl};`).join('\n')}

  /* Base Colors */
${baseColors.map(c => `  ${c.cssVar}: ${c.hsl};`).join('\n')}
}
`;
    downloadFile(cssContent, 'tsijukebox-palette.css', 'text/css');
    toast.success('Paleta CSS exportada!');
  };

  return (
    <div className="min-h-screen bg-kiosk-bg">
      {/* Header */}
      <header className="border-b border-kiosk-border/30 bg-kiosk-surface/30 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/help">
              <ArrowLeft className="w-5 h-5 icon-neon-blue" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gold-neon">Brand Guidelines</h1>
            <p className="text-sm text-kiosk-text/60">TSiJUKEBOX Design System v4.0</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section with Logo */}
        <section className="text-center py-12">
          <LogoBrand size="xl" variant="metal" centered animate showTagline />
          <p className="mt-6 text-kiosk-text/70 max-w-2xl mx-auto">
            Este guia define as diretrizes visuais do TSiJUKEBOX, incluindo cores, tipografia, 
            uso correto da logo e componentes do design system.
          </p>
        </section>

        <Separator className="bg-kiosk-border/30" />

        {/* Tabs Navigation */}
        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 bg-kiosk-surface/50">
            <TabsTrigger value="colors" className="data-[state=active]:bg-kiosk-primary/20">
              <Palette className="w-4 h-4 mr-2" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="typography" className="data-[state=active]:bg-kiosk-primary/20">
              <Type className="w-4 h-4 mr-2" />
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="animations" className="data-[state=active]:bg-kiosk-primary/20">
              <Play className="w-4 h-4 mr-2" />
              Animações
            </TabsTrigger>
            <TabsTrigger value="logo-usage" className="data-[state=active]:bg-kiosk-primary/20">
              <Shield className="w-4 h-4 mr-2" />
              Uso da Logo
            </TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-kiosk-primary/20">
              <Download className="w-4 h-4 mr-2" />
              Downloads
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-8">
            {/* Neon Colors */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Palette className="w-5 h-5 icon-neon-blue" />
                  Paleta Neon
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Cores vibrantes para acentos, ícones e elementos interativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {neonColors.map((color) => (
                    <ColorSwatch key={color.name} color={color} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Base Colors */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Palette className="w-5 h-5 icon-neon-blue" />
                  Cores Base (Dark Theme)
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Cores fundamentais do tema escuro do TSiJUKEBOX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {baseColors.map((color) => (
                    <ColorSwatch key={color.name} color={color} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-8">
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Type className="w-5 h-5 icon-neon-blue" />
                  Classes de Texto
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Classes CSS para tipografia com efeitos neon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {typographyClasses.map((item) => (
                  <div 
                    key={item.class} 
                    className="flex items-center justify-between p-4 rounded-lg bg-kiosk-bg/50 border border-kiosk-border/20"
                  >
                    <div className="space-y-1">
                      <code className="text-sm font-mono text-cyan-400">.{item.class}</code>
                      <p className="text-xs text-kiosk-text/60">{item.description}</p>
                    </div>
                    <div className={`text-xl ${item.class}`}>
                      {item.demo}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Font Weights */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon">Pesos de Fonte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-kiosk-bg/30 rounded">
                  <span className="text-kiosk-text/70">Regular (400)</span>
                  <span className="font-normal text-kiosk-text text-lg">TSiJUKEBOX</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-kiosk-bg/30 rounded">
                  <span className="text-kiosk-text/70">Medium (500)</span>
                  <span className="font-medium text-kiosk-text text-lg">TSiJUKEBOX</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-kiosk-bg/30 rounded">
                  <span className="text-kiosk-text/70">Semibold (600)</span>
                  <span className="font-semibold text-kiosk-text text-lg">TSiJUKEBOX</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-kiosk-bg/30 rounded">
                  <span className="text-kiosk-text/70">Bold (700)</span>
                  <span className="font-bold text-kiosk-text text-lg">TSiJUKEBOX</span>
                </div>
              </CardContent>
            </Card>

            {/* BrandText Component */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Type className="w-5 h-5 icon-neon-blue" />
                  Componente BrandText
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Componente React para renderizar "TSiJUKEBOX" com cores da logo e shimmer metálico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tamanhos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Tamanhos Disponíveis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <div key={size} className="p-4 bg-kiosk-bg/50 rounded-lg text-center">
                        <BrandText size={size} />
                        <Badge variant="outline" className="mt-2 text-xs">{size}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Exemplos em Contexto */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Exemplos em Contexto</h4>
                  
                  {/* Em título */}
                  <div className="p-4 bg-kiosk-bg/50 rounded-lg">
                    <h2 className="text-xl font-bold text-kiosk-text">
                      Bem-vindo ao <BrandText size="lg" />
                    </h2>
                    <code className="text-xs text-cyan-400 mt-2 block">
                      {`<h2>Bem-vindo ao <BrandText size="lg" /></h2>`}
                    </code>
                  </div>
                  
                  {/* Em parágrafo */}
                  <div className="p-4 bg-kiosk-bg/50 rounded-lg">
                    <p className="text-kiosk-text/80">
                      O <BrandText /> é um sistema de jukebox inteligente 
                      para ambientes comerciais.
                    </p>
                    <code className="text-xs text-cyan-400 mt-2 block">
                      {`<p>O <BrandText /> é um sistema...</p>`}
                    </code>
                  </div>
                  
                  {/* Em card header */}
                  <div className="p-4 bg-kiosk-surface rounded-lg border border-kiosk-border/30">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 icon-neon-blue" />
                      <span className="font-semibold"><BrandText size="md" /></span>
                    </div>
                    <p className="text-sm text-kiosk-text/60 mt-1">Player de música</p>
                    <code className="text-xs text-cyan-400 mt-2 block">
                      {`<CardTitle><BrandText size="md" /></CardTitle>`}
                    </code>
                  </div>
                </div>
                
                {/* Dark/Light Mode Demo */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Suporte a Temas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 rounded-lg text-center">
                      <p className="text-xs text-slate-400 mb-2">Dark Mode</p>
                      <BrandText size="lg" />
                    </div>
                    <div className="p-4 bg-slate-100 rounded-lg text-center">
                      <p className="text-xs text-slate-600 mb-2">Light Mode</p>
                      <span className="inline text-lg">
                        <span className="text-brand-tsi">TSi</span>
                        <span className="text-brand-jukebox">JUKEBOX</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Uso do Código */}
                <div className="p-4 bg-kiosk-bg/80 rounded-lg font-mono text-sm space-y-2">
                  <p className="text-cyan-400">{`import { BrandText } from '@/components/ui/BrandText';`}</p>
                  <Separator className="bg-kiosk-border/30 my-3" />
                  <p className="text-kiosk-text/70">{`// Uso básico`}</p>
                  <p className="text-green-400">{`<BrandText />`}</p>
                  <p className="text-kiosk-text/70 mt-2">{`// Com tamanho`}</p>
                  <p className="text-green-400">{`<BrandText size="xl" />`}</p>
                  <p className="text-kiosk-text/70 mt-2">{`// Com peso`}</p>
                  <p className="text-green-400">{`<BrandText weight="semibold" />`}</p>
                  <p className="text-kiosk-text/70 mt-2">{`// Sem shimmer (acessibilidade)`}</p>
                  <p className="text-green-400">{`<BrandText noShimmer />`}</p>
                </div>
              </CardContent>
            </Card>

            {/* BrandTagline Component */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Type className="w-5 h-5 icon-neon-blue" />
                  Componente BrandTagline
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Tagline estilizada para uso junto com BrandText em headers e footers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variantes de Tagline */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Variantes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(['default', 'subtle', 'accent', 'neon', 'gradient'] as TaglineVariant[]).map((variant) => (
                      <div key={variant} className="p-3 bg-kiosk-bg/50 rounded-lg text-center">
                        <BrandTagline variant={variant} size="xs" />
                        <Badge variant="outline" className="mt-2 text-xs">{variant}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Uso em Headers */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Uso em Headers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-kiosk-bg/50 rounded-lg text-center">
                      <BrandText size="xl" />
                      <BrandTagline variant="subtle" size="sm" className="mt-1" />
                    </div>
                    <div className="p-6 bg-kiosk-bg/50 rounded-lg text-center">
                      <BrandText size="md" weight="semibold" />
                      <BrandTagline variant="accent" size="xs" className="mt-1" />
                    </div>
                  </div>
                </div>
                
                {/* Pesos do BrandText */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Variantes de Peso (BrandText)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(['light', 'normal', 'semibold', 'bold', 'extrabold'] as BrandTextWeight[]).map((weight) => (
                      <div key={weight} className="p-4 bg-kiosk-bg/50 rounded-lg text-center">
                        <BrandText size="lg" weight={weight} />
                        <Badge variant="outline" className="mt-2 text-xs">{weight}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uso do Código */}
                <div className="p-4 bg-kiosk-bg/80 rounded-lg font-mono text-sm space-y-2">
                  <p className="text-cyan-400">{`import { BrandTagline, BrandWithTagline } from '@/components/ui/BrandTagline';`}</p>
                  <Separator className="bg-kiosk-border/30 my-3" />
                  <p className="text-kiosk-text/70">{`// Tagline standalone`}</p>
                  <p className="text-green-400">{`<BrandTagline variant="neon" />`}</p>
                  <p className="text-kiosk-text/70 mt-2">{`// Combo BrandText + Tagline`}</p>
                  <p className="text-green-400">{`<BrandWithTagline brandSize="xl" taglineVariant="subtle" />`}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-8">
            {/* BrandLogo Animations */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Play className="w-5 h-5 icon-neon-blue" />
                  Animações do BrandLogo
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Animações de entrada para splash screens e loading states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Animation Types Demo */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Tipos de Animação</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {(['fade', 'slide-up', 'scale', 'cascade', 'splash'] as LogoAnimationType[]).map((anim) => (
                      <div key={anim} className="p-6 bg-kiosk-bg/50 rounded-lg text-center min-h-[140px] flex flex-col items-center justify-center">
                        <BrandLogo 
                          key={`${anim}-${Date.now()}`}
                          size="sm" 
                          variant="metal" 
                          animate={anim}
                          taglineVariant="subtle"
                        />
                        <Badge variant="outline" className="mt-4 text-xs">{anim}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Splash Screen Example */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-kiosk-text/70">Exemplo: Splash Screen</h4>
                  <div className="p-12 bg-gradient-to-b from-kiosk-bg to-kiosk-surface rounded-lg flex items-center justify-center">
                    <BrandLogo 
                      key={`splash-demo-${Date.now()}`}
                      size="xl" 
                      variant="metal" 
                      animate="splash"
                      taglineVariant="neon"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BrandWithTagline Animations */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Type className="w-5 h-5 icon-neon-blue" />
                  Animações do BrandWithTagline
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Versão texto com animações para headers e loading states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {(['fade', 'slide-up', 'slide-down', 'scale', 'cascade'] as BrandAnimationType[]).map((anim) => (
                    <div key={anim} className="p-6 bg-kiosk-bg/50 rounded-lg text-center min-h-[100px] flex flex-col items-center justify-center">
                      <BrandWithTagline 
                        key={`text-${anim}-${Date.now()}`}
                        brandSize="lg"
                        brandWeight="bold"
                        animate={anim}
                        taglineVariant="subtle"
                      />
                      <Badge variant="outline" className="mt-3 text-xs">{anim}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon">Exemplos de Código</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-kiosk-bg/80 rounded-lg font-mono text-sm space-y-2">
                  <p className="text-cyan-400">{`import { BrandLogo, BrandWithTagline } from '@/components/ui';`}</p>
                  <Separator className="bg-kiosk-border/30 my-3" />
                  <p className="text-kiosk-text/70">{`// Splash Screen com animação elegante`}</p>
                  <p className="text-green-400">{`<BrandLogo size="xl" variant="metal" animate="splash" />`}</p>
                  <p className="text-kiosk-text/70 mt-2">{`// Loading State com slide-up`}</p>
                  <p className="text-green-400">{`<BrandWithTagline animate="slide-up" taglineVariant="neon" />`}</p>
                  <p className="text-kiosk-text/70 mt-2">{`// Header com cascade`}</p>
                  <p className="text-green-400">{`<BrandLogo animate="cascade" animationDelay={0.2} />`}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logo Usage Tab */}
          <TabsContent value="logo-usage" className="space-y-8">
            {/* Logo Variations */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Shield className="w-5 h-5 icon-neon-blue" />
                  Variações da Logo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {(['default', 'metal', 'silver', 'mirror'] as const).map((variant) => (
                    <div key={variant} className="text-center space-y-3">
                      <div className="p-4 bg-kiosk-bg/50 rounded-lg">
                        <LogoBrand size="sm" variant={variant} centered />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {variant}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Rules */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Do's */}
              <Card className="bg-kiosk-surface/30 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Uso Correto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-kiosk-text/80 text-sm">Usar sobre fundos escuros (#1a1a2e ou similar)</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-kiosk-text/80 text-sm">Manter proporções originais (aspect ratio)</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-kiosk-text/80 text-sm">Área livre mínima: 20px ao redor da logo</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-kiosk-text/80 text-sm">Tamanho mínimo: 40px de altura</span>
                  </div>
                </CardContent>
              </Card>

              {/* Don'ts */}
              <Card className="bg-kiosk-surface/30 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Uso Incorreto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span className="text-kiosk-text/80 text-sm">Não usar sobre fundos brancos ou claros</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span className="text-kiosk-text/80 text-sm">Não distorcer ou esticar a logo</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span className="text-kiosk-text/80 text-sm">Não rotacionar ou inclinar</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-kiosk-bg/30 rounded">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span className="text-kiosk-text/80 text-sm">Não alterar as cores da paleta neon</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Minimum Sizes */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon">Tamanhos Recomendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-8 justify-center py-4">
                  <div className="text-center">
                    <LogoBrand size="sm" centered />
                    <p className="mt-2 text-xs text-kiosk-text/60">Small (SM)</p>
                  </div>
                  <div className="text-center">
                    <LogoBrand size="md" centered />
                    <p className="mt-2 text-xs text-kiosk-text/60">Medium (MD)</p>
                  </div>
                  <div className="text-center">
                    <LogoBrand size="lg" centered />
                    <p className="mt-2 text-xs text-kiosk-text/60">Large (LG)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-8">
            <LogoDownload />
            
            {/* Export Palette */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Palette className="w-5 h-5 icon-neon-blue" />
                  Exportar Paleta de Cores
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Baixe a paleta completa para usar em seus projetos
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-auto py-4"
                  onClick={exportAsJSON}
                >
                  <Download className="w-5 h-5 icon-neon-blue" />
                  <div className="text-left">
                    <div className="font-semibold">Download JSON</div>
                    <div className="text-xs text-kiosk-text/60">Formato estruturado para desenvolvimento</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-auto py-4"
                  onClick={exportAsCSS}
                >
                  <Download className="w-5 h-5 icon-neon-blue" />
                  <div className="text-left">
                    <div className="font-semibold">Download CSS</div>
                    <div className="text-xs text-kiosk-text/60">Variáveis CSS prontas para usar</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
            
            {/* Additional Resources */}
            <Card className="bg-kiosk-surface/30 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-gold-neon">Recursos Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/help">
                    <Info className="w-4 h-4 icon-neon-blue" />
                    Central de Ajuda
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/wiki">
                    <Type className="w-4 h-4 icon-neon-blue" />
                    Documentação Wiki
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
