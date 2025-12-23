// GitHub sync types - separated for better organization

export interface FileToSync {
  path: string;
  content: string;
}

export interface SyncResult {
  success: boolean;
  commit?: {
    sha: string;
    url: string;
    message: string;
    filesChanged: number;
  };
  error?: string;
  skippedFiles?: string[];
  syncedFiles?: string[];
}

export interface SyncProgress {
  phase: 'preparing' | 'uploading' | 'committing' | 'done' | 'error';
  current: number;
  total: number;
  currentFile?: string;
}

export interface UseGitHubFullSyncReturn {
  isSyncing: boolean;
  progress: SyncProgress | null;
  error: string | null;
  lastSync: SyncResult | null;
  syncFiles: (files: FileToSync[], commitMessage?: string) => Promise<SyncResult>;
  syncFullRepository: (commitMessage?: string) => Promise<SyncResult>;
  syncSelectedFiles: (selectedPaths: string[], commitMessage?: string) => Promise<SyncResult>;
  clearError: () => void;
}

export interface SyncHistoryEntry {
  id: string;
  commit_sha: string;
  commit_url: string | null;
  commit_message: string | null;
  branch: string;
  files_synced: number;
  files_skipped: number;
  synced_files: string[];
  skipped_files: string[];
  sync_type: 'manual' | 'auto' | 'webhook';
  sync_source: string | null;
  duration_ms: number | null;
  status: 'success' | 'partial' | 'failed';
  error_message: string | null;
  created_at: string;
}

// File categories for selection modal - 95 arquivos organizados por tipo
export const FILE_CATEGORIES = {
  // === DOCUMENTAÇÃO (5 arquivos) ===
  'Documentação': [
    'docs/VERSION',
    'docs/SYNC_LOG.md',
    'docs/CHANGELOG.md',
    'docs/README.md',
    'docs/GITHUB-INTEGRATION.md',
  ],
  
  // === SCRIPTS (5 arquivos) ===
  'Scripts': [
    'scripts/install.py',
    'scripts/diagnose-service.py',
    'scripts/tsi-status',
    'scripts/systemd-notify-wrapper.py',
    'scripts/tsijukebox-doctor',
  ],
  
  // === E2E FIXTURES (9 arquivos) ===
  'E2E Fixtures': [
    'e2e/fixtures/a11y.fixture.ts',
    'e2e/fixtures/auth.fixture.ts',
    'e2e/fixtures/backup.fixture.ts',
    'e2e/fixtures/brand.fixture.ts',
    'e2e/fixtures/code-scan.fixture.ts',
    'e2e/fixtures/deploy-key.fixture.ts',
    'e2e/fixtures/notifications.fixture.ts',
    'e2e/fixtures/player.fixture.ts',
    'e2e/fixtures/settings.fixture.ts',
  ],
  
  // === E2E SPECS (29 arquivos - cobertura completa) ===
  'E2E Specs': [
    // Core specs
    'e2e/specs/code-scan.spec.ts',
    'e2e/specs/code-scan-a11y.spec.ts',
    'e2e/specs/github-sync.spec.ts',
    'e2e/specs/ai-providers-a11y.spec.ts',
    'e2e/specs/ai-providers.spec.ts',
    'e2e/specs/auth-local.spec.ts',
    'e2e/specs/auth-supabase.spec.ts',
    'e2e/specs/auth-permissions.spec.ts',
    'e2e/specs/backup-management.spec.ts',
    // Player specs
    'e2e/specs/player-controls.spec.ts',
    'e2e/specs/player-accessibility.spec.ts',
    'e2e/specs/player-responsive.spec.ts',
    'e2e/specs/player-progress.spec.ts',
    'e2e/specs/playback-controls.spec.ts',
    'e2e/specs/volume-controls.spec.ts',
    'e2e/specs/queue-panel.spec.ts',
    'e2e/specs/now-playing.spec.ts',
    // UI/UX specs
    'e2e/specs/wcag-compliance.spec.ts',
    'e2e/specs/routes-validation.spec.ts',
    'e2e/specs/keyboard-shortcuts.spec.ts',
    'e2e/specs/touch-gestures.spec.ts',
    'e2e/specs/notifications-realtime.spec.ts',
    'e2e/specs/landing-page.spec.ts',
    // Integration specs
    'e2e/specs/brand-guidelines.spec.ts',
    'e2e/specs/deploy-key.spec.ts',
    'e2e/specs/manus-automation.spec.ts',
    'e2e/specs/spotify-wizard.spec.ts',
    'e2e/specs/voice-control.spec.ts',
    'e2e/specs/youtube-music-wizard.spec.ts',
  ],
  
  // === HOOKS DO SISTEMA (10 arquivos) ===
  'Hooks': [
    'src/hooks/system/useGitHubFullSync.ts',
    'src/hooks/system/useGitHubSync.ts',
    'src/hooks/system/useAutoSync.ts',
    'src/hooks/system/useCodeScan.ts',
    'src/hooks/system/useA11yStats.ts',
    'src/hooks/system/useSyncHistory.ts',
    'src/hooks/system/useGitHubStats.ts',
    'src/hooks/system/useGitHubExport.ts',
    'src/hooks/system/useConnectionMonitor.ts',
    'src/hooks/system/useNetworkStatus.ts',
  ],
  
  // === COMPONENTES SETTINGS (8 arquivos) ===
  'Componentes': [
    'src/components/settings/CodeScanSection.tsx',
    'src/components/settings/GitHubExportSection.tsx',
    'src/components/settings/GitHubSyncStatus.tsx',
    'src/components/settings/AccessibilitySection.tsx',
    'src/components/settings/BackendConnectionSection.tsx',
    'src/components/settings/DatabaseSection.tsx',
    'src/components/settings/ScriptRefactorSection.tsx',
    'src/components/settings/SettingsDashboard.tsx',
  ],
  
  // === PAGES/DASHBOARDS (5 arquivos) ===
  'Pages': [
    'src/pages/dashboards/GitHubDashboard.tsx',
    'src/pages/dashboards/A11yDashboard.tsx',
    'src/pages/dashboards/HealthDashboard.tsx',
    'src/pages/dashboards/KioskMonitorDashboard.tsx',
    'src/pages/settings/Settings.tsx',
  ],
  
  // === UTILS/LIB (12 arquivos) === NOVA CATEGORIA
  'Utils': [
    'src/lib/utils.ts',
    'src/lib/utils/fileChangeDetector.ts',
    'src/lib/formatters.ts',
    'src/lib/date-utils.ts',
    'src/lib/colorExtractor.ts',
    'src/lib/contrastUtils.ts',
    'src/lib/theme-utils.ts',
    'src/lib/globalSearch.ts',
    'src/lib/lrcParser.ts',
    'src/lib/lyricsCache.ts',
    'src/lib/documentExporter.ts',
    'src/lib/constants.ts',
  ],
  
  // === API CLIENTS (9 arquivos) === NOVA CATEGORIA
  'API': [
    'src/lib/api/client.ts',
    'src/lib/api/spotify.ts',
    'src/lib/api/localMusic.ts',
    'src/lib/api/youtubeMusic.ts',
    'src/lib/api/sshSync.ts',
    'src/lib/api/storj.ts',
    'src/lib/api/spicetify.ts',
    'src/lib/api/types.ts',
    'src/lib/api/index.ts',
  ],
  
  // === AUTH (3 arquivos) === NOVA CATEGORIA
  'Auth': [
    'src/lib/auth/localUsers.ts',
    'src/lib/auth/passwordUtils.ts',
    'src/lib/auth/index.ts',
  ],
  
  // === CONTEXTS (8 arquivos) ===
  'Contexts': [
    'src/contexts/AppSettingsContext.tsx',
    'src/contexts/JamContext.tsx',
    'src/contexts/SettingsContext.tsx',
    'src/contexts/SpotifyContext.tsx',
    'src/contexts/ThemeContext.tsx',
    'src/contexts/UserContext.tsx',
    'src/contexts/YouTubeMusicContext.tsx',
    'src/contexts/index.ts',
  ],
  
  // === TYPES (10 arquivos) ===
  'Types': [
    'src/types/audit.ts',
    'src/types/index.ts',
    'src/types/kiosk.ts',
    'src/types/lyrics.ts',
    'src/types/notifications.ts',
    'src/types/settings.ts',
    'src/types/spotify-api.ts',
    'src/types/track.ts',
    'src/types/user.ts',
    'src/types/weather.ts',
  ],
  
  // === STORAGE (2 arquivos) ===
  'Storage': [
    'src/lib/storage/index.ts',
    'src/lib/storage/mediaProviderStorage.ts',
  ],
  
  // === VALIDATIONS (2 arquivos) ===
  'Validations': [
    'src/lib/validations/authSchemas.ts',
    'src/lib/validations/index.ts',
  ],
  
  // === CONSTANTS (4 arquivos) ===
  'Constants': [
    'src/lib/constants/commitTypes.ts',
    'src/lib/constants/connectionTypes.ts',
    'src/lib/constants/defaultPlaylists.ts',
    'src/lib/constants/index.ts',
  ],
  
  // === I18N (4 arquivos) ===
  'i18n': [
    'src/i18n/index.ts',
    'src/i18n/locales/en.json',
    'src/i18n/locales/es.json',
    'src/i18n/locales/pt-BR.json',
  ],
  
  // === ROUTES (1 arquivo) ===
  'Routes': [
    'src/routes/index.tsx',
  ],
  
  // === LIB INDEX (1 arquivo) ===
  'Lib': [
    'src/lib/index.ts',
  ],
  
  // === COMPONENTS UI (15 arquivos) ===
  'Components UI': [
    'src/components/ui/button.tsx',
    'src/components/ui/input.tsx',
    'src/components/ui/card.tsx',
    'src/components/ui/dialog.tsx',
    'src/components/ui/toast.tsx',
    'src/components/ui/form.tsx',
    'src/components/ui/select.tsx',
    'src/components/ui/tabs.tsx',
    'src/components/ui/dropdown-menu.tsx',
    'src/components/ui/badge.tsx',
    'src/components/ui/progress.tsx',
    'src/components/ui/skeleton.tsx',
    'src/components/ui/tooltip.tsx',
    'src/components/ui/switch.tsx',
    'src/components/ui/index.ts',
  ],
  
  // === COMPONENTS PLAYER (10 arquivos) ===
  'Components Player': [
    'src/components/player/NowPlaying.tsx',
    'src/components/player/PlayerControls.tsx',
    'src/components/player/PlaybackControls.tsx',
    'src/components/player/VolumeSlider.tsx',
    'src/components/player/ProgressBar.tsx',
    'src/components/player/QueuePanel.tsx',
    'src/components/player/LyricsDisplay.tsx',
    'src/components/player/AudioVisualizer.tsx',
    'src/components/player/LibraryPanel.tsx',
    'src/components/player/index.ts',
  ],
  
  // === COMPONENTS GITHUB (8 arquivos) ===
  'Components GitHub': [
    'src/components/github/AutoSyncPanel.tsx',
    'src/components/github/FileSelectionModal.tsx',
    'src/components/github/SyncHistoryPanel.tsx',
    'src/components/github/CommitsTable.tsx',
    'src/components/github/GitHubDashboardCharts.tsx',
    'src/components/github/KpiCard.tsx',
    'src/components/github/LanguagesChart.tsx',
    'src/components/github/index.ts',
  ],

  // === COMPONENTS LAYOUT (2 arquivos) ===
  'Components Layout': [
    'src/components/layout/AdminLayout.tsx',
    'src/components/layout/KioskLayout.tsx',
  ],

  // === COMPONENTS AUTH (7 arquivos) ===
  'Components Auth': [
    'src/components/auth/AuthFormField.tsx',
    'src/components/auth/LocalLoginForm.tsx',
    'src/components/auth/LoginForm.tsx',
    'src/components/auth/PermissionGate.tsx',
    'src/components/auth/ProtectedRoute.tsx',
    'src/components/auth/SignUpForm.tsx',
    'src/components/auth/index.ts',
  ],

  // === COMPONENTS SPOTIFY (9 arquivos) ===
  'Components Spotify': [
    'src/components/spotify/AddToPlaylistModal.tsx',
    'src/components/spotify/AlbumCard.tsx',
    'src/components/spotify/ArtistCard.tsx',
    'src/components/spotify/CreatePlaylistModal.tsx',
    'src/components/spotify/PlaylistCard.tsx',
    'src/components/spotify/SpotifyPanel.tsx',
    'src/components/spotify/SpotifyUserBadge.tsx',
    'src/components/spotify/TrackItem.tsx',
    'src/components/spotify/index.ts',
  ],

  // === COMPONENTS YOUTUBE (6 arquivos) ===
  'Components YouTube': [
    'src/components/youtube/AddToPlaylistModal.tsx',
    'src/components/youtube/YouTubeMusicAlbumCard.tsx',
    'src/components/youtube/YouTubeMusicPlaylistCard.tsx',
    'src/components/youtube/YouTubeMusicTrackItem.tsx',
    'src/components/youtube/YouTubeMusicUserBadge.tsx',
    'src/components/youtube/index.ts',
  ],

  // === COMPONENTS JAM (10 arquivos) ===
  'Components Jam': [
    'src/components/jam/CreateJamModal.tsx',
    'src/components/jam/JamAISuggestions.tsx',
    'src/components/jam/JamAddTrackModal.tsx',
    'src/components/jam/JamHeader.tsx',
    'src/components/jam/JamInviteModal.tsx',
    'src/components/jam/JamNicknameModal.tsx',
    'src/components/jam/JamParticipantsList.tsx',
    'src/components/jam/JamPlayer.tsx',
    'src/components/jam/JamQueue.tsx',
    'src/components/jam/JamReactions.tsx',
  ],

  // === COMPONENTS LANDING (6 arquivos) ===
  'Components Landing': [
    'src/components/landing/DemoAnimated.tsx',
    'src/components/landing/FAQSection.tsx',
    'src/components/landing/ScreenshotCarousel.tsx',
    'src/components/landing/ScreenshotPreview.tsx',
    'src/components/landing/StatsSection.tsx',
    'src/components/landing/ThemeComparison.tsx',
  ],

  // === COMPONENTS ERRORS (3 arquivos) ===
  'Components Errors': [
    'src/components/errors/ErrorBoundary.tsx',
    'src/components/errors/SuspenseBoundary.tsx',
    'src/components/errors/index.ts',
  ],

  // === COMPONENTS ROOT (3 arquivos) ===
  'Components Root': [
    'src/components/GlobalSearchModal.tsx',
    'src/components/NavLink.tsx',
    'src/components/kiosk/KioskRemoteControl.tsx',
  ],

  // === HOOKS PLAYER (13 arquivos) ===
  'Hooks Player': [
    'src/hooks/player/index.ts',
    'src/hooks/player/useLibrary.ts',
    'src/hooks/player/useLocalMusic.ts',
    'src/hooks/player/useLyrics.ts',
    'src/hooks/player/usePlaybackControls.ts',
    'src/hooks/player/usePlayer.ts',
    'src/hooks/player/useSpicetifyIntegration.ts',
    'src/hooks/player/useVoiceCommandHistory.ts',
    'src/hooks/player/useVoiceControl.ts',
    'src/hooks/player/useVoiceSearch.ts',
    'src/hooks/player/useVoiceTraining.ts',
    'src/hooks/player/useVolume.ts',
    'src/hooks/player/useVolumeNormalization.ts',
  ],

  // === HOOKS SPOTIFY (7 arquivos) ===
  'Hooks Spotify': [
    'src/hooks/spotify/index.ts',
    'src/hooks/spotify/useSpotifyBrowse.ts',
    'src/hooks/spotify/useSpotifyLibrary.ts',
    'src/hooks/spotify/useSpotifyPlayer.ts',
    'src/hooks/spotify/useSpotifyPlaylists.ts',
    'src/hooks/spotify/useSpotifyRecommendations.ts',
    'src/hooks/spotify/useSpotifySearch.ts',
  ],

  // === HOOKS YOUTUBE (7 arquivos) ===
  'Hooks YouTube': [
    'src/hooks/youtube/index.ts',
    'src/hooks/youtube/useYouTubeMusicBrowse.ts',
    'src/hooks/youtube/useYouTubeMusicLibrary.ts',
    'src/hooks/youtube/useYouTubeMusicPlayer.ts',
    'src/hooks/youtube/useYouTubeMusicPlaylists.ts',
    'src/hooks/youtube/useYouTubeMusicRecommendations.ts',
    'src/hooks/youtube/useYouTubeMusicSearch.ts',
  ],

  // === HOOKS JAM (6 arquivos) ===
  'Hooks Jam': [
    'src/hooks/jam/index.ts',
    'src/hooks/jam/useJamMusicSearch.ts',
    'src/hooks/jam/useJamParticipants.ts',
    'src/hooks/jam/useJamQueue.ts',
    'src/hooks/jam/useJamReactions.ts',
    'src/hooks/jam/useJamSession.ts',
  ],

  // === COMPONENTS SETTINGS (17 arquivos) ===
  'Components Settings': [
    'src/components/settings/AccessibilitySection.tsx',
    'src/components/settings/AIConfigSection.tsx',
    'src/components/settings/AddCustomCommandModal.tsx',
    'src/components/settings/BackendConnectionSection.tsx',
    'src/components/settings/CloudConnectionSection.tsx',
    'src/components/settings/DatabaseSection.tsx',
    'src/components/settings/LanguageSection.tsx',
    'src/components/settings/LocalMusicSection.tsx',
    'src/components/settings/MusicIntegrationsSection.tsx',
    'src/components/settings/SettingsGuideModal.tsx',
    'src/components/settings/SpotifySetupWizard.tsx',
    'src/components/settings/ThemeSection.tsx',
    'src/components/settings/VoiceControlSection.tsx',
    'src/components/settings/VolumeNormalizationSection.tsx',
    'src/components/settings/WeatherConfigSection.tsx',
    'src/components/settings/YouTubeMusicSection.tsx',
    'src/components/settings/index.ts',
  ],

  // === HOOKS COMMON (22 arquivos) ===
  'Hooks Common': [
    'src/hooks/common/index.ts',
    'src/hooks/common/use-mobile.tsx',
    'src/hooks/common/use-toast.ts',
    'src/hooks/common/useBackNavigation.ts',
    'src/hooks/common/useDebounce.ts',
    'src/hooks/common/useFirstAccess.ts',
    'src/hooks/common/useGlobalSearch.ts',
    'src/hooks/common/useMediaProviderStorage.ts',
    'src/hooks/common/useNotifications.ts',
    'src/hooks/common/usePWAInstall.ts',
    'src/hooks/common/useReadArticles.ts',
    'src/hooks/common/useRipple.ts',
    'src/hooks/common/useSettingsNotifications.ts',
    'src/hooks/common/useSettingsSelector.ts',
    'src/hooks/common/useSettingsStatus.ts',
    'src/hooks/common/useSettingsTour.ts',
    'src/hooks/common/useSoundEffects.ts',
    'src/hooks/common/useThemeCustomizer.ts',
    'src/hooks/common/useTouchGestures.ts',
    'src/hooks/common/useTranslation.ts',
    'src/hooks/common/useWikiBookmarks.ts',
    'src/hooks/common/useWikiOffline.ts',
  ],

  // === HOOKS SYSTEM (18 arquivos principais) ===
  'Hooks System': [
    'src/hooks/system/index.ts',
    'src/hooks/system/useAutoSync.ts',
    'src/hooks/system/useCodeScan.ts',
    'src/hooks/system/useConnectionMonitor.ts',
    'src/hooks/system/useFileChangeDetector.ts',
    'src/hooks/system/useGitHubCache.ts',
    'src/hooks/system/useInstallerMetrics.ts',
    'src/hooks/system/useKioskMonitor.ts',
    'src/hooks/system/useLogs.ts',
    'src/hooks/system/useMockData.ts',
    'src/hooks/system/useNetworkStatus.ts',
    'src/hooks/system/usePlaybackStats.ts',
    'src/hooks/system/useStatus.ts',
    'src/hooks/system/useSyncHistory.ts',
    'src/hooks/system/useWeather.ts',
    'src/hooks/system/useWebSocketStatus.ts',
  ],

  // === LIB API (12 arquivos) ===
  'Lib API': [
    'src/lib/api/index.ts',
    'src/lib/api/client.ts',
    'src/lib/api/types.ts',
    'src/lib/api/spotify.ts',
    'src/lib/api/youtubeMusic.ts',
    'src/lib/api/localMusic.ts',
    'src/lib/api/storj.ts',
    'src/lib/api/sshSync.ts',
    'src/lib/api/spicetify.ts',
    'src/lib/api/spotify/index.ts',
    'src/lib/api/spotify/types.ts',
    'src/lib/api/spotify/mappers.ts',
  ],

  // === COMPONENTS WIKI (4 arquivos) ===
  'Components Wiki': [
    'src/components/wiki/WikiArticle.tsx',
    'src/components/wiki/WikiNavigation.tsx',
    'src/components/wiki/WikiSearch.tsx',
    'src/components/wiki/wikiData.ts',
  ],

  // === COMPONENTS UI EXTENDED (40 arquivos) ===
  'Components UI Extended': [
    'src/components/ui/accordion.tsx',
    'src/components/ui/alert.tsx',
    'src/components/ui/alert-dialog.tsx',
    'src/components/ui/aspect-ratio.tsx',
    'src/components/ui/avatar.tsx',
    'src/components/ui/breadcrumb.tsx',
    'src/components/ui/calendar.tsx',
    'src/components/ui/carousel.tsx',
    'src/components/ui/chart.tsx',
    'src/components/ui/checkbox.tsx',
    'src/components/ui/collapsible.tsx',
    'src/components/ui/command.tsx',
    'src/components/ui/context-menu.tsx',
    'src/components/ui/drawer.tsx',
    'src/components/ui/hover-card.tsx',
    'src/components/ui/input-otp.tsx',
    'src/components/ui/label.tsx',
    'src/components/ui/menubar.tsx',
    'src/components/ui/navigation-menu.tsx',
    'src/components/ui/pagination.tsx',
    'src/components/ui/popover.tsx',
    'src/components/ui/radio-group.tsx',
    'src/components/ui/resizable.tsx',
    'src/components/ui/scroll-area.tsx',
    'src/components/ui/separator.tsx',
    'src/components/ui/sheet.tsx',
    'src/components/ui/sidebar.tsx',
    'src/components/ui/slider.tsx',
    'src/components/ui/sonner.tsx',
    'src/components/ui/table.tsx',
    'src/components/ui/textarea.tsx',
    'src/components/ui/toaster.tsx',
    'src/components/ui/toggle.tsx',
    'src/components/ui/toggle-group.tsx',
    'src/components/ui/use-toast.ts',
    'src/components/ui/BackButton.tsx',
    'src/components/ui/BrandLogo.tsx',
    'src/components/ui/InfoTooltip.tsx',
    'src/components/ui/SkipLink.tsx',
    'src/components/ui/SplashScreen.tsx',
  ],

  // === PAGES TOOLS (7 arquivos) ===
  'Pages Tools': [
    'src/pages/tools/index.ts',
    'src/pages/tools/ChangelogTimeline.tsx',
    'src/pages/tools/ComponentsShowcase.tsx',
    'src/pages/tools/LyricsTest.tsx',
    'src/pages/tools/ScreenshotService.tsx',
    'src/pages/tools/VersionComparison.tsx',
    'src/pages/tools/WcagExceptions.tsx',
  ],

  // === PAGES ADMIN (5 arquivos) ===
  'Pages Admin': [
    'src/pages/admin/index.ts',
    'src/pages/admin/Admin.tsx',
    'src/pages/admin/AdminFeedback.tsx',
    'src/pages/admin/AdminLibrary.tsx',
    'src/pages/admin/AdminLogs.tsx',
  ],

  // === PAGES PUBLIC (10 arquivos) ===
  'Pages Public': [
    'src/pages/public/index.ts',
    'src/pages/public/Auth.tsx',
    'src/pages/public/Help.tsx',
    'src/pages/public/Index.tsx',
    'src/pages/public/Install.tsx',
    'src/pages/public/LandingPage.tsx',
    'src/pages/public/Login.tsx',
    'src/pages/public/NotFound.tsx',
    'src/pages/public/SetupWizard.tsx',
    'src/pages/public/Wiki.tsx',
  ],

  // === PAGES DASHBOARDS (5 arquivos) ===
  'Pages Dashboards': [
    'src/pages/dashboards/index.ts',
    'src/pages/dashboards/Dashboard.tsx',
    'src/pages/dashboards/ClientsMonitorDashboard.tsx',
    'src/pages/dashboards/InstallerMetrics.tsx',
    'src/pages/dashboards/JukeboxStatsDashboard.tsx',
  ],

  // === PAGES BRAND (3 arquivos) ===
  'Pages Brand': [
    'src/pages/brand/index.ts',
    'src/pages/brand/BrandGuidelines.tsx',
    'src/pages/brand/LogoGitHubPreview.tsx',
  ],

  // === COMPONENTS MISC (5 arquivos) ===
  'Components Misc': [
    'src/components/tour/GuidedTour.tsx',
    'src/components/debug/ContrastDebugPanel.tsx',
    'src/components/help/InteractiveTestMode.tsx',
    'src/components/system/TraceViewer.tsx',
    'src/components/upload/AudioWaveformPreview.tsx',
  ],
} as const;

// Files that should have generated content (timestamps, version info)
export const GENERATED_FILES = [
  'docs/VERSION',
  'docs/SYNC_LOG.md',
  'docs/CHANGELOG.md',
  'docs/README.md',
  'docs/GITHUB-INTEGRATION.md',
];

// Helper to check if a file needs generated content
export function isGeneratedFile(path: string): boolean {
  return GENERATED_FILES.includes(path);
}

// Only these files should be synced - prevents accidental overwrites (397 arquivos)
export const SAFE_SYNC_FILES = [
  ...FILE_CATEGORIES['Documentação'],
  ...FILE_CATEGORIES['Scripts'],
  ...FILE_CATEGORIES['E2E Fixtures'],
  ...FILE_CATEGORIES['E2E Specs'],
  ...FILE_CATEGORIES['Hooks'],
  ...FILE_CATEGORIES['Componentes'],
  ...FILE_CATEGORIES['Pages'],
  ...FILE_CATEGORIES['Utils'],
  ...FILE_CATEGORIES['API'],
  ...FILE_CATEGORIES['Auth'],
  ...FILE_CATEGORIES['Contexts'],
  ...FILE_CATEGORIES['Types'],
  ...FILE_CATEGORIES['Storage'],
  ...FILE_CATEGORIES['Validations'],
  ...FILE_CATEGORIES['Constants'],
  ...FILE_CATEGORIES['i18n'],
  ...FILE_CATEGORIES['Routes'],
  ...FILE_CATEGORIES['Lib'],
  ...FILE_CATEGORIES['Components UI'],
  ...FILE_CATEGORIES['Components Player'],
  ...FILE_CATEGORIES['Components GitHub'],
  ...FILE_CATEGORIES['Components Layout'],
  ...FILE_CATEGORIES['Components Auth'],
  ...FILE_CATEGORIES['Components Spotify'],
  ...FILE_CATEGORIES['Components YouTube'],
  ...FILE_CATEGORIES['Components Jam'],
  ...FILE_CATEGORIES['Components Landing'],
  ...FILE_CATEGORIES['Components Errors'],
  ...FILE_CATEGORIES['Components Root'],
  ...FILE_CATEGORIES['Hooks Player'],
  ...FILE_CATEGORIES['Hooks Spotify'],
  ...FILE_CATEGORIES['Hooks YouTube'],
  ...FILE_CATEGORIES['Hooks Jam'],
  ...FILE_CATEGORIES['Components Settings'],
  ...FILE_CATEGORIES['Hooks Common'],
  ...FILE_CATEGORIES['Hooks System'],
  ...FILE_CATEGORIES['Lib API'],
  ...FILE_CATEGORIES['Components Wiki'],
  ...FILE_CATEGORIES['Components UI Extended'],
  ...FILE_CATEGORIES['Pages Tools'],
  ...FILE_CATEGORIES['Pages Admin'],
  ...FILE_CATEGORIES['Pages Public'],
  ...FILE_CATEGORIES['Pages Dashboards'],
  ...FILE_CATEGORIES['Pages Brand'],
  ...FILE_CATEGORIES['Components Misc'],
];
