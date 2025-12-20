import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, RefreshCw, Upload, FolderGit2, Check, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SettingsSection } from './SettingsSection';
import { useGitHubExport } from '@/hooks/system/useGitHubExport';

export function GitHubExportSection() {
  const {
    isExporting,
    isLoading,
    error,
    syncStatus,
    lastExport,
    checkSyncStatus,
    exportToGitHub,
  } = useGitHubExport();

  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => {
    checkSyncStatus();
  }, [checkSyncStatus]);

  const handleQuickExport = async () => {
    // Example: export a simple test file
    await exportToGitHub([
      { path: 'docs/LAST_SYNC.md', content: `# Last Sync\n\nSynced at: ${new Date().toISOString()}\n` }
    ], commitMessage || undefined);
    setCommitMessage('');
  };

  return (
    <SettingsSection
      icon={<Github className="w-5 h-5 text-kiosk-primary" />}
      title="GitHub Export"
      description="Sincronize o projeto com o repositório GitHub"
      badge={
        syncStatus?.connected ? (
          <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
            <Check className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        ) : null
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Status */}
        <div className="p-4 rounded-lg bg-kiosk-surface/50 border border-kiosk-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-kiosk-primary" />
              <span className="text-sm font-medium text-kiosk-text">Repositório</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => checkSyncStatus()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {syncStatus?.repository ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <a 
                  href={syncStatus.repository.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-kiosk-primary hover:underline flex items-center gap-1"
                >
                  {syncStatus.repository.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch:</span>
                <span className="text-kiosk-text">{syncStatus.repository.defaultBranch}</span>
              </div>
              {syncStatus.latestCommit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último commit:</span>
                  <span className="text-kiosk-text truncate max-w-[200px]">
                    {syncStatus.latestCommit.message}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Verificando conexão...</p>
          )}
        </div>

        {/* Commit Message */}
        <div className="space-y-2">
          <Label className="text-kiosk-text">Mensagem do Commit (opcional)</Label>
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="[TSiJUKEBOX] Descreva as mudanças..."
            className="bg-kiosk-background border-kiosk-border text-kiosk-text min-h-[80px]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleQuickExport}
            disabled={isExporting || !syncStatus?.connected}
            className="flex-1 bg-kiosk-primary hover:bg-kiosk-primary/90"
          >
            {isExporting ? (
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar para GitHub'}
          </Button>
        </div>

        {/* Last Export */}
        {lastExport && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Última exportação: {lastExport.toLocaleString()}
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
