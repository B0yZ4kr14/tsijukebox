# TSiJUKEBOX - Documentação Técnica de Componentes React

> **Versão:** 4.3.0 | **Total:** 187 componentes | **Atualizado:** 2025-12-23

---

## Índice

1. [UI Base (Shadcn)](#1-ui-base-shadcn---68-componentes)
2. [UI Customizados](#2-ui-customizados---18-componentes)
3. [Player](#3-player---21-componentes)
4. [Settings](#4-settings---61-componentes)
5. [Spotify](#5-spotify---8-componentes)
6. [YouTube Music](#6-youtube-music---5-componentes)
7. [GitHub](#7-github---16-componentes)
8. [Jam Session](#8-jam-session---10-componentes)
9. [Auth](#9-auth---6-componentes)
10. [Layout](#10-layout---2-componentes)
11. [Wiki](#11-wiki---4-componentes)
12. [Landing](#12-landing---6-componentes)
13. [Outros](#13-outros---13-componentes)

---

## 1. UI Base (Shadcn) - 68 Componentes

### Button

**Localização:** `src/components/ui/button.tsx`

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg" disabled={false}>
  Click me
</Button>
```

**Interface TypeScript:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'kiosk-outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `variant` | `string` | ❌ | `'default'` | Estilo visual do botão |
| `size` | `string` | ❌ | `'default'` | Tamanho do botão |
| `asChild` | `boolean` | ❌ | `false` | Renderiza como filho (Slot) |
| `disabled` | `boolean` | ❌ | `false` | Desabilita interação |

**Variantes:**
- `default` - Botão primário com cor de destaque
- `destructive` - Ação destrutiva (vermelho)
- `outline` - Borda sem preenchimento
- `kiosk-outline` - Outline para modo kiosk
- `secondary` - Ação secundária
- `ghost` - Sem borda, hover sutil
- `link` - Estilo de link

---

### Card

**Localização:** `src/components/ui/card.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card className="w-96">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo principal</CardContent>
  <CardFooter>Ações do rodapé</CardFooter>
</Card>
```

**Interface TypeScript:**
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

| Componente | Descrição |
|------------|-----------|
| `Card` | Container principal com borda e sombra |
| `CardHeader` | Área de cabeçalho |
| `CardTitle` | Título do card (h3) |
| `CardDescription` | Descrição/subtítulo |
| `CardContent` | Área de conteúdo principal |
| `CardFooter` | Rodapé com ações |

---

### Dialog

**Localização:** `src/components/ui/dialog.tsx`

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição do diálogo</DialogDescription>
    </DialogHeader>
    <div>Conteúdo</div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DialogClose>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Interface TypeScript:**
```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
  children: React.ReactNode;
}

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  className?: string;
  children: React.ReactNode;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `open` | `boolean` | ❌ | - | Controla estado aberto/fechado |
| `onOpenChange` | `(open: boolean) => void` | ❌ | - | Callback quando estado muda |
| `modal` | `boolean` | ❌ | `true` | Se bloqueia interação externa |

---

### Input

**Localização:** `src/components/ui/input.tsx`

```tsx
import { Input } from '@/components/ui/input';

<Input 
  type="email" 
  placeholder="Digite seu email" 
  value={email} 
  onChange={(e) => setEmail(e.target.value)}
  disabled={false}
/>
```

**Interface TypeScript:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `type` | `string` | ❌ | `'text'` | Tipo do input HTML |
| `placeholder` | `string` | ❌ | - | Texto placeholder |
| `value` | `string` | ❌ | - | Valor controlado |
| `onChange` | `(e: ChangeEvent) => void` | ❌ | - | Handler de mudança |
| `disabled` | `boolean` | ❌ | `false` | Desabilita input |

---

### Select

**Localização:** `src/components/ui/select.tsx`

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Opções</SelectLabel>
      <SelectItem value="opt1">Opção 1</SelectItem>
      <SelectItem value="opt2">Opção 2</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

**Interface TypeScript:**
```typescript
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}
```

---

### Switch

**Localização:** `src/components/ui/switch.tsx`

```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
  <Switch 
    id="airplane-mode" 
    checked={enabled} 
    onCheckedChange={setEnabled} 
  />
  <Label htmlFor="airplane-mode">Modo avião</Label>
</div>
```

**Interface TypeScript:**
```typescript
interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `checked` | `boolean` | ❌ | - | Estado controlado |
| `onCheckedChange` | `(checked: boolean) => void` | ❌ | - | Callback de mudança |
| `disabled` | `boolean` | ❌ | `false` | Desabilita switch |

---

### Tabs

**Localização:** `src/components/ui/tabs.tsx`

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1" className="w-full">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo da Tab 1</TabsContent>
  <TabsContent value="tab2">Conteúdo da Tab 2</TabsContent>
</Tabs>
```

**Interface TypeScript:**
```typescript
interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  forceMount?: boolean;
  children: React.ReactNode;
}
```

---

### Toast

**Localização:** `src/components/ui/toast.tsx`

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Uso
toast({
  title: "Sucesso!",
  description: "Operação realizada com sucesso.",
  variant: "default"
});

// Com ação
toast({
  title: "Arquivo deletado",
  description: "O arquivo foi movido para a lixeira.",
  action: <ToastAction altText="Desfazer">Desfazer</ToastAction>,
});
```

**Interface TypeScript:**
```typescript
interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactElement<ToastActionElement>;
  duration?: number;
}

interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText: string;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `title` | `string` | ❌ | - | Título do toast |
| `description` | `string` | ❌ | - | Mensagem detalhada |
| `variant` | `string` | ❌ | `'default'` | Estilo visual |
| `duration` | `number` | ❌ | `5000` | Duração em ms |

---

### Tooltip

**Localização:** `src/components/ui/tooltip.tsx`

```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Texto do tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Interface TypeScript:**
```typescript
interface TooltipProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
}
```

---

### Form (react-hook-form + zod)

**Localização:** `src/components/ui/form.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>Seu nome de usuário público.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
```

---

### Outros Componentes UI Base

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| `Accordion` | `ui/accordion.tsx` | Lista expansível |
| `AlertDialog` | `ui/alert-dialog.tsx` | Diálogo de confirmação |
| `AspectRatio` | `ui/aspect-ratio.tsx` | Container com aspect ratio fixo |
| `Avatar` | `ui/avatar.tsx` | Imagem de perfil circular |
| `Badge` | `ui/badge.tsx` | Tag/etiqueta pequena |
| `Checkbox` | `ui/checkbox.tsx` | Caixa de seleção |
| `Collapsible` | `ui/collapsible.tsx` | Conteúdo colapsável |
| `Command` | `ui/command.tsx` | Paleta de comandos |
| `ContextMenu` | `ui/context-menu.tsx` | Menu de contexto |
| `DropdownMenu` | `ui/dropdown-menu.tsx` | Menu dropdown |
| `HoverCard` | `ui/hover-card.tsx` | Card ao passar mouse |
| `Label` | `ui/label.tsx` | Label para inputs |
| `Menubar` | `ui/menubar.tsx` | Barra de menu |
| `NavigationMenu` | `ui/navigation-menu.tsx` | Menu de navegação |
| `Popover` | `ui/popover.tsx` | Popup flutuante |
| `Progress` | `ui/progress.tsx` | Barra de progresso |
| `RadioGroup` | `ui/radio-group.tsx` | Grupo de radio buttons |
| `ScrollArea` | `ui/scroll-area.tsx` | Área com scroll customizado |
| `Separator` | `ui/separator.tsx` | Linha separadora |
| `Skeleton` | `ui/skeleton.tsx` | Placeholder de carregamento |
| `Slider` | `ui/slider.tsx` | Controle deslizante |
| `Textarea` | `ui/textarea.tsx` | Campo de texto multilinha |
| `Toggle` | `ui/toggle.tsx` | Botão toggle |
| `ToggleGroup` | `ui/toggle-group.tsx` | Grupo de toggles |

---

## 2. UI Customizados - 18 Componentes

### BackButton

**Localização:** `src/components/ui/BackButton.tsx`

```tsx
import { BackButton } from '@/components/ui/BackButton';

<BackButton 
  label="Voltar" 
  iconSize="md" 
  showLabel={true}
  navigationOptions={{ fallbackPath: '/settings' }} 
/>
```

**Interface TypeScript:**
```typescript
interface BackButtonProps {
  label?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  navigationOptions?: {
    fallbackPath?: string;
    replace?: boolean;
  };
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `label` | `string` | ❌ | `'Voltar'` | Texto do botão |
| `iconSize` | `string` | ❌ | `'md'` | Tamanho do ícone |
| `showLabel` | `boolean` | ❌ | `true` | Exibe ou oculta label |
| `navigationOptions.fallbackPath` | `string` | ❌ | `'/'` | Path se não houver histórico |

---

### BrandLogo

**Localização:** `src/components/ui/BrandLogo.tsx`

```tsx
import { BrandLogo } from '@/components/ui/BrandLogo';

<BrandLogo 
  size="lg" 
  variant="ultra" 
  animate="splash" 
  showTagline={true}
  centered={true}
/>
```

**Interface TypeScript:**
```typescript
interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ultra' | 'silver' | 'hologram';
  animate?: 'none' | 'fade' | 'splash' | 'glitch';
  showTagline?: boolean;
  centered?: boolean;
  className?: string;
  onClick?: () => void;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `size` | `string` | ❌ | `'md'` | Tamanho do logo |
| `variant` | `string` | ❌ | `'default'` | Estilo visual |
| `animate` | `string` | ❌ | `'none'` | Tipo de animação |
| `showTagline` | `boolean` | ❌ | `false` | Mostra tagline |
| `centered` | `boolean` | ❌ | `false` | Centraliza horizontalmente |

**Variantes de Animação:**
- `none` - Sem animação
- `fade` - Fade in suave
- `splash` - Animação de splash screen
- `glitch` - Efeito glitch cyberpunk

---

### LoadingSpinner

**Localização:** `src/components/ui/LoadingSpinner.tsx`

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" className="text-primary" />
```

**Interface TypeScript:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

---

### ErrorMessage

**Localização:** `src/components/ui/ErrorMessage.tsx`

```tsx
import { ErrorMessage } from '@/components/ui/ErrorMessage';

<ErrorMessage 
  title="Erro ao carregar" 
  message="Não foi possível conectar ao servidor."
  onRetry={() => refetch()}
/>
```

**Interface TypeScript:**
```typescript
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}
```

---

## 3. Player - 21 Componentes

### AudioVisualizer

**Localização:** `src/components/player/AudioVisualizer.tsx`

```tsx
import { AudioVisualizer } from '@/components/player/AudioVisualizer';

<AudioVisualizer 
  isPlaying={true} 
  barCount={32} 
  genre="rock" 
  variant="default"
  height={100}
/>
```

**Interface TypeScript:**
```typescript
interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  genre?: 'rock' | 'pop' | 'soul' | 'hip-hop' | 'electronic' | 'classical' | 'jazz';
  variant?: 'default' | 'minimal' | 'circular' | 'wave';
  height?: number;
  className?: string;
  audioContext?: AudioContext;
  analyser?: AnalyserNode;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `isPlaying` | `boolean` | ✅ | - | Estado de reprodução |
| `barCount` | `number` | ❌ | `32` | Número de barras |
| `genre` | `string` | ❌ | - | Gênero para cor |
| `variant` | `string` | ❌ | `'default'` | Estilo visual |
| `height` | `number` | ❌ | `100` | Altura em pixels |

---

### NowPlaying

**Localização:** `src/components/player/NowPlaying.tsx`

```tsx
import { NowPlaying } from '@/components/player/NowPlaying';

<NowPlaying 
  track={{
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    cover: '/covers/queen.jpg',
    duration: 354000
  }}
  isPlaying={true}
  onPlayPause={togglePlay}
  onNext={nextTrack}
  onPrevious={prevTrack}
/>
```

**Interface TypeScript:**
```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  duration?: number;
  genre?: string;
}

interface NowPlayingProps {
  track: Track | null;
  isPlaying: boolean;
  progress?: number;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (position: number) => void;
  showControls?: boolean;
  compact?: boolean;
  className?: string;
}
```

---

### VolumeSlider

**Localização:** `src/components/player/VolumeSlider.tsx`

```tsx
import { VolumeSlider } from '@/components/player/VolumeSlider';

<VolumeSlider 
  volume={75} 
  onVolumeChange={setVolume} 
  muted={false} 
  onMuteToggle={toggleMute}
  orientation="horizontal"
/>
```

**Interface TypeScript:**
```typescript
interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted?: boolean;
  onMuteToggle?: () => void;
  orientation?: 'horizontal' | 'vertical';
  showValue?: boolean;
  className?: string;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `volume` | `number` | ✅ | - | Volume atual (0-100) |
| `onVolumeChange` | `(volume: number) => void` | ✅ | - | Callback de mudança |
| `muted` | `boolean` | ❌ | `false` | Estado mudo |
| `onMuteToggle` | `() => void` | ❌ | - | Toggle mute |
| `orientation` | `string` | ❌ | `'horizontal'` | Direção do slider |

---

### ProgressBar

**Localização:** `src/components/player/ProgressBar.tsx`

```tsx
import { ProgressBar } from '@/components/player/ProgressBar';

<ProgressBar 
  current={45000}
  total={180000}
  onSeek={(position) => seek(position)}
  buffered={60}
  showTime={true}
/>
```

**Interface TypeScript:**
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  onSeek?: (position: number) => void;
  buffered?: number;
  showTime?: boolean;
  disabled?: boolean;
  className?: string;
}
```

---

### PlaybackControls

**Localização:** `src/components/player/PlaybackControls.tsx`

```tsx
import { PlaybackControls } from '@/components/player/PlaybackControls';

<PlaybackControls 
  isPlaying={true}
  onPlayPause={togglePlay}
  onNext={nextTrack}
  onPrevious={prevTrack}
  onShuffle={toggleShuffle}
  onRepeat={toggleRepeat}
  shuffle={false}
  repeat="off"
  size="lg"
/>
```

**Interface TypeScript:**
```typescript
interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onShuffle?: () => void;
  onRepeat?: () => void;
  shuffle?: boolean;
  repeat?: 'off' | 'all' | 'one';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

---

### Outros Componentes Player

| Componente | Props Principais | Descrição |
|------------|------------------|-----------|
| `CommandDeck` | `commands`, `onCommand` | Painel de comandos do player |
| `DigitalClock` | `format`, `showSeconds` | Relógio digital |
| `FullscreenKaraoke` | `lyrics`, `currentTime` | Karaoke em tela cheia |
| `KaraokeLyrics` | `lyrics`, `currentLine` | Display de letras |
| `LibraryPanel` | `tracks`, `onSelect` | Painel de biblioteca |
| `LyricsDisplay` | `lyrics`, `isLoading` | Exibição de letras |
| `QueuePanel` | `queue`, `onReorder` | Painel de fila |
| `SideInfoPanel` | `track`, `stats` | Informações laterais |
| `SystemMonitor` | `cpu`, `memory`, `network` | Monitor de sistema |
| `UserBadge` | `user`, `role` | Badge de usuário |
| `VoiceControlButton` | `listening`, `onToggle` | Botão de controle por voz |
| `WeatherWidget` | `location`, `units` | Widget de clima |
| `ConnectionIndicator` | `status`, `type` | Indicador de conexão |

---

## 4. Settings - 61 Componentes

### SettingsSection

**Localização:** `src/components/settings/SettingsSection.tsx`

```tsx
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Settings } from 'lucide-react';

<SettingsSection 
  icon={<Settings />} 
  title="Configurações Gerais" 
  description="Preferências básicas do sistema"
  defaultOpen={true}
  instructions={{
    title: 'Como usar',
    steps: ['Passo 1: ...', 'Passo 2: ...']
  }}
>
  {children}
</SettingsSection>
```

**Interface TypeScript:**
```typescript
interface SettingsSectionProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  instructions?: {
    title: string;
    steps: string[];
  };
  children: React.ReactNode;
  className?: string;
  badge?: string;
  actions?: React.ReactNode;
}
```

| Prop | Tipo | Required | Default | Descrição |
|------|------|----------|---------|-----------|
| `title` | `string` | ✅ | - | Título da seção |
| `icon` | `ReactNode` | ❌ | - | Ícone à esquerda |
| `description` | `string` | ❌ | - | Descrição breve |
| `defaultOpen` | `boolean` | ❌ | `false` | Estado inicial |
| `instructions` | `object` | ❌ | - | Tooltip de ajuda |
| `badge` | `string` | ❌ | - | Badge de status |

---

### AIConfigSection

**Localização:** `src/components/settings/AIConfigSection.tsx`

```tsx
import { AIConfigSection } from '@/components/settings/AIConfigSection';

<AIConfigSection />
```

**Interface TypeScript:**
```typescript
interface APIKeyConfig {
  name: string;
  secretName: string;
  description: string;
  consoleUrl: string;
  icon: React.ComponentType;
  prefix?: string;
}

// Componente não recebe props externas
// Gerencia estado interno de API keys
```

**Funcionalidades:**
- Campos para Claude Opus e Manus.im API keys
- Validação de formato de chave
- Teste de conexão com APIs
- Indicadores de status (configurado/não configurado)
- Links para consoles externas

---

### CreateDeployKeyModal

**Localização:** `src/components/settings/CreateDeployKeyModal.tsx`

```tsx
import { CreateDeployKeyModal } from '@/components/settings/CreateDeployKeyModal';

<CreateDeployKeyModal 
  open={open}
  onOpenChange={setOpen}
  onSuccess={(keyId) => console.log('Key created:', keyId)}
/>
```

**Interface TypeScript:**
```typescript
interface CreateDeployKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (keyId: string) => void;
  repositoryUrl?: string;
}
```

---

### BackupManager

**Localização:** `src/components/settings/backup/BackupManager.tsx`

```tsx
import { BackupManager } from '@/components/settings/backup/BackupManager';

<BackupManager 
  onBackupComplete={(backup) => console.log('Backup done:', backup)}
  autoRefresh={true}
/>
```

**Interface TypeScript:**
```typescript
interface Backup {
  id: string;
  name: string;
  size: number;
  createdAt: Date;
  provider: 'storj' | 'local' | 's3';
  status: 'completed' | 'pending' | 'failed';
}

interface BackupManagerProps {
  onBackupComplete?: (backup: Backup) => void;
  autoRefresh?: boolean;
  className?: string;
}
```

---

### Subcategorias de Settings

#### Database
| Componente | Descrição |
|------------|-----------|
| `DatabaseSection` | Configuração principal de banco |
| `AdvancedDatabaseSection` | Opções avançadas de DB |
| `UnifiedDatabaseSection` | Painel unificado de databases |

#### Backup
| Componente | Props | Descrição |
|------------|-------|-----------|
| `BackupCard` | `backup`, `onRestore`, `onDelete` | Card de backup individual |
| `BackupActions` | `onBackup`, `onRestore` | Ações de backup |
| `BackupHistory` | `backups`, `onSelect` | Histórico de backups |
| `BackupScheduler` | `schedule`, `onScheduleChange` | Agendamento |

#### Integrations
| Componente | Props | Descrição |
|------------|-------|-----------|
| `SpotifySetupWizard` | `onComplete` | Wizard de setup Spotify |
| `YouTubeMusicSetupWizard` | `onComplete` | Wizard YouTube Music |
| `GitHubExportSection` | `repositoryUrl` | Export para GitHub |
| `StorjSection` | `bucket`, `accessGrant` | Config Storj |

#### Users
| Componente | Props | Descrição |
|------------|-------|-----------|
| `UserManagementSection` | `users`, `onUpdate` | Gestão de usuários |
| `KeysManagementSection` | `keys`, `onRevoke` | Gestão de API keys |
| `AuthProviderSection` | `providers` | Provedores de auth |

#### Voice
| Componente | Props | Descrição |
|------------|-------|-----------|
| `VoiceControlSection` | `enabled`, `onToggle` | Config de voz |
| `VoiceTrainingMode` | `onComplete` | Treinamento de voz |
| `VoiceCommandHistory` | `commands` | Histórico de comandos |

#### Developer
| Componente | Props | Descrição |
|------------|-------|-----------|
| `CodeScanSection` | `results`, `onScan` | Scanner de código |
| `FullstackRefactorPanel` | `files`, `onRefactor` | Painel de refatoração |
| `ScriptRefactorSection` | `script`, `onRefactor` | Refatoração de scripts |
| `GitHubSyncStatus` | `status`, `onSync` | Status de sync GitHub |
| `ManusAutomationSection` | `config`, `onRun` | Automação Manus.im |

---

## 5. Spotify - 8 Componentes

### SpotifyPanel

**Localização:** `src/components/spotify/SpotifyPanel.tsx`

```tsx
import { SpotifyPanel } from '@/components/spotify/SpotifyPanel';

<SpotifyPanel 
  accessToken={token}
  onTrackSelect={(track) => playTrack(track)}
  view="grid"
/>
```

**Interface TypeScript:**
```typescript
interface SpotifyPanelProps {
  accessToken: string;
  onTrackSelect?: (track: SpotifyTrack) => void;
  view?: 'grid' | 'list';
  className?: string;
}
```

---

### TrackItem

**Localização:** `src/components/spotify/TrackItem.tsx`

```tsx
import { TrackItem } from '@/components/spotify/TrackItem';

<TrackItem 
  track={track}
  isPlaying={currentTrackId === track.id}
  onPlay={() => play(track)}
  onAddToQueue={() => addToQueue(track)}
/>
```

**Interface TypeScript:**
```typescript
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  uri: string;
}

interface TrackItemProps {
  track: SpotifyTrack;
  isPlaying?: boolean;
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onAddToPlaylist?: () => void;
  showAlbum?: boolean;
  compact?: boolean;
}
```

---

### Outros Componentes Spotify

| Componente | Props | Descrição |
|------------|-------|-----------|
| `PlaylistCard` | `playlist`, `onClick` | Card de playlist |
| `AlbumCard` | `album`, `onClick` | Card de álbum |
| `ArtistCard` | `artist`, `onClick` | Card de artista |
| `SpotifyUserBadge` | `user` | Badge do usuário Spotify |
| `AddToPlaylistModal` | `track`, `playlists`, `onAdd` | Modal adicionar à playlist |
| `CreatePlaylistModal` | `onSuccess` | Modal criar playlist |

---

## 6. YouTube Music - 5 Componentes

### YouTubeMusicTrackItem

**Localização:** `src/components/youtube/YouTubeMusicTrackItem.tsx`

```tsx
import { YouTubeMusicTrackItem } from '@/components/youtube/YouTubeMusicTrackItem';

<YouTubeMusicTrackItem 
  track={track}
  onPlay={() => playYouTubeTrack(track.videoId)}
/>
```

**Interface TypeScript:**
```typescript
interface YouTubeMusicTrack {
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  duration: string;
}

interface YouTubeMusicTrackItemProps {
  track: YouTubeMusicTrack;
  isPlaying?: boolean;
  onPlay?: () => void;
  onAddToQueue?: () => void;
}
```

---

## 7. GitHub - 16 Componentes

### KpiCard

**Localização:** `src/components/github/KpiCard.tsx`

```tsx
import { KpiCard } from '@/components/github/KpiCard';
import { GitCommit } from 'lucide-react';

<KpiCard 
  title="Total Commits" 
  value={1234} 
  icon={GitCommit} 
  color="bg-blue-500"
  trend={{ value: 12, direction: 'up' }}
  isLoading={false}
/>
```

**Interface TypeScript:**
```typescript
interface KpiCardProps {
  title: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}
```

---

### CommitsTable

**Localização:** `src/components/github/CommitsTable.tsx`

```tsx
import { CommitsTable } from '@/components/github/CommitsTable';

<CommitsTable 
  commits={commits}
  onCommitClick={(sha) => viewCommit(sha)}
  loading={isLoading}
/>
```

**Interface TypeScript:**
```typescript
interface Commit {
  sha: string;
  message: string;
  author: { name: string; avatar: string };
  date: string;
  additions: number;
  deletions: number;
}

interface CommitsTableProps {
  commits: Commit[];
  onCommitClick?: (sha: string) => void;
  loading?: boolean;
  pageSize?: number;
}
```

---

### Outros Componentes GitHub

| Componente | Props | Descrição |
|------------|-------|-----------|
| `LanguagesChart` | `languages` | Gráfico de linguagens |
| `ContributorsChart` | `contributors` | Gráfico de contribuidores |
| `CommitFilters` | `filters`, `onChange` | Filtros de commits |
| `ReleasesSection` | `releases` | Seção de releases |
| `BranchesSection` | `branches`, `current` | Seção de branches |
| `AutoSyncPanel` | `enabled`, `onToggle` | Painel de auto-sync |
| `CacheIndicator` | `cached`, `lastUpdate` | Indicador de cache |
| `SyncHistoryPanel` | `history` | Histórico de sync |
| `FileSelectionModal` | `files`, `onSelect` | Modal seleção de arquivos |
| `GitHubDashboardCharts` | `data` | Gráficos do dashboard |
| `GitHubDashboardSkeleton` | - | Skeleton do dashboard |
| `GitHubErrorState` | `error`, `onRetry` | Estado de erro |
| `GitHubEmptyState` | `message` | Estado vazio |

---

## 8. Jam Session - 10 Componentes

### CreateJamModal

**Localização:** `src/components/jam/CreateJamModal.tsx`

```tsx
import { CreateJamModal } from '@/components/jam/CreateJamModal';

<CreateJamModal 
  open={open}
  onOpenChange={setOpen}
  onJamCreated={(jam) => navigateToJam(jam.code)}
/>
```

**Interface TypeScript:**
```typescript
interface JamSession {
  id: string;
  code: string;
  name: string;
  hostNickname: string;
  isActive: boolean;
  privacy: 'public' | 'private';
}

interface CreateJamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJamCreated?: (jam: JamSession) => void;
}
```

---

### JamQueue

**Localização:** `src/components/jam/JamQueue.tsx`

```tsx
import { JamQueue } from '@/components/jam/JamQueue';

<JamQueue 
  queue={queue}
  currentTrack={currentTrack}
  onVote={(trackId) => vote(trackId)}
  onReorder={(tracks) => reorderQueue(tracks)}
  isHost={isHost}
/>
```

**Interface TypeScript:**
```typescript
interface QueueTrack {
  id: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  addedBy: string;
  votes: number;
  position: number;
}

interface JamQueueProps {
  queue: QueueTrack[];
  currentTrack?: QueueTrack;
  onVote?: (trackId: string) => void;
  onReorder?: (tracks: QueueTrack[]) => void;
  isHost?: boolean;
}
```

---

### Outros Componentes Jam

| Componente | Props | Descrição |
|------------|-------|-----------|
| `JamHeader` | `session`, `onLeave` | Cabeçalho da sessão |
| `JamPlayer` | `track`, `isPlaying` | Player da jam |
| `JamParticipantsList` | `participants` | Lista de participantes |
| `JamReactions` | `sessionId`, `onReact` | Reações em tempo real |
| `JamNicknameModal` | `open`, `onSubmit` | Modal de nickname |
| `JamInviteModal` | `code`, `onShare` | Modal de convite |
| `JamAddTrackModal` | `onAdd` | Modal adicionar música |
| `JamAISuggestions` | `context`, `onSelect` | Sugestões de IA |

---

## 9. Auth - 6 Componentes

### ProtectedRoute

**Localização:** `src/components/auth/ProtectedRoute.tsx`

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<ProtectedRoute requiredRole="admin" fallback={<LoginPage />}>
  <AdminPanel />
</ProtectedRoute>
```

**Interface TypeScript:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'newbie';
  fallback?: React.ReactNode;
  redirectTo?: string;
}
```

---

### PermissionGate

**Localização:** `src/components/auth/PermissionGate.tsx`

```tsx
import { PermissionGate } from '@/components/auth/PermissionGate';

<PermissionGate permission="manage_users" fallback={<AccessDenied />}>
  <UserManagement />
</PermissionGate>
```

**Interface TypeScript:**
```typescript
type Permission = 
  | 'manage_users' 
  | 'manage_settings' 
  | 'manage_backups' 
  | 'manage_integrations'
  | 'view_analytics';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

---

### LoginForm / SignUpForm

```tsx
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

<LoginForm 
  onSuccess={() => navigate('/dashboard')}
  onForgotPassword={() => navigate('/forgot-password')}
/>

<SignUpForm 
  onSuccess={() => navigate('/verify-email')}
/>
```

**Interface TypeScript:**
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  redirectTo?: string;
}

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}
```

---

## 10. Layout - 2 Componentes

### KioskLayout

**Localização:** `src/components/layout/KioskLayout.tsx`

```tsx
import { KioskLayout } from '@/components/layout/KioskLayout';

<KioskLayout 
  showClock={true}
  showWeather={true}
  idleTimeout={300}
>
  {children}
</KioskLayout>
```

**Interface TypeScript:**
```typescript
interface KioskLayoutProps {
  children: React.ReactNode;
  showClock?: boolean;
  showWeather?: boolean;
  idleTimeout?: number;
  onIdle?: () => void;
  className?: string;
}
```

---

### AdminLayout

**Localização:** `src/components/layout/AdminLayout.tsx`

```tsx
import { AdminLayout } from '@/components/layout/AdminLayout';

<AdminLayout 
  sidebar={<Sidebar />}
  header={<Header />}
>
  {children}
</AdminLayout>
```

**Interface TypeScript:**
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}
```

---

## 11. Wiki - 4 Componentes

### WikiArticleView

**Localização:** `src/components/wiki/WikiArticleView.tsx`

```tsx
import { WikiArticleView } from '@/components/wiki/WikiArticleView';

<WikiArticleView 
  article={article}
  onNavigate={(articleId) => navigate(`/wiki/${articleId}`)}
/>
```

**Interface TypeScript:**
```typescript
interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: Date;
  relatedArticles?: string[];
}

interface WikiArticleViewProps {
  article: WikiArticle;
  onNavigate?: (articleId: string) => void;
  showTableOfContents?: boolean;
}
```

---

## 12. Landing - 6 Componentes

| Componente | Props | Descrição |
|------------|-------|-----------|
| `DemoAnimated` | `autoPlay`, `duration` | Demo animada |
| `FAQSection` | `faqs` | Seção de FAQ |
| `ScreenshotCarousel` | `screenshots` | Carrossel de screenshots |
| `ScreenshotPreview` | `src`, `alt` | Preview de screenshot |
| `StatsSection` | `stats` | Seção de estatísticas |
| `ThemeComparison` | `themes` | Comparação de temas |

---

## 13. Outros - 13 Componentes

### ErrorBoundary

**Localização:** `src/components/errors/ErrorBoundary.tsx`

```tsx
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

<ErrorBoundary 
  fallback={<ErrorFallback />}
  onError={(error, info) => logError(error, info)}
>
  <App />
</ErrorBoundary>
```

**Interface TypeScript:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}
```

---

### ContrastDebugPanel

**Localização:** `src/components/debug/ContrastDebugPanel.tsx`

```tsx
import { ContrastDebugPanel } from '@/components/debug/ContrastDebugPanel';

<ContrastDebugPanel 
  enabled={isDev}
  position="bottom-right"
/>
```

**Interface TypeScript:**
```typescript
interface ContrastDebugPanelProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

---

### Outros

| Componente | Props | Descrição |
|------------|-------|-----------|
| `SuspenseBoundary` | `fallback`, `children` | Wrapper de Suspense |
| `PageBoundary` | `children` | Error + Suspense boundary |
| `DevFileChangeMonitor` | `enabled` | Monitor de mudanças de arquivo |
| `CodePlayground` | `code`, `language` | Playground de código |
| `AuditLogViewer` | `logs`, `filters` | Visualizador de logs |
| `GuidedTour` | `steps`, `onComplete` | Tour guiado |
| `InteractiveTestMode` | `tests`, `onRun` | Modo de testes interativo |
| `KioskRemoteControl` | `machineId` | Controle remoto de kiosk |
| `AnimatedWeatherIcon` | `condition`, `size` | Ícone de clima animado |
| `AudioWaveformPreview` | `audioUrl` | Preview de waveform |
| `TraceViewer` | `traces` | Visualizador de traces |
| `ThemePreviewCard` | `theme`, `onClick` | Preview de tema Spicetify |

---

## Design Tokens

### Cores Semânticas

```css
:root {
  /* Background & Foreground */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  
  /* Primary */
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  
  /* Secondary */
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  
  /* Muted */
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  
  /* Accent */
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  
  /* Destructive */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  
  /* Border */
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
}
```

### Cores Kiosk Mode

```css
:root {
  --kiosk-bg: 0 0% 5%;
  --kiosk-surface: 0 0% 10%;
  --kiosk-primary: 180 100% 50%;
  --kiosk-text: 0 0% 95%;
}
```

### Cores por Gênero Musical

```css
:root {
  --genre-rock: 0 100% 50%;
  --genre-pop: 300 100% 50%;
  --genre-soul: 30 100% 50%;
  --genre-hip-hop: 270 100% 50%;
  --genre-electronic: 180 100% 50%;
  --genre-classical: 45 100% 50%;
  --genre-jazz: 200 100% 40%;
}
```

---

## Padrões de Uso

### Importação de Componentes

```tsx
// UI Base
import { Button, Card, Dialog } from '@/components/ui';

// Player
import { NowPlaying, AudioVisualizer } from '@/components/player';

// Settings
import { SettingsSection, AIConfigSection } from '@/components/settings';

// Auth
import { ProtectedRoute, PermissionGate } from '@/components/auth';
```

### Padrão de Composição

```tsx
// Componentes compostos (compound components)
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

// Render props
<DataTable
  data={data}
  columns={columns}
  renderRow={(row) => <CustomRow {...row} />}
/>

// Children as function
<AnimatePresence>
  {(isVisible) => isVisible && <AnimatedComponent />}
</AnimatePresence>
```

---

## Changelog

### v4.3.0 (2025-12-23)
- ✅ Adicionado `AIConfigSection` para configuração de APIs Claude/Manus
- ✅ Documentação expandida com TypeScript props detalhados
- ✅ Adicionados 61 componentes de Settings documentados

### v4.2.0 (2025-12-23)
- Versão inicial da documentação completa

---

**Licença:** Public Domain
