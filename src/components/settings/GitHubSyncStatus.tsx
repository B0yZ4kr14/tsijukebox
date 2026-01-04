import { useEffect } from 'react';
import { Github, RefreshCw, ExternalLink, GitCommit, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Separator } from '@/components/ui/separator';
import { useGitHubSync } from '@/hooks/system/useGitHubSync';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge, Button } from "@/components/ui/themed"

export function GitHubSyncStatus() {
  const { syncStatus, isLoading, error, refresh, lastRefresh } = useGitHubSync();

  useEffect(() => {
    refresh();
    // Auto-refresh every 5 minutes
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge data-testid="github-status-badge" variant="secondary" className="animate-pulse">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Verificando...
        </Badge>
      );
    }

    if (error) {
      return (
        <Badge data-testid="github-status-badge" variant="danger">
          <AlertCircle className="w-3 h-3 mr-1" />
          Erro
        </Badge>
      );
    }

    switch (syncStatus?.syncStatus) {
      case 'synced':
        return (
          <Badge data-testid="github-status-badge" className="bg-green-600 hover:bg-green-600/90">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sincronizado
          </Badge>
        );
      case 'pending':
        return (
          <Badge data-testid="github-status-badge" variant="outline" className="border-yellow-500 text-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      default:
        return (
          <Badge data-testid="github-status-badge" variant="secondary">
            Desconhecido
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const instructions = {
    title: "🔄 O que é GitHub Sync?",
    steps: [
      "O GitHub é onde todo o código do TSiJUKEBOX é armazenado e versionado.",
      "Esta seção mostra se o código local está sincronizado com o repositório remoto.",
      "O 'Último commit' mostra a mudança mais recente feita no código.",
      "Clique em 'Atualizar' para verificar o status mais recente."
    ],
    tips: [
      "💡 Verde = Tudo sincronizado e atualizado",
      "💡 Amarelo = Há mudanças pendentes",
      "💡 Clique no commit para ver detalhes no GitHub"
    ]
  };

  return (
    <SettingsSection
      icon={<Github className="w-5 h-5 icon-neon-blue" />}
      title="GitHub Sync Status"
      description="Status de sincronização com o repositório"
      badge={getStatusBadge()}
      instructions={instructions}
      delay={0.3}
    >
      <div data-testid="github-sync-section" className="space-y-4">
        {/* Refresh Button */}
        <div className="flex items-center justify-between">
          <div data-testid="github-last-check" className="text-sm text-muted-foreground">
            {lastRefresh && (
              <span>Última verificação: {formatDate(lastRefresh.toISOString())}</span>
            )}
          </div>
          <Button
            data-testid="github-refresh-button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            aria-label="Atualizar status de sincronização"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="w-4 h-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>

        {error && (
          <div data-testid="github-error-display" className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}

        {syncStatus && (
          <>
            {/* Last Commit */}
            {syncStatus.lastCommit && (
              <div data-testid="github-last-commit" className="card-option-dark-3d rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-label-yellow">
                  <GitCommit className="w-4 h-4" />
                  <span className="font-medium">Último Commit</span>
                </div>
                
                <div className="flex items-start gap-3">
                  {syncStatus.lastCommit.authorAvatar && (
                    <img
                      src={syncStatus.lastCommit.authorAvatar}
                      alt={`Avatar de ${syncStatus.lastCommit.author}`}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate font-medium">
                      {syncStatus.lastCommit.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{syncStatus.lastCommit.author}</span>
                      <span>•</span>
                      <code className="bg-kiosk-background/50 px-1.5 py-0.5 rounded">
                        {syncStatus.lastCommit.sha}
                      </code>
                      <span>•</span>
                      <span>{formatDate(syncStatus.lastCommit.date)}</span>
                    </div>
                  </div>
                  <a
                    data-testid="github-commit-link"
                    href={syncStatus.lastCommit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-kiosk-primary hover:text-kiosk-primary/80"
                    aria-label="Ver commit no GitHub"
                  >
                    <ExternalLink aria-hidden="true" className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            <Separator className="bg-kiosk-border" />

            {/* Repo Info */}
            <div data-testid="github-repo-info" className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Branch</p>
                <Badge data-testid="github-branch-badge" variant="outline">{syncStatus.branch}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Último Push</p>
                <p className="text-foreground">{formatDate(syncStatus.lastPush)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Última Atualização</p>
                <p className="text-foreground">{formatDate(syncStatus.lastUpdate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Repositório</p>
                <a
                  data-testid="github-repo-link"
                  href={syncStatus.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kiosk-primary hover:underline inline-flex items-center gap-1"
                >
                  Ver no GitHub
                  <ExternalLink aria-hidden="true" className="w-3 h-3" />
                </a>
              </div>
            </div>
          </>
        )}

        {!syncStatus && !isLoading && !error && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Clique em "Atualizar" para verificar o status de sincronização
          </p>
        )}
      </div>
    </SettingsSection>
  );
}
