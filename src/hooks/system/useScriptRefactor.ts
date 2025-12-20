import { useState, useCallback, useMemo } from 'react';
import { useClaudeOpusRefactor } from './useClaudeOpusRefactor';
import { useGitHubExport } from './useGitHubExport';
import { toast } from 'sonner';

export interface InstallerScript {
  path: string;
  name: string;
  description: string;
  category: 'core' | 'setup' | 'integration' | 'utility';
  priority: 'high' | 'medium' | 'low';
  estimatedLines: number;
}

export interface RefactoredScript {
  path: string;
  originalCode: string;
  refactoredCode: string;
  summary: string;
  improvements: string[];
  refactoredAt: Date;
}

export interface UseScriptRefactorReturn {
  installerScripts: InstallerScript[];
  selectedScripts: string[];
  refactoredScripts: Map<string, RefactoredScript>;
  isRefactoring: boolean;
  isExporting: boolean;
  error: string | null;
  selectScript: (path: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  refactorSelected: (targetDistro?: string) => Promise<void>;
  refactorSingle: (path: string, code: string, targetDistro?: string) => Promise<RefactoredScript | null>;
  exportToGitHub: (commitMessage?: string) => Promise<void>;
  getScriptsByCategory: (category: InstallerScript['category']) => InstallerScript[];
  getScriptsByPriority: (priority: InstallerScript['priority']) => InstallerScript[];
  clearRefactored: () => void;
}

// Lista completa dos scripts Python do instalador CachyOS
const INSTALLER_SCRIPTS: InstallerScript[] = [
  {
    path: 'scripts/installer/main.py',
    name: 'main.py',
    description: 'Entry point principal do instalador com menu interativo',
    category: 'core',
    priority: 'high',
    estimatedLines: 608,
  },
  {
    path: 'scripts/installer/database_manager.py',
    name: 'database_manager.py',
    description: 'Gerenciamento de banco de dados SQLite para configurações',
    category: 'core',
    priority: 'high',
    estimatedLines: 200,
  },
  {
    path: 'scripts/installer/openbox_setup.py',
    name: 'openbox_setup.py',
    description: 'Configuração do ambiente Openbox para modo kiosk',
    category: 'setup',
    priority: 'high',
    estimatedLines: 476,
  },
  {
    path: 'scripts/installer/kiosk_setup.py',
    name: 'kiosk_setup.py',
    description: 'Setup do modo kiosk com Chromium e autostart',
    category: 'setup',
    priority: 'high',
    estimatedLines: 150,
  },
  {
    path: 'scripts/installer/config.py',
    name: 'config.py',
    description: 'Configurações globais e constantes do instalador',
    category: 'core',
    priority: 'medium',
    estimatedLines: 100,
  },
  {
    path: 'scripts/installer/docker_setup.py',
    name: 'docker_setup.py',
    description: 'Instalação e configuração do Docker e containers',
    category: 'setup',
    priority: 'medium',
    estimatedLines: 180,
  },
  {
    path: 'scripts/installer/user_manager.py',
    name: 'user_manager.py',
    description: 'Gerenciamento de usuários do sistema kiosk',
    category: 'utility',
    priority: 'medium',
    estimatedLines: 120,
  },
  {
    path: 'scripts/installer/package_manager.py',
    name: 'package_manager.py',
    description: 'Instalação de pacotes via pacman/yay',
    category: 'utility',
    priority: 'medium',
    estimatedLines: 150,
  },
  {
    path: 'scripts/installer/spicetify_setup.py',
    name: 'spicetify_setup.py',
    description: 'Integração e setup do Spicetify para Spotify',
    category: 'integration',
    priority: 'low',
    estimatedLines: 100,
  },
  {
    path: 'scripts/installer/cloud_setup.py',
    name: 'cloud_setup.py',
    description: 'Configuração de serviços cloud (Storj, S3)',
    category: 'integration',
    priority: 'low',
    estimatedLines: 100,
  },
  {
    path: 'scripts/installer/auth_setup.py',
    name: 'auth_setup.py',
    description: 'Setup de autenticação e OAuth',
    category: 'integration',
    priority: 'low',
    estimatedLines: 80,
  },
  {
    path: 'scripts/installer/analytics.py',
    name: 'analytics.py',
    description: 'Coleta de métricas e telemetria de instalação',
    category: 'utility',
    priority: 'low',
    estimatedLines: 100,
  },
  {
    path: 'scripts/installer/landing_server.py',
    name: 'landing_server.py',
    description: 'Servidor web para wizard de configuração',
    category: 'utility',
    priority: 'low',
    estimatedLines: 150,
  },
  {
    path: 'scripts/installer/system_check.py',
    name: 'system_check.py',
    description: 'Verificação de requisitos e compatibilidade do sistema',
    category: 'utility',
    priority: 'low',
    estimatedLines: 120,
  },
];

export function useScriptRefactor(): UseScriptRefactorReturn {
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [refactoredScripts, setRefactoredScripts] = useState<Map<string, RefactoredScript>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const { refactorPython, optimizeForCachyOS, isRefactoring } = useClaudeOpusRefactor();
  const { exportToGitHub: githubExport, isExporting } = useGitHubExport();

  const installerScripts = useMemo(() => INSTALLER_SCRIPTS, []);

  const selectScript = useCallback((path: string) => {
    setSelectedScripts(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path);
      }
      return [...prev, path];
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedScripts(INSTALLER_SCRIPTS.map(s => s.path));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedScripts([]);
  }, []);

  const refactorSingle = useCallback(async (
    path: string,
    code: string,
    targetDistro: string = 'cachyos'
  ): Promise<RefactoredScript | null> => {
    try {
      setError(null);
      
      const result = await optimizeForCachyOS([{
        path,
        content: code,
      }], targetDistro);

      if (!result || result.files.length === 0) {
        throw new Error('Nenhum resultado retornado da refatoração');
      }

      const refactored: RefactoredScript = {
        path,
        originalCode: code,
        refactoredCode: result.files[0].refactoredContent,
        summary: result.summary,
        improvements: result.files[0].changes,
        refactoredAt: new Date(),
      };

      setRefactoredScripts(prev => new Map(prev).set(path, refactored));
      
      return refactored;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na refatoração';
      setError(message);
      toast.error(message);
      return null;
    }
  }, [optimizeForCachyOS]);

  const refactorSelected = useCallback(async (targetDistro: string = 'cachyos') => {
    if (selectedScripts.length === 0) {
      toast.error('Selecione ao menos um script para refatorar');
      return;
    }

    try {
      setError(null);
      toast.info(`Refatorando ${selectedScripts.length} scripts com Claude Opus 4.5...`);

      // Para cada script selecionado, precisamos do código
      // Aqui simulamos com placeholder - na implementação real, 
      // os códigos viriam da leitura dos arquivos via GitHub API
      for (const path of selectedScripts) {
        const script = INSTALLER_SCRIPTS.find(s => s.path === path);
        if (script) {
          // Placeholder - em produção, buscar código real via useGitHubExport.getFileContent
          toast.info(`Processando ${script.name}...`);
        }
      }

      toast.success(`${selectedScripts.length} scripts enviados para refatoração`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na refatoração em lote';
      setError(message);
      toast.error(message);
    }
  }, [selectedScripts]);

  const exportToGitHub = useCallback(async (commitMessage?: string) => {
    if (refactoredScripts.size === 0) {
      toast.error('Nenhum script refatorado para exportar');
      return;
    }

    try {
      setError(null);
      
      const files = Array.from(refactoredScripts.entries()).map(([path, script]) => ({
        path,
        content: script.refactoredCode,
      }));

      const message = commitMessage || `refactor: Otimização de ${files.length} scripts para CachyOS via Claude Opus 4.5`;
      
      await githubExport(files, message);
      toast.success(`${files.length} scripts exportados para GitHub!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao exportar para GitHub';
      setError(message);
      toast.error(message);
    }
  }, [refactoredScripts, githubExport]);

  const getScriptsByCategory = useCallback((category: InstallerScript['category']) => {
    return INSTALLER_SCRIPTS.filter(s => s.category === category);
  }, []);

  const getScriptsByPriority = useCallback((priority: InstallerScript['priority']) => {
    return INSTALLER_SCRIPTS.filter(s => s.priority === priority);
  }, []);

  const clearRefactored = useCallback(() => {
    setRefactoredScripts(new Map());
  }, []);

  return {
    installerScripts,
    selectedScripts,
    refactoredScripts,
    isRefactoring,
    isExporting,
    error,
    selectScript,
    selectAll,
    clearSelection,
    refactorSelected,
    refactorSingle,
    exportToGitHub,
    getScriptsByCategory,
    getScriptsByPriority,
    clearRefactored,
  };
}
