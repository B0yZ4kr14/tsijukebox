// Page Templates - 5 arquivos
// Generates React page components for dashboards

const VERSION = '4.1.0';

export function generatePageContent(path: string): string | null {
  const now = new Date().toISOString();
  
  const pageMap: Record<string, () => string> = {
    'src/pages/dashboards/GitHubDashboard.tsx': () => `import { useState } from 'react';
import { GitBranch, RefreshCw, History, Settings, FileCode, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GitHubSyncStatus } from '@/components/settings/GitHubSyncStatus';
import { useGitHubFullSync } from '@/hooks/system/useGitHubFullSync';
import { useSyncHistory } from '@/hooks/system/useSyncHistory';
import { toast } from 'sonner';
// TSiJUKEBOX Page - GitHub Dashboard
// Version: ${VERSION} | Generated: ${now}

export default function GitHubDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { syncFullRepository, isSyncing } = useGitHubFullSync();
  const { history, isLoading: historyLoading } = useSyncHistory();

  const handleFullSync = async () => {
    try {
      await syncFullRepository('[Manual] Full repository sync from dashboard');
      toast.success('Sync complete!');
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  return (
    <div data-testid="github-dashboard" className="container mx-auto p-6 space-y-6">
      <div data-testid="dashboard-header" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-8 h-8 text-kiosk-primary" />
          <div>
            <h1 className="text-2xl font-bold">GitHub Dashboard</h1>
            <p className="text-muted-foreground">Repository synchronization management</p>
          </div>
        </div>
        <Button data-testid="full-sync-button" onClick={handleFullSync} disabled={isSyncing}>
          <RefreshCw className={\`w-4 h-4 mr-2 \${isSyncing ? 'animate-spin' : ''}\`} />
          Full Sync
        </Button>
      </div>

      <Card data-testid="status-card">
        <CardHeader><CardTitle>Sync Status</CardTitle></CardHeader>
        <CardContent><GitHubSyncStatus /></CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="dashboard-tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" data-testid="tab-overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <FileCode className="w-8 h-8 text-kiosk-primary" />
                  <div>
                    <p className="text-2xl font-bold">71</p>
                    <p className="text-sm text-muted-foreground">Files Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <History className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{history.length}</p>
                    <p className="text-sm text-muted-foreground">Total Syncs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {history.filter(h => h.status === 'success').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" data-testid="tab-history">
          <Card>
            <CardContent className="pt-6">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
                      {entry.status}
                    </Badge>
                    <span className="font-mono text-sm">{entry.commit_sha.slice(0, 7)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{entry.files_synced} files</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" data-testid="tab-files">
          <Card><CardContent className="pt-6">File management coming soon...</CardContent></Card>
        </TabsContent>

        <TabsContent value="settings" data-testid="tab-settings">
          <Card><CardContent className="pt-6">Settings coming soon...</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`,

    'src/pages/dashboards/A11yDashboard.tsx': () => `import { useState, useEffect } from 'react';
import { Accessibility, Eye, Ear, Hand, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useA11yStats } from '@/hooks/system/useA11yStats';
// TSiJUKEBOX Page - Accessibility Dashboard
// Version: ${VERSION} | Generated: ${now}

export default function A11yDashboard() {
  const { stats, isLoading, fetchStats } = useA11yStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div data-testid="a11y-dashboard" className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Accessibility className="w-8 h-8 text-kiosk-primary" />
        <div>
          <h1 className="text-2xl font-bold">Accessibility Dashboard</h1>
          <p className="text-muted-foreground">WCAG compliance monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-kiosk-primary">{stats?.score ?? '--'}%</div>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-red-500">{stats?.violations ?? 0}</div>
            <p className="text-sm text-muted-foreground">Violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-yellow-500">{stats?.warnings ?? 0}</div>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-500">{stats?.passing ?? 0}</div>
            <p className="text-sm text-muted-foreground">Passing</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Eye className="w-5 h-5" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span>Visual</span><span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Ear className="w-5 h-5" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span>Auditory</span><span>88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Hand className="w-5 h-5" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span>Motor</span><span>95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'src/pages/dashboards/HealthDashboard.tsx': () => `import { useState, useEffect } from 'react';
import { Activity, Server, Cpu, HardDrive, Wifi, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConnectionMonitor } from '@/hooks/system/useConnectionMonitor';
// TSiJUKEBOX Page - Health Dashboard
// Version: ${VERSION} | Generated: ${now}

export default function HealthDashboard() {
  const { status, latency, ping } = useConnectionMonitor();

  return (
    <div data-testid="health-dashboard" className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-kiosk-primary" />
          <div>
            <h1 className="text-2xl font-bold">System Health</h1>
            <p className="text-muted-foreground">Real-time system monitoring</p>
          </div>
        </div>
        <Button variant="outline" onClick={ping}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Server className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold">Backend</p>
                <Badge className={status === 'connected' ? 'bg-green-500' : 'bg-red-500'}>
                  {status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Wifi className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-semibold">Latency</p>
                <p className="text-2xl font-bold">{latency ?? '--'}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Cpu className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold">CPU</p>
                <p className="text-2xl font-bold">23%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <HardDrive className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-semibold">Storage</p>
                <p className="text-2xl font-bold">45%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Resource Usage</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Memory</span><span>62%</span>
            </div>
            <Progress value={62} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>CPU</span><span>23%</span>
            </div>
            <Progress value={23} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Disk</span><span>45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'src/pages/dashboards/KioskMonitorDashboard.tsx': () => `import { useState, useEffect } from 'react';
import { Monitor, Power, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// TSiJUKEBOX Page - Kiosk Monitor Dashboard
// Version: ${VERSION} | Generated: ${now}

interface KioskDevice {
  id: string;
  hostname: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  uptime: number;
}

export default function KioskMonitorDashboard() {
  const [devices, setDevices] = useState<KioskDevice[]>([
    { id: '1', hostname: 'kiosk-01', status: 'online', lastSeen: new Date().toISOString(), uptime: 99.9 },
    { id: '2', hostname: 'kiosk-02', status: 'warning', lastSeen: new Date().toISOString(), uptime: 98.5 },
    { id: '3', hostname: 'kiosk-03', status: 'offline', lastSeen: new Date().toISOString(), uptime: 0 },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Power className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div data-testid="kiosk-monitor-dashboard" className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="w-8 h-8 text-kiosk-primary" />
        <div>
          <h1 className="text-2xl font-bold">Kiosk Monitor</h1>
          <p className="text-muted-foreground">Monitor connected kiosk devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-500">
              {devices.filter(d => d.status === 'online').length}
            </div>
            <p className="text-sm text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-yellow-500">
              {devices.filter(d => d.status === 'warning').length}
            </div>
            <p className="text-sm text-muted-foreground">Warning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-red-500">
              {devices.filter(d => d.status === 'offline').length}
            </div>
            <p className="text-sm text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Devices</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(device.status)}
                  <div>
                    <p className="font-semibold">{device.hostname}</p>
                    <p className="text-sm text-muted-foreground">Uptime: {device.uptime}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                    {device.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'src/pages/settings/Settings.tsx': () => `import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SettingsDashboard } from '@/components/settings/SettingsDashboard';
// TSiJUKEBOX Page - Settings
// Version: ${VERSION} | Generated: ${now}

export default function Settings() {
  return (
    <div data-testid="settings-page" className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-kiosk-primary" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" data-testid="settings-tabs">
        <TabsList>
          <TabsTrigger value="general" data-value="general">
            <User className="w-4 h-4 mr-2" />General
          </TabsTrigger>
          <TabsTrigger value="notifications" data-value="notifications">
            <Bell className="w-4 h-4 mr-2" />Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" data-value="privacy">
            <Shield className="w-4 h-4 mr-2" />Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" data-value="appearance">
            <Palette className="w-4 h-4 mr-2" />Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-play">Auto-play on startup</Label>
                <Switch id="auto-play" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="remember-queue">Remember queue</Label>
                <Switch id="remember-queue" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push notifications</Label>
                <Switch id="push-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <Switch id="email-notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Usage analytics</Label>
                <Switch id="analytics" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public-profile">Public profile</Label>
                <Switch id="public-profile" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" data-testid="theme-toggle">Dark mode</Label>
                <Switch id="dark-mode" data-testid="theme-toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="reset-settings">Reset to defaults</Button>
        <Button data-testid="save-settings">Save changes</Button>
      </div>
    </div>
  );
}
`,
  };

  const generator = pageMap[path];
  if (generator) {
    return generator();
  }

  return null;
}
