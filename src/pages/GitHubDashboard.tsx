import { motion } from 'framer-motion';
import { 
  Star, 
  GitFork, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  GitBranch, 
  Tag, 
  Users, 
  Code, 
  Clock,
  ExternalLink,
  ArrowLeft,
  Github
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

import { useGitHubStats } from '@/hooks/system/useGitHubStats';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoBrand } from '@/components/ui/LogoBrand';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  CSS: '#264de4',
  HTML: '#e34c26',
  Python: '#3776ab',
  Shell: '#89e051',
  Dockerfile: '#2496ed',
  JSON: '#000000',
  Markdown: '#083fa1',
  YAML: '#cb171e',
};

const getLanguageColor = (lang: string): string => {
  return LANGUAGE_COLORS[lang] || `hsl(${Math.random() * 360}, 70%, 50%)`;
};

function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  isLoading 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
    refetch 
  } = useGitHubStats();

  // Preparar dados para gráfico de linguagens
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const languageData = Object.entries(languages).map(([name, bytes]) => ({
    name,
    value: bytes,
    percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0',
    color: getLanguageColor(name)
  }));

  // Preparar dados para gráfico de contribuidores
  const contributorData = contributors.slice(0, 8).map(c => ({
    name: c.login,
    contributions: c.contributions,
    avatar: c.avatar_url
  }));

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
              </h1>
              {repoInfo && (
                <p className="text-muted-foreground text-sm">{repoInfo.full_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
            <Button 
              variant="default" 
              size="sm"
              onClick={refetch}
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
          {/* Languages Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Linguagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Skeleton className="h-40 w-40 rounded-full" />
                  </div>
                ) : languageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        labelLine={false}
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${(value / 1024).toFixed(1)} KB`, 'Tamanho']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">Sem dados de linguagens</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contributors Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Top Contribuidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : contributorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={contributorData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Contribuições']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="contributions" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">Sem dados de contribuidores</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Commits Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Commits Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : commits.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {commits.map((commit, index) => (
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
                          <p className="font-medium truncate">{commit.commit.message.split('\n')[0]}</p>
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
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-10">Sem commits recentes</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Releases and Branches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Releases */}
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

          {/* Branches */}
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
