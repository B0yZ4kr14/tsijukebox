// Settings Components templates - 17 templates for settings-related components
// Supports AccessibilitySection, AIConfigSection, VoiceControlSection, etc.

export function generateSettingsComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/settings/index.ts':
      return `// Settings components barrel export
export { AccessibilitySection } from './AccessibilitySection';
export { AIConfigSection } from './AIConfigSection';
export { AddCustomCommandModal } from './AddCustomCommandModal';
export { BackendConnectionSection } from './BackendConnectionSection';
export { CloudConnectionSection } from './CloudConnectionSection';
export { DatabaseSection } from './DatabaseSection';
export { LanguageSection } from './LanguageSection';
export { LocalMusicSection } from './LocalMusicSection';
export { MusicIntegrationsSection } from './MusicIntegrationsSection';
export { SettingsGuideModal } from './SettingsGuideModal';
export { SpotifySetupWizard } from './SpotifySetupWizard';
export { ThemeSection } from './ThemeSection';
export { VoiceControlSection } from './VoiceControlSection';
export { VolumeNormalizationSection } from './VolumeNormalizationSection';
export { WeatherConfigSection } from './WeatherConfigSection';
export { YouTubeMusicSection } from './YouTubeMusicSection';
`;

    case 'src/components/settings/AccessibilitySection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccessibilitySectionProps {
  settings: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: number;
    colorScheme: 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  };
  onUpdate: (settings: Partial<AccessibilitySectionProps['settings']>) => void;
}

export function AccessibilitySection({ settings, onUpdate }: AccessibilitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acessibilidade</CardTitle>
        <CardDescription>Configurações para melhorar a experiência de uso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast">Alto Contraste</Label>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => onUpdate({ highContrast: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="reduced-motion">Reduzir Animações</Label>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => onUpdate({ reducedMotion: checked })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tamanho da Fonte</Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => onUpdate({ fontSize: value })}
            min={12}
            max={24}
            step={1}
          />
          <p className="text-sm text-muted-foreground">{settings.fontSize}px</p>
        </div>
        
        <div className="space-y-2">
          <Label>Esquema de Cores</Label>
          <Select
            value={settings.colorScheme}
            onValueChange={(value) => onUpdate({ colorScheme: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Padrão</SelectItem>
              <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
              <SelectItem value="protanopia">Protanopia</SelectItem>
              <SelectItem value="tritanopia">Tritanopia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/AIConfigSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles } from 'lucide-react';

interface AIConfigSectionProps {
  settings: {
    enabled: boolean;
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    temperature: number;
    maxTokens: number;
  };
  onUpdate: (settings: Partial<AIConfigSectionProps['settings']>) => void;
}

export function AIConfigSection({ settings, onUpdate }: AIConfigSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Configuração de IA
        </CardTitle>
        <CardDescription>Configure o assistente de IA para recomendações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-enabled">Ativar IA</Label>
          <Switch
            id="ai-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Provedor</Label>
          <Select
            value={settings.provider}
            onValueChange={(value) => onUpdate({ provider: value as any })}
            disabled={!settings.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Temperatura (Criatividade)</Label>
          <Slider
            value={[settings.temperature]}
            onValueChange={([value]) => onUpdate({ temperature: value })}
            min={0}
            max={1}
            step={0.1}
            disabled={!settings.enabled}
          />
          <p className="text-sm text-muted-foreground">{settings.temperature}</p>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/AddCustomCommandModal.tsx':
      return `import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddCustomCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (command: { phrase: string; action: string }) => void;
}

const ACTIONS = [
  { value: 'play', label: 'Reproduzir' },
  { value: 'pause', label: 'Pausar' },
  { value: 'next', label: 'Próxima' },
  { value: 'prev', label: 'Anterior' },
  { value: 'volume_up', label: 'Aumentar Volume' },
  { value: 'volume_down', label: 'Diminuir Volume' },
  { value: 'mute', label: 'Silenciar' },
];

export function AddCustomCommandModal({ open, onOpenChange, onAdd }: AddCustomCommandModalProps) {
  const [phrase, setPhrase] = useState('');
  const [action, setAction] = useState('');

  const handleSubmit = () => {
    if (!phrase.trim() || !action) return;
    onAdd({ phrase: phrase.trim(), action });
    setPhrase('');
    setAction('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comando Personalizado</DialogTitle>
          <DialogDescription>
            Crie um novo comando de voz para controlar o player
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phrase">Frase de Ativação</Label>
            <Input
              id="phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Ex: toca aí"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ação</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map(a => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!phrase.trim() || !action}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/settings/BackendConnectionSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface BackendConnectionSectionProps {
  status: 'connected' | 'disconnected' | 'checking';
  endpoint: string;
  lastCheck: Date | null;
  onRefresh: () => void;
}

export function BackendConnectionSection({ status, endpoint, lastCheck, onRefresh }: BackendConnectionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Conexão Backend
        </CardTitle>
        <CardDescription>Status da conexão com o servidor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status</span>
          <Badge variant={status === 'connected' ? 'default' : status === 'checking' ? 'secondary' : 'destructive'}>
            {status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === 'disconnected' && <XCircle className="h-3 w-3 mr-1" />}
            {status === 'checking' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
            {status === 'connected' ? 'Conectado' : status === 'checking' ? 'Verificando...' : 'Desconectado'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Endpoint</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">{endpoint}</code>
        </div>
        
        {lastCheck && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Última verificação</span>
            <span className="text-sm">{lastCheck.toLocaleTimeString()}</span>
          </div>
        )}
        
        <Button variant="outline" className="w-full" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar Conexão
        </Button>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/CloudConnectionSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Check, AlertTriangle } from 'lucide-react';

interface CloudConnectionSectionProps {
  isConnected: boolean;
  projectId?: string;
  region?: string;
  onConnect: () => void;
}

export function CloudConnectionSection({ isConnected, projectId, region, onConnect }: CloudConnectionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Lovable Cloud
        </CardTitle>
        <CardDescription>Conexão com serviços de backend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status</span>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Não Conectado
              </>
            )}
          </Badge>
        </div>
        
        {isConnected && projectId && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projeto</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{projectId}</code>
            </div>
            {region && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Região</span>
                <span className="text-sm">{region}</span>
              </div>
            )}
          </>
        )}
        
        {!isConnected && (
          <Button className="w-full" onClick={onConnect}>
            <Cloud className="h-4 w-4 mr-2" />
            Conectar ao Cloud
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/DatabaseSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Trash2 } from 'lucide-react';

interface DatabaseSectionProps {
  stats: {
    totalRecords: number;
    storageUsed: string;
    lastBackup: Date | null;
  };
  onClearCache: () => void;
  onBackup: () => void;
}

export function DatabaseSection({ stats, onClearCache, onBackup }: DatabaseSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Banco de Dados
        </CardTitle>
        <CardDescription>Estatísticas e gerenciamento de dados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{stats.storageUsed}</p>
            <p className="text-xs text-muted-foreground">Armazenamento</p>
          </div>
        </div>
        
        {stats.lastBackup && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Último backup</span>
            <span>{stats.lastBackup.toLocaleDateString()}</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onBackup}>
            <HardDrive className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClearCache}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/LanguageSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface LanguageSectionProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSection({ currentLanguage, onLanguageChange }: LanguageSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Idioma
        </CardTitle>
        <CardDescription>Selecione o idioma da interface</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Idioma da Interface</Label>
          <Select value={currentLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/LocalMusicSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, Music, RefreshCw } from 'lucide-react';

interface LocalMusicSectionProps {
  paths: string[];
  trackCount: number;
  isScanning: boolean;
  scanProgress: number;
  onAddPath: () => void;
  onRemovePath: (path: string) => void;
  onScan: () => void;
}

export function LocalMusicSection({ 
  paths, 
  trackCount, 
  isScanning, 
  scanProgress, 
  onAddPath, 
  onScan 
}: LocalMusicSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Música Local
        </CardTitle>
        <CardDescription>Gerencie suas pastas de música local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Músicas encontradas</span>
          <span className="font-medium">{trackCount.toLocaleString()}</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Pastas</p>
          {paths.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pasta configurada</p>
          ) : (
            <ul className="space-y-1">
              {paths.map(path => (
                <li key={path} className="text-sm bg-muted px-2 py-1 rounded flex items-center">
                  <FolderOpen className="h-3 w-3 mr-2" />
                  {path}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {isScanning && (
          <div className="space-y-2">
            <Progress value={scanProgress} />
            <p className="text-xs text-muted-foreground text-center">Escaneando... {scanProgress}%</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onAddPath}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Adicionar Pasta
          </Button>
          <Button variant="outline" className="flex-1" onClick={onScan} disabled={isScanning}>
            <RefreshCw className={\`h-4 w-4 mr-2 \${isScanning ? 'animate-spin' : ''}\`} />
            Escanear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/MusicIntegrationsSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Check, X } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  user?: string;
}

interface MusicIntegrationsSectionProps {
  integrations: Integration[];
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

export function MusicIntegrationsSection({ integrations, onConnect, onDisconnect }: MusicIntegrationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Integrações de Música
        </CardTitle>
        <CardDescription>Conecte seus serviços de streaming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map(integration => (
          <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{integration.icon}</span>
              <div>
                <p className="font-medium">{integration.name}</p>
                {integration.connected && integration.user && (
                  <p className="text-sm text-muted-foreground">{integration.user}</p>
                )}
              </div>
            </div>
            
            {integration.connected ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => onDisconnect(integration.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => onConnect(integration.id)}>
                Conectar
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/SettingsGuideModal.tsx':
      return `import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle } from 'lucide-react';

interface SettingsGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsGuideModal({ open, onOpenChange }: SettingsGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Guia de Configurações
          </DialogTitle>
          <DialogDescription>
            Saiba mais sobre cada seção de configurações
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-2">🎵 Integrações de Música</h3>
              <p className="text-sm text-muted-foreground">
                Conecte seus serviços de streaming favoritos como Spotify e YouTube Music 
                para acessar suas playlists e músicas diretamente no TSiJUKEBOX.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold mb-2">🎤 Controle por Voz</h3>
              <p className="text-sm text-muted-foreground">
                Configure comandos de voz personalizados para controlar a reprodução. 
                Você pode adicionar frases em português, inglês ou espanhol.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold mb-2">🌐 Idioma</h3>
              <p className="text-sm text-muted-foreground">
                Altere o idioma da interface. Atualmente suportamos Português, 
                Inglês e Espanhol.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold mb-2">♿ Acessibilidade</h3>
              <p className="text-sm text-muted-foreground">
                Configure opções de acessibilidade como alto contraste, 
                redução de animações e tamanho de fonte.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold mb-2">☁️ Cloud</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie a conexão com o backend Cloud para sincronização 
                de dados e funcionalidades avançadas.
              </p>
            </section>
          </div>
        </ScrollArea>
        
        <Button onClick={() => onOpenChange(false)}>Entendi</Button>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/settings/SpotifySetupWizard.tsx':
      return `import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface SpotifySetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (config: { clientId: string; redirectUri: string }) => void;
}

export function SpotifySetupWizard({ open, onOpenChange, onComplete }: SpotifySetupWizardProps) {
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState(window.location.origin + '/spotify/callback');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      onComplete({ clientId, redirectUri });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Spotify</DialogTitle>
          <DialogDescription>Passo {step} de {totalSteps}</DialogDescription>
        </DialogHeader>
        
        <Progress value={progress} className="mb-4" />
        
        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm">Primeiro, você precisa criar um app no Spotify Developer Dashboard.</p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Acesse developer.spotify.com</li>
                <li>Faça login com sua conta Spotify</li>
                <li>Crie um novo aplicativo</li>
                <li>Copie o Client ID</li>
              </ol>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Cole seu Client ID aqui"
                />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-sm">Configuração concluída! Clique em Conectar para autorizar.</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Voltar</Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={step === 2 && !clientId}
          >
            {step === totalSteps ? 'Conectar' : 'Próximo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/settings/ThemeSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSectionProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeSection({ theme, onThemeChange }: ThemeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Aparência
        </CardTitle>
        <CardDescription>Personalize o tema da interface</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={onThemeChange as any}>
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
              <Sun className="h-4 w-4" />
              <span>Claro</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
              <Moon className="h-4 w-4" />
              <span>Escuro</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer flex-1">
              <Monitor className="h-4 w-4" />
              <span>Sistema</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/VoiceControlSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mic, Plus } from 'lucide-react';

interface VoiceControlSectionProps {
  settings: {
    enabled: boolean;
    language: string;
    sensitivity: number;
    wakeWord: string;
  };
  onUpdate: (settings: Partial<VoiceControlSectionProps['settings']>) => void;
  onAddCommand: () => void;
}

export function VoiceControlSection({ settings, onUpdate, onAddCommand }: VoiceControlSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Controle por Voz
        </CardTitle>
        <CardDescription>Configure comandos de voz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="voice-enabled">Ativar Controle por Voz</Label>
          <Switch
            id="voice-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Idioma</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => onUpdate({ language: value })}
            disabled={!settings.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Sensibilidade</Label>
          <Slider
            value={[settings.sensitivity * 100]}
            onValueChange={([value]) => onUpdate({ sensitivity: value / 100 })}
            min={0}
            max={100}
            disabled={!settings.enabled}
          />
          <p className="text-sm text-muted-foreground">{Math.round(settings.sensitivity * 100)}%</p>
        </div>
        
        <Button variant="outline" className="w-full" onClick={onAddCommand} disabled={!settings.enabled}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Comando Personalizado
        </Button>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/VolumeNormalizationSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2 } from 'lucide-react';

interface VolumeNormalizationSectionProps {
  settings: {
    enabled: boolean;
    mode: 'soft' | 'moderate' | 'aggressive';
    targetLoudness: number;
    peakLimit: number;
  };
  onUpdate: (settings: Partial<VolumeNormalizationSectionProps['settings']>) => void;
}

export function VolumeNormalizationSection({ settings, onUpdate }: VolumeNormalizationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Normalização de Volume
        </CardTitle>
        <CardDescription>Equalize o volume entre músicas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="norm-enabled">Ativar Normalização</Label>
          <Switch
            id="norm-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Modo</Label>
          <Select
            value={settings.mode}
            onValueChange={(value) => onUpdate({ mode: value as any })}
            disabled={!settings.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">Suave</SelectItem>
              <SelectItem value="moderate">Moderado</SelectItem>
              <SelectItem value="aggressive">Agressivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Volume Alvo (LUFS)</Label>
          <Slider
            value={[settings.targetLoudness]}
            onValueChange={([value]) => onUpdate({ targetLoudness: value })}
            min={-23}
            max={-5}
            step={1}
            disabled={!settings.enabled}
          />
          <p className="text-sm text-muted-foreground">{settings.targetLoudness} LUFS</p>
        </div>
        
        <div className="space-y-2">
          <Label>Limite de Pico (dB)</Label>
          <Slider
            value={[settings.peakLimit]}
            onValueChange={([value]) => onUpdate({ peakLimit: value })}
            min={-3}
            max={0}
            step={0.5}
            disabled={!settings.enabled}
          />
          <p className="text-sm text-muted-foreground">{settings.peakLimit} dB</p>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/WeatherConfigSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud } from 'lucide-react';

interface WeatherConfigSectionProps {
  settings: {
    enabled: boolean;
    city: string;
    unit: 'celsius' | 'fahrenheit';
    showInKiosk: boolean;
  };
  onUpdate: (settings: Partial<WeatherConfigSectionProps['settings']>) => void;
}

export function WeatherConfigSection({ settings, onUpdate }: WeatherConfigSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Clima
        </CardTitle>
        <CardDescription>Configure a exibição do clima</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="weather-enabled">Exibir Clima</Label>
          <Switch
            id="weather-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={settings.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            placeholder="Ex: São Paulo, BR"
            disabled={!settings.enabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Unidade</Label>
          <Select
            value={settings.unit}
            onValueChange={(value) => onUpdate({ unit: value as any })}
            disabled={!settings.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="celsius">Celsius (°C)</SelectItem>
              <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="kiosk-weather">Exibir no Modo Kiosk</Label>
          <Switch
            id="kiosk-weather"
            checked={settings.showInKiosk}
            onCheckedChange={(checked) => onUpdate({ showInKiosk: checked })}
            disabled={!settings.enabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
`;

    case 'src/components/settings/YouTubeMusicSection.tsx':
      return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Youtube, Check, ExternalLink } from 'lucide-react';

interface YouTubeMusicSectionProps {
  isConnected: boolean;
  user?: { name: string; email: string };
  settings: {
    autoplay: boolean;
    qualityPreference: 'auto' | 'high' | 'low';
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onUpdateSettings: (settings: Partial<YouTubeMusicSectionProps['settings']>) => void;
}

export function YouTubeMusicSection({ 
  isConnected, 
  user, 
  settings, 
  onConnect, 
  onDisconnect, 
  onUpdateSettings 
}: YouTubeMusicSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          YouTube Music
        </CardTitle>
        <CardDescription>Conecte sua conta do YouTube Music</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">Status</p>
            {isConnected && user && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
              <Button size="sm" variant="ghost" onClick={onDisconnect}>
                Desconectar
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onConnect}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          )}
        </div>
        
        {isConnected && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="yt-autoplay">Autoplay</Label>
              <Switch
                id="yt-autoplay"
                checked={settings.autoplay}
                onCheckedChange={(checked) => onUpdateSettings({ autoplay: checked })}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
`;

    default:
      return null;
  }
}
