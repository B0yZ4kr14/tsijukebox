# TSiJUKEBOX - Documentação Técnica de Componentes React

> **Versão:** 4.2.0 | **Total:** 186 componentes | **Atualizado:** 2025-12-23

## Índice

1. [UI Base (Shadcn)](#1-ui-base-shadcn---68-componentes)
2. [UI Customizados](#2-ui-customizados---18-componentes)
3. [Player](#3-player---21-componentes)
4. [Settings](#4-settings---60-componentes)
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
```tsx
import { Button } from '@/components/ui';
<Button variant="outline" size="lg">Clique</Button>
```
| Prop | Tipo | Default |
|------|------|---------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'kiosk-outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` |
| `asChild` | `boolean` | `false` |

### Card, Dialog, Tabs, Form, Input, Select, Switch, Toast, Tooltip
Componentes Shadcn padrão - ver [shadcn/ui docs](https://ui.shadcn.com)

---

## 2. UI Customizados - 18 Componentes

### BackButton
```tsx
<BackButton label="Voltar" iconSize="md" showLabel navigationOptions={{ fallbackPath: '/settings' }} />
```

### BrandLogo
```tsx
<BrandLogo size="lg" variant="ultra" animate="splash" showTagline centered />
```
| Prop | Valores |
|------|---------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` |
| `variant` | `'default' \| 'ultra' \| 'silver' \| 'hologram'` |
| `animate` | `'none' \| 'fade' \| 'splash' \| 'glitch'` |

---

## 3. Player - 21 Componentes

### AudioVisualizer
```tsx
<AudioVisualizer isPlaying={true} barCount={32} genre="rock" variant="default" />
```

### NowPlaying
```tsx
<NowPlaying track={{ title: 'Música', artist: 'Artista', cover: '/cover.jpg' }} isPlaying={true} />
```

### VolumeSlider
```tsx
<VolumeSlider volume={75} onVolumeChange={setVolume} muted={false} onMuteToggle={toggleMute} />
```

**Outros:** CommandDeck, DigitalClock, FullscreenKaraoke, KaraokeLyrics, LibraryPanel, LyricsDisplay, PlaybackControls, PlayerControls, ProgressBar, QueuePanel, SideInfoPanel, SystemMonitor, UserBadge, VoiceControlButton, WeatherWidget, WeatherForecastChart, ConnectionIndicator

---

## 4. Settings - 60 Componentes

### SettingsSection
```tsx
<SettingsSection icon={<Settings />} title="Geral" description="Preferências" defaultOpen instructions={{ title: 'Ajuda', steps: ['Passo 1'] }}>
  {children}
</SettingsSection>
```

**Subcategorias:**
- **Database:** DatabaseSection, AdvancedDatabaseSection, UnifiedDatabaseSection
- **Backup:** BackupManager, BackupCard, BackupActions, BackupHistory, BackupScheduler
- **Integrations:** SpotifySetupWizard, YouTubeMusicSetupWizard, GitHubExportSection, StorjSection
- **Users:** UserManagementSection, KeysManagementSection, AuthProviderSection
- **Voice:** VoiceControlSection, VoiceTrainingMode, VoiceCommandHistory
- **Developer:** CodeScanSection, FullstackRefactorPanel, CreateDeployKeyModal

---

## 5. Spotify - 8 Componentes

```tsx
import { SpotifyPanel, TrackItem, PlaylistCard, AlbumCard, ArtistCard, SpotifyUserBadge, AddToPlaylistModal, CreatePlaylistModal } from '@/components/spotify';
```

---

## 6. YouTube Music - 5 Componentes

```tsx
import { YouTubeMusicTrackItem, YouTubeMusicPlaylistCard, YouTubeMusicAlbumCard, YouTubeMusicUserBadge, AddToPlaylistModal } from '@/components/youtube';
```

---

## 7. GitHub - 16 Componentes

### KpiCard
```tsx
<KpiCard title="Commits" value={1234} icon={GitCommit} color="bg-blue-500" isLoading={false} />
```

**Outros:** LanguagesChart, ContributorsChart, CommitsTable, CommitFilters, ReleasesSection, BranchesSection, AutoSyncPanel, CacheIndicator, SyncHistoryPanel, FileSelectionModal, GitHubDashboardCharts, GitHubDashboardSkeleton, GitHubErrorState, GitHubEmptyState

---

## 8. Jam Session - 10 Componentes

### CreateJamModal
```tsx
<CreateJamModal open={open} onOpenChange={setOpen} />
```

**Outros:** JamHeader, JamQueue, JamPlayer, JamParticipantsList, JamReactions, JamNicknameModal, JamInviteModal, JamAddTrackModal, JamAISuggestions

---

## 9. Auth - 6 Componentes

```tsx
import { LoginForm, SignUpForm, LocalLoginForm, AuthFormField, ProtectedRoute, PermissionGate } from '@/components/auth';

<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>
<PermissionGate permission="manage_users"><UserManagement /></PermissionGate>
```

---

## 10. Layout - 2 Componentes

```tsx
import { KioskLayout, AdminLayout } from '@/components/layout';
<KioskLayout>{children}</KioskLayout>
```

---

## 11. Wiki - 4 Componentes

```tsx
import { WikiArticleView, WikiNavigation, WikiSearch } from '@/components/wiki';
import { wikiCategories, findArticleById } from '@/components/wiki/wikiData';
```

---

## 12. Landing - 6 Componentes

DemoAnimated, FAQSection, ScreenshotCarousel, ScreenshotPreview, StatsSection, ThemeComparison

---

## 13. Outros - 13 Componentes

- **Errors:** ErrorBoundary, SuspenseBoundary, PageBoundary
- **Debug:** ContrastDebugPanel, DevFileChangeMonitor
- **Docs:** CodePlayground
- **Audit:** AuditLogViewer
- **Tour:** GuidedTour
- **Help:** InteractiveTestMode
- **Kiosk:** KioskRemoteControl
- **Weather:** AnimatedWeatherIcon
- **Upload:** AudioWaveformPreview
- **System:** TraceViewer
- **Spicetify:** ThemePreviewCard

---

## Design Tokens

```css
/* Cores semânticas */
--background, --foreground, --primary, --secondary, --muted, --accent, --destructive, --border
/* Kiosk */
--kiosk-bg, --kiosk-surface, --kiosk-primary, --kiosk-text
/* Gêneros */
--genre-rock, --genre-pop, --genre-soul, --genre-hip-hop
```

---

**Licença:** Public Domain
