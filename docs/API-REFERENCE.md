# 📚 TSiJUKEBOX - API Reference

<p align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="120">
</p>

<p align="center">
  <strong>Documentação Completa de Hooks e Contexts</strong>
  <br>
  Versão 4.0.0 | Dezembro 2025
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Contexts-6-blue?style=flat-square" alt="Contexts">
  <img src="https://img.shields.io/badge/Hooks-52-green?style=flat-square" alt="Hooks">
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square" alt="TypeScript">
</p>

---

## 📑 Índice

- [Contexts](#-contexts)
  - [useTheme](#usetheme)
  - [useUser](#useuser)
  - [useAppSettings](#useappsettings)
  - [useSpotify](#usespotify)
  - [useYouTubeMusic](#useyoutubemusic)
  - [useSettings](#usesettings)
- [Hooks - Common](#-common-hooks)
  - [useTranslation](#usetranslation)
  - [useDebounce](#usedebounce)
  - [useTouchGestures](#usetouchgestures)
  - [useRipple](#useripple)
  - [useSoundEffects](#usesoundeffects)
  - [useGlobalSearch](#useglobalsearch)
  - [usePWAInstall](#usepwainstall)
  - [useFirstAccess](#usefirstaccess)
  - [useBackNavigation](#usebacknavigation)
  - [useMediaProviderStorage](#usemediaproviderstorage)
- [Hooks - Player](#-player-hooks)
  - [usePlayer](#useplayer)
  - [usePlaybackControls](#useplaybackcontrols)
  - [useVolume](#usevolume)
  - [useLyrics](#uselyrics)
  - [useLibrary](#uselibrary)
  - [useLocalMusic](#uselocalmusic)
  - [useSpicetifyIntegration](#usespicetifyintegration)
- [Hooks - System](#-system-hooks)
  - [useStatus](#usestatus)
  - [useNetworkStatus](#usenetworkstatus)
  - [useWeather](#useweather)
  - [useWeatherForecast](#useweatherforecast)
  - [useConnectionMonitor](#useconnectionmonitor)
  - [useWebSocketStatus](#usewebsocketstatus)
  - [useLogs](#uselogs)
  - [useMockData](#usemockdata)
  - [useStorjClient](#usestorjclient)
- [Hooks - Spotify](#-spotify-hooks)
  - [useSpotifyPlayer](#usespotifyplayer)
  - [useSpotifySearch](#usespotifysearch)
  - [useSpotifyLibrary](#usespotifylibrary)
  - [useSpotifyPlaylists](#usespotifyplaylists)
  - [useSpotifyBrowse](#usespotifybrowse)
  - [useSpotifyRecommendations](#usespotifyrecommendations)
- [Hooks - YouTube Music](#-youtube-music-hooks)
  - [useYouTubeMusicSearch](#useyoutubemusicsearch)
  - [useYouTubeMusicPlayer](#useyoutubemusicplayer)
  - [useYouTubeMusicLibrary](#useyoutubemusiclibrary)
- [Hooks - Auth](#-auth-hooks)
  - [useAuthConfig](#useauthconfig)
  - [useLocalAuth](#uselocalauth)
  - [useSupabaseAuth](#usesupabaseauth)
- [API Client](#-api-client)
- [Tipos](#-tipos)

---

## 🔄 Contexts

### useTheme

Hook para gerenciamento de tema, modo claro/escuro, idioma e preferências de acessibilidade.

**Importação:**
```typescript
import { useTheme } from '@/contexts';
// ou
import { useTheme } from '@/contexts/ThemeContext';
```

**Interface:**
```typescript
type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'custom';
type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  isDarkMode: boolean;
}
```

**Propriedades:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `theme` | `ThemeColor` | Cor atual do tema (blue, green, purple, orange, pink, custom) |
| `themeMode` | `ThemeMode` | Modo do tema (dark, light, system) |
| `language` | `Language` | Idioma atual (pt-BR, en, es) |
| `soundEnabled` | `boolean` | Se efeitos sonoros estão habilitados |
| `animationsEnabled` | `boolean` | Se animações estão habilitadas |
| `highContrast` | `boolean` | Modo alto contraste ativado |
| `reducedMotion` | `boolean` | Movimento reduzido ativado |
| `isDarkMode` | `boolean` | Computed: se está no modo escuro |

**Exemplo de Uso:**
```typescript
function ThemeToggle() {
  const { themeMode, setThemeMode, theme, setTheme, isDarkMode } = useTheme();
  
  return (
    <div className="flex gap-2">
      <button onClick={() => setThemeMode(isDarkMode ? 'light' : 'dark')}>
        {isDarkMode ? '🌙' : '☀️'}
      </button>
      
      <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeColor)}>
        <option value="blue">Azul</option>
        <option value="green">Verde</option>
        <option value="purple">Roxo</option>
      </select>
    </div>
  );
}
```

**Persistência:** 
- Tema: `localStorage.tsi_jukebox_theme`
- Modo: `localStorage.tsi_jukebox_theme_mode`
- Idioma: `localStorage.tsi_jukebox_language`
- Acessibilidade: `localStorage.tsi_jukebox_accessibility`

---

### useUser

Hook para gerenciamento de sessão, autenticação e permissões do usuário.

**Importação:**
```typescript
import { useUser } from '@/contexts';
// ou
import { useUser } from '@/contexts/UserContext';
```

**Interface:**
```typescript
type UserRole = 'admin' | 'user' | 'newbie';

interface UserContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
```

**Propriedades:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `user` | `User \| null` | Dados do usuário logado |
| `role` | `UserRole` | Role atual (admin, user, newbie) |
| `isAdmin` | `boolean` | Computed: se é administrador |
| `isAuthenticated` | `boolean` | Se está autenticado |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `login` | `LoginCredentials` | `Promise<void>` | Realiza login |
| `logout` | - | `Promise<void>` | Realiza logout |
| `updateProfile` | `Partial<User>` | `Promise<void>` | Atualiza perfil |
| `hasPermission` | `string` | `boolean` | Verifica permissão |

**Exemplo de Uso:**
```typescript
function UserBadge() {
  const { user, isAdmin, logout, isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return <LoginButton />;
  }
  
  return (
    <div className="flex items-center gap-2">
      <Avatar src={user?.avatar} />
      <span>{user?.name}</span>
      {isAdmin && <Badge variant="admin">Admin</Badge>}
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

### useAppSettings

Hook para configurações gerais da aplicação (providers de música, URLs, etc.).

**Importação:**
```typescript
import { useAppSettings } from '@/contexts';
// ou
import { useAppSettings } from '@/contexts/AppSettingsContext';
```

**Interface:**
```typescript
interface AppSettingsContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  spotifyEnabled: boolean;
  setSpotifyEnabled: (value: boolean) => void;
  youtubeMusicEnabled: boolean;
  setYouTubeMusicEnabled: (value: boolean) => void;
  localMusicEnabled: boolean;
  setLocalMusicEnabled: (value: boolean) => void;
  kioskMode: boolean;
  setKioskMode: (value: boolean) => void;
  weatherEnabled: boolean;
  setWeatherEnabled: (value: boolean) => void;
  ntpServer: string;
  setNtpServer: (server: string) => void;
}
```

**Exemplo de Uso:**
```typescript
function MusicProviderSettings() {
  const { 
    spotifyEnabled, setSpotifyEnabled,
    youtubeMusicEnabled, setYouTubeMusicEnabled,
    localMusicEnabled, setLocalMusicEnabled 
  } = useAppSettings();
  
  return (
    <div className="space-y-4">
      <Switch 
        checked={spotifyEnabled} 
        onCheckedChange={setSpotifyEnabled}
        label="Spotify"
      />
      <Switch 
        checked={youtubeMusicEnabled} 
        onCheckedChange={setYouTubeMusicEnabled}
        label="YouTube Music"
      />
      <Switch 
        checked={localMusicEnabled} 
        onCheckedChange={setLocalMusicEnabled}
        label="Música Local"
      />
    </div>
  );
}
```

---

### useSpotify

Hook para integração com Spotify (autenticação, credenciais, estado da conexão).

**Importação:**
```typescript
import { useSpotify } from '@/contexts';
// ou
import { useSpotify } from '@/contexts/SpotifyContext';
```

**Interface:**
```typescript
interface SpotifyContextType {
  isConnected: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: SpotifyUser | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshAccessToken: () => Promise<void>;
  clientId: string;
  setClientId: (id: string) => void;
  clientSecret: string;
  setClientSecret: (secret: string) => void;
}
```

**Exemplo de Uso:**
```typescript
function SpotifyConnection() {
  const { isConnected, connect, disconnect, user, isLoading } = useSpotify();
  
  if (isLoading) return <Spinner />;
  
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Avatar src={user?.images?.[0]?.url} />
        <span>{user?.display_name}</span>
        <button onClick={disconnect}>Desconectar</button>
      </div>
    );
  }
  
  return <button onClick={connect}>Conectar ao Spotify</button>;
}
```

---

### useYouTubeMusic

Hook para integração com YouTube Music.

**Importação:**
```typescript
import { useYouTubeMusic } from '@/contexts';
// ou
import { useYouTubeMusic } from '@/contexts/YouTubeMusicContext';
```

**Interface:**
```typescript
interface YouTubeMusicContextType {
  isConnected: boolean;
  isLoading: boolean;
  accessToken: string | null;
  user: YouTubeMusicUser | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}
```

---

### useSettings

Hook agregador que combina todos os contexts de configuração.

**Importação:**
```typescript
import { useSettings } from '@/contexts';
// ou
import { useSettings } from '@/contexts/SettingsContext';
```

**Interface:**
```typescript
interface SettingsContextType extends 
  ThemeContextType,
  AppSettingsContextType,
  SpotifyContextType,
  YouTubeMusicContextType {
  // Propriedades agregadas de todos os contexts
}
```

> ⚠️ **Nota:** Este context é um agregador. Prefira usar os contexts específicos quando possível para melhor performance.

---

## 🪝 Common Hooks

### useTranslation

Hook para internacionalização com suporte a 3 idiomas.

**Importação:**
```typescript
import { useTranslation } from '@/hooks/common';
```

**Interface:**
```typescript
interface UseTranslationReturn {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: readonly Language[];
}
```

**Exemplo de Uso:**
```typescript
function WelcomeMessage() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('player.nowPlaying', { track: 'Song Name' })}</p>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
        <option value="pt-BR">Português</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
```

**Idiomas Suportados:**
- `pt-BR` - Português (Brasil) - Padrão
- `en` - English
- `es` - Español

---

### useDebounce

Hook para debounce de valores.

**Importação:**
```typescript
import { useDebounce } from '@/hooks/common';
```

**Interface:**
```typescript
function useDebounce<T>(value: T, delay: number): T;
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `value` | `T` | Valor a ser "debounced" |
| `delay` | `number` | Delay em milissegundos |

**Exemplo de Uso:**
```typescript
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      searchApi(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <input 
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

---

### useTouchGestures

Hook para detecção de gestos touch em dispositivos móveis.

**Importação:**
```typescript
import { useTouchGestures } from '@/hooks/common';
```

**Interface:**
```typescript
interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Padrão: 50px
}

interface TouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

function useTouchGestures(options: TouchGestureOptions): TouchHandlers;
```

**Exemplo de Uso:**
```typescript
function SwipeablePlayer() {
  const handlers = useTouchGestures({
    onSwipeLeft: () => nextTrack(),
    onSwipeRight: () => prevTrack(),
    onSwipeUp: () => showQueue(),
    onSwipeDown: () => hideQueue(),
    threshold: 75,
  });
  
  return (
    <div {...handlers} className="player-container">
      <NowPlaying />
    </div>
  );
}
```

---

### useRipple

Hook para efeito ripple estilo Material Design.

**Importação:**
```typescript
import { useRipple } from '@/hooks/common';
```

**Interface:**
```typescript
interface RippleConfig {
  color?: string;
  duration?: number;
  disabled?: boolean;
}

function useRipple(config?: RippleConfig): {
  ripples: Ripple[];
  onMouseDown: (e: React.MouseEvent) => void;
};
```

**Exemplo de Uso:**
```typescript
function RippleButton({ children, onClick }) {
  const { ripples, onMouseDown } = useRipple({ color: 'rgba(255,255,255,0.3)' });
  
  return (
    <button 
      onClick={onClick}
      onMouseDown={onMouseDown}
      className="relative overflow-hidden"
    >
      {children}
      <RippleContainer ripples={ripples} />
    </button>
  );
}
```

---

### useSoundEffects

Hook para efeitos sonoros de feedback.

**Importação:**
```typescript
import { useSoundEffects } from '@/hooks/common';
```

**Interface:**
```typescript
interface UseSoundEffectsReturn {
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  playNotification: () => void;
  isEnabled: boolean;
}

function useSoundEffects(): UseSoundEffectsReturn;
```

**Exemplo de Uso:**
```typescript
function ActionButton({ onClick, children }) {
  const { playClick } = useSoundEffects();
  
  const handleClick = () => {
    playClick();
    onClick();
  };
  
  return <button onClick={handleClick}>{children}</button>;
}
```

---

### useGlobalSearch

Hook para busca global unificada.

**Importação:**
```typescript
import { useGlobalSearch } from '@/hooks/common';
```

**Interface:**
```typescript
interface GlobalSearchResult {
  type: 'track' | 'artist' | 'album' | 'playlist' | 'page';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  action: () => void;
}

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: GlobalSearchResult[];
  isLoading: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}
```

---

### usePWAInstall

Hook para instalação de PWA.

**Importação:**
```typescript
import { usePWAInstall } from '@/hooks/common';
```

**Interface:**
```typescript
interface UsePWAInstallReturn {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}
```

**Exemplo de Uso:**
```typescript
function InstallPrompt() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  
  if (isInstalled || !canInstall) return null;
  
  return (
    <div className="install-banner">
      <p>Instale o TSiJUKEBOX para melhor experiência</p>
      <button onClick={install}>Instalar</button>
    </div>
  );
}
```

---

### useFirstAccess

Hook para detecção de primeiro acesso.

**Importação:**
```typescript
import { useFirstAccess } from '@/hooks/common';
```

**Interface:**
```typescript
function useFirstAccess(): {
  isFirstAccess: boolean;
  markAsAccessed: () => void;
};
```

---

### useBackNavigation

Hook para navegação com histórico de voltar.

**Importação:**
```typescript
import { useBackNavigation } from '@/hooks/common';
```

**Interface:**
```typescript
function useBackNavigation(fallbackPath?: string): {
  goBack: () => void;
  canGoBack: boolean;
};
```

---

### useMediaProviderStorage

Hook para persistência de provider de mídia selecionado.

**Importação:**
```typescript
import { useMediaProviderStorage } from '@/hooks/common';
```

**Interface:**
```typescript
type MediaProvider = 'spotify' | 'youtube' | 'local';

function useMediaProviderStorage(): {
  provider: MediaProvider;
  setProvider: (provider: MediaProvider) => void;
};
```

---

## 🎵 Player Hooks

### usePlayer

Hook principal para controle de reprodução.

**Importação:**
```typescript
import { usePlayer } from '@/hooks/player';
```

**Interface:**
```typescript
interface UsePlayerReturn {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  isLoading: boolean;
}
```

**Exemplo de Uso:**
```typescript
function PlayerControls() {
  const { play, pause, next, prev, isLoading } = usePlayer();
  const { isPlaying } = useStatus();
  
  return (
    <div className="flex items-center gap-4">
      <button onClick={prev} disabled={isLoading}>
        <SkipBack />
      </button>
      
      <button onClick={isPlaying ? pause : play} disabled={isLoading}>
        {isPlaying ? <Pause /> : <Play />}
      </button>
      
      <button onClick={next} disabled={isLoading}>
        <SkipForward />
      </button>
    </div>
  );
}
```

---

### usePlaybackControls

Hook para controles avançados de reprodução (queue, shuffle, repeat).

**Importação:**
```typescript
import { usePlaybackControls } from '@/hooks/player';
```

**Interface:**
```typescript
type RepeatMode = 'off' | 'track' | 'queue';

interface UsePlaybackControlsReturn {
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeat: RepeatMode;
  setRepeat: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
}
```

**Exemplo de Uso:**
```typescript
function QueueControls() {
  const { queue, shuffle, toggleShuffle, repeat, cycleRepeat, clearQueue } = usePlaybackControls();
  
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleShuffle}
        className={shuffle ? 'text-primary' : 'text-muted-foreground'}
      >
        <Shuffle />
      </button>
      
      <button onClick={cycleRepeat}>
        {repeat === 'track' ? <Repeat1 /> : <Repeat />}
      </button>
      
      <span>{queue.length} na fila</span>
      
      <button onClick={clearQueue}>Limpar</button>
    </div>
  );
}
```

---

### useVolume

Hook para controle de volume.

**Importação:**
```typescript
import { useVolume } from '@/hooks/player';
```

**Interface:**
```typescript
interface UseVolumeReturn {
  volume: number; // 0-100
  setVolume: (volume: number) => void;
  muted: boolean;
  toggleMute: () => void;
  increaseVolume: (amount?: number) => void;
  decreaseVolume: (amount?: number) => void;
}
```

**Exemplo de Uso:**
```typescript
function VolumeControl() {
  const { volume, setVolume, muted, toggleMute } = useVolume();
  
  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleMute}>
        {muted ? <VolumeX /> : volume > 50 ? <Volume2 /> : <Volume1 />}
      </button>
      <Slider 
        value={[muted ? 0 : volume]} 
        onValueChange={([v]) => setVolume(v)}
        max={100}
      />
    </div>
  );
}
```

---

### useLyrics

Hook para sincronização de letras.

**Importação:**
```typescript
import { useLyrics } from '@/hooks/player';
```

**Interface:**
```typescript
interface LyricLine {
  time: number; // segundos
  text: string;
}

interface UseLyricsReturn {
  lyrics: LyricLine[];
  currentLine: number;
  isLoading: boolean;
  error: Error | null;
  hasLyrics: boolean;
}
```

**Exemplo de Uso:**
```typescript
function KaraokeLyrics() {
  const { lyrics, currentLine, hasLyrics, isLoading } = useLyrics();
  
  if (isLoading) return <Skeleton />;
  if (!hasLyrics) return <p>Letra não disponível</p>;
  
  return (
    <div className="lyrics-container">
      {lyrics.map((line, index) => (
        <p 
          key={index}
          className={cn(
            'transition-all',
            index === currentLine && 'text-primary scale-110 font-bold'
          )}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}
```

---

### useLibrary

Hook para gerenciamento da biblioteca local.

**Importação:**
```typescript
import { useLibrary } from '@/hooks/player';
```

**Interface:**
```typescript
interface UseLibraryReturn {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  isLoading: boolean;
  refresh: () => void;
  search: (query: string) => Track[];
  addToPlaylist: (trackId: string, playlistId: string) => void;
  createPlaylist: (name: string) => Playlist;
}
```

---

### useLocalMusic

Hook para música local (arquivos MP3/FLAC).

**Importação:**
```typescript
import { useLocalMusic } from '@/hooks/player';
```

**Interface:**
```typescript
interface UseLocalMusicReturn {
  tracks: LocalTrack[];
  isScanning: boolean;
  scanDirectory: (path: string) => Promise<void>;
  getAudioUrl: (trackId: string) => string;
  importFiles: (files: File[]) => Promise<void>;
}
```

---

### useSpicetifyIntegration

Hook para integração com Spicetify.

**Importação:**
```typescript
import { useSpicetifyIntegration } from '@/hooks/player';
```

**Interface:**
```typescript
interface UseSpicetifyIntegrationReturn {
  isAvailable: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  currentTrack: SpicetifyTrack | null;
  controlPlayer: (action: string) => void;
}
```

---

## 🖥️ System Hooks

### useStatus

Hook para estado do sistema e player.

**Importação:**
```typescript
import { useStatus } from '@/hooks/system';
```

**Interface:**
```typescript
interface SystemStatus {
  isPlaying: boolean;
  currentTrack: Track | null;
  position: number;
  duration: number;
  cpu: number;
  memory: number;
  temperature: number;
  uptime: number;
}

interface UseStatusReturn {
  status: SystemStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Exemplo de Uso:**
```typescript
function SystemMonitor() {
  const { status, isLoading } = useStatus();
  
  if (isLoading || !status) return <Skeleton />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>CPU</CardHeader>
        <CardContent>{status.cpu}%</CardContent>
      </Card>
      <Card>
        <CardHeader>RAM</CardHeader>
        <CardContent>{status.memory}%</CardContent>
      </Card>
      <Card>
        <CardHeader>Temp</CardHeader>
        <CardContent>{status.temperature}°C</CardContent>
      </Card>
    </div>
  );
}
```

---

### useNetworkStatus

Hook para status de conexão de rede.

**Importação:**
```typescript
import { useNetworkStatus } from '@/hooks/system';
```

**Interface:**
```typescript
interface UseNetworkStatusReturn {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | null;
  downlink: number | null;
  rtt: number | null;
}
```

---

### useWeather

Hook para dados climáticos.

**Importação:**
```typescript
import { useWeather } from '@/hooks/system';
```

**Interface:**
```typescript
interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
  windSpeed: number;
  pressure: number;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

---

### useWeatherForecast

Hook para previsão estendida.

**Importação:**
```typescript
import { useWeatherForecast } from '@/hooks/system';
```

**Interface:**
```typescript
interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
}

interface UseWeatherForecastReturn {
  forecast: ForecastDay[];
  isLoading: boolean;
  error: Error | null;
}
```

---

### useConnectionMonitor

Hook para monitoramento de conexão com backend.

**Importação:**
```typescript
import { useConnectionMonitor } from '@/hooks/system';
```

**Interface:**
```typescript
interface UseConnectionMonitorReturn {
  isConnected: boolean;
  latency: number | null;
  lastCheck: Date | null;
  checkConnection: () => Promise<boolean>;
}
```

---

### useWebSocketStatus

Hook para status de conexão WebSocket.

**Importação:**
```typescript
import { useWebSocketStatus } from '@/hooks/system';
```

**Interface:**
```typescript
type WebSocketState = 'connecting' | 'open' | 'closing' | 'closed';

interface UseWebSocketStatusReturn {
  state: WebSocketState;
  isConnected: boolean;
  reconnect: () => void;
}
```

---

### useLogs

Hook para logs do sistema.

**Importação:**
```typescript
import { useLogs } from '@/hooks/system';
```

**Interface:**
```typescript
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

interface UseLogsReturn {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  filterByLevel: (level: string) => LogEntry[];
}
```

---

### useMockData

Hook para dados mock em desenvolvimento.

**Importação:**
```typescript
import { useMockData } from '@/hooks/system';
```

**Interface:**
```typescript
interface UseMockDataReturn {
  isMockEnabled: boolean;
  enableMock: () => void;
  disableMock: () => void;
  mockStatus: SystemStatus;
  mockWeather: WeatherData;
}
```

---

### useStorjClient

Hook para integração com Storj (backup cloud).

**Importação:**
```typescript
import { useStorjClient } from '@/hooks/system';
```

**Interface:**
```typescript
interface UseStorjClientReturn {
  isConfigured: boolean;
  isConnected: boolean;
  connect: (credentials: StorjCredentials) => Promise<void>;
  disconnect: () => void;
  upload: (file: File, path: string) => Promise<string>;
  download: (path: string) => Promise<Blob>;
  listFiles: (path: string) => Promise<StorjFile[]>;
}
```

---

## 🎧 Spotify Hooks

### useSpotifyPlayer

Hook para controle do player Spotify.

**Importação:**
```typescript
import { useSpotifyPlayer } from '@/hooks/spotify';
```

**Interface:**
```typescript
interface UseSpotifyPlayerReturn {
  play: (uri?: string) => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
}
```

---

### useSpotifySearch

Hook para busca no Spotify.

**Importação:**
```typescript
import { useSpotifySearch, type SearchType } from '@/hooks/spotify';
```

**Interface:**
```typescript
type SearchType = 'track' | 'album' | 'artist' | 'playlist';

interface UseSpotifySearchReturn {
  search: (query: string, types: SearchType[]) => Promise<void>;
  results: SpotifySearchResults;
  isLoading: boolean;
  error: Error | null;
  clear: () => void;
}
```

**Exemplo de Uso:**
```typescript
function SpotifySearch() {
  const { search, results, isLoading } = useSpotifySearch();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery, ['track', 'artist', 'album']);
    }
  }, [debouncedQuery]);
  
  return (
    <div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <TrackList tracks={results.tracks} />
          <ArtistList artists={results.artists} />
          <AlbumList albums={results.albums} />
        </div>
      )}
    </div>
  );
}
```

---

### useSpotifyLibrary

Hook para biblioteca do Spotify.

**Importação:**
```typescript
import { useSpotifyLibrary } from '@/hooks/spotify';
```

**Interface:**
```typescript
interface UseSpotifyLibraryReturn {
  savedTracks: SpotifyTrack[];
  savedAlbums: SpotifyAlbum[];
  followedArtists: SpotifyArtist[];
  isLoading: boolean;
  saveTrack: (trackId: string) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
  isTrackSaved: (trackId: string) => boolean;
}
```

---

### useSpotifyPlaylists

Hook para playlists do Spotify.

**Importação:**
```typescript
import { useSpotifyPlaylists, useSpotifyPlaylist } from '@/hooks/spotify';
```

**Interface:**
```typescript
// Lista de playlists
interface UseSpotifyPlaylistsReturn {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  createPlaylist: (name: string, description?: string) => Promise<SpotifyPlaylist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
}

// Playlist individual
interface UseSpotifyPlaylistReturn {
  playlist: SpotifyPlaylist | null;
  tracks: SpotifyTrack[];
  isLoading: boolean;
  addTrack: (trackUri: string) => Promise<void>;
  removeTrack: (trackUri: string) => Promise<void>;
  reorderTracks: (rangeStart: number, insertBefore: number) => Promise<void>;
}
```

---

### useSpotifyBrowse

Hook para navegação e descoberta no Spotify.

**Importação:**
```typescript
import { useSpotifyBrowse } from '@/hooks/spotify';
```

**Interface:**
```typescript
interface UseSpotifyBrowseReturn {
  newReleases: SpotifyAlbum[];
  featuredPlaylists: SpotifyPlaylist[];
  categories: SpotifyCategory[];
  isLoading: boolean;
  getCategoryPlaylists: (categoryId: string) => Promise<SpotifyPlaylist[]>;
}
```

---

### useSpotifyRecommendations

Hook para recomendações personalizadas.

**Importação:**
```typescript
import { useSpotifyRecommendations } from '@/hooks/spotify';
```

**Interface:**
```typescript
interface RecommendationSeeds {
  seedTracks?: string[];
  seedArtists?: string[];
  seedGenres?: string[];
}

interface UseSpotifyRecommendationsReturn {
  recommendations: SpotifyTrack[];
  isLoading: boolean;
  getRecommendations: (seeds: RecommendationSeeds) => Promise<void>;
  availableGenres: string[];
}
```

---

## 🎬 YouTube Music Hooks

### useYouTubeMusicSearch

Hook para busca no YouTube Music.

**Importação:**
```typescript
import { useYouTubeMusicSearch } from '@/hooks/youtube';
```

**Interface:**
```typescript
interface UseYouTubeMusicSearchReturn {
  search: (query: string) => Promise<void>;
  results: {
    tracks: YouTubeMusicTrack[];
    albums: YouTubeMusicAlbum[];
    playlists: YouTubeMusicPlaylist[];
  };
  isLoading: boolean;
  error: Error | null;
}
```

---

### useYouTubeMusicPlayer

Hook para player do YouTube Music.

**Importação:**
```typescript
import { useYouTubeMusicPlayer } from '@/hooks/youtube';
```

**Interface:**
```typescript
interface UseYouTubeMusicPlayerReturn {
  play: (videoId: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  currentTrack: YouTubeMusicTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
}
```

---

### useYouTubeMusicLibrary

Hook para biblioteca do YouTube Music.

**Importação:**
```typescript
import { useYouTubeMusicLibrary } from '@/hooks/youtube';
```

**Interface:**
```typescript
interface UseYouTubeMusicLibraryReturn {
  likedSongs: YouTubeMusicTrack[];
  playlists: YouTubeMusicPlaylist[];
  albums: YouTubeMusicAlbum[];
  isLoading: boolean;
  likeTrack: (videoId: string) => Promise<void>;
  unlikeTrack: (videoId: string) => Promise<void>;
}
```

---

## 🔐 Auth Hooks

### useAuthConfig

Hook para configuração de autenticação.

**Importação:**
```typescript
import { useAuthConfig } from '@/hooks/auth';
```

**Interface:**
```typescript
type AuthProvider = 'local' | 'supabase';

interface UseAuthConfigReturn {
  provider: AuthProvider;
  setProvider: (provider: AuthProvider) => void;
  isConfigured: boolean;
  configure: (config: AuthConfig) => void;
}
```

---

### useLocalAuth

Hook para autenticação local (sem Supabase).

**Importação:**
```typescript
import { useLocalAuth } from '@/hooks/auth';
```

**Interface:**
```typescript
interface UseLocalAuthReturn {
  user: LocalUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  users: LocalUser[];
  deleteUser: (userId: string) => boolean;
}
```

**Exemplo de Uso:**
```typescript
function LocalLogin() {
  const { login, isAuthenticated, user } = useLocalAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      toast.success('Login realizado!');
    } else {
      toast.error('Credenciais inválidas');
    }
  };
  
  if (isAuthenticated) {
    return <p>Bem-vindo, {user?.username}!</p>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Entrar</Button>
    </form>
  );
}
```

---

### useSupabaseAuth

Hook para autenticação via Supabase.

**Importação:**
```typescript
import { useSupabaseAuth } from '@/hooks/auth';
```

**Interface:**
```typescript
interface UseSupabaseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
```

---

## 📡 API Client

### ApiClient

Cliente HTTP para comunicação com o backend.

**Importação:**
```typescript
import { api } from '@/lib/api/client';
```

**Métodos Disponíveis:**

| Método | Descrição |
|--------|-----------|
| `api.getStatus()` | Obtém status do sistema |
| `api.controlPlayback(action)` | Controla reprodução |
| `api.setVolume(level)` | Define volume |
| `api.getQueue()` | Obtém fila de reprodução |
| `api.addToQueue(track)` | Adiciona à fila |
| `api.getLyrics(trackId)` | Obtém letras |
| `api.getWeather()` | Obtém dados climáticos |

**Exemplo de Uso:**
```typescript
import { api } from '@/lib/api/client';

// Obter status
const status = await api.getStatus();

// Controlar player
await api.controlPlayback({ action: 'play' });
await api.controlPlayback({ action: 'pause' });
await api.controlPlayback({ action: 'next' });

// Ajustar volume
await api.setVolume(75);
```

---

## 📋 Tipos

### Track
```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  albumArt?: string;
  uri?: string;
  provider: 'spotify' | 'youtube' | 'local';
}
```

### User
```typescript
interface User {
  id: string;
  email?: string;
  username: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'newbie';
  createdAt: Date;
}
```

### Playlist
```typescript
interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  owner: string;
  isPublic: boolean;
  createdAt: Date;
}
```

---

## 📚 Recursos Adicionais

- [Project Map](PROJECT-MAP.md) - Mapa completo de arquivos
- [Architecture Analysis](ARCHITECTURE-ANALYSIS.md) - Análise de arquitetura
- [Developer Guide](DEVELOPER-GUIDE.md) - Guia do desenvolvedor
- [Backend Endpoints](BACKEND-ENDPOINTS.md) - Documentação de Edge Functions

---

<p align="center">
  <strong>TSiJUKEBOX API Reference</strong>
  <br>
  Versão 4.0.0 | Gerado automaticamente em Dezembro 2025
</p>
