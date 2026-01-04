// Pages Settings Extended templates (4 files)

export function generatePagesSettingsExtendedContent(path: string): string | null {
  switch (path) {
    case 'src/pages/settings/index.ts':
      return `// Settings pages barrel export
export { default as Settings } from './Settings';
export { default as SpicetifyThemeGallery } from './SpicetifyThemeGallery';
export { default as SystemDiagnostics } from './SystemDiagnostics';
export { default as ThemePreview } from './ThemePreview';
`;

    case 'src/pages/settings/SpicetifyThemeGallery.tsx':
      return `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Star, Eye, Palette } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Theme {
  id: string;
  name: string;
  author: string;
  description: string;
  preview: string;
  downloads: number;
  rating: number;
  tags: string[];
}

const MOCK_THEMES: Theme[] = [
  {
    id: '1',
    name: 'Catppuccin',
    author: 'catppuccin',
    description: 'Soothing pastel theme for Spotify',
    preview: '',
    downloads: 15420,
    rating: 4.8,
    tags: ['pastel', 'dark', 'minimal'],
  },
  {
    id: '2',
    name: 'Dribbblish',
    author: 'morpheusthewhite',
    description: 'A Dribbble-inspired theme with animations',
    preview: '',
    downloads: 28340,
    rating: 4.9,
    tags: ['modern', 'animated', 'colorful'],
  },
];

export default function SpicetifyThemeGallery() {
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const filteredThemes = MOCK_THEMES.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) ||
           t.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleInstall = (theme: Theme) => {
    toast.success(\`Tema \${theme.name} instalado!\`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Galeria de Temas Spicetify
          </h1>
          <p className="text-muted-foreground">Personalize sua experiência Spotify</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar temas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
          <TabsTrigger value="new">Novos</TabsTrigger>
          <TabsTrigger value="installed">Instalados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => (
              <Card key={theme.id} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{theme.name}</CardTitle>
                  <CardDescription>por {theme.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{theme.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {theme.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {theme.downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {theme.rating}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleInstall(theme)}>
                      <Download className="h-4 w-4 mr-1" />
                      Instalar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;

    case 'src/pages/settings/SystemDiagnostics.tsx':
      return `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  value?: number;
}

export default function SystemDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const diagnostics: DiagnosticResult[] = [
      { name: 'Conexão com Internet', status: 'ok', message: 'Conectado - 45ms latência' },
      { name: 'Servidor de API', status: 'ok', message: 'Respondendo normalmente' },
      { name: 'Banco de Dados', status: 'ok', message: 'Conexão estável' },
      { name: 'Memória', status: 'warning', message: '78% em uso', value: 78 },
      { name: 'CPU', status: 'ok', message: '23% em uso', value: 23 },
      { name: 'Armazenamento', status: 'ok', message: '45% em uso', value: 45 },
    ];

    for (let i = 0; i < diagnostics.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setResults((prev) => [...prev, diagnostics[i]]);
      setProgress(((i + 1) / diagnostics.length) * 100);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Diagnósticos do Sistema
          </h1>
          <p className="text-muted-foreground">Verifique a saúde do sistema</p>
        </div>
        <Button onClick={runDiagnostics} disabled={isRunning}>
          <RefreshCw className={\`h-4 w-4 mr-2 \${isRunning ? 'animate-spin' : ''}\`} />
          {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4 py-4">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <p className="font-medium">{result.name}</p>
                <p className="text-sm text-muted-foreground">{result.message}</p>
              </div>
              {result.value !== undefined && (
                <Badge variant={result.status === 'ok' ? 'secondary' : 'destructive'}>
                  {result.value}%
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length > 0 && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{results.filter((r) => r.status === 'ok').length} OK</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>{results.filter((r) => r.status === 'warning').length} Avisos</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>{results.filter((r) => r.status === 'error').length} Erros</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
`;

    case 'src/pages/settings/ThemePreview.tsx':
      return `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Save,
  RotateCcw,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

export default function ThemePreview() {
  const [primaryHue, setPrimaryHue] = useState(250);
  const [saturation, setSaturation] = useState(80);
  const [borderRadius, setBorderRadius] = useState(8);
  const [isDark, setIsDark] = useState(true);

  const handleCopyCSS = () => {
    const css = \`:root {
  --primary: \${primaryHue} \${saturation}% 50%;
  --radius: \${borderRadius}px;
}\`;
    navigator.clipboard.writeText(css);
    toast.success('CSS copiado!');
  };

  const handleReset = () => {
    setPrimaryHue(250);
    setSaturation(80);
    setBorderRadius(8);
    toast.info('Tema resetado');
  };

  const handleSave = () => {
    toast.success('Tema salvo!');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Preview de Tema
          </h1>
          <p className="text-muted-foreground">Customize as cores e estilos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button variant="outline" onClick={handleCopyCSS}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar CSS
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Modo</Label>
              <div className="flex gap-2">
                <Button 
                  variant={!isDark ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setIsDark(false)}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Claro
                </Button>
                <Button 
                  variant={isDark ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setIsDark(true)}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Escuro
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Cor Primária (Hue)</Label>
                <span className="text-sm text-muted-foreground">{primaryHue}°</span>
              </div>
              <Slider
                value={[primaryHue]}
                min={0}
                max={360}
                step={1}
                onValueChange={([v]) => setPrimaryHue(v)}
              />
              <div 
                className="h-8 rounded-md"
                style={{ backgroundColor: \`hsl(\${primaryHue}, \${saturation}%, 50%)\` }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Saturação</Label>
                <span className="text-sm text-muted-foreground">{saturation}%</span>
              </div>
              <Slider
                value={[saturation]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => setSaturation(v)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">{borderRadius}px</span>
              </div>
              <Slider
                value={[borderRadius]}
                min={0}
                max={24}
                step={1}
                onValueChange={([v]) => setBorderRadius(v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Botões</Label>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  style={{ 
                    backgroundColor: \`hsl(\${primaryHue}, \${saturation}%, 50%)\`,
                    borderRadius: \`\${borderRadius}px\`
                  }}
                >
                  Primary
                </Button>
                <Button variant="secondary" style={{ borderRadius: \`\${borderRadius}px\` }}>
                  Secondary
                </Button>
                <Button variant="outline" style={{ borderRadius: \`\${borderRadius}px\` }}>
                  Outline
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Badges</Label>
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  style={{ 
                    backgroundColor: \`hsl(\${primaryHue}, \${saturation}%, 50%)\`,
                    borderRadius: \`\${borderRadius}px\`
                  }}
                >
                  Badge
                </Badge>
                <Badge variant="secondary" style={{ borderRadius: \`\${borderRadius}px\` }}>
                  Secondary
                </Badge>
                <Badge variant="outline" style={{ borderRadius: \`\${borderRadius}px\` }}>
                  Outline
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Input</Label>
              <Input 
                placeholder="Digite algo..." 
                style={{ borderRadius: \`\${borderRadius}px\` }}
              />
            </div>

            <div 
              className="p-4 border"
              style={{ borderRadius: \`\${borderRadius}px\` }}
            >
              <p className="text-sm">Card com border radius customizado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

    default:
      return null;
  }
}
