import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitHubBranch, GitHubRepoInfo } from '@/hooks/system/useGitHubStats';

interface BranchesSectionProps {
  branches: GitHubBranch[];
  repoInfo: GitHubRepoInfo | null;
  isLoading: boolean;
}

export function BranchesSection({ branches, repoInfo, isLoading }: BranchesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : branches.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {branches.map((branch, index) => (
                  <motion.div
                    key={branch.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{branch.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {branch.name === repoInfo?.default_branch && (
                        <Badge variant="outline" className="text-xs">default</Badge>
                      )}
                      {branch.protected && (
                        <Badge variant="secondary" className="text-xs">protected</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-10">Sem branches encontradas</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
