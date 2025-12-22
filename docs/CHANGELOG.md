# Changelog

All notable changes to TSiJUKEBOX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **BrandText**: Componente de texto com shimmer e animação de typing
- **BrandTagline**: Tagline com variantes neon, gradient, accent, subtle
- **BrandWithTagline**: Combinação com animações de entrada (fade, slide-up, cascade)
- **BrandLogo**: Componente unificado LogoBrand + Tagline com 8+ variantes
- **SplashScreen**: Tela de splash completa com:
  - Progress bar animada
  - Variantes: default, minimal, cyberpunk, elegant
  - Animações: splash, glitch, fade, scale
  - Skip com clique
- **Animação Glitch**: Efeito cyberpunk de distorção para BrandLogo
- **Animação Hologram**: Efeito 3D futurista completo com:
  - Flutuação 3D com rotação sutil (`hologram-float` 6s)
  - Hue shift gradual cyan-gold (`hologram-hue` 8s)
  - Scanlines holográficas animadas (`hologram-scanlines` 3s)
  - Glow pulsante ao redor do container (`hologram-glow-pulse` 4s)
  - Reflexos invertidos abaixo do texto (pseudo-elementos ::after)
  - Suporte a `prefers-reduced-motion` para acessibilidade
- **Animação Typing**: Efeito typewriter para BrandText
- **useSplashScreen Hook**: Gerenciamento de estado do splash
- Brand Guidelines page with color palette, typography, and logo usage
- Export color palette as JSON and CSS
- Python installer with logging and validators utilities
- Comprehensive documentation suite
- Brand setup module for installer (brand_setup.py)
- GitHub workflow for brand components CI

### Changed
- Improved authentication provider toggle on login page
- Enhanced system checker with more hardware detection
- LogoBrand atualizado com variantes hologram e metal
- Docker configs with brand environment variables
- Updated installer config with brand configuration

### Fixed
- Auth provider toggle visibility on login page

---

## [4.1.0] - 2024-12-22

### Added

#### 🔌 Sistema de Plugins
- **PluginManager**: Gerenciador modular de extensões
- **Plugins Built-in**: youtube-music-dl, spotify-downloader, discord-integration, lyrics-fetcher
- **Plugin API**: Interface para criação de plugins customizados
- **Hot-reload**: Atualização de plugins sem restart

#### 🏥 Sistema de Monitoramento
- **HealthCheck CLI**: Verificação rápida de saúde (`--health-check`)
  - Códigos de saída: 0=OK, 1=WARNING, 2=CRITICAL, 3=UNKNOWN
  - Compatível com Nagios, Zabbix, PRTG
- **SystemdHealthTimer**: Timer automático com alertas
  - Verificação a cada 5 minutos (configurável)
  - Suporte a Telegram, Email, Discord, Database
- **HealthDashboard**: Página `/health` com monitoramento em tempo real
  - Cards de status de serviços
  - Gauges circulares para CPU/RAM/Disco
  - Gráficos de histórico de métricas
  - Timeline de alertas
  - Conexão WebSocket persistente
- **useHealthMonitorWebSocket**: Hook para streaming de métricas em tempo real

#### 🎨 Galeria Spicetify
- **SpicetifyThemeGallery**: Página `/spicetify-themes`
  - Grid visual com 12+ temas
  - Preview mockado do player Spotify
  - Filtros por categoria (Dark, Light, Colorful, Minimal)
  - Instalação com um clique
  - Indicador do tema ativo
- **ThemePreviewCard**: Componente de preview com hover effects

#### ⚡ Edge Functions
- **health-monitor-ws**: WebSocket para streaming de métricas
  - Atualização a cada 30 segundos
  - Reconexão automática
  - Dados de CPU, RAM, Disco, Serviços, Alertas

#### 🛠️ Instalador
- **ConfigMigrator**: Migração automática de configurações entre versões
- **--migrate**: Flag para migração de configurações
- **--install-timer**: Instalação do timer systemd
- **--plugin NAME**: Instalação de plugins individuais
- **--list-plugins**: Lista plugins disponíveis
- **--health-check**: Verificação rápida de saúde

### Changed
- **CommandDeck**: Refatorado para mini-rail bar discreto
  - Posição: `bottom-24 left-0` (não sobrepõe SideInfoPanel)
  - Expansão horizontal ao invés de vertical
  - Z-index harmonizado com outros painéis
- **alert-notifications**: Suporte a Telegram adicionado
- **Documentação**: Atualizada para v4.1.0

### Fixed
- Sobreposição do CommandDeck sobre SideInfoPanel
- Reconexão WebSocket em caso de perda de conexão

---

## [4.0.0] - 2024-12-19

### Added
- **Kiosk Mode**: Touch-optimized interface for public installations
- **Karaoke Mode**: Synchronized lyrics display with fullscreen view
- **Multi-Provider Support**: Spotify, YouTube Music, and local files
- **Cloud Backup**: Storj, Google Drive, Dropbox, AWS S3, OneDrive, MEGA
- **System Monitoring**: Real-time CPU, RAM, temperature display
- **Weather Widget**: Current conditions and forecast
- **Audio Visualizer**: Real-time audio visualization
- **Role-Based Access**: Admin, User, Newbie roles with permissions
- **Internationalization**: English, Spanish, Portuguese support
- **PWA Support**: Installable as desktop/mobile app
- **Accessibility**: WCAG 2.1 AA compliance

### Changed
- Complete UI redesign with neon dark theme
- Improved performance with React Query caching
- Enhanced mobile responsiveness
- Refactored hook architecture for better organization

### Security
- Implemented Row Level Security (RLS) on all tables
- Added input validation with Zod schemas
- Secured API keys in edge functions

---

## [3.0.0] - 2024-06-15

### Added
- YouTube Music integration
- Playlist management
- Queue system with drag-and-drop
- Settings dashboard

### Changed
- Migrated to Vite from Create React App
- Updated to React 18
- Improved TypeScript coverage

### Deprecated
- Legacy REST API endpoints

---

## [2.0.0] - 2024-01-10

### Added
- Spotify integration with OAuth
- User authentication with Supabase
- Basic playback controls
- Library scanning

### Changed
- Redesigned player interface
- Improved audio quality handling

### Removed
- PHP backend (replaced with Supabase)

---

## [1.0.0] - 2023-08-01

### Added
- Initial release
- Local music playback
- Basic UI with dark theme
- Volume control
- Track information display

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 4.0.0 | 2024-12-19 | Kiosk mode, karaoke, cloud backup |
| 3.0.0 | 2024-06-15 | YouTube Music, playlists |
| 2.0.0 | 2024-01-10 | Spotify, Supabase auth |
| 1.0.0 | 2023-08-01 | Initial release |

---

## Upgrade Notes

### Upgrading to 4.0.0

1. **Database Migration Required**
   ```bash
   npm run migrate
   ```

2. **New Environment Variables**
   ```env
   VITE_WEATHER_API_KEY=your_key
   ```

3. **Breaking Changes**
   - `usePlayback` hook renamed to `usePlayer`
   - Settings context API changed
   - Some CSS class names updated

### Upgrading to 3.0.0

1. **Vite Migration**
   - Update `package.json` scripts
   - Rename `process.env` to `import.meta.env`

2. **React 18**
   - Update `ReactDOM.render` to `createRoot`

---

<p align="center">
  See <a href="INSTALLATION.md">Installation Guide</a> for upgrade instructions.
</p>
