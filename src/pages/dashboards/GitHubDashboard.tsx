import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  GitFork, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Github,
  Upload,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useGitHubStats, GitHubCommit } from '@/hooks/system/useGitHubStats';
import { useGitHubFullSync, FileToSync } from '@/hooks/system/useGitHubFullSync';
import { useAutoSync } from '@/hooks/system/useAutoSync';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { ComponentBoundary } from '@/components/errors';
import { 
  KpiCard,
  LanguagesChart,
  ContributorsChart,
  CommitsTable,
  ReleasesSection,
  BranchesSection,
  AutoSyncPanel,
  CacheIndicator,
  GitHubDashboardCharts
} from '@/components/github';

export default function GitHubDashboard() {
  const navigate = useNavigate();
  const { 
    repoInfo, 
    commits, 
    contributors, 
    releases, 
    branches, 
    languages, 
    isLoading, 
    error, 
    fromCache,
    cacheStats,
    refetch,
    clearAllCache
  } = useGitHubStats();

  const { isSyncing, syncFiles } = useGitHubFullSync();
  const autoSync = useAutoSync();

  const [filteredCommits, setFilteredCommits] = useState<GitHubCommit[]>([]);
  
  const handleFilteredCommits = useCallback((filtered: GitHubCommit[]) => {
    setFilteredCommits(filtered);
  }, []);

  const handleFullSync = useCallback(async () => {
    const filesToSync: FileToSync[] = [
      {
        path: 'docs/VERSION',
        content: '4.1.0'
      },
      {
        path: 'docs/SYNC_LOG.md',
        content: `# Repository Sync Log\n\n## Last Sync\n- **Date**: ${new Date().toISOString()}\n- **Version**: 4.1.0\n- **Status**: ✅ Synced via Lovable\n`
      }
    ];

    await syncFiles(filesToSync, `[TSiJUKEBOX v4.1.0] Repository sync - ${new Date().toLocaleDateString('pt-BR')}`);
  }, [syncFiles]);

  const displayCommits = filteredCommits.length > 0 || commits.length === 0 ? filteredCommits : commits;

  return (
    <KioskLayout>
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <LogoBrand size="sm" />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Github className="h-6 w-6" />
                GitHub Dashboard
                <Badge 
                  variant={autoSync.isEnabled ? 'default' : 'secondary'}
                  className={autoSync.isEnabled ? 'bg-green-600 text-xs' : 'text-xs'}
                >
                  {autoSync.isEnabled ? '🔄 Auto' : '⏸️ Manual'}
                </Badge>
              </h1>
              {repoInfo && (
                <p className="text-muted-foreground text-sm">{repoInfo.full_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleFullSync}
              disabled={isSyncing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Repository'}
            </Button>
            {repoInfo && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(repoInfo.html_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver no GitHub
              </Button>
            )}
            <CacheIndicator 
              stats={cacheStats} 
              fromCache={fromCache} 
              onClear={clearAllCache} 
            />
            <Button 
              variant="default" 
              size="sm"
              onClick={() => refetch(true)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </motion.header>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6"
          >
            <p className="text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Auto-Sync Panel */}
        <div className="mb-8">
          <AutoSyncPanel autoSync={autoSync} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard 
            title="Stars" 
            value={repoInfo?.stargazers_count || 0} 
            icon={Star} 
            color="bg-yellow-500"
            isLoading={isLoading}
          />
          <KpiCard 
            title="Forks" 
            value={repoInfo?.forks_count || 0} 
            icon={GitFork} 
            color="bg-blue-500"
            isLoading={isLoading}
          />
          <KpiCard 
            title="Watchers" 
            value={repoInfo?.watchers_count || 0} 
            icon={Eye} 
            color="bg-purple-500"
            isLoading={isLoading}
          />
          <KpiCard 
            title="Open Issues" 
            value={repoInfo?.open_issues_count || 0} 
            icon={AlertCircle} 
            color="bg-red-500"
            isLoading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LanguagesChart languages={languages} isLoading={isLoading} />
          <ContributorsChart contributors={contributors} isLoading={isLoading} />
        </div>

        {/* Advanced Charts */}
        <GitHubDashboardCharts
          commits={commits}
          contributors={contributors}
          languages={languages}
          releases={releases}
        />

        {/* Commits Table */}
        <CommitsTable
          commits={commits}
          contributors={contributors}
          displayCommits={displayCommits}
          isLoading={isLoading}
          onFilteredCommits={handleFilteredCommits}
        />

        {/* Releases and Branches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReleasesSection releases={releases} isLoading={isLoading} />
          <BranchesSection branches={branches} repoInfo={repoInfo} isLoading={isLoading} />
        </div>

        {/* Footer Info */}
        {repoInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>
              Repositório criado em{' '}
              {new Date(repoInfo.created_at).toLocaleDateString('pt-BR')}
              {' • '}
              Última atualização{' '}
              {formatDistanceToNow(new Date(repoInfo.pushed_at), { 
                addSuffix: true,
                locale: ptBR 
              })}
              {' • '}
              {(repoInfo.size / 1024).toFixed(1)} MB
            </p>
          </motion.div>
        )}
      </div>
    </KioskLayout>
  );
}
