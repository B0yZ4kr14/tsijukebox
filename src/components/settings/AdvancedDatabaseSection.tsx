import { useState } from 'react';
import { 
  Database, HardDrive, Server, Flame, 
  Settings, Wrench, ArrowLeftRight, FileCode, BookOpen,
  Play, RefreshCw, Check, AlertTriangle, Download, Upload,
  FileText, Table, Copy, ExternalLink, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DatabaseConnectionHistory, addConnectionHistoryEntry } from './DatabaseConnectionHistory';

type DatabaseEngine = 'sqlite' | 'postgresql' | 'mariadb' | 'firebird';

interface DatabaseEngineInfo {
  id: DatabaseEngine;
  name: string;
  icon: React.ReactNode;
  description: string;
  useCases: string[];
  features: string[];
  limitations: string[];
  defaultPort: number;
  documentation: { title: string; url: string }[];
  connectionFields: { key: string; label: string; placeholder: string; type?: string }[];
  repairTools: { id: string; name: string; description: string; command: string }[];
  templates: { id: string; name: string; description: string; sql: string }[];
}

const databaseEngines: DatabaseEngineInfo[] = [
  {
    id: 'sqlite',
    name: 'SQLite',
    icon: <HardDrive className="w-5 h-5" />,
    description: 'Banco de dados leve em arquivo único, ideal para instalações single-node',
    useCases: [
      'Instalações single-node (1 terminal)',
      'Ambientes offline sem rede',
      'Backup fácil (apenas copiar arquivo)',
      'Desenvolvimento e testes',
    ],
    features: [
      'Zero configuração',
      'Arquivo único portátil',
      'Sem servidor externo',
      'Transações ACID',
      'Full-text search',
    ],
    limitations: [
      'Limite de conexões simultâneas',
      'Não recomendado para múltiplos clientes',
      'Sem replicação nativa',
    ],
    defaultPort: 0,
    documentation: [
      { title: 'SQLite Documentation', url: 'https://sqlite.org/docs.html' },
      { title: 'SQLite FAQ', url: 'https://sqlite.org/faq.html' },
      { title: 'SQLite Query Language', url: 'https://sqlite.org/lang.html' },
    ],
    connectionFields: [
      { key: 'path', label: 'Caminho do Arquivo', placeholder: '/var/lib/jukebox/data.db' },
    ],
    repairTools: [
      { id: 'vacuum', name: 'VACUUM', description: 'Compacta o banco e recupera espaço', command: 'VACUUM;' },
      { id: 'integrity', name: 'Integrity Check', description: 'Verifica integridade dos dados', command: 'PRAGMA integrity_check;' },
      { id: 'reindex', name: 'Reindex', description: 'Reconstrói todos os índices', command: 'REINDEX;' },
      { id: 'analyze', name: 'Analyze', description: 'Atualiza estatísticas das tabelas', command: 'ANALYZE;' },
    ],
    templates: [
      { id: 'tracks', name: 'Tabela de Músicas', description: 'Armazena informações das faixas', sql: `CREATE TABLE tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  duration INTEGER,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);` },
      { id: 'playlists', name: 'Tabela de Playlists', description: 'Playlists e suas músicas', sql: `CREATE TABLE playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_tracks (
  playlist_id INTEGER REFERENCES playlists(id),
  track_id INTEGER REFERENCES tracks(id),
  position INTEGER,
  PRIMARY KEY (playlist_id, track_id)
);` },
      { id: 'users', name: 'Tabela de Usuários', description: 'Usuários e permissões', sql: `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);` },
    ],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: <Database className="w-5 h-5" />,
    description: 'Banco de dados robusto e escalável para ambientes corporativos',
    useCases: [
      'Múltiplos terminais JUKEBOX (rede)',
      'Ambientes corporativos',
      'Alta disponibilidade (replicação)',
      'Integração com outras aplicações',
    ],
    features: [
      'JSON/JSONB nativo',
      'Full-text search avançado',
      'Replicação síncrona/assíncrona',
      'Extensões (PostGIS, etc)',
      'MVCC robusto',
    ],
    limitations: [
      'Requer instalação separada',
      'Mais complexo de administrar',
      'Consumo maior de recursos',
    ],
    defaultPort: 5432,
    documentation: [
      { title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
      { title: 'Tutorial Iniciante', url: 'https://www.postgresqltutorial.com/' },
      { title: 'PostgreSQL Wiki', url: 'https://wiki.postgresql.org/' },
    ],
    connectionFields: [
      { key: 'host', label: 'Host', placeholder: 'localhost' },
      { key: 'port', label: 'Porta', placeholder: '5432' },
      { key: 'database', label: 'Banco de Dados', placeholder: 'jukebox' },
      { key: 'username', label: 'Usuário', placeholder: 'postgres' },
      { key: 'password', label: 'Senha', placeholder: '••••••••', type: 'password' },
    ],
    repairTools: [
      { id: 'vacuum', name: 'VACUUM FULL', description: 'Compacta e recupera espaço', command: 'VACUUM FULL;' },
      { id: 'analyze', name: 'ANALYZE', description: 'Atualiza estatísticas', command: 'ANALYZE;' },
      { id: 'reindex', name: 'REINDEX DATABASE', description: 'Reconstrói índices', command: 'REINDEX DATABASE jukebox;' },
      { id: 'checksum', name: 'pg_checksums', description: 'Verifica checksums das páginas', command: 'pg_checksums --check' },
    ],
    templates: [
      { id: 'tracks', name: 'Tabela de Músicas', description: 'Armazena informações das faixas', sql: `CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  album VARCHAR(255),
  duration INTEGER,
  file_path TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracks_artist ON tracks(artist);
CREATE INDEX idx_tracks_metadata ON tracks USING GIN(metadata);` },
      { id: 'playlists', name: 'Tabela de Playlists', description: 'Playlists e suas músicas', sql: `CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_tracks (
  playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
  track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, track_id)
);` },
    ],
  },
  {
    id: 'mariadb',
    name: 'MariaDB',
    icon: <Server className="w-5 h-5" />,
    description: 'Fork do MySQL com melhor performance e compatibilidade',
    useCases: [
      'Ambientes com múltiplos jukeboxes',
      'Migração de sistemas MySQL existentes',
      'Compatibilidade com scripts MySQL',
      'Alto volume de leituras',
    ],
    features: [
      'Compatível com MySQL',
      'Storage engines diversos',
      'Galera Cluster nativo',
      'Thread pool',
      'Aria engine',
    ],
    limitations: [
      'Algumas funções PostgreSQL não disponíveis',
      'Menor comunidade que PostgreSQL',
      'JSON menos robusto',
    ],
    defaultPort: 3306,
    documentation: [
      { title: 'MariaDB Docs', url: 'https://mariadb.com/kb/en/' },
      { title: 'MariaDB Blog', url: 'https://mariadb.com/resources/blog/' },
    ],
    connectionFields: [
      { key: 'host', label: 'Host', placeholder: 'localhost' },
      { key: 'port', label: 'Porta', placeholder: '3306' },
      { key: 'database', label: 'Banco de Dados', placeholder: 'jukebox' },
      { key: 'username', label: 'Usuário', placeholder: 'root' },
      { key: 'password', label: 'Senha', placeholder: '••••••••', type: 'password' },
    ],
    repairTools: [
      { id: 'optimize', name: 'OPTIMIZE TABLE', description: 'Otimiza e desfragmenta tabelas', command: 'OPTIMIZE TABLE tracks, playlists;' },
      { id: 'repair', name: 'REPAIR TABLE', description: 'Repara tabelas corrompidas', command: 'REPAIR TABLE tracks;' },
      { id: 'analyze', name: 'ANALYZE TABLE', description: 'Atualiza estatísticas', command: 'ANALYZE TABLE tracks, playlists;' },
      { id: 'check', name: 'CHECK TABLE', description: 'Verifica integridade', command: 'CHECK TABLE tracks, playlists;' },
    ],
    templates: [
      { id: 'tracks', name: 'Tabela de Músicas', description: 'Armazena informações das faixas', sql: `CREATE TABLE tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  album VARCHAR(255),
  duration INT,
  file_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_artist (artist)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;` },
    ],
  },
  {
    id: 'firebird',
    name: 'Firebird',
    icon: <Flame className="w-5 h-5" />,
    description: 'Banco de dados legado multiplataforma com modo embedded',
    useCases: [
      'Sistemas legados existentes',
      'Aplicações desktop standalone',
      'Compatibilidade com Interbase',
      'Embedded database com servidor',
    ],
    features: [
      'Modo embedded e servidor',
      'Stored procedures',
      'Triggers avançados',
      'Instalação pequena',
      'Suporte a eventos',
    ],
    limitations: [
      'Comunidade menor',
      'Menos ferramentas modernas',
      'Documentação menos extensa',
    ],
    defaultPort: 3050,
    documentation: [
      { title: 'Firebird Docs', url: 'https://firebirdsql.org/en/reference-manuals/' },
      { title: 'Firebird FAQ', url: 'https://firebirdsql.org/en/faq/' },
    ],
    connectionFields: [
      { key: 'host', label: 'Host', placeholder: 'localhost' },
      { key: 'port', label: 'Porta', placeholder: '3050' },
      { key: 'database', label: 'Caminho do Banco', placeholder: '/var/lib/firebird/jukebox.fdb' },
      { key: 'username', label: 'Usuário', placeholder: 'SYSDBA' },
      { key: 'password', label: 'Senha', placeholder: '••••••••', type: 'password' },
    ],
    repairTools: [
      { id: 'gfix', name: 'gfix -sweep', description: 'Remove versões antigas de registros', command: 'gfix -sweep jukebox.fdb' },
      { id: 'validate', name: 'gfix -validate', description: 'Valida estrutura do banco', command: 'gfix -validate -full jukebox.fdb' },
      { id: 'repair', name: 'gfix -mend', description: 'Repara erros encontrados', command: 'gfix -mend jukebox.fdb' },
      { id: 'stats', name: 'gstat', description: 'Estatísticas do banco', command: 'gstat -h jukebox.fdb' },
    ],
    templates: [
      { id: 'tracks', name: 'Tabela de Músicas', description: 'Armazena informações das faixas', sql: `CREATE TABLE TRACKS (
  ID INTEGER NOT NULL PRIMARY KEY,
  TITLE VARCHAR(255) NOT NULL,
  ARTIST VARCHAR(255),
  ALBUM VARCHAR(255),
  DURATION INTEGER,
  FILE_PATH VARCHAR(500),
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE GENERATOR GEN_TRACKS_ID;
SET GENERATOR GEN_TRACKS_ID TO 0;

CREATE TRIGGER TRG_TRACKS_BI FOR TRACKS
ACTIVE BEFORE INSERT POSITION 0
AS
BEGIN
  IF (NEW.ID IS NULL) THEN
    NEW.ID = GEN_ID(GEN_TRACKS_ID, 1);
END` },
    ],
  },
];

interface ConnectionTestResult {
  success: boolean;
  latency: number;
  serverVersion?: string;
  error?: string;
  details?: {
    maxConnections?: number;
    currentConnections?: number;
    databaseSize?: string;
    uptime?: string;
    encoding?: string;
  };
}

interface AdvancedDatabaseSectionProps {
  isDemoMode?: boolean;
}

export function AdvancedDatabaseSection({ isDemoMode }: AdvancedDatabaseSectionProps) {
  const [selectedEngine, setSelectedEngine] = useState<DatabaseEngine>(() => {
    const saved = localStorage.getItem('db_engine');
    return (saved as DatabaseEngine) || 'sqlite';
  });
  const [connectionConfig, setConnectionConfig] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('db_connection_config');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeTab, setActiveTab] = useState('engine');
  const [isRunningTool, setIsRunningTool] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const engine = databaseEngines.find(e => e.id === selectedEngine)!;

  const handleEngineChange = (engineId: DatabaseEngine) => {
    setSelectedEngine(engineId);
    setConnectionStatus(null);
    localStorage.setItem('db_engine', engineId);
    toast.success(`Motor de banco alterado para ${databaseEngines.find(e => e.id === engineId)?.name}`);
  };

  const handleConfigChange = (key: string, value: string) => {
    const newConfig = { ...connectionConfig, [key]: value };
    setConnectionConfig(newConfig);
    setConnectionStatus(null);
    localStorage.setItem('db_connection_config', JSON.stringify(newConfig));
  };

  const testDatabaseConnection = async (): Promise<ConnectionTestResult> => {
    const start = Date.now();
    
    // In demo mode, simulate successful connection
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        latency: Date.now() - start,
        serverVersion: `${engine.name} (Demo Mode)`,
        details: {
          databaseSize: '256 MB',
          uptime: '7 dias, 4 horas',
          encoding: 'UTF-8'
        }
      };
    }
    
    try {
      const apiUrl = localStorage.getItem('tsi_api_url') || 'http://localhost:8000/api';
      
      switch (selectedEngine) {
        case 'sqlite': {
          const response = await fetch(`${apiUrl}/database/test/sqlite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: connectionConfig.path || '/var/lib/jukebox/data.db' })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              success: false,
              latency: Date.now() - start,
              error: errorData.detail || `Erro HTTP ${response.status}`
            };
          }
          
          const data = await response.json();
          return {
            success: true,
            latency: Date.now() - start,
            serverVersion: `SQLite ${data.version || '3.x'}`,
            details: {
              databaseSize: data.size || 'N/A',
              encoding: data.encoding || 'UTF-8'
            }
          };
        }
        
        case 'postgresql': {
          const response = await fetch(`${apiUrl}/database/test/postgresql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: connectionConfig.host || 'localhost',
              port: parseInt(connectionConfig.port) || 5432,
              database: connectionConfig.database || 'jukebox',
              username: connectionConfig.username || 'postgres',
              password: connectionConfig.password || ''
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              success: false,
              latency: Date.now() - start,
              error: errorData.detail || `Erro de conexão: ${response.status}`
            };
          }
          
          const data = await response.json();
          return {
            success: true,
            latency: Date.now() - start,
            serverVersion: data.version || 'PostgreSQL',
            details: {
              maxConnections: data.max_connections,
              currentConnections: data.current_connections,
              databaseSize: data.size,
              uptime: data.uptime,
              encoding: data.encoding
            }
          };
        }
        
        case 'mariadb': {
          const response = await fetch(`${apiUrl}/database/test/mariadb`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: connectionConfig.host || 'localhost',
              port: parseInt(connectionConfig.port) || 3306,
              database: connectionConfig.database || 'jukebox',
              username: connectionConfig.username || 'root',
              password: connectionConfig.password || ''
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              success: false,
              latency: Date.now() - start,
              error: errorData.detail || `Erro de conexão: ${response.status}`
            };
          }
          
          const data = await response.json();
          return {
            success: true,
            latency: Date.now() - start,
            serverVersion: data.version || 'MariaDB',
            details: {
              maxConnections: data.max_connections,
              currentConnections: data.threads_connected,
              databaseSize: data.size,
              uptime: data.uptime
            }
          };
        }
        
        case 'firebird': {
          const response = await fetch(`${apiUrl}/database/test/firebird`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: connectionConfig.host || 'localhost',
              port: parseInt(connectionConfig.port) || 3050,
              database: connectionConfig.database || '/var/lib/firebird/jukebox.fdb',
              username: connectionConfig.username || 'SYSDBA',
              password: connectionConfig.password || ''
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              success: false,
              latency: Date.now() - start,
              error: errorData.detail || `Erro de conexão: ${response.status}`
            };
          }
          
          const data = await response.json();
          return {
            success: true,
            latency: Date.now() - start,
            serverVersion: data.version || 'Firebird',
            details: {
              databaseSize: data.size,
              encoding: data.charset
            }
          };
        }
        
        default:
          return {
            success: false,
            latency: Date.now() - start,
            error: 'Motor de banco não suportado'
          };
      }
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    toast.info(`Testando conexão ${engine.name}...`);
    
    const result = await testDatabaseConnection();
    setConnectionStatus(result);
    setIsTesting(false);
    
    // Add to connection history
    addConnectionHistoryEntry({
      latency: result.latency,
      success: result.success,
      engine: selectedEngine
    });
    
    if (result.success) {
      toast.success(`Conexão ${engine.name} estabelecida com sucesso`);
    } else {
      toast.error(`Falha na conexão: ${result.error}`);
    }
  };

  const handleRunTool = async (toolId: string, toolName: string) => {
    setIsRunningTool(toolId);
    toast.info(`Executando ${toolName}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunningTool(null);
    toast.success(`${toolName} executado com sucesso`);
  };

  const handleCopySQL = (sql: string, templateName: string) => {
    navigator.clipboard.writeText(sql);
    toast.success(`SQL de "${templateName}" copiado para a área de transferência`);
  };

  const handleExportSchema = () => {
    const schema = engine.templates.map(t => t.sql).join('\n\n');
    const blob = new Blob([schema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jukebox-schema-${selectedEngine}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schema exportado com sucesso');
  };

  return (
    <SettingsSection
      icon={<Database className="w-5 h-5 icon-neon-blue" />}
      title="Banco de Dados Avançado"
      description="Configure o motor e conexão do banco de dados"
      data-tour="database-engine"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-4 bg-kiosk-surface/50">
          <TabsTrigger value="engine" className="text-xs data-[state=active]:bg-primary/20">
            <Settings className="w-3 h-3 mr-1" />
            Motor
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs data-[state=active]:bg-primary/20">
            <Database className="w-3 h-3 mr-1" />
            Config
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs data-[state=active]:bg-primary/20">
            <Wrench className="w-3 h-3 mr-1" />
            Reparo
          </TabsTrigger>
          <TabsTrigger value="migration" className="text-xs data-[state=active]:bg-primary/20">
            <ArrowLeftRight className="w-3 h-3 mr-1" />
            Migração
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs data-[state=active]:bg-primary/20">
            <FileCode className="w-3 h-3 mr-1" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="docs" className="text-xs data-[state=active]:bg-primary/20">
            <BookOpen className="w-3 h-3 mr-1" />
            Docs
          </TabsTrigger>
        </TabsList>

        {/* Engine Selection Tab */}
        <TabsContent value="engine" className="space-y-4">
          <RadioGroup value={selectedEngine} onValueChange={(v) => handleEngineChange(v as DatabaseEngine)}>
            <div className="grid grid-cols-2 gap-3">
              {databaseEngines.map((eng) => (
                <label
                  key={eng.id}
                  className={cn(
                    "flex flex-col p-4 rounded-lg cursor-pointer transition-all",
                    selectedEngine === eng.id
                      ? "card-option-selected-3d"
                      : "card-option-dark-3d hover:border-cyan-500/40"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <RadioGroupItem value={eng.id} className="sr-only" />
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedEngine === eng.id ? "bg-primary/20" : "bg-kiosk-surface/60"
                    )}>
                      <span className="icon-neon-blue">{eng.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-kiosk-text">{eng.name}</p>
                      {eng.defaultPort > 0 && (
                        <span className="text-xs text-kiosk-text/50">Porta: {eng.defaultPort}</span>
                      )}
                    </div>
                    {selectedEngine === eng.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-kiosk-text/85 mb-3">{eng.description}</p>
                </label>
              ))}
            </div>
          </RadioGroup>

          {/* Selected Engine Details */}
          <div className="card-option-dark-3d rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="icon-neon-blue">{engine.icon}</span>
              <h4 className="text-label-yellow font-medium">{engine.name} - Detalhes</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-label-orange mb-2">✅ Quando usar:</p>
                <ul className="space-y-1">
                  {engine.useCases.map((use, i) => (
                    <li key={i} className="text-xs text-kiosk-text/90 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-label-orange mb-2">⚠️ Limitações:</p>
                <ul className="space-y-1">
                  {engine.limitations.map((lim, i) => (
                    <li key={i} className="text-xs text-kiosk-text/80 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <p className="text-xs text-label-orange mb-2">🚀 Recursos:</p>
              <div className="flex flex-wrap gap-2">
                {engine.features.map((feat, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                    {feat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4" data-tour="database-config">
          <div className="space-y-3">
            {engine.connectionFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-label-yellow">{field.label}</Label>
                <Input
                  type={field.type || 'text'}
                  value={connectionConfig[field.key] || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="input-3d bg-kiosk-bg font-mono text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTestConnection} 
              disabled={isTesting}
              className="flex-1 button-primary-glow-3d"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando {engine.name}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Testar Conexão {engine.name}
                </>
              )}
            </Button>
          </div>

          {/* Connection Status Display */}
          {connectionStatus && (
            <div className={cn(
              "p-4 rounded-lg border mt-4 space-y-3",
              connectionStatus.success 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-red-500/10 border-red-500/30"
            )}>
              <div className="flex items-center gap-2">
                {connectionStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={cn(
                  "font-medium",
                  connectionStatus.success ? "text-green-400" : "text-red-400"
                )}>
                  {connectionStatus.success ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
                </span>
                <span className="text-xs text-kiosk-text/50 ml-auto">
                  {connectionStatus.latency}ms
                </span>
              </div>
              
              {connectionStatus.success && connectionStatus.serverVersion && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-kiosk-text/85 text-xs">Servidor</p>
                    <p className="text-kiosk-text font-mono">{connectionStatus.serverVersion}</p>
                  </div>
                  {connectionStatus.details?.databaseSize && (
                    <div className="space-y-1">
                      <p className="text-kiosk-text/85 text-xs">Tamanho</p>
                      <p className="text-kiosk-text font-mono">{connectionStatus.details.databaseSize}</p>
                    </div>
                  )}
                  {connectionStatus.details?.uptime && (
                    <div className="space-y-1">
                      <p className="text-kiosk-text/85 text-xs">Uptime</p>
                      <p className="text-kiosk-text font-mono">{connectionStatus.details.uptime}</p>
                    </div>
                  )}
                  {connectionStatus.details?.encoding && (
                    <div className="space-y-1">
                      <p className="text-kiosk-text/85 text-xs">Encoding</p>
                      <p className="text-kiosk-text font-mono">{connectionStatus.details.encoding}</p>
                    </div>
                  )}
                  {connectionStatus.details?.maxConnections && (
                    <div className="space-y-1">
                      <p className="text-kiosk-text/85 text-xs">Conexões</p>
                      <p className="text-kiosk-text font-mono">
                        {connectionStatus.details.currentConnections} / {connectionStatus.details.maxConnections}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {connectionStatus.error && (
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400 font-mono">{connectionStatus.error}</p>
                </div>
              )}
            </div>
          )}

          {isDemoMode && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-400">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Modo Demo: Conexão será simulada
              </p>
            </div>
          )}
        </TabsContent>

        {/* Maintenance/Repair Tab */}
        <TabsContent value="maintenance" className="space-y-4" data-tour="database-maintenance">
          <p className="text-sm text-kiosk-text/70 mb-4">
            Ferramentas de manutenção e reparo para {engine.name}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {engine.repairTools.map((tool) => (
              <div key={tool.id} className="card-option-dark-3d rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-label-yellow">{tool.name}</h5>
                  <Button
                    size="sm"
                    variant="kiosk-outline"
                    onClick={() => handleRunTool(tool.id, tool.name)}
                    disabled={isRunningTool === tool.id}
                    className="h-7 text-xs button-action-neon"
                  >
                    {isRunningTool === tool.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-kiosk-text/70">{tool.description}</p>
                <code className="block text-xs font-mono text-cyan-400/80 bg-kiosk-bg/50 p-2 rounded">
                  {tool.command}
                </code>
              </div>
            ))}
          </div>

          {/* Connection History Chart */}
          <div className="mt-6">
            <DatabaseConnectionHistory engine={selectedEngine} />
          </div>
        </TabsContent>

        {/* Migration Tab */}
        <TabsContent value="migration" className="space-y-4">
          <p className="text-sm text-kiosk-text/70 mb-4">
            Exporte e importe dados entre diferentes motores de banco
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="kiosk-outline" className="h-auto py-4 flex-col gap-2 button-action-neon">
              <Download className="w-6 h-6" />
              <span className="text-sm">Exportar Dados</span>
              <span className="text-xs text-kiosk-text/60">JSON/SQL</span>
            </Button>
            <Button variant="kiosk-outline" className="h-auto py-4 flex-col gap-2 button-action-neon">
              <Upload className="w-6 h-6" />
              <span className="text-sm">Importar Dados</span>
              <span className="text-xs text-kiosk-text/60">De outro banco</span>
            </Button>
          </div>

          <div className="card-option-dark-3d rounded-lg p-4 space-y-3">
            <h5 className="text-sm font-medium text-label-yellow">Migração Assistida</h5>
            <p className="text-xs text-kiosk-text/70">
              Transfira dados automaticamente de um motor para outro mantendo integridade referencial.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-kiosk-surface">
                {engine.name}
              </Badge>
              <ArrowLeftRight className="w-4 h-4 text-kiosk-text/50" />
              <select className="bg-kiosk-bg border border-kiosk-surface rounded px-2 py-1 text-sm text-kiosk-text">
                {databaseEngines.filter(e => e.id !== selectedEngine).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <Button variant="kiosk-outline" className="w-full button-outline-neon">
              Iniciar Migração
            </Button>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-kiosk-text/70">
              Templates de tabelas para {engine.name}
            </p>
            <Button size="sm" variant="kiosk-outline" onClick={handleExportSchema} className="button-action-neon">
              <FileText className="w-4 h-4 mr-2" />
              Exportar Schema
            </Button>
          </div>

          <div className="space-y-3">
            {engine.templates.map((template) => (
              <div key={template.id} className="card-option-dark-3d rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 icon-neon-blue" />
                    <h5 className="text-sm font-medium text-label-yellow">{template.name}</h5>
                  </div>
                  <Button
                    size="sm"
                    variant="kiosk-outline"
                    onClick={() => handleCopySQL(template.sql, template.name)}
                    className="h-7 text-xs button-action-neon"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-kiosk-text/70">{template.description}</p>
                <pre className="text-xs font-mono text-cyan-400/80 bg-kiosk-bg/50 p-3 rounded overflow-x-auto max-h-40">
                  {template.sql}
                </pre>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <p className="text-sm text-kiosk-text/70 mb-4">
            Documentação oficial e recursos para {engine.name}
          </p>

          <div className="space-y-3">
            {engine.documentation.map((doc, i) => (
              <a
                key={i}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 icon-neon-blue" />
                  <span className="text-sm text-kiosk-text">{doc.title}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-kiosk-text/50" />
              </a>
            ))}
          </div>

          <div className="card-option-dark-3d rounded-lg p-4 space-y-3">
            <h5 className="text-sm font-medium text-label-yellow">Dicas de Instalação</h5>
            <div className="text-xs text-kiosk-text/70 space-y-2">
              {selectedEngine === 'sqlite' && (
                <p>SQLite já vem embutido - não requer instalação adicional.</p>
              )}
              {selectedEngine === 'postgresql' && (
                <>
                  <p><strong>Arch/CachyOS:</strong> <code className="text-cyan-400">sudo pacman -S postgresql</code></p>
                  <p><strong>Ubuntu/Debian:</strong> <code className="text-cyan-400">sudo apt install postgresql</code></p>
                </>
              )}
              {selectedEngine === 'mariadb' && (
                <>
                  <p><strong>Arch/CachyOS:</strong> <code className="text-cyan-400">sudo pacman -S mariadb</code></p>
                  <p><strong>Ubuntu/Debian:</strong> <code className="text-cyan-400">sudo apt install mariadb-server</code></p>
                </>
              )}
              {selectedEngine === 'firebird' && (
                <>
                  <p><strong>Arch/CachyOS:</strong> <code className="text-cyan-400">yay -S firebird</code></p>
                  <p><strong>Download:</strong> <a href="https://firebirdsql.org/en/downloads/" target="_blank" className="text-cyan-400 hover:underline">firebirdsql.org/downloads</a></p>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </SettingsSection>
  );
}
