// Component Templates - 8 arquivos
// Generates React components for settings UI

const VERSION = '4.1.0';

export function generateComponentContent(path: string): string | null {
  const now = new Date().toISOString();
  
  const componentMap: Record<string, () => string> = {
    'src/components/settings/CodeScanSection.tsx': () => `import { useState } from 'react';
import { Shield, Play, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCodeScan } from '@/hooks/system/useCodeScan';
// TSiJUKEBOX Component - Code Scan Section
// Version: ${VERSION} | Generated: ${now}

export function CodeScanSection() {
  const { isScanning, result, scan } = useCodeScan();

  const handleScan = async () => {
    await scan(['src/**/*.ts', 'src/**/*.tsx']);
  };

  const getScoreBadge = () => {
    if (!result) return null;
    const { score } = result;
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  return (
    <div data-testid="code-scan-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-kiosk-primary" />
          <h3 className="font-semibold">Code Quality Scan</h3>
        </div>
        {getScoreBadge()}
      </div>

      {isScanning && (
        <div data-testid="scan-progress" className="space-y-2">
          <Progress value={50} className="h-2" />
          <p className="text-sm text-muted-foreground">Scanning...</p>
        </div>
      )}

      {result && (
        <div data-testid="scan-results" className="space-y-2">
          <div data-testid="scan-score" className="text-2xl font-bold">
            {result.score}/100
          </div>
          <div data-testid="issues-list" className="space-y-1">
            {result.issues.map((issue, i) => (
              <div key={i} data-testid="issue-item" className="flex items-center gap-2 text-sm">
                {issue.severity === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                )}
                {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        data-testid="code-scan-button"
        onClick={handleScan}
        disabled={isScanning}
        aria-label="Start code scan"
      >
        <Play className="w-4 h-4 mr-2" />
        {isScanning ? 'Scanning...' : 'Start Scan'}
      </Button>
    </div>
  );
}
`,

    'src/components/settings/GitHubExportSection.tsx': () => `import { useState } from 'react';
import { Upload, GitBranch, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useGitHubExport } from '@/hooks/system/useGitHubExport';
import { formatDistanceToNow } from 'date-fns';
// TSiJUKEBOX Component - GitHub Export Section
// Version: ${VERSION} | Generated: ${now}

export function GitHubExportSection() {
  const [commitMessage, setCommitMessage] = useState('');
  const { isExporting, syncStatus, lastExport, exportToGitHub, checkSyncStatus } = useGitHubExport();

  const handleExport = async () => {
    await exportToGitHub([], commitMessage || 'Export from TSiJUKEBOX');
    setCommitMessage('');
  };

  return (
    <div data-testid="github-export-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-kiosk-primary" />
          <h3 className="font-semibold">GitHub Export</h3>
        </div>
        {syncStatus?.connected && (
          <Badge className="bg-green-500">Connected</Badge>
        )}
      </div>

      <Textarea
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        placeholder="Commit message (optional)"
        className="min-h-[80px]"
      />

      <div className="flex items-center gap-4">
        <Button
          onClick={handleExport}
          disabled={isExporting}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export to GitHub'}
        </Button>

        {lastExport && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDistanceToNow(lastExport, { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}
`,

    'src/components/settings/GitHubSyncStatus.tsx': () => `import { useEffect } from 'react';
import { RefreshCw, GitBranch, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGitHubFullSync } from '@/hooks/system/useGitHubFullSync';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// TSiJUKEBOX Component - GitHub Sync Status
// Version: ${VERSION} | Generated: ${now}

export function GitHubSyncStatus() {
  const { isSyncing, progress, lastSync, error, syncFullRepository } = useGitHubFullSync();

  const getStatusBadge = () => {
    if (isSyncing) {
      return (
        <Badge data-testid="sync-status-syncing" className="bg-blue-500 text-white">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Syncing
        </Badge>
      );
    }
    if (error) {
      return (
        <Badge data-testid="sync-status-error" variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    }
    if (lastSync?.success) {
      return (
        <Badge data-testid="sync-status-success" className="bg-green-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Synced
        </Badge>
      );
    }
    return (
      <Badge data-testid="sync-status-idle" variant="outline">
        <Clock className="w-3 h-3 mr-1" />
        Idle
      </Badge>
    );
  };

  return (
    <div data-testid="github-sync-status" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-kiosk-primary" />
          <span className="text-sm font-medium">GitHub Status</span>
        </div>
        {getStatusBadge()}
      </div>

      {isSyncing && progress && (
        <div data-testid="sync-progress" className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.phase}</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <Progress value={(progress.current / progress.total) * 100} className="h-1" />
        </div>
      )}

      {lastSync?.commit && (
        <div data-testid="last-sync-info" className="text-xs text-muted-foreground">
          <p>Last: {lastSync.commit.sha.slice(0, 7)}</p>
        </div>
      )}

      {error && (
        <div data-testid="sync-error" role="alert" className="p-2 rounded bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
`,

    'src/components/settings/AccessibilitySection.tsx': () => `import { Accessibility, Eye, Keyboard, Volume2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
// TSiJUKEBOX Component - Accessibility Section
// Version: ${VERSION} | Generated: ${now}

export function AccessibilitySection() {
  return (
    <div data-testid="accessibility-section" className="space-y-6">
      <div className="flex items-center gap-2">
        <Accessibility className="w-5 h-5 text-kiosk-primary" />
        <h3 className="font-semibold">Accessibility</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <Label htmlFor="high-contrast">High Contrast Mode</Label>
          </div>
          <Switch id="high-contrast" data-testid="high-contrast-toggle" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
          </div>
          <Switch id="keyboard-nav" data-testid="keyboard-nav-toggle" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <Label>Screen Reader Volume</Label>
          </div>
          <Slider defaultValue={[75]} max={100} step={5} data-testid="sr-volume-slider" />
        </div>
      </div>
    </div>
  );
}
`,

    'src/components/settings/BackendConnectionSection.tsx': () => `import { useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConnectionMonitor } from '@/hooks/system/useConnectionMonitor';
// TSiJUKEBOX Component - Backend Connection Section
// Version: ${VERSION} | Generated: ${now}

export function BackendConnectionSection() {
  const { status, latency, ping } = useConnectionMonitor();

  return (
    <div data-testid="backend-connection-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-kiosk-primary" />
          <h3 className="font-semibold">Backend Connection</h3>
        </div>
        <Badge className={status === 'connected' ? 'bg-green-500' : 'bg-red-500'}>
          {status === 'connected' ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
          ) : (
            <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
          )}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        {latency !== null && <p>Latency: {latency}ms</p>}
      </div>

      <Button variant="outline" size="sm" onClick={ping}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Test Connection
      </Button>
    </div>
  );
}
`,

    'src/components/settings/DatabaseSection.tsx': () => `import { Database, Table, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// TSiJUKEBOX Component - Database Section
// Version: ${VERSION} | Generated: ${now}

export function DatabaseSection() {
  return (
    <div data-testid="database-section" className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-kiosk-primary" />
        <h3 className="font-semibold">Database</h3>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              <span className="text-sm">Tables</span>
            </div>
            <span className="text-sm text-muted-foreground">12 active</span>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Schema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'src/components/settings/ScriptRefactorSection.tsx': () => `import { useState } from 'react';
import { Code, Wand2, FileCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// TSiJUKEBOX Component - Script Refactor Section
// Version: ${VERSION} | Generated: ${now}

export function ScriptRefactorSection() {
  const [isRefactoring, setIsRefactoring] = useState(false);

  const handleRefactor = async () => {
    setIsRefactoring(true);
    // Simulate refactoring
    setTimeout(() => setIsRefactoring(false), 3000);
  };

  return (
    <div data-testid="script-refactor-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-kiosk-primary" />
          <h3 className="font-semibold">Script Refactoring</h3>
        </div>
        <Badge variant="outline">Claude Opus</Badge>
      </div>

      {isRefactoring && (
        <div className="space-y-2">
          <Progress value={45} className="h-2" />
          <p className="text-sm text-muted-foreground">Analyzing scripts...</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleRefactor} disabled={isRefactoring}>
          <Wand2 className="w-4 h-4 mr-2" />
          {isRefactoring ? 'Refactoring...' : 'Refactor Scripts'}
        </Button>
        <Button variant="outline" disabled={isRefactoring}>
          <FileCode className="w-4 h-4 mr-2" />
          Preview Changes
        </Button>
      </div>
    </div>
  );
}
`,

    'src/components/settings/SettingsDashboard.tsx': () => `import { Settings, Github, Shield, Database, Code, Accessibility } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeScanSection } from './CodeScanSection';
import { GitHubSyncStatus } from './GitHubSyncStatus';
import { AccessibilitySection } from './AccessibilitySection';
import { BackendConnectionSection } from './BackendConnectionSection';
import { DatabaseSection } from './DatabaseSection';
import { ScriptRefactorSection } from './ScriptRefactorSection';
// TSiJUKEBOX Component - Settings Dashboard
// Version: ${VERSION} | Generated: ${now}

export function SettingsDashboard() {
  return (
    <div data-testid="settings-container" className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-kiosk-primary" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application configuration</p>
        </div>
      </div>

      <Tabs defaultValue="general" data-testid="settings-tabs">
        <TabsList>
          <TabsTrigger value="general" data-value="general">General</TabsTrigger>
          <TabsTrigger value="github" data-value="github">GitHub</TabsTrigger>
          <TabsTrigger value="security" data-value="security">Security</TabsTrigger>
          <TabsTrigger value="a11y" data-value="a11y">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Backend</CardTitle></CardHeader>
            <CardContent><BackendConnectionSection /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Database</CardTitle></CardHeader>
            <CardContent><DatabaseSection /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Sync Status</CardTitle></CardHeader>
            <CardContent><GitHubSyncStatus /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Code Scan</CardTitle></CardHeader>
            <CardContent><CodeScanSection /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Script Refactor</CardTitle></CardHeader>
            <CardContent><ScriptRefactorSection /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a11y" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Accessibility</CardTitle></CardHeader>
            <CardContent><AccessibilitySection /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`,
  };

  const generator = componentMap[path];
  if (generator) {
    return generator();
  }

  return null;
}
