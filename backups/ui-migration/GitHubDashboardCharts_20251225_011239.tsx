import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GitHubCommit, GitHubContributor, GitHubLanguages, GitHubRelease } from '@/hooks/system/useGitHubStats';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { safeParseISO } from '@/lib/date-utils';

interface GitHubDashboardChartsProps {
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  languages: GitHubLanguages;
  releases: GitHubRelease[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  HTML: '#e34c26',
  CSS: '#1572b6',
  Shell: '#89e051',
  Dockerfile: '#2496ed',
  YAML: '#cb171e',
  JSON: '#000000',
  Markdown: '#083fa1',
};

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function GitHubDashboardCharts({
  commits,
  contributors,
  languages,
  releases,
}: GitHubDashboardChartsProps) {
  // Process commits by day (last 30 days)
  const commitsByDay = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return { date, count: 0 };
    });

    commits.forEach((commit) => {
      const dateString = commit.commit?.author?.date;
      const parsedDate = safeParseISO(dateString);
      if (!parsedDate) return;
      
      const commitDate = startOfDay(parsedDate);
      const dayEntry = last30Days.find(
        (d) => d.date.getTime() === commitDate.getTime()
      );
      if (dayEntry) {
        dayEntry.count++;
      }
    });

    return last30Days.map((d) => ({
      date: format(d.date, 'dd/MM', { locale: ptBR }),
      commits: d.count,
    }));
  }, [commits]);

  // Process contributors for bar chart
  const topContributors = useMemo(() => {
    return contributors
      .slice(0, 10)
      .map((c) => ({
        name: c.login,
        commits: c.contributions,
        avatar: c.avatar_url,
      }));
  }, [contributors]);

  // Process languages for pie chart
  const languageData = useMemo(() => {
    const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        value: bytes,
        percentage: ((bytes / total) * 100).toFixed(1),
        color: LANGUAGE_COLORS[name] || DEFAULT_COLORS[Object.keys(languages).indexOf(name) % DEFAULT_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [languages]);

  // Process releases timeline
  const releaseTimeline = useMemo(() => {
    return releases
      .filter((r) => r.published_at != null)
      .slice(0, 10)
      .reverse()
      .map((r) => {
        const parsedDate = safeParseISO(r.published_at);
        return {
          name: r.tag_name,
          date: parsedDate ? format(parsedDate, 'dd/MM/yy', { locale: ptBR }) : 'N/A',
          isPrerelease: r.prerelease,
        };
      });
  }, [releases]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Commits Activity Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Atividade de Commits</CardTitle>
          <CardDescription>Commits nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={commitsByDay}>
              <defs>
                <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#commitGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Contributors Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contribuidores</CardTitle>
          <CardDescription>Por número de commits</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topContributors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="commits" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Languages Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Linguagens</CardTitle>
          <CardDescription>Distribuição no repositório</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                labelLine={false}
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${(value / 1024).toFixed(1)} KB`, 'Tamanho']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Releases Timeline */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Timeline de Releases</CardTitle>
          <CardDescription>Últimas {releaseTimeline.length} releases</CardDescription>
        </CardHeader>
        <CardContent>
          {releaseTimeline.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {releaseTimeline.map((release, index) => (
                <div
                  key={release.name}
                  className={`flex flex-col items-center p-3 rounded-lg border ${
                    release.isPrerelease 
                      ? 'border-warning bg-warning/10' 
                      : 'border-primary bg-primary/10'
                  }`}
                >
                  <span className="text-sm font-mono font-semibold">{release.name}</span>
                  <span className="text-xs text-muted-foreground">{release.date}</span>
                  {release.isPrerelease && (
                    <span className="text-xs text-warning mt-1">Pre-release</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma release encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
