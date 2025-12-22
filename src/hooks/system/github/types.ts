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

// File categories for selection modal
export const FILE_CATEGORIES = {
  'Documentação': [
    'docs/VERSION',
    'docs/SYNC_LOG.md',
    'docs/CHANGELOG.md',
    'docs/README.md',
    'docs/GITHUB-INTEGRATION.md',
  ],
  'Scripts': [
    'scripts/install.py',
    'scripts/diagnose-service.py',
    'scripts/tsi-status',
    'scripts/systemd-notify-wrapper.py',
    'scripts/tsijukebox-doctor',
  ],
} as const;

// Only these files should be synced - prevents accidental overwrites
export const SAFE_SYNC_FILES = [
  ...FILE_CATEGORIES['Documentação'],
  ...FILE_CATEGORIES['Scripts'],
];
