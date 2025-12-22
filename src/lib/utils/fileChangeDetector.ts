/**
 * File Change Detector Utility
 * Detects and categorizes file changes for auto-sync
 */

export type FileCategory = 'critical' | 'important' | 'docs' | 'config' | 'other';

export interface FileCategorization {
  path: string;
  category: FileCategory;
  priority: number;
}

// File patterns by category
const PATTERNS: Record<FileCategory, RegExp[]> = {
  critical: [
    /^src\/pages\/.+\.tsx$/,
    /^src\/components\/.+\.tsx$/,
    /^src\/App\.tsx$/,
    /^src\/main\.tsx$/,
  ],
  important: [
    /^src\/hooks\/.+\.ts$/,
    /^src\/lib\/.+\.ts$/,
    /^src\/integrations\/.+\.ts$/,
    /^supabase\/functions\/.+\/.+\.ts$/,
  ],
  docs: [
    /^docs\/.+\.md$/,
    /^README\.md$/,
    /^CHANGELOG\.md$/,
    /^LICENSE$/,
  ],
  config: [
    /^vite\.config\.ts$/,
    /^tailwind\.config\.ts$/,
    /^tsconfig.*\.json$/,
    /^supabase\/config\.toml$/,
  ],
  other: [
    /.*/,
  ],
};

// Priority by category (higher = more important)
const PRIORITY: Record<FileCategory, number> = {
  critical: 100,
  important: 75,
  docs: 50,
  config: 25,
  other: 10,
};

/**
 * Categorize a file path
 */
export function categorizeFile(filePath: string): FileCategory {
  for (const [category, patterns] of Object.entries(PATTERNS)) {
    if (category === 'other') continue;
    for (const pattern of patterns) {
      if (pattern.test(filePath)) {
        return category as FileCategory;
      }
    }
  }
  return 'other';
}

/**
 * Get categorization with priority for a file
 */
export function getFileCategorization(filePath: string): FileCategorization {
  const category = categorizeFile(filePath);
  return {
    path: filePath,
    category,
    priority: PRIORITY[category],
  };
}

/**
 * Sort files by priority (highest first)
 */
export function sortFilesByPriority(files: string[]): FileCategorization[] {
  return files
    .map(getFileCategorization)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Check if a file should trigger auto-sync
 */
export function shouldAutoSync(filePath: string): boolean {
  const category = categorizeFile(filePath);
  // Auto-sync critical, important, and docs files
  return ['critical', 'important', 'docs'].includes(category);
}

/**
 * Filter files that should be auto-synced
 */
export function filterSyncableFiles(files: string[]): string[] {
  return files.filter(shouldAutoSync);
}

/**
 * Group files by category
 */
export function groupFilesByCategory(files: string[]): Record<FileCategory, string[]> {
  const grouped: Record<FileCategory, string[]> = {
    critical: [],
    important: [],
    docs: [],
    config: [],
    other: [],
  };

  for (const file of files) {
    const category = categorizeFile(file);
    grouped[category].push(file);
  }

  return grouped;
}

/**
 * Generate commit message based on files
 */
export function generateCommitMessage(files: string[]): string {
  const grouped = groupFilesByCategory(files);
  const parts: string[] = [];

  if (grouped.critical.length > 0) {
    parts.push(`${grouped.critical.length} component(s)`);
  }
  if (grouped.important.length > 0) {
    parts.push(`${grouped.important.length} hook(s)/util(s)`);
  }
  if (grouped.docs.length > 0) {
    parts.push(`${grouped.docs.length} doc(s)`);
  }
  if (grouped.config.length > 0) {
    parts.push(`${grouped.config.length} config(s)`);
  }

  const summary = parts.length > 0 ? parts.join(', ') : `${files.length} file(s)`;
  
  return `[Auto-Sync] Update ${summary}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts.pop()! : '';
}

/**
 * Check if file is a TypeScript/JavaScript file
 */
export function isCodeFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ['ts', 'tsx', 'js', 'jsx'].includes(ext);
}

/**
 * Check if file is a documentation file
 */
export function isDocFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ['md', 'mdx', 'txt'].includes(ext);
}
