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

// File categories for selection modal - 57 arquivos organizados por tipo
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
  
  // === E2E SPECS (15 arquivos principais) ===
  'E2E Specs': [
    'e2e/specs/code-scan.spec.ts',
    'e2e/specs/code-scan-a11y.spec.ts',
    'e2e/specs/github-sync.spec.ts',
    'e2e/specs/ai-providers-a11y.spec.ts',
    'e2e/specs/ai-providers.spec.ts',
    'e2e/specs/auth-local.spec.ts',
    'e2e/specs/auth-supabase.spec.ts',
    'e2e/specs/backup-management.spec.ts',
    'e2e/specs/player-controls.spec.ts',
    'e2e/specs/player-accessibility.spec.ts',
    'e2e/specs/wcag-compliance.spec.ts',
    'e2e/specs/routes-validation.spec.ts',
    'e2e/specs/keyboard-shortcuts.spec.ts',
    'e2e/specs/notifications-realtime.spec.ts',
    'e2e/specs/landing-page.spec.ts',
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

// Only these files should be synced - prevents accidental overwrites (57 arquivos)
export const SAFE_SYNC_FILES = [
  ...FILE_CATEGORIES['Documentação'],
  ...FILE_CATEGORIES['Scripts'],
  ...FILE_CATEGORIES['E2E Fixtures'],
  ...FILE_CATEGORIES['E2E Specs'],
  ...FILE_CATEGORIES['Hooks'],
  ...FILE_CATEGORIES['Componentes'],
  ...FILE_CATEGORIES['Pages'],
];
