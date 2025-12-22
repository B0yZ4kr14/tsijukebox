import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitHubRelease } from '@/hooks/system/useGitHubStats';

interface ReleasesSectionProps {
  releases: GitHubRelease[];
  isLoading: boolean;
}

export function ReleasesSection({ releases, isLoading }: ReleasesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Releases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : releases.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {releases.slice(0, 10).map((release, index) => (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.open(release.html_url, '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {release.tag_name}
                      </Badge>
                      <span className="text-sm truncate max-w-[200px]">
                        {release.name || release.tag_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(release.published_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-10">Sem releases publicadas</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
