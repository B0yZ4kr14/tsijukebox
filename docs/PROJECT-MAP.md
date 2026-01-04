# 🗺️ TSiJUKEBOX - Mapa Completo do Projeto

<p align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="120">
</p>

<p align="center">
  <strong>Documentação Técnica - Mapa de Arquivos do Front-End</strong>
  <br>
  Versão 4.0.0 | Dezembro 2025
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Páginas-32-blue?style=flat-square" alt="Pages">
  <img src="https://img.shields.io/badge/Componentes-95+-green?style=flat-square" alt="Components">
  <img src="https://img.shields.io/badge/Hooks-52-purple?style=flat-square" alt="Hooks">
  <img src="https://img.shields.io/badge/Contexts-6-orange?style=flat-square" alt="Contexts">
  <img src="https://img.shields.io/badge/Linhas_de_Código-15K+-red?style=flat-square" alt="LOC">
</p>

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Páginas (32)](#-páginas-32)
- [Componentes (95+)](#-componentes-95)
  - [UI Components (50+)](#ui-components-50)
  - [Player Components (12)](#player-components-12)
  - [Settings Components (28)](#settings-components-28)
  - [Auth Components (6)](#auth-components-6)
  - [Spotify Components (8)](#spotify-components-8)
  - [YouTube Components (5)](#youtube-components-5)
  - [Layout Components (2)](#layout-components-2)
  - [Index Page Components (4)](#index-page-components-4)
  - [Wiki Components (4)](#wiki-components-4)
  - [Weather Components (2)](#weather-components-2)
  - [Other Components (10+)](#other-components-10)
- [Hooks (52)](#-hooks-52)
  - [Common Hooks (20)](#common-hooks-20)
  - [Player Hooks (7)](#player-hooks-7)
  - [System Hooks (13)](#system-hooks-13)
  - [Spotify Hooks (6)](#spotify-hooks-6)
  - [YouTube Hooks (3)](#youtube-hooks-3)
  - [Auth Hooks (3)](#auth-hooks-3)
- [Contexts (6)](#-contexts-6)
- [Lib/Utilities (25+)](#-libutilities-25)
  - [Core Utilities](#core-utilities)
  - [API Clients](#api-clients)
  - [Auth Utilities](#auth-utilities)
  - [Storage Utilities](#storage-utilities)
  - [Validations](#validations-zod)
  - [Constants](#constants)
- [Types (5)](#-types-5)
- [i18n (4)](#-i18n-4)
- [Edge Functions (4)](#-edge-functions-4)
- [Testes](#-testes)
- [Diagrama de Dependências](#-diagrama-de-dependências)
- [Estatísticas do Projeto](#-estatísticas-do-projeto)

---

## 🏗️ Visão Geral

```
src/
├── 📄 pages/          (32 páginas)
├── 🧩 components/     (95+ componentes)
│   ├── ui/           (50+ primitivos)
│   ├── player/       (12 player)
│   ├── settings/     (28 configurações)
│   ├── auth/         (6 autenticação)
│   ├── spotify/      (8 spotify)
│   ├── youtube/      (5 youtube)
│   ├── layout/       (2 layouts)
│   ├── index-page/   (4 index)
│   ├── wiki/         (4 wiki)
│   ├── weather/      (2 clima)
│   └── ...           (outros)
├── 🪝 hooks/          (52 hooks)
│   ├── common/       (20 utilitários)
│   ├── player/       (7 player)
│   ├── system/       (13 sistema)
│   ├── spotify/      (6 spotify)
│   ├── youtube/      (3 youtube)
│   └── auth/         (3 autenticação)
├── 🔄 contexts/       (6 contexts)
├── 📚 lib/            (25+ utilities)
├── 📋 types/          (5 definições)
├── 🌐 i18n/           (4 idiomas)
└── 🔌 integrations/   (supabase)
```

### Fluxo de Dados Supabase ↔ Frontend Vite

- **Edge Functions críticas**: `supabase/functions/github-sync-export` (sincronização de arquivos/GitHub), `supabase/functions/installer-metrics` (telemetria de instalação) e `supabase/functions/spotify-auth`/`youtube-music-auth` (brokers OAuth) publicam respostas JSON já compatíveis com CORS para domínios `*.lovable.app` e `*.manus.ai`. As funções expõem cabeçalhos `Access-Control-Allow-*` e lidam com preflight `OPTIONS` para evitar bloqueios durante prototipação.
- **Supabase Client**: criado em `src/lib/supabase/client.ts` (importado por hooks e providers) com as chaves de ambiente `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Todas são tipadas em `src/vite-env.d.ts`, permitindo autocompletar em LLMs e no TypeScript Language Service.
- **API Layer**: `src/lib/api/client.ts` agrega chamadas REST do backend FastAPI (`/status`, `/play`, `/seek`, `/volume`) com circuit breaker, cache e retries. Hooks como `src/hooks/player/usePlayer.ts` e `src/hooks/system/useSystemStatus.ts` invalidam queries via `@tanstack/react-query`, alimentando componentes como `src/components/player/NowPlayingCard.tsx` e `src/components/system/SystemHealthCard.tsx`.
- **Estado Global**: o contexto `src/contexts/SessionContext.tsx` injeta a sessão Supabase e o tema atual. O player consome estado combinado de Supabase (preferências) + API local (status do player) + store de fila (`src/stores/queueStore.ts`).
- **Pipeline de sincronização**: mutações de conteúdo (playlists, arquivos do repositório) chamam Edge Functions via `src/lib/api/supabaseEdge.ts`, que encapsula fetch com headers de autenticação e roteia respostas para os caches React Query. Eventos de realtime do Supabase são tratados em `src/hooks/system/useRealtimeChannels.ts` para refletir updates na UI.

---

## 📄 Páginas (32)

### Páginas Principais

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `Index.tsx` | `/` | Dashboard principal com player integrado | ❌ Público |
| `Dashboard.tsx` | `/dashboard` | Painel de controle do usuário | 🔐 User |
| `Admin.tsx` | `/admin` | Painel de administração do sistema | 🔐 Admin |
| `Settings.tsx` | `/settings` | Configurações completas do sistema | 🔐 User |
| `Help.tsx` | `/help` | Central de ajuda e suporte | ❌ Público |
| `Wiki.tsx` | `/wiki` | Base de conhecimento completa | ❌ Público |

### Páginas de Autenticação

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `Auth.tsx` | `/auth` | Página de autenticação principal | ❌ Público |
| `Login.tsx` | `/login` | Login de usuários | ❌ Público |
| `SetupWizard.tsx` | `/setup` | Assistente de configuração inicial | ❌ Público |

### Páginas de Administração

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `AdminLibrary.tsx` | `/admin/library` | Gerenciamento da biblioteca de músicas | 🔐 Admin |
| `AdminLogs.tsx` | `/admin/logs` | Visualização de logs do sistema | 🔐 Admin |
| `AdminFeedback.tsx` | `/admin/feedback` | Gerenciamento de feedback dos usuários | 🔐 Admin |

### Páginas Spotify

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `SpotifyBrowser.tsx` | `/spotify` | Navegador de conteúdo Spotify | 🔐 User |
| `SpotifyLibrary.tsx` | `/spotify/library` | Biblioteca do usuário no Spotify | 🔐 User |
| `SpotifySearch.tsx` | `/spotify/search` | Busca de músicas no Spotify | 🔐 User |
| `SpotifyPlaylist.tsx` | `/spotify/playlist/:id` | Visualização de playlist Spotify | 🔐 User |

### Páginas YouTube Music

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `YouTubeMusicBrowser.tsx` | `/youtube` | Navegador de conteúdo YouTube Music | 🔐 User |
| `YouTubeMusicLibrary.tsx` | `/youtube/library` | Biblioteca do usuário no YouTube Music | 🔐 User |
| `YouTubeMusicSearch.tsx` | `/youtube/search` | Busca de músicas no YouTube Music | 🔐 User |
| `YouTubeMusicPlaylist.tsx` | `/youtube/playlist/:id` | Visualização de playlist YouTube Music | 🔐 User |

### Páginas de Sistema

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `SystemDiagnostics.tsx` | `/diagnostics` | Diagnóstico completo do sistema | 🔐 Admin |
| `A11yDashboard.tsx` | `/a11y` | Dashboard de acessibilidade | 🔐 Admin |
| `ClientsMonitorDashboard.tsx` | `/clients` | Monitor de clientes conectados | 🔐 Admin |
| `InstallerMetrics.tsx` | `/installer-metrics` | Métricas do instalador | 🔐 Admin |

### Páginas de Conteúdo

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `BrandGuidelines.tsx` | `/brand` | Diretrizes da marca TSiJUKEBOX | ❌ Público |
| `ChangelogTimeline.tsx` | `/changelog` | Histórico de versões | ❌ Público |
| `ComponentsShowcase.tsx` | `/components` | Showcase de componentes UI | ❌ Público |
| `ThemePreview.tsx` | `/theme` | Preview de temas disponíveis | ❌ Público |
| `WcagExceptions.tsx` | `/wcag` | Exceções WCAG documentadas | ❌ Público |

### Páginas de Teste/Debug

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `LyricsTest.tsx` | `/lyrics-test` | Teste de sincronização de letras | 🔐 Admin |
| `Install.tsx` | `/install` | Página de instalação PWA | ❌ Público |

### Páginas de Erro

| Arquivo | Rota | Descrição | Proteção |
|---------|------|-----------|----------|
| `NotFound.tsx` | `*` | Página 404 personalizada | ❌ Público |

---

## 🧩 Componentes (95+)

### UI Components (50+)

#### Primitivos Base (shadcn/ui)

| Componente | Arquivo | Descrição | Origem |
|------------|---------|-----------|--------|
| Accordion | `accordion.tsx` | Acordeão expansível | shadcn/ui |
| AlertDialog | `alert-dialog.tsx` | Diálogo de alerta modal | shadcn/ui |
| Alert | `alert.tsx` | Componente de alerta | shadcn/ui |
| AspectRatio | `aspect-ratio.tsx` | Container com proporção fixa | shadcn/ui |
| Avatar | `avatar.tsx` | Avatar de usuário | shadcn/ui |
| Badge | `badge.tsx` | Badge/etiqueta | shadcn/ui |
| Breadcrumb | `breadcrumb.tsx` | Navegação breadcrumb | shadcn/ui |
| Button | `button.tsx` | Botão com variantes | shadcn/ui |
| Calendar | `calendar.tsx` | Seletor de data | shadcn/ui |
| Card | `card.tsx` | Container card | shadcn/ui |
| Carousel | `carousel.tsx` | Carrossel de imagens | shadcn/ui |
| Chart | `chart.tsx` | Gráficos com Recharts | shadcn/ui |
| Checkbox | `checkbox.tsx` | Checkbox acessível | shadcn/ui |
| Collapsible | `collapsible.tsx` | Container colapsável | shadcn/ui |
| Command | `command.tsx` | Paleta de comandos | shadcn/ui |
| ContextMenu | `context-menu.tsx` | Menu de contexto | shadcn/ui |
| Dialog | `dialog.tsx` | Modal dialog | shadcn/ui |
| Drawer | `drawer.tsx` | Drawer lateral/inferior | shadcn/ui |
| DropdownMenu | `dropdown-menu.tsx` | Menu dropdown | shadcn/ui |
| Form | `form.tsx` | Formulário com validação | shadcn/ui |
| HoverCard | `hover-card.tsx` | Card ao passar mouse | shadcn/ui |
| Input | `input.tsx` | Campo de entrada | shadcn/ui |
| InputOTP | `input-otp.tsx` | Input para código OTP | shadcn/ui |
| Label | `label.tsx` | Label de formulário | shadcn/ui |
| Menubar | `menubar.tsx` | Barra de menu | shadcn/ui |
| NavigationMenu | `navigation-menu.tsx` | Menu de navegação | shadcn/ui |
| Pagination | `pagination.tsx` | Paginação | shadcn/ui |
| Popover | `popover.tsx` | Popover flutuante | shadcn/ui |
| Progress | `progress.tsx` | Barra de progresso | shadcn/ui |
| RadioGroup | `radio-group.tsx` | Grupo de radio buttons | shadcn/ui |
| Resizable | `resizable.tsx` | Painéis redimensionáveis | shadcn/ui |
| ScrollArea | `scroll-area.tsx` | Área de scroll customizada | shadcn/ui |
| Select | `select.tsx` | Seletor dropdown | shadcn/ui |
| Separator | `separator.tsx` | Separador visual | shadcn/ui |
| Sheet | `sheet.tsx` | Painel lateral | shadcn/ui |
| Sidebar | `sidebar.tsx` | Barra lateral | shadcn/ui |
| Skeleton | `skeleton.tsx` | Placeholder de loading | shadcn/ui |
| Slider | `slider.tsx` | Slider de valor | shadcn/ui |
| Sonner | `sonner.tsx` | Notificações toast | shadcn/ui |
| Switch | `switch.tsx` | Toggle switch | shadcn/ui |
| Table | `table.tsx` | Tabela de dados | shadcn/ui |
| Tabs | `tabs.tsx` | Abas de navegação | shadcn/ui |
| Textarea | `textarea.tsx` | Área de texto | shadcn/ui |
| Toast | `toast.tsx` | Notificação toast | shadcn/ui |
| Toaster | `toaster.tsx` | Container de toasts | shadcn/ui |
| Toggle | `toggle.tsx` | Botão toggle | shadcn/ui |
| ToggleGroup | `toggle-group.tsx` | Grupo de toggles | shadcn/ui |
| Tooltip | `tooltip.tsx` | Tooltip informativo | shadcn/ui |

#### Componentes Customizados

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| BackButton | `BackButton.tsx` | Botão de voltar com navegação |
| BrandLogo | `BrandLogo.tsx` | Logo com 8 variantes de cor |
| BrandTagline | `BrandTagline.tsx` | Tagline da marca |
| BrandText | `BrandText.tsx` | Texto estilizado da marca |
| HighContrastToggle | `HighContrastToggle.tsx` | Toggle de alto contraste |
| InfoTooltip | `InfoTooltip.tsx` | Tooltip de informação |
| LogoBrand | `LogoBrand.tsx` | Logo para branding |
| LogoDownload | `LogoDownload.tsx` | Botão de download do logo |
| PageTitle | `PageTitle.tsx` | Título de página com SEO |
| RippleContainer | `RippleContainer.tsx` | Efeito ripple Material Design |
| SkipLink | `SkipLink.tsx` | Link de skip para acessibilidade |
| SplashScreen | `SplashScreen.tsx` | Tela de splash inicial |
| WcagExceptionComment | `WcagExceptionComment.tsx` | Comentário de exceção WCAG |
| PermissionToggle | `permission-toggle.tsx` | Toggle de permissões |

---

### Player Components (12)

| Componente | Arquivo | Descrição | Hooks Utilizados |
|------------|---------|-----------|------------------|
| NowPlaying | `NowPlaying.tsx` | Exibição da música atual com artwork | `usePlayer` |
| PlaybackControls | `PlaybackControls.tsx` | Controles play/pause/skip | `usePlaybackControls` |
| PlayerControls | `PlayerControls.tsx` | Controles completos do player | `usePlayer`, `useVolume` |
| ProgressBar | `ProgressBar.tsx` | Barra de progresso da música | `usePlayer` |
| VolumeSlider | `VolumeSlider.tsx` | Controle de volume | `useVolume` |
| AudioVisualizer | `AudioVisualizer.tsx` | Visualizador de áudio animado | Web Audio API |
| KaraokeLyrics | `KaraokeLyrics.tsx` | Letras sincronizadas para karaoke | `useLyrics` |
| LyricsDisplay | `LyricsDisplay.tsx` | Display de letras | `useLyrics` |
| FullscreenKaraoke | `FullscreenKaraoke.tsx` | Modo karaoke em tela cheia | `useLyrics` |
| QueuePanel | `QueuePanel.tsx` | Painel de fila de músicas | `usePlayer` |
| LibraryPanel | `LibraryPanel.tsx` | Painel da biblioteca local | `useLibrary` |
| CommandDeck | `CommandDeck.tsx` | Deck de comandos estilo DJ | `usePlayer` |
| SideInfoPanel | `SideInfoPanel.tsx` | Painel lateral de informações | - |
| ConnectionIndicator | `ConnectionIndicator.tsx` | Indicador de conexão | `useConnectionMonitor` |
| DigitalClock | `DigitalClock.tsx` | Relógio digital | - |
| SystemMonitor | `SystemMonitor.tsx` | Monitor de recursos do sistema | `useStatus` |
| UserBadge | `UserBadge.tsx` | Badge do usuário logado | `useUser` |
| WeatherWidget | `WeatherWidget.tsx` | Widget de clima | `useWeather` |
| WeatherForecastChart | `WeatherForecastChart.tsx` | Gráfico de previsão do tempo | `useWeatherForecast` |

---

### Settings Components (28)

| Componente | Arquivo | Seção | Descrição |
|------------|---------|-------|-----------|
| SettingsDashboard | `SettingsDashboard.tsx` | - | Dashboard principal de configurações |
| SettingsSidebar | `SettingsSidebar.tsx` | - | Navegação lateral das configurações |
| SettingsBreadcrumb | `SettingsBreadcrumb.tsx` | - | Breadcrumb de navegação |
| SettingsSection | `SettingsSection.tsx` | - | Container de seção |
| SettingsGuideCard | `SettingsGuideCard.tsx` | - | Card de guia/ajuda |
| SettingsGuideModal | `SettingsGuideModal.tsx` | - | Modal de guia |
| SettingsFAQ | `SettingsFAQ.tsx` | - | FAQ de configurações |
| SettingsIllustration | `SettingsIllustration.tsx` | - | Ilustrações decorativas |
| SettingsNotificationBanner | `SettingsNotificationBanner.tsx` | - | Banner de notificações |
| SettingsSectionTour | `SettingsSectionTour.tsx` | - | Tour guiado |
| ThemeSection | `ThemeSection.tsx` | Aparência | Seleção de tema |
| ThemeCustomizer | `ThemeCustomizer.tsx` | Aparência | Customização avançada de tema |
| ColorPicker | `ColorPicker.tsx` | Aparência | Seletor de cores |
| LanguageSection | `LanguageSection.tsx` | Geral | Seleção de idioma |
| AccessibilitySection | `AccessibilitySection.tsx` | Geral | Opções de acessibilidade |
| AuthProviderSection | `AuthProviderSection.tsx` | Segurança | Configuração de autenticação |
| UserManagementSection | `UserManagementSection.tsx` | Segurança | Gerenciamento de usuários |
| KeysManagementSection | `KeysManagementSection.tsx` | Segurança | Gerenciamento de chaves API |
| ClientsManagementSection | `ClientsManagementSection.tsx` | Segurança | Gerenciamento de clientes |
| DatabaseSection | `DatabaseSection.tsx` | Sistema | Configuração de banco de dados |
| DatabaseConfigSection | `DatabaseConfigSection.tsx` | Sistema | Config avançada de BD |
| AdvancedDatabaseSection | `AdvancedDatabaseSection.tsx` | Sistema | Operações avançadas de BD |
| UnifiedDatabaseSection | `UnifiedDatabaseSection.tsx` | Sistema | Seção unificada de BD |
| DatabaseConnectionHistory | `DatabaseConnectionHistory.tsx` | Sistema | Histórico de conexões |
| BackupSection | `BackupSection.tsx` | Sistema | Configuração de backup |
| BackupScheduleSection | `BackupScheduleSection.tsx` | Sistema | Agendamento de backups |
| CloudBackupSection | `CloudBackupSection.tsx` | Sistema | Backup em nuvem |
| ConfigBackupSection | `ConfigBackupSection.tsx` | Sistema | Backup de configurações |
| DistributedBackupSection | `DistributedBackupSection.tsx` | Sistema | Backup distribuído |
| UnifiedBackupSection | `UnifiedBackupSection.tsx` | Sistema | Seção unificada de backup |
| StorjSection | `StorjSection.tsx` | Sistema | Configuração Storj |
| CloudConnectionSection | `CloudConnectionSection.tsx` | Sistema | Conexão com nuvem |
| CloudProviderHelp | `CloudProviderHelp.tsx` | Sistema | Ajuda de provedores cloud |
| BackendConnectionSection | `BackendConnectionSection.tsx` | Sistema | Conexão com backend |
| MusicIntegrationsSection | `MusicIntegrationsSection.tsx` | Integrações | Integrações de música |
| SpicetifySection | `SpicetifySection.tsx` | Integrações | Configuração Spicetify |
| YouTubeMusicSection | `YouTubeMusicSection.tsx` | Integrações | Configuração YouTube Music |
| LocalMusicSection | `LocalMusicSection.tsx` | Integrações | Música local |
| SystemUrlsSection | `SystemUrlsSection.tsx` | Sistema | URLs do sistema |
| NtpConfigSection | `NtpConfigSection.tsx` | Sistema | Configuração NTP |
| WeatherConfigSection | `WeatherConfigSection.tsx` | Sistema | Configuração do clima |

---

### Auth Components (6)

| Componente | Arquivo | Descrição | Dependencies |
|------------|---------|-----------|--------------|
| LoginForm | `LoginForm.tsx` | Formulário de login completo | `useLocalAuth`, `useSupabaseAuth` |
| LocalLoginForm | `LocalLoginForm.tsx` | Formulário de login local | `useLocalAuth` |
| SignUpForm | `SignUpForm.tsx` | Formulário de cadastro | `useSupabaseAuth` |
| AuthFormField | `AuthFormField.tsx` | Campo de formulário reutilizável | `react-hook-form` |
| PermissionGate | `PermissionGate.tsx` | Gate de permissão por role | `useUser` |
| ProtectedRoute | `ProtectedRoute.tsx` | Rota protegida por autenticação | `useUser` |

---

### Spotify Components (8)

| Componente | Arquivo | Descrição | Dependencies |
|------------|---------|-----------|--------------|
| SpotifyPanel | `SpotifyPanel.tsx` | Painel principal do Spotify | `SpotifyContext` |
| SpotifyUserBadge | `SpotifyUserBadge.tsx` | Badge do usuário Spotify | `SpotifyContext` |
| TrackItem | `TrackItem.tsx` | Item de faixa musical | - |
| AlbumCard | `AlbumCard.tsx` | Card de álbum | - |
| ArtistCard | `ArtistCard.tsx` | Card de artista | - |
| PlaylistCard | `PlaylistCard.tsx` | Card de playlist | - |
| AddToPlaylistModal | `AddToPlaylistModal.tsx` | Modal para adicionar à playlist | `useSpotifyPlaylists` |
| CreatePlaylistModal | `CreatePlaylistModal.tsx` | Modal para criar playlist | `useSpotifyPlaylists` |

---

### YouTube Components (5)

| Componente | Arquivo | Descrição | Dependencies |
|------------|---------|-----------|--------------|
| YouTubeMusicUserBadge | `YouTubeMusicUserBadge.tsx` | Badge do usuário YouTube | `YouTubeMusicContext` |
| YouTubeMusicTrackItem | `YouTubeMusicTrackItem.tsx` | Item de faixa musical | - |
| YouTubeMusicAlbumCard | `YouTubeMusicAlbumCard.tsx` | Card de álbum | - |
| YouTubeMusicPlaylistCard | `YouTubeMusicPlaylistCard.tsx` | Card de playlist | - |
| AddToPlaylistModal | `AddToPlaylistModal.tsx` | Modal para adicionar à playlist | `useYouTubeMusicLibrary` |

---

### Layout Components (2)

| Componente | Arquivo | Descrição | Uso |
|------------|---------|-----------|-----|
| AdminLayout | `AdminLayout.tsx` | Layout para páginas de admin | Páginas `/admin/*` |
| KioskLayout | `KioskLayout.tsx` | Layout para modo kiosk | Modo quiosque |

---

### Index Page Components (4)

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| IndexHeader | `IndexHeader.tsx` | Header da página principal |
| IndexPanels | `IndexPanels.tsx` | Painéis de conteúdo |
| IndexPlayerSection | `IndexPlayerSection.tsx` | Seção do player |
| IndexStates | `IndexStates.tsx` | Estados de loading/error/empty |

---

### Wiki Components (4)

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| WikiArticle | `WikiArticle.tsx` | Exibição de artigo da wiki |
| WikiNavigation | `WikiNavigation.tsx` | Navegação da wiki |
| WikiSearch | `WikiSearch.tsx` | Busca na wiki |
| wikiData.ts | `wikiData.ts` | Dados estáticos da wiki |

---

### Weather Components (2)

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| AnimatedWeatherIcon | `AnimatedWeatherIcon.tsx` | Ícone animado de clima |
| WeatherWidget | `player/WeatherWidget.tsx` | Widget completo de clima |

---

### Other Components (10+)

| Componente | Arquivo | Categoria | Descrição |
|------------|---------|-----------|-----------|
| GlobalSearchModal | `GlobalSearchModal.tsx` | Search | Modal de busca global |
| NavLink | `NavLink.tsx` | Navigation | Link de navegação ativo |
| GuidedTour | `tour/GuidedTour.tsx` | Tour | Tour guiado interativo |
| InteractiveTestMode | `help/InteractiveTestMode.tsx` | Help | Modo de teste interativo |
| CodePlayground | `docs/CodePlayground.tsx` | Docs | Playground de código |
| ContrastDebugPanel | `debug/ContrastDebugPanel.tsx` | Debug | Painel de debug de contraste |
| AudioWaveformPreview | `upload/AudioWaveformPreview.tsx` | Upload | Preview de waveform |

---

## 🪝 Hooks (52)

### Common Hooks (20)

| Hook | Arquivo | Descrição | Retorno Principal |
|------|---------|-----------|-------------------|
| `useTranslation` | `useTranslation.ts` | Internacionalização com 3 idiomas | `{ t, language, setLanguage }` |
| `useDebounce` | `useDebounce.ts` | Debounce de valores | `debouncedValue` |
| `useTouchGestures` | `useTouchGestures.ts` | Gestos touch para mobile | `{ handlers }` |
| `useBackNavigation` | `useBackNavigation.ts` | Navegação de voltar | `{ goBack, canGoBack }` |
| `useMediaProviderStorage` | `useMediaProviderStorage.ts` | Storage de provedores de mídia | `{ provider, setProvider }` |
| `useFirstAccess` | `useFirstAccess.ts` | Detecção de primeiro acesso | `{ isFirstAccess }` |
| `useGlobalSearch` | `useGlobalSearch.ts` | Busca global no app | `{ search, results }` |
| `usePWAInstall` | `usePWAInstall.ts` | Instalação PWA | `{ canInstall, install }` |
| `useReadArticles` | `useReadArticles.ts` | Artigos lidos da wiki | `{ readArticles, markAsRead }` |
| `useRipple` | `useRipple.ts` | Efeito ripple | `{ rippleProps }` |
| `useSettingsNotifications` | `useSettingsNotifications.ts` | Notificações de settings | `{ notifications }` |
| `useSettingsStatus` | `useSettingsStatus.ts` | Status das configurações | `{ status }` |
| `useSettingsTour` | `useSettingsTour.ts` | Tour de configurações | `{ tourStep }` |
| `useSoundEffects` | `useSoundEffects.ts` | Efeitos sonoros | `{ playSound }` |
| `useThemeCustomizer` | `useThemeCustomizer.ts` | Customização de tema | `{ colors, setColors }` |
| `useWikiBookmarks` | `useWikiBookmarks.ts` | Bookmarks da wiki | `{ bookmarks, addBookmark }` |
| `useWikiOffline` | `useWikiOffline.ts` | Wiki offline | `{ isOffline, cachedArticles }` |
| `use-mobile` | `use-mobile.tsx` | Detecção de mobile | `isMobile` |
| `use-toast` | `use-toast.ts` | Sistema de toasts | `{ toast }` |

---

### Player Hooks (7)

| Hook | Arquivo | Descrição | Retorno Principal |
|------|---------|-----------|-------------------|
| `usePlayer` | `usePlayer.ts` | Estado do player principal | `{ currentTrack, isPlaying, queue }` |
| `usePlaybackControls` | `usePlaybackControls.ts` | Controles de playback | `{ play, pause, next, previous }` |
| `useVolume` | `useVolume.ts` | Controle de volume | `{ volume, setVolume, muted }` |
| `useLibrary` | `useLibrary.ts` | Biblioteca de músicas | `{ tracks, albums, artists }` |
| `useLocalMusic` | `useLocalMusic.ts` | Músicas locais | `{ localTracks, scanFolder }` |
| `useLyrics` | `useLyrics.ts` | Letras sincronizadas | `{ lyrics, currentLine }` |
| `useSpicetifyIntegration` | `useSpicetifyIntegration.ts` | Integração Spicetify | `{ isConnected, sync }` |

---

### System Hooks (13)

| Hook | Arquivo | Descrição | Retorno Principal |
|------|---------|-----------|-------------------|
| `useStatus` | `useStatus.ts` | Status do sistema | `{ cpu, memory, temperature }` |
| `useConnectionMonitor` | `useConnectionMonitor.ts` | Monitor de conexão | `{ isOnline, latency }` |
| `useNetworkStatus` | `useNetworkStatus.ts` | Status da rede | `{ type, downlink }` |
| `useWebSocketStatus` | `useWebSocketStatus.ts` | Status do WebSocket | `{ connected, reconnecting }` |
| `useClientWebSocket` | `useClientWebSocket.ts` | WebSocket do cliente | `{ ws, send, lastMessage }` |
| `useWeather` | `useWeather.ts` | Dados do clima | `{ weather, location }` |
| `useWeatherForecast` | `useWeatherForecast.ts` | Previsão do tempo | `{ forecast }` |
| `useLogs` | `useLogs.ts` | Logs do sistema | `{ logs, clearLogs }` |
| `useStorjClient` | `useStorjClient.ts` | Cliente Storj | `{ upload, download }` |
| `useMockData` | `useMockData.ts` | Dados mock para dev | `{ mockTrack, mockUser }` |
| `useContrastDebug` | `useContrastDebug.ts` | Debug de contraste | `{ contrastRatio }` |
| `useA11yStats` | `useA11yStats.ts` | Estatísticas a11y | `{ violations, score }` |

---

### Spotify Hooks (6)

| Hook | Arquivo | Descrição | Retorno Principal |
|------|---------|-----------|-------------------|
| `useSpotifyPlayer` | `useSpotifyPlayer.ts` | Player do Spotify | `{ play, pause, seek }` |
| `useSpotifySearch` | `useSpotifySearch.ts` | Busca no Spotify | `{ search, results }` |
| `useSpotifyLibrary` | `useSpotifyLibrary.ts` | Biblioteca do Spotify | `{ savedTracks, playlists }` |
| `useSpotifyPlaylists` | `useSpotifyPlaylists.ts` | Playlists do Spotify | `{ playlists, createPlaylist }` |
| `useSpotifyBrowse` | `useSpotifyBrowse.ts` | Browse do Spotify | `{ categories, newReleases }` |
| `useSpotifyRecommendations` | `useSpotifyRecommendations.ts` | Recomendações | `{ recommendations }` |

---

### YouTube Hooks (3)

| Hook | Arquivo | Descrição | Retorno Principal |
|------|---------|-----------|-------------------|
| `useYouTubeMusicPlayer` | `useYouTubeMusicPlayer.ts` | Player do YouTube | `{ play, pause, seek }` |
| `useYouTubeMusicSearch` | `useYouTubeMusicSearch.ts` | Busca no YouTube | `{ search, results }` |
| `useYouTubeMusicLibrary` | `useYouTubeMusicLibrary.ts` | Biblioteca do YouTube | `{ savedTracks, playlists }` |

---

### Auth Hooks (3)

| Hook | Arquivo | Descrição | Retorno Principal |
|------|---------|-----------|-------------------|
| `useAuthConfig` | `useAuthConfig.ts` | Configuração de auth | `{ provider, configured }` |
| `useLocalAuth` | `useLocalAuth.ts` | Autenticação local | `{ login, logout, user }` |
| `useSupabaseAuth` | `useSupabaseAuth.ts` | Autenticação Supabase | `{ login, logout, user }` |

---

## 🔄 Contexts (6)

| Context | Arquivo | Descrição | Estado Principal |
|---------|---------|-----------|------------------|
| `ThemeContext` | `ThemeContext.tsx` | Gerenciamento de temas | `theme`, `setTheme`, `colors` |
| `UserContext` | `UserContext.tsx` | Sessão e dados do usuário | `user`, `role`, `permissions` |
| `AppSettingsContext` | `AppSettingsContext.tsx` | Configurações globais do app | `settings`, `updateSettings` |
| `SettingsContext` | `SettingsContext.tsx` | Estado da página de settings | `activeSection`, `unsavedChanges` |
| `SpotifyContext` | `SpotifyContext.tsx` | Estado do Spotify | `isConnected`, `user`, `token` |
| `YouTubeMusicContext` | `YouTubeMusicContext.tsx` | Estado do YouTube Music | `isConnected`, `user`, `token` |

---

## 📚 Lib/Utilities (25+)

### Core Utilities

| Arquivo | Descrição | Exports Principais |
|---------|-----------|-------------------|
| `utils.ts` | Utilitários gerais | `cn()` (classnames) |
| `formatters.ts` | Formatação de dados | `formatDuration()`, `formatDate()` |
| `colorExtractor.ts` | Extração de cores de imagens | `extractColors()` |
| `contrastUtils.ts` | Utilitários de contraste WCAG | `getContrastRatio()` |
| `globalSearch.ts` | Sistema de busca global | `searchAll()` |
| `lrcParser.ts` | Parser de arquivos LRC | `parseLRC()` |
| `lyricsCache.ts` | Cache de letras | `LyricsCache` |
| `theme-utils.ts` | Utilitários de tema | `generateTheme()` |
| `documentExporter.ts` | Exportação de documentos | `exportMarkdown()`, `exportHTML()` |

### API Clients

| Arquivo | Descrição | Exports Principais |
|---------|-----------|-------------------|
| `api/client.ts` | Cliente HTTP base | `apiClient` |
| `api/spotify.ts` | Cliente Spotify | `spotifyAPI` |
| `api/youtubeMusic.ts` | Cliente YouTube Music | `youtubeMusicAPI` |
| `api/localMusic.ts` | Cliente música local | `localMusicAPI` |
| `api/spicetify.ts` | Cliente Spicetify | `spicetifyAPI` |
| `api/storj.ts` | Cliente Storj | `storjAPI` |
| `api/sshSync.ts` | Sincronização SSH | `sshSync` |

### Auth Utilities

| Arquivo | Descrição | Exports Principais |
|---------|-----------|-------------------|
| `auth/localUsers.ts` | Gerenciamento de usuários locais | `LocalUserManager` |
| `auth/passwordUtils.ts` | Utilitários de senha | `hashPassword()`, `verifyPassword()` |

### Storage Utilities

| Arquivo | Descrição | Exports Principais |
|---------|-----------|-------------------|
| `storage/mediaProviderStorage.ts` | Storage de provedores | `MediaProviderStorage` |

### Validations (Zod)

| Arquivo | Descrição | Schemas |
|---------|-----------|---------|
| `validations/authSchemas.ts` | Schemas de autenticação | `loginSchema`, `signupSchema` |

### Constants

| Arquivo | Descrição | Exports |
|---------|-----------|---------|
| `constants.ts` | Constantes globais | `APP_NAME`, `VERSION` |
| `constants/connectionTypes.ts` | Tipos de conexão | `ConnectionTypes` |

---

## 📋 Types (5)

| Arquivo | Descrição | Tipos Principais |
|---------|-----------|------------------|
| `index.ts` | Tipos gerais | `AppSettings`, `Theme` |
| `track.ts` | Tipos de faixa musical | `Track`, `QueueItem`, `Album`, `Artist` |
| `user.ts` | Tipos de usuário | `User`, `UserRole`, `Permission` |
| `lyrics.ts` | Tipos de letras | `LRCLine`, `LyricsData` |
| `spotify-api.ts` | Tipos da API Spotify | `SpotifyTrack`, `SpotifyPlaylist`, `SpotifyAlbum` |

---

## 🌐 i18n (4)

| Arquivo | Idioma | Chaves | Cobertura |
|---------|--------|--------|-----------|
| `index.ts` | - | - | Configuração i18n |
| `locales/en.json` | Inglês (default) | 200+ | 100% |
| `locales/pt-BR.json` | Português Brasil | 200+ | 100% |
| `locales/es.json` | Espanhol | 200+ | 100% |

### Estrutura das Traduções

```json
{
  "common": { "save": "...", "cancel": "..." },
  "auth": { "login": "...", "logout": "..." },
  "player": { "play": "...", "pause": "..." },
  "settings": { "theme": "...", "language": "..." },
  "errors": { "network": "...", "auth": "..." }
}
```

---

## 🔌 Edge Functions (4)

| Função | Endpoint | Descrição | Método |
|--------|----------|-----------|--------|
| `spotify-auth` | `/functions/v1/spotify-auth` | OAuth flow do Spotify | POST |
| `youtube-music-auth` | `/functions/v1/youtube-music-auth` | OAuth flow do YouTube Music | POST |
| `lyrics-search` | `/functions/v1/lyrics-search` | Busca de letras sincronizadas | GET |
| `github-repo` | `/functions/v1/github-repo` | Integração com GitHub | GET/POST |

### Localização

```
supabase/functions/
├── spotify-auth/
│   └── index.ts
├── youtube-music-auth/
│   └── index.ts
├── lyrics-search/
│   └── index.ts
└── github-repo/
    └── index.ts
```

---

## 🧪 Testes

### Testes Unitários (Vitest)

| Diretório | Arquivos | Cobertura |
|-----------|----------|-----------|
| `src/hooks/**/__tests__/` | 12 | Hooks principais |
| `src/contexts/__tests__/` | 1 | ThemeContext |
| `src/test/` | 4 | Setup e mocks |

#### Arquivos de Teste

| Arquivo | Testando |
|---------|----------|
| `useAuthConfig.test.ts` | Hook de config de auth |
| `useLocalAuth.test.ts` | Hook de auth local |
| `useSupabaseAuth.test.ts` | Hook de auth Supabase |
| `useSpotifyPlayer.test.ts` | Hook do player Spotify |
| `useSpotifySearch.test.ts` | Hook de busca Spotify |
| `useSpotifyLibrary.test.ts` | Hook da biblioteca Spotify |
| `useSpotifyPlaylists.test.ts` | Hook de playlists Spotify |
| `useSpotifyBrowse.test.ts` | Hook de browse Spotify |
| `useSpotifyRecommendations.test.ts` | Hook de recomendações |
| `useYouTubeMusicPlayer.test.ts` | Hook do player YouTube |
| `useYouTubeMusicSearch.test.ts` | Hook de busca YouTube |
| `useYouTubeMusicLibrary.test.ts` | Hook da biblioteca YouTube |
| `useBackNavigation.test.ts` | Hook de navegação |
| `useMediaProviderStorage.test.ts` | Hook de storage |
| `ThemeContext.test.tsx` | Context de tema |

### Testes E2E (Playwright)

| Diretório | Arquivos | Cobertura |
|-----------|----------|-----------|
| `e2e/specs/` | 10 | Fluxos críticos |
| `e2e/fixtures/` | 3 | Fixtures reutilizáveis |

#### Arquivos de Teste E2E

| Arquivo | Testando |
|---------|----------|
| `auth-local.spec.ts` | Autenticação local |
| `auth-supabase.spec.ts` | Autenticação Supabase |
| `auth-permissions.spec.ts` | Permissões por role |
| `brand-guidelines.spec.ts` | Página de brand |
| `keyboard-shortcuts.spec.ts` | Atalhos de teclado |
| `playback-controls.spec.ts` | Controles de playback |
| `player-controls.spec.ts` | Controles do player |
| `queue-panel.spec.ts` | Painel de fila |
| `touch-gestures.spec.ts` | Gestos touch |
| `volume-controls.spec.ts` | Controles de volume |

---

## 🔗 Diagrama de Dependências

```
┌─────────────────────────────────────────────────────────────────┐
│                          PAGES (32)                             │
│  Index, Admin, Settings, Help, Wiki, Spotify*, YouTube*...      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
│  COMPONENTS     │ │    HOOKS      │ │   CONTEXTS      │
│  (95+)          │ │    (52)       │ │   (6)           │
│                 │ │               │ │                 │
│  ├── ui/        │ │  ├── common/  │ │  Theme          │
│  ├── player/    │ │  ├── player/  │ │  User           │
│  ├── settings/  │ │  ├── system/  │ │  AppSettings    │
│  ├── auth/      │ │  ├── spotify/ │ │  Settings       │
│  ├── spotify/   │ │  ├── youtube/ │ │  Spotify        │
│  └── youtube/   │ │  └── auth/    │ │  YouTubeMusic   │
└────────┬────────┘ └───────┬───────┘ └────────┬────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
              ┌─────────────────────────┐
              │      LIB (25+)          │
              │                         │
              │  ├── api/ (clients)     │
              │  ├── auth/ (utils)      │
              │  ├── storage/           │
              │  ├── validations/       │
              │  └── constants/         │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │      TYPES (5)          │
              │                         │
              │  Track, User, Lyrics    │
              │  SpotifyAPI, Index      │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │   INTEGRATIONS          │
              │                         │
              │   supabase/client.ts    │
              │   supabase/types.ts     │
              └─────────────────────────┘
```

---

## 📊 Estatísticas do Projeto

| Categoria | Quantidade | Detalhes |
|-----------|------------|----------|
| **Páginas** | 32 | 6 públicas, 26 protegidas |
| **Componentes** | 95+ | 50+ UI, 12 player, 28 settings |
| **Hooks** | 52 | 20 common, 7 player, 13 system |
| **Contexts** | 6 | Theme, User, Settings, Spotify, YouTube, App |
| **Lib Files** | 25+ | API clients, utils, validations |
| **Types** | 5 | Track, User, Lyrics, Spotify, Index |
| **i18n** | 3 idiomas | EN, PT-BR, ES (200+ chaves cada) |
| **Edge Functions** | 4 | Auth Spotify/YouTube, Lyrics, GitHub |
| **Testes Unit** | 15 | Hooks, Contexts |
| **Testes E2E** | 10 | Fluxos críticos |
| **LOC Estimado** | 15.000+ | TypeScript/TSX |

---

## 📖 Documentos Relacionados

- [README Principal](./README.md) - Visão geral do projeto
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) - Guia do desenvolvedor
- [HOOKS-ARCHITECTURE.md](./HOOKS-ARCHITECTURE.md) - Arquitetura de hooks
- [API-REFERENCE.md](./API-REFERENCE.md) - Referência da API
- [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - Sistema de design

---

<p align="center">
  <strong>TSiJUKEBOX Enterprise</strong> — Mapa do Projeto v4.0.0
  <br>
  <em>Documento gerado automaticamente</em>
</p>
