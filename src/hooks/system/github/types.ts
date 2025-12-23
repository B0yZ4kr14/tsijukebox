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

// Only these files should be synced - prevents accidental overwrites (127 arquivos)
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
];
