import { motion } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommitFilters } from '@/components/github/CommitFilters';
import { getCommitTypeInfo } from '@/lib/constants/commitTypes';
import { GitHubCommit, GitHubContributor } from '@/hooks/system/useGitHubStats';
import { Badge, Card } from "@/components/ui/themed"

interface CommitsTableProps {
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  displayCommits: GitHubCommit[];
  isLoading: boolean;
  onFilteredCommits: (filtered: GitHubCommit[]) => void;
}

export function CommitsTable({ 
  commits, 
  contributors,
  displayCommits, 
  isLoading,
  onFilteredCommits 
}: CommitsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-8"
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Clock className="h-5 w-5 text-primary" />
            Commits Recentes
            {displayCommits.length !== commits.length && (
              <Badge variant="secondary" className="ml-2">
                {displayCommits.length} de {commits.length}
              </Badge>
            )}
          </h3>
        
        <div className="mt-4">
          {!isLoading && commits.length > 0 && (
            <CommitFilters
              commits={commits}
              contributors={contributors}
              onFilter={onFilteredCommits}
            />
          )}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : displayCommits.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {displayCommits.map((commit, index) => {
                  const typeInfo = getCommitTypeInfo(commit.commit.message);
                  return (
                    <motion.div
                      key={commit.sha}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => window.open(commit.html_url, '_blank')}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={commit.author?.avatar_url} />
                        <AvatarFallback>
                          {commit.commit.author.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${typeInfo.color}`} />
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                          <p className="font-medium truncate flex-1">{commit.commit.message.split('\n')[0]}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                            {commit.sha.slice(0, 7)}
                          </code>
                          <span>•</span>
                          <span>{commit.author?.login || commit.commit.author.name}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(commit.commit.author.date), { 
                              addSuffix: true,
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </div>
                      <ExternalLink aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : commits.length > 0 ? (
            <p className="text-muted-foreground text-center py-10">Nenhum commit encontrado com os filtros aplicados</p>
          ) : (
            <p className="text-muted-foreground text-center py-10">Sem commits recentes</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
