// Constants templates - 4 arquivos
// Geração automática de conteúdo para src/lib/constants/

const VERSION = '2.5.0';
const GENERATED_AT = new Date().toISOString();

export function generateConstantsContent(path: string): string | null {
  const fileName = path.split('/').pop();
  
  switch (fileName) {
    case 'index.ts':
      return generateConstantsIndex();
    case 'commitTypes.ts':
      return generateCommitTypes();
    case 'connectionTypes.ts':
      return generateConnectionTypes();
    case 'defaultPlaylists.ts':
      return generateDefaultPlaylists();
    default:
      return null;
  }
}

function generateConstantsIndex(): string {
  return `// Constants - centralized exports
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export * from './commitTypes';
export * from './connectionTypes';
export * from './defaultPlaylists';

// App-wide constants
export const APP_NAME = 'TSiJUKEBOX';
export const APP_VERSION = '${VERSION}';
export const APP_DESCRIPTION = 'Smart Music Player for Linux';

// API endpoints
export const API_ENDPOINTS = {
  SPOTIFY: 'https://api.spotify.com/v1',
  YOUTUBE: 'https://www.googleapis.com/youtube/v3',
  LOCAL: '/api/local',
} as const;

// Feature flags
export const FEATURES = {
  SPOTIFY_ENABLED: true,
  YOUTUBE_ENABLED: true,
  LOCAL_ENABLED: true,
  JAM_SESSION_ENABLED: true,
  VOICE_CONTROL_ENABLED: false,
  KIOSK_MODE_ENABLED: true,
} as const;
`;
}

function generateCommitTypes(): string {
  return `// Commit types for changelog generation
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export interface CommitType {
  type: string;
  emoji: string;
  description: string;
  category: 'feature' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
}

export const COMMIT_TYPES: CommitType[] = [
  { type: 'feat', emoji: '✨', description: 'Nova funcionalidade', category: 'feature' },
  { type: 'fix', emoji: '🐛', description: 'Correção de bug', category: 'fix' },
  { type: 'docs', emoji: '📚', description: 'Documentação', category: 'docs' },
  { type: 'style', emoji: '💄', description: 'Estilo/UI', category: 'style' },
  { type: 'refactor', emoji: '♻️', description: 'Refatoração', category: 'refactor' },
  { type: 'perf', emoji: '⚡', description: 'Performance', category: 'refactor' },
  { type: 'test', emoji: '✅', description: 'Testes', category: 'test' },
  { type: 'build', emoji: '📦', description: 'Build/Deploy', category: 'chore' },
  { type: 'ci', emoji: '👷', description: 'CI/CD', category: 'chore' },
  { type: 'chore', emoji: '🔧', description: 'Manutenção', category: 'chore' },
  { type: 'revert', emoji: '⏪', description: 'Reverter', category: 'fix' },
  { type: 'sync', emoji: '🔄', description: 'Sincronização', category: 'chore' },
];

export const getCommitTypeByName = (type: string): CommitType | undefined => {
  return COMMIT_TYPES.find(ct => ct.type === type);
};

export const getCommitEmoji = (type: string): string => {
  return getCommitTypeByName(type)?.emoji ?? '📝';
};
`;
}

function generateConnectionTypes(): string {
  return `// Connection types for status monitoring
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ConnectionInfo {
  id: string;
  name: string;
  type: ConnectionType;
  status: ConnectionStatus;
  lastChecked: Date;
  latency?: number;
  error?: string;
}

export type ConnectionType = 
  | 'database'
  | 'spotify'
  | 'youtube'
  | 'github'
  | 'backend'
  | 'websocket'
  | 'local';

export const CONNECTION_LABELS: Record<ConnectionType, string> = {
  database: 'Banco de Dados',
  spotify: 'Spotify API',
  youtube: 'YouTube Music API',
  github: 'GitHub API',
  backend: 'Backend Server',
  websocket: 'WebSocket',
  local: 'Música Local',
};

export const CONNECTION_ICONS: Record<ConnectionType, string> = {
  database: 'Database',
  spotify: 'Music',
  youtube: 'Youtube',
  github: 'Github',
  backend: 'Server',
  websocket: 'Radio',
  local: 'HardDrive',
};

export const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: 'text-green-500',
  disconnected: 'text-gray-500',
  connecting: 'text-yellow-500',
  error: 'text-red-500',
};
`;
}

function generateDefaultPlaylists(): string {
  return `// Default playlists configuration
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export interface DefaultPlaylist {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export const DEFAULT_PLAYLISTS: DefaultPlaylist[] = [
  {
    id: 'favorites',
    name: 'Favoritas',
    description: 'Suas músicas favoritas',
    icon: 'Heart',
    color: 'rose',
    isSystem: true,
  },
  {
    id: 'recently-played',
    name: 'Tocadas Recentemente',
    description: 'Últimas músicas reproduzidas',
    icon: 'Clock',
    color: 'blue',
    isSystem: true,
  },
  {
    id: 'most-played',
    name: 'Mais Tocadas',
    description: 'Músicas mais reproduzidas',
    icon: 'TrendingUp',
    color: 'purple',
    isSystem: true,
  },
  {
    id: 'queue',
    name: 'Fila de Reprodução',
    description: 'Próximas músicas',
    icon: 'ListMusic',
    color: 'green',
    isSystem: true,
  },
];

export const getPlaylistById = (id: string): DefaultPlaylist | undefined => {
  return DEFAULT_PLAYLISTS.find(p => p.id === id);
};

export const getSystemPlaylists = (): DefaultPlaylist[] => {
  return DEFAULT_PLAYLISTS.filter(p => p.isSystem);
};
`;
}
