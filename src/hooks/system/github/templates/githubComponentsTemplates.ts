// GitHub Components Templates - Sync and integration components
// Covers 8 GitHub-related components

export function generateGitHubComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/github/AutoSyncPanel.tsx':
      return `import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, FileText, Play, Pause, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AutoSyncPanelProps {
  isEnabled: boolean;
  interval: number;
  lastSync: Date | null;
  pendingFiles: string[];
  isSyncing: boolean;
  onToggle: (enabled: boolean) => void;
  onIntervalChange: (interval: number) => void;
  onSyncNow: () => void;
  className?: string;
}

export function AutoSyncPanel({
  isEnabled,
  interval,
  lastSync,
  pendingFiles,
  isSyncing,
  onToggle,
  onIntervalChange,
  onSyncNow,
  className
}: AutoSyncPanelProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!isEnabled || !lastSync) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const nextSync = new Date(lastSync.getTime() + interval * 60 * 1000);
      const remaining = Math.max(0, Math.floor((nextSync.getTime() - Date.now()) / 1000));
      setCountdown(remaining);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [isEnabled, lastSync, interval]);

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
              Auto Sync
            </CardTitle>
            <CardDescription>
              Automatically sync changes to GitHub
            </CardDescription>
          </div>
          <Switch checked={isEnabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEnabled && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sync Interval</span>
              <Select
                value={interval.toString()}
                onValueChange={(v) => onIntervalChange(parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {countdown !== null && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Next sync in {formatCountdown(countdown)}</span>
                <Progress value={(1 - countdown / (interval * 60)) * 100} className="flex-1" />
              </div>
            )}
            
            {pendingFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Pending Files
                  </span>
                  <Badge variant="secondary">{pendingFiles.length}</Badge>
                </div>
              </div>
            )}
            
            <Button
              onClick={onSyncNow}
              disabled={isSyncing || pendingFiles.length === 0}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </>
        )}
        
        {!isEnabled && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Enable auto sync to automatically push changes to GitHub
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default AutoSyncPanel;
`;

    case 'src/components/github/FileSelectionModal.tsx':
      return `import React, { useState, useMemo } from 'react';
import { Check, File, Folder, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FileCategory {
  name: string;
  files: string[];
}

interface FileSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: FileCategory[];
  onConfirm: (selectedFiles: string[]) => void;
  isLoading?: boolean;
}

export function FileSelectionModal({
  open,
  onOpenChange,
  categories,
  onConfirm,
  isLoading = false
}: FileSelectionModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    return categories.map(cat => ({
      ...cat,
      files: cat.files.filter(f => 
        f.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.files.length > 0);
  }, [categories, searchQuery]);

  const toggleFile = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const toggleCategory = (category: FileCategory) => {
    const newSelected = new Set(selectedFiles);
    const allSelected = category.files.every(f => selectedFiles.has(f));
    
    category.files.forEach(f => {
      if (allSelected) {
        newSelected.delete(f);
      } else {
        newSelected.add(f);
      }
    });
    
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    const allFiles = categories.flatMap(c => c.files);
    setSelectedFiles(new Set(allFiles));
  };

  const clearAll = () => {
    setSelectedFiles(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedFiles));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Files to Sync</DialogTitle>
          <DialogDescription>
            Choose which files to include in the sync operation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {selectedFiles.size} selected
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
          
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              const selectedCount = category.files.filter(f => selectedFiles.has(f)).length;
              const allSelected = selectedCount === category.files.length;
              
              return (
                <div key={category.name} className="mb-4">
                  <div
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer"
                    onClick={() => {
                      const newExpanded = new Set(expandedCategories);
                      if (isExpanded) {
                        newExpanded.delete(category.name);
                      } else {
                        newExpanded.add(category.name);
                      }
                      setExpandedCategories(newExpanded);
                    }}
                  >
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => toggleCategory(category)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium flex-1">{category.name}</span>
                    <Badge variant="outline">{selectedCount}/{category.files.length}</Badge>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {category.files.map((file) => (
                        <div
                          key={file}
                          className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded cursor-pointer"
                          onClick={() => toggleFile(file)}
                        >
                          <Checkbox checked={selectedFiles.has(file)} />
                          <File className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || selectedFiles.size === 0}>
            {isLoading ? 'Syncing...' : \`Sync \${selectedFiles.size} Files\`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FileSelectionModal;
`;

    case 'src/components/github/SyncHistoryPanel.tsx':
      return `import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit, Check, X, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SyncEntry {
  id: string;
  commitSha: string;
  commitUrl: string;
  commitMessage: string;
  filesChanged: number;
  status: 'success' | 'partial' | 'failed';
  createdAt: Date;
}

interface SyncHistoryPanelProps {
  entries: SyncEntry[];
  isLoading?: boolean;
  onViewCommit?: (entry: SyncEntry) => void;
  className?: string;
}

export function SyncHistoryPanel({
  entries,
  isLoading = false,
  onViewCommit,
  className
}: SyncHistoryPanelProps) {
  const getStatusIcon = (status: SyncEntry['status']) => {
    switch (status) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'partial': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SyncEntry['status']) => {
    switch (status) {
      case 'success': return <Badge variant="success">Success</Badge>;
      case 'partial': return <Badge variant="warning">Partial</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Sync History
        </CardTitle>
        <CardDescription>
          Recent synchronization commits
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No sync history yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">{getStatusIcon(entry.status)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {entry.commitSha.substring(0, 7)}
                      </code>
                      {getStatusBadge(entry.status)}
                    </div>
                    
                    <p className="text-sm font-medium truncate">
                      {entry.commitMessage}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{entry.filesChanged} files</span>
                      <span>{formatDistanceToNow(entry.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewCommit?.(entry)}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default SyncHistoryPanel;
`;

    case 'src/components/github/CommitsTable.tsx':
      return `import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit, User, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: Date;
  additions: number;
  deletions: number;
  url: string;
}

interface CommitsTableProps {
  commits: Commit[];
  isLoading?: boolean;
  className?: string;
}

export function CommitsTable({ commits, isLoading = false, className }: CommitsTableProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <GitCommit className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className={cn("text-center py-12 text-muted-foreground", className)}>
        <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No commits found</p>
      </div>
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Commit</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Changes</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commits.map((commit) => (
          <TableRow key={commit.sha}>
            <TableCell>
              <div className="flex items-start gap-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
                  {commit.sha.substring(0, 7)}
                </code>
                <span className="text-sm truncate max-w-[300px]">
                  {commit.message}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {commit.author.avatar ? (
                  <img
                    src={commit.author.avatar}
                    alt={commit.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6 p-1 bg-muted rounded-full" />
                )}
                <span className="text-sm">{commit.author.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-500">
                  +{commit.additions}
                </Badge>
                <Badge variant="outline" className="text-red-500">
                  -{commit.deletions}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistanceToNow(commit.date, { addSuffix: true })}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <a href={commit.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default CommitsTable;
`;

    case 'src/components/github/GitHubDashboardCharts.tsx':
      return `import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface GitHubDashboardChartsProps {
  commitActivity: ChartData[];
  languageStats: ChartData[];
  syncHistory: ChartData[];
  className?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function GitHubDashboardCharts({
  commitActivity,
  languageStats,
  syncHistory,
  className
}: GitHubDashboardChartsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Commit Activity</CardTitle>
          <CardDescription>Commits over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={commitActivity}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>Code distribution by language</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={languageStats}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {languageStats.map((_, index) => (
                  <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {languageStats.map((lang, index) => (
              <div key={lang.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {lang.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Sync Activity</CardTitle>
          <CardDescription>Files synced over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={syncHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default GitHubDashboardCharts;
`;

    case 'src/components/github/KpiCard.tsx':
      return `import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className
}: KpiCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-500';
    if (trend.value < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
                {getTrendIcon()}
                <span>{Math.abs(trend.value)}%</span>
                {trend.label && <span>{trend.label}</span>}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KpiCard;
`;

    case 'src/components/github/LanguagesChart.tsx':
      return `import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LanguageData {
  name: string;
  value: number;
  color?: string;
}

interface LanguagesChartProps {
  data: LanguageData[];
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3178c6', // TypeScript
  '#f1e05a', // JavaScript
  '#e34c26', // HTML
  '#563d7c', // CSS
  '#89e051', // Shell
  '#3572A5', // Python
  '#dea584', // Rust
];

export function LanguagesChart({
  data,
  title = 'Languages',
  description = 'Repository language distribution',
  className
}: LanguagesChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [\`\${((value / total) * 100).toFixed(1)}%\`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-2">
            {chartData.map((lang) => (
              <div key={lang.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LanguagesChart;
`;

    case 'src/components/github/index.ts':
      return `// GitHub Components barrel export
export { AutoSyncPanel } from './AutoSyncPanel';
export { FileSelectionModal } from './FileSelectionModal';
export { SyncHistoryPanel } from './SyncHistoryPanel';
export { CommitsTable } from './CommitsTable';
export { GitHubDashboardCharts } from './GitHubDashboardCharts';
export { KpiCard } from './KpiCard';
export { LanguagesChart } from './LanguagesChart';
`;

    default:
      return null;
  }
}
