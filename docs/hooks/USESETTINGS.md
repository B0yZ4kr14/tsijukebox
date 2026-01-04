# useSettings

**Tipo:** React Hook (Context)  
**Localização:** `src/contexts/SettingsContext.tsx`  
**Versão:** 1.0.0  
**Categoria:** Configuration & State Management

---

## Descrição

O hook `useSettings` fornece acesso centralizado a todas as configurações do TSiJUKEBOX através de um **Context API unificado**. Agrega configurações de múltiplos contextos (Spotify, YouTube Music, Theme, App Settings) em uma interface única e consistente.

**Principais recursos:**
- Gerenciamento centralizado de configurações
- Persistência automática em localStorage
- Integração com Spotify e YouTube Music
- Controle de tema e idioma
- Configurações de API e WebSocket
- Modo demo para desenvolvimento
- Otimização com useMemo

---

## Uso Básico

```typescript
import { useSettings } from '@/contexts/SettingsContext';

function SettingsPanel() {
  const {
    isDemoMode,
    setDemoMode,
    theme,
    setTheme,
    language,
    setLanguage,
    spotify,
    youtubeMusic
  } = useSettings();

  return (
    <div>
      <h2>Configurações</h2>
      
      {/* Modo Demo */}
      <label>
        <input
          type="checkbox"
          checked={isDemoMode}
          onChange={(e) => setDemoMode(e.target.checked)}
        />
        Modo Demo
      </label>

      {/* Tema */}
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="dark">Escuro</option>
        <option value="light">Claro</option>
        <option value="auto">Automático</option>
      </select>

      {/* Status Spotify */}
      <p>Spotify: {spotify.isConnected ? 'Conectado' : 'Desconectado'}</p>
    </div>
  );
}
```

---

## Retorno

### `SettingsContextType`

O hook retorna um objeto com todas as configurações e funções de controle.

---

## Configurações de Aplicação

### `isDemoMode`: `boolean`

Indica se o modo demo está ativo (dados mockados).

**Padrão:** `false`

---

### `setDemoMode`: `(value: boolean) => void`

Ativa/desativa o modo demo.

**Exemplo:**
```typescript
setDemoMode(true); // Ativar modo demo
```

---

### `apiUrl`: `string`

URL base da API do backend.

**Padrão:** `http://localhost:3000`

---

### `setApiUrl`: `(value: string) => void`

Define a URL da API.

**Exemplo:**
```typescript
setApiUrl('https://api.tsijukebox.com');
```

---

### `useWebSocket`: `boolean`

Indica se WebSocket está habilitado para comunicação em tempo real.

**Padrão:** `true`

---

### `setUseWebSocket`: `(value: boolean) => void`

Habilita/desabilita WebSocket.

---

### `pollingInterval`: `number`

Intervalo de polling em milissegundos (quando WebSocket está desabilitado).

**Padrão:** `5000` (5 segundos)

---

### `setPollingInterval`: `(value: number) => void`

Define o intervalo de polling.

**Exemplo:**
```typescript
setPollingInterval(10000); // 10 segundos
```

---

## Configurações do Spotify

### `spotify`: `SpotifySettings`

Configurações e estado do Spotify.

**Tipo `SpotifySettings`:**
```typescript
interface SpotifySettings {
  clientId: string;
  clientSecret: string;
  isConnected: boolean;
  tokens: SpotifyTokens | null;
  user: SpotifyUser | null;
}

interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  images: Array<{ url: string }>;
  product: 'free' | 'premium';
}
```

---

### `setSpotifyCredentials`: `(clientId: string, clientSecret: string) => void`

Define as credenciais OAuth do Spotify.

**Exemplo:**
```typescript
setSpotifyCredentials(
  'seu_client_id',
  'seu_client_secret'
);
```

---

### `setSpotifyTokens`: `(tokens: SpotifyTokens | null) => void`

Define os tokens de autenticação do Spotify.

---

### `setSpotifyUser`: `(user: SpotifyUser | null) => void`

Define os dados do usuário Spotify.

---

### `clearSpotifyAuth`: `() => void`

Limpa toda a autenticação do Spotify.

**Exemplo:**
```typescript
// Desconectar Spotify
clearSpotifyAuth();
```

---

## Configurações do YouTube Music

### `youtubeMusic`: `YouTubeMusicSettings`

Configurações e estado do YouTube Music.

**Tipo `YouTubeMusicSettings`:**
```typescript
interface YouTubeMusicSettings {
  clientId: string;
  clientSecret: string;
  isConnected: boolean;
  tokens: YouTubeMusicTokens | null;
  user: YouTubeMusicUser | null;
}
```

---

### `setYouTubeMusicCredentials`: `(clientId: string, clientSecret: string) => void`

Define as credenciais OAuth do YouTube Music.

---

### `setYouTubeMusicTokens`: `(tokens: YouTubeMusicTokens | null) => void`

Define os tokens de autenticação do YouTube Music.

---

### `setYouTubeMusicUser`: `(user: YouTubeMusicUser | null) => void`

Define os dados do usuário YouTube Music.

---

### `clearYouTubeMusicAuth`: `() => void`

Limpa toda a autenticação do YouTube Music.

---

## Configurações de Tema

### `theme`: `ThemeColor`

Tema de cores atual.

**Tipo `ThemeColor`:**
```typescript
type ThemeColor = 'dark' | 'light' | 'auto';
```

**Padrão:** `'dark'`

---

### `setTheme`: `(theme: ThemeColor) => void`

Define o tema de cores.

**Exemplo:**
```typescript
setTheme('dark');  // Tema escuro
setTheme('light'); // Tema claro
setTheme('auto');  // Automático (sistema)
```

---

### `language`: `Language`

Idioma da interface.

**Tipo `Language`:**
```typescript
type Language = 'pt-BR' | 'en-US' | 'es-ES';
```

**Padrão:** `'pt-BR'`

---

### `setLanguage`: `(lang: Language) => void`

Define o idioma da interface.

**Exemplo:**
```typescript
setLanguage('en-US'); // Inglês
setLanguage('pt-BR'); // Português
setLanguage('es-ES'); // Espanhol
```

---

## Configurações de UI

### `soundEnabled`: `boolean`

Indica se efeitos sonoros estão habilitados.

**Padrão:** `true`

---

### `setSoundEnabled`: `(value: boolean) => void`

Habilita/desabilita efeitos sonoros.

---

### `animationsEnabled`: `boolean`

Indica se animações estão habilitadas.

**Padrão:** `true`

---

### `setAnimationsEnabled`: `(value: boolean) => void`

Habilita/desabilita animações.

---

## Configurações Adicionais

### `spicetify`: `SpicetifySettings`

Configurações do Spicetify (customização do Spotify Desktop).

**Tipo `SpicetifySettings`:**
```typescript
interface SpicetifySettings {
  isInstalled: boolean;
  currentTheme: string;
  version: string;
}
```

---

### `setSpicetifyConfig`: `(config: Partial<SpicetifySettings>) => void`

Atualiza configurações do Spicetify.

---

### `musicProvider`: `MusicProvider`

Provedor de música ativo.

**Tipo `MusicProvider`:**
```typescript
type MusicProvider = 'spotify' | 'youtube' | 'local';
```

---

### `setMusicProvider`: `(provider: MusicProvider) => void`

Define o provedor de música ativo.

**Exemplo:**
```typescript
setMusicProvider('spotify');  // Usar Spotify
setMusicProvider('youtube');  // Usar YouTube Music
setMusicProvider('local');    // Usar biblioteca local
```

---

### `weather`: `WeatherSettings`

Configurações do widget de clima.

**Tipo `WeatherSettings`:**
```typescript
interface WeatherSettings {
  apiKey: string;
  city: string;
  isEnabled: boolean;
}
```

---

### `setWeatherConfig`: `(config: Partial<WeatherSettings>) => void`

Atualiza configurações do clima.

**Exemplo:**
```typescript
setWeatherConfig({
  apiKey: 'sua_api_key',
  city: 'São Paulo',
  isEnabled: true
});
```

---

## Exemplo Completo: Painel de Configurações

```typescript
import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Music, 
  Palette, 
  Globe,
  Volume2,
  Sparkles
} from 'lucide-react';

function SettingsPage() {
  const {
    isDemoMode,
    setDemoMode,
    theme,
    setTheme,
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,
    animationsEnabled,
    setAnimationsEnabled,
    musicProvider,
    setMusicProvider,
    spotify,
    youtubeMusic,
    clearSpotifyAuth,
    clearYouTubeMusicAuth,
    apiUrl,
    setApiUrl,
    useWebSocket,
    setUseWebSocket
  } = useSettings();

  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  const handleSaveApiUrl = () => {
    setApiUrl(tempApiUrl);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      {/* Geral */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Geral</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Modo Demo */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Demo</p>
              <p className="text-sm text-muted-foreground">
                Usar dados mockados para testes
              </p>
            </div>
            <Switch
              checked={isDemoMode}
              onCheckedChange={setDemoMode}
            />
          </div>

          {/* WebSocket */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">WebSocket</p>
              <p className="text-sm text-muted-foreground">
                Comunicação em tempo real
              </p>
            </div>
            <Switch
              checked={useWebSocket}
              onCheckedChange={setUseWebSocket}
            />
          </div>

          {/* API URL */}
          <div>
            <label className="font-medium block mb-2">
              URL da API
            </label>
            <div className="flex gap-2">
              <Input
                value={tempApiUrl}
                onChange={(e) => setTempApiUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
              <Button onClick={handleSaveApiUrl}>
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Aparência</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tema */}
          <div>
            <label className="font-medium block mb-2">
              Tema
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeColor)}
              className="w-full p-2 rounded-lg border bg-background"
            >
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          {/* Efeitos Sonoros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <p className="font-medium">Efeitos Sonoros</p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {/* Animações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <p className="font-medium">Animações</p>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Idioma */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Idioma</h2>
          </div>
        </CardHeader>
        <CardContent>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full p-2 rounded-lg border bg-background"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </CardContent>
      </Card>

      {/* Provedor de Música */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Provedor de Música</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor */}
          <div>
            <label className="font-medium block mb-2">
              Provedor Ativo
            </label>
            <select
              value={musicProvider}
              onChange={(e) => setMusicProvider(e.target.value as MusicProvider)}
              className="w-full p-2 rounded-lg border bg-background"
            >
              <option value="spotify">Spotify</option>
              <option value="youtube">YouTube Music</option>
              <option value="local">Biblioteca Local</option>
            </select>
          </div>

          {/* Status Spotify */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Spotify</p>
              <span className={`text-sm ${
                spotify.isConnected 
                  ? 'text-green-500' 
                  : 'text-muted-foreground'
              }`}>
                {spotify.isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            {spotify.isConnected && spotify.user && (
              <div className="space-y-2">
                <p className="text-sm">
                  Usuário: {spotify.user.displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Plano: {spotify.user.product}
                </p>
                <Button
                  onClick={clearSpotifyAuth}
                  variant="outline"
                  size="sm"
                >
                  Desconectar
                </Button>
              </div>
            )}
          </div>

          {/* Status YouTube Music */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">YouTube Music</p>
              <span className={`text-sm ${
                youtubeMusic.isConnected 
                  ? 'text-green-500' 
                  : 'text-muted-foreground'
              }`}>
                {youtubeMusic.isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            {youtubeMusic.isConnected && youtubeMusic.user && (
              <div className="space-y-2">
                <p className="text-sm">
                  Usuário: {youtubeMusic.user.displayName}
                </p>
                <Button
                  onClick={clearYouTubeMusicAuth}
                  variant="outline"
                  size="sm"
                >
                  Desconectar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
```

---

## Persistência

As configurações são automaticamente salvas em **localStorage** através de múltiplos contextos:

### Chaves de Storage

| Contexto | Chave | Conteúdo |
|----------|-------|----------|
| App Settings | `tsijukebox-app-settings` | Configurações gerais |
| Spotify | `tsijukebox-spotify` | Credenciais e tokens |
| YouTube Music | `tsijukebox-youtube-music` | Credenciais e tokens |
| Theme | `tsijukebox-theme` | Tema e preferências UI |

---

## Estrutura de Contextos

O `useSettings` agrega 4 contextos especializados:

```
SettingsContext (Agregador)
├── AppSettingsContext (Configurações gerais)
├── SpotifyContext (Integração Spotify)
├── YouTubeMusicContext (Integração YouTube Music)
└── ThemeContext (Tema e UI)
```

**Vantagens:**
- ✅ Separação de responsabilidades
- ✅ Otimização com useMemo
- ✅ Re-renders minimizados
- ✅ Fácil manutenção

---

## Performance

### Otimizações

1. **useMemo** - Valor do contexto memoizado
2. **Contextos separados** - Re-renders isolados
3. **Lazy loading** - Contextos carregados sob demanda
4. **Debounce** - Salvamento em localStorage debounced

### Recomendações

```typescript
// ❌ Evitar
function Component() {
  const settings = useSettings();
  // Re-render em qualquer mudança
}

// ✅ Preferir
function Component() {
  const { theme, setTheme } = useSettings();
  // Re-render apenas quando theme muda
}
```

---

## Migração de Versões Antigas

### De configurações separadas para useSettings

```typescript
// ❌ Antes (múltiplos hooks)
import { useSpotify } from '@/contexts/SpotifyContext';
import { useTheme } from '@/contexts/ThemeContext';

function Component() {
  const spotify = useSpotify();
  const theme = useTheme();
}

// ✅ Depois (hook unificado)
import { useSettings } from '@/contexts/SettingsContext';

function Component() {
  const { spotify, theme } = useSettings();
}
```

---

## Tratamento de Erros

```typescript
try {
  const { spotify } = useSettings();
  
  if (!spotify.isConnected) {
    throw new Error('Spotify não conectado');
  }
  
  // Usar spotify...
} catch (error) {
  console.error('Erro:', error);
  toast.error('Configure o Spotify nas configurações');
}
```

---

## Acessibilidade

- ✅ Suporte a temas claro/escuro
- ✅ Controle de animações (motion-safe)
- ✅ Múltiplos idiomas
- ✅ Persistência de preferências

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';

describe('useSettings', () => {
  it('should toggle demo mode', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider
    });

    act(() => {
      result.current.setDemoMode(true);
    });

    expect(result.current.isDemoMode).toBe(true);
  });

  it('should change theme', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider
    });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });
});
```

---

## Notas

- Requer **SettingsProvider** no topo da árvore de componentes
- Configurações são **persistidas automaticamente**
- Tokens OAuth são **criptografados** no localStorage
- Suporta **hot reload** sem perda de estado

---

## Relacionados

- [useTheme](./USETHEME.md) - Hook de tema
- [useSpotify](./USESPOTIFY.md) - Hook do Spotify
- [useYouTube](./USEYOUTUBE.md) - Hook do YouTube Music
- [SettingsContext](../contexts/SETTINGS_CONTEXT.md)
- [Guia de Configuração](../guides/CONFIGURATION.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Context API unificado
- ✅ Agregação de 4 contextos especializados
- ✅ Persistência automática
- ✅ Otimização com useMemo
- ✅ Suporte a múltiplos provedores de música
- ✅ Documentação completa
