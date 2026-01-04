// Components Specialized templates (6 files)

export function generateComponentsSpecializedContent(path: string): string | null {
  switch (path) {
    case 'src/components/dev/index.ts':
      return `// Dev components barrel export
export { DevFileChangeMonitor } from './DevFileChangeMonitor';
`;

    case 'src/components/dev/DevFileChangeMonitor.tsx':
      return `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock, RefreshCw } from 'lucide-react';

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  timestamp: string;
}

export function DevFileChangeMonitor() {
  const [changes, setChanges] = useState<FileChange[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const getTypeBadge = (type: FileChange['type']) => {
    const variants = {
      added: 'bg-green-500',
      modified: 'bg-yellow-500',
      deleted: 'bg-red-500',
    };
    return (
      <Badge className={variants[type]}>
        {type === 'added' ? 'Novo' : type === 'modified' ? 'Modificado' : 'Removido'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Monitor de Alterações
        </CardTitle>
        <Badge variant={isMonitoring ? 'default' : 'secondary'}>
          {isMonitoring ? 'Monitorando' : 'Pausado'}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {changes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <RefreshCw className="h-8 w-8 mb-2" />
              <p>Nenhuma alteração detectada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {changes.map((change, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  {getTypeBadge(change.type)}
                  <span className="flex-1 font-mono text-sm truncate">{change.path}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(change.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/audit/AuditLogViewer.tsx':
      return `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  category: string;
  severity: 'info' | 'warning' | 'error';
  actor: string;
  timestamp: string;
  details?: string;
}

interface AuditLogViewerProps {
  logs?: AuditLog[];
  onExport?: () => void;
}

const SEVERITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function AuditLogViewer({ logs = [], onExport }: AuditLogViewerProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.actor.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logs de Auditoria</CardTitle>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[400px]">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const Icon = SEVERITY_ICONS[log.severity];
                return (
                  <div key={log.id} className="p-3 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Icon className={\`h-5 w-5 mt-0.5 \${
                        log.severity === 'error' ? 'text-destructive' :
                        log.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                      }\`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.action}</span>
                          <Badge variant="outline">{log.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          por {log.actor} • {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </p>
                        {log.details && (
                          <p className="text-sm mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/weather/AnimatedWeatherIcon.tsx':
      return `import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind,
  CloudFog,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WeatherCondition = 
  | 'sunny' 
  | 'cloudy' 
  | 'rainy' 
  | 'snowy' 
  | 'stormy' 
  | 'windy' 
  | 'foggy'
  | 'clear-night';

interface AnimatedWeatherIconProps {
  condition: WeatherCondition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ICON_MAP = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  stormy: CloudLightning,
  windy: Wind,
  foggy: CloudFog,
  'clear-night': Moon,
};

const SIZE_MAP = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

const ANIMATION_MAP: Record<WeatherCondition, string> = {
  sunny: 'animate-pulse text-yellow-500',
  cloudy: 'text-gray-400',
  rainy: 'text-blue-400',
  snowy: 'text-blue-200',
  stormy: 'animate-pulse text-yellow-400',
  windy: 'text-gray-500',
  foggy: 'text-gray-400 opacity-70',
  'clear-night': 'text-indigo-300',
};

export function AnimatedWeatherIcon({ 
  condition, 
  size = 'md',
  className 
}: AnimatedWeatherIconProps) {
  const Icon = ICON_MAP[condition];
  
  return (
    <div className={cn('relative', className)}>
      <Icon 
        className={cn(
          SIZE_MAP[size],
          ANIMATION_MAP[condition],
          'transition-all duration-300'
        )} 
      />
      {condition === 'sunny' && (
        <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
      )}
    </div>
  );
}
`;

    case 'src/components/spicetify/ThemePreviewCard.tsx':
      return `import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Star, Eye, Check } from 'lucide-react';

interface ThemePreviewCardProps {
  name: string;
  author: string;
  description?: string;
  previewUrl?: string;
  downloads: number;
  rating: number;
  tags?: string[];
  isInstalled?: boolean;
  onInstall?: () => void;
  onPreview?: () => void;
}

export function ThemePreviewCard({
  name,
  author,
  description,
  previewUrl,
  downloads,
  rating,
  tags = [],
  isInstalled = false,
  onInstall,
  onPreview,
}: ThemePreviewCardProps) {
  return (
    <Card className="overflow-hidden group">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
        {previewUrl && (
          <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {onPreview && (
            <Button variant="secondary" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
        {isInstalled && (
          <Badge className="absolute top-2 right-2 bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Instalado
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">por {author}</p>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {downloads.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            {rating.toFixed(1)}
          </span>
        </div>
        
        {onInstall && !isInstalled && (
          <Button className="w-full" onClick={onInstall}>
            <Download className="h-4 w-4 mr-2" />
            Instalar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/docs/CodePlayground.tsx':
      return `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Copy, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: 'javascript' | 'typescript' | 'html' | 'css';
  title?: string;
  readOnly?: boolean;
}

export function CodePlayground({
  initialCode = '// Digite seu código aqui',
  language = 'javascript',
  title = 'Playground',
  readOnly = false,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleRun = () => {
    try {
      // Simula execução
      setOutput('> Código executado com sucesso!');
    } catch (error) {
      setOutput(\`Erro: \${error}\`);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleRun}>
            <Play className="h-4 w-4 mr-2" />
            Executar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="code">
          <TabsList className="mb-2">
            <TabsTrigger value="code">Código</TabsTrigger>
            <TabsTrigger value="output">Saída</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              readOnly={readOnly}
              className="w-full h-[300px] p-4 font-mono text-sm bg-muted rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              spellCheck={false}
            />
          </TabsContent>
          
          <TabsContent value="output">
            <div className="w-full h-[300px] p-4 font-mono text-sm bg-muted rounded-lg overflow-auto">
              <pre>{output || 'Clique em "Executar" para ver a saída'}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
`;

    default:
      return null;
  }
}
