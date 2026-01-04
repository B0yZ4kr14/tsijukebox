// Pages templates - Tools, Admin, Public, Dashboards, Brand (29 files total)

const VERSION = '4.2.0';

export function generatePagesExtendedContent(path: string): string | null {
  const now = new Date().toISOString();
  const fileName = path.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || '';
  const folder = path.split('/')[2]; // e.g., 'tools', 'admin', 'public', etc.

  // === PAGES TOOLS (7 files) ===
  const toolsTemplates: Record<string, string> = {
    'index': `// Pages Tools Barrel Export
// Version: ${VERSION}
// Last updated: ${now}

export { default as ChangelogTimeline } from './ChangelogTimeline';
export { default as ComponentsShowcase } from './ComponentsShowcase';
export { default as LyricsTest } from './LyricsTest';
export { default as ScreenshotService } from './ScreenshotService';
export { default as VersionComparison } from './VersionComparison';
export { default as WcagExceptions } from './WcagExceptions';
`,

    'ChangelogTimeline': `// Changelog Timeline Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: { type: 'added' | 'changed' | 'fixed' | 'removed'; text: string }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '${VERSION}',
    date: '${now.split('T')[0]}',
    changes: [
      { type: 'added', text: 'Full repository sync with GitHub' },
      { type: 'added', text: 'File selection modal' },
      { type: 'changed', text: 'Improved dashboard performance' },
      { type: 'fixed', text: 'Various bug fixes' }
    ]
  }
];

export default function ChangelogTimeline() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Changelog</h1>
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {changelog.map((entry) => (
            <Card key={entry.version}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <CardTitle>v{entry.version}</CardTitle>
                  <Badge variant="outline">{entry.date}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Badge variant={change.type === 'added' ? 'default' : 'secondary'}>
                        {change.type}
                      </Badge>
                      <span>{change.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
`,

    'ComponentsShowcase': `// Components Showcase Page
// Version: ${VERSION}
// Last updated: ${now}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function ComponentsShowcase() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Components Showcase</h1>
      
      <Tabs defaultValue="buttons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inputs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Default input" value={inputValue} onChange={e => setInputValue(e.target.value)} />
              <Input type="password" placeholder="Password input" />
              <Input disabled placeholder="Disabled input" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Card content goes here.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => toast.success('Button clicked!')}>
                  Click me
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`,

    'LyricsTest': `// Lyrics Test Page
// Version: ${VERSION}
// Last updated: ${now}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LyricsTest() {
  const [artist, setArtist] = useState('');
  const [track, setTrack] = useState('');
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchLyrics = async () => {
    if (!artist || !track) return;
    setLoading(true);
    // Simulated lyrics fetch
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLyrics(\`[Lyrics for "\${track}" by \${artist}]\\n\\nVerse 1:\\nSample lyrics here...\\n\\nChorus:\\nSample chorus here...\`);
    setLoading(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Lyrics Test</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Search Lyrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Artist name" 
            value={artist} 
            onChange={e => setArtist(e.target.value)} 
          />
          <Input 
            placeholder="Track name" 
            value={track} 
            onChange={e => setTrack(e.target.value)} 
          />
          <Button onClick={searchLyrics} disabled={loading || !artist || !track}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          
          {lyrics && (
            <ScrollArea className="h-64 mt-4 p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">{lyrics}</pre>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'ScreenshotService': `// Screenshot Service Page
// Version: ${VERSION}
// Last updated: ${now}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Download } from 'lucide-react';

export default function ScreenshotService() {
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const captureScreenshot = async () => {
    if (!url) return;
    setLoading(true);
    // Simulated screenshot capture
    await new Promise(resolve => setTimeout(resolve, 2000));
    setScreenshot('/placeholder.svg');
    setLoading(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Screenshot Service</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Capture Screenshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Enter URL to capture" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            type="url"
          />
          <Button onClick={captureScreenshot} disabled={loading || !url}>
            {loading ? 'Capturing...' : 'Capture'}
          </Button>
          
          {screenshot && (
            <div className="mt-4 space-y-4">
              <img 
                src={screenshot} 
                alt="Screenshot" 
                className="w-full rounded-lg border"
              />
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'VersionComparison': `// Version Comparison Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const versions = [
  { version: '4.2.0', date: '${now.split('T')[0]}', features: 12, fixes: 8, status: 'current' },
  { version: '4.1.0', date: '2024-12-01', features: 10, fixes: 15, status: 'stable' },
  { version: '4.0.0', date: '2024-11-15', features: 25, fixes: 20, status: 'legacy' },
];

export default function VersionComparison() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Version Comparison</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Release History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Bug Fixes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="font-mono">{v.version}</TableCell>
                  <TableCell>{v.date}</TableCell>
                  <TableCell>{v.features}</TableCell>
                  <TableCell>{v.fixes}</TableCell>
                  <TableCell>
                    <Badge variant={v.status === 'current' ? 'default' : 'secondary'}>
                      {v.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'WcagExceptions': `// WCAG Exceptions Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const exceptions = [
  { id: 1, rule: '1.4.3 Contrast', reason: 'Decorative element', status: 'approved' },
  { id: 2, rule: '2.4.4 Link Purpose', reason: 'Context provides meaning', status: 'approved' },
  { id: 3, rule: '4.1.2 Name, Role, Value', reason: 'Third-party widget', status: 'pending' },
];

export default function WcagExceptions() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">WCAG Exceptions</h1>
      
      <div className="space-y-4">
        {exceptions.map((exc) => (
          <Card key={exc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {exc.status === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {exc.rule}
                </CardTitle>
                <Badge variant={exc.status === 'approved' ? 'default' : 'secondary'}>
                  {exc.status}
                </Badge>
              </div>
              <CardDescription>{exc.reason}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
`
  };

  // === PAGES ADMIN (5 files) ===
  const adminTemplates: Record<string, string> = {
    'index': `// Pages Admin Barrel Export
// Version: ${VERSION}
// Last updated: ${now}

export { default as Admin } from './Admin';
export { default as AdminFeedback } from './AdminFeedback';
export { default as AdminLibrary } from './AdminLibrary';
export { default as AdminLogs } from './AdminLogs';
`,

    'Admin': `// Admin Dashboard Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Music, MessageSquare, Activity } from 'lucide-react';

const stats = [
  { title: 'Total Users', value: '1,234', icon: Users, change: '+12%' },
  { title: 'Tracks Played', value: '45,678', icon: Music, change: '+8%' },
  { title: 'Feedback', value: '89', icon: MessageSquare, change: '+23%' },
  { title: 'Active Sessions', value: '42', icon: Activity, change: '+5%' },
];

export default function Admin() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`,

    'AdminFeedback': `// Admin Feedback Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const feedback = [
  { id: 1, user: 'User 1', message: 'Great app!', rating: 5, date: '2024-01-15' },
  { id: 2, user: 'User 2', message: 'Could use more features', rating: 4, date: '2024-01-14' },
  { id: 3, user: 'User 3', message: 'Love the interface', rating: 5, date: '2024-01-13' },
];

export default function AdminFeedback() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">User Feedback</h1>
      
      <div className="space-y-4">
        {feedback.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{item.user}</CardTitle>
              <div className="flex items-center gap-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p>{item.message}</p>
              <Badge variant="outline" className="mt-2">{item.date}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`,

    'AdminLibrary': `// Admin Library Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Trash2 } from 'lucide-react';

const tracks = [
  { id: '1', title: 'Song 1', artist: 'Artist 1', duration: '3:45', plays: 1234 },
  { id: '2', title: 'Song 2', artist: 'Artist 2', duration: '4:12', plays: 987 },
  { id: '3', title: 'Song 3', artist: 'Artist 3', duration: '3:28', plays: 756 },
];

export default function AdminLibrary() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Music Library</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Track
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tracks..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track) => (
                <TableRow key={track.id}>
                  <TableCell className="font-medium">{track.title}</TableCell>
                  <TableCell>{track.artist}</TableCell>
                  <TableCell>{track.duration}</TableCell>
                  <TableCell>{track.plays.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'AdminLogs': `// Admin Logs Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const logs = [
  { id: 1, level: 'INFO', message: 'User logged in', timestamp: '${now}', module: 'auth' },
  { id: 2, level: 'WARNING', message: 'Rate limit approaching', timestamp: '${now}', module: 'api' },
  { id: 3, level: 'ERROR', message: 'Failed to sync', timestamp: '${now}', module: 'sync' },
  { id: 4, level: 'DEBUG', message: 'Cache cleared', timestamp: '${now}', module: 'cache' },
];

export default function AdminLogs() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'destructive';
      case 'WARNING': return 'warning';
      case 'INFO': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">System Logs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <Badge variant={getLevelColor(log.level) as any}>{log.level}</Badge>
                  <span className="flex-1">{log.message}</span>
                  <span className="text-sm text-muted-foreground">{log.module}</span>
                  <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
`
  };

  // === PAGES PUBLIC (10 files) ===
  const publicTemplates: Record<string, string> = {
    'index': `// Pages Public Barrel Export
// Version: ${VERSION}
// Last updated: ${now}

export { default as Auth } from './Auth';
export { default as Help } from './Help';
export { default as Index } from './Index';
export { default as Install } from './Install';
export { default as LandingPage } from './LandingPage';
export { default as Login } from './Login';
export { default as NotFound } from './NotFound';
export { default as SetupWizard } from './SetupWizard';
export { default as Wiki } from './Wiki';
`,

    'Auth': `// Auth Page
// Version: ${VERSION}
// Last updated: ${now}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Auth() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to TSiJUKEBOX</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <p className="text-center text-muted-foreground py-8">Login form here</p>
            </TabsContent>
            <TabsContent value="signup">
              <p className="text-center text-muted-foreground py-8">Sign up form here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'Help': `// Help Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How do I connect Spotify?', a: 'Go to Settings > Music Integrations > Spotify and follow the setup wizard.' },
  { q: 'How do I create a Jam session?', a: 'Click the Jam button in the player and select "Create Session".' },
  { q: 'Can I use this on multiple devices?', a: 'Yes! Your account syncs across all your devices.' },
];

export default function Help() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={\`item-\${i}\`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'NotFound': `// 404 Not Found Page
// Version: ${VERSION}
// Last updated: ${now}

import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
      
      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
  );
}
`
  };

  // === PAGES DASHBOARDS (5 files) ===
  const dashboardsTemplates: Record<string, string> = {
    'index': `// Pages Dashboards Barrel Export
// Version: ${VERSION}
// Last updated: ${now}

export { default as Dashboard } from './Dashboard';
export { default as ClientsMonitorDashboard } from './ClientsMonitorDashboard';
export { default as InstallerMetrics } from './InstallerMetrics';
export { default as JukeboxStatsDashboard } from './JukeboxStatsDashboard';
`,

    'Dashboard': `// Main Dashboard Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dashboard content here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`,

    'ClientsMonitorDashboard': `// Clients Monitor Dashboard
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ClientsMonitorDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Clients Monitor</h1>
      <Card>
        <CardHeader>
          <CardTitle>Connected Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>Kiosk-01</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>Kiosk-02</span>
              <Badge variant="destructive">Offline</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`,

    'InstallerMetrics': `// Installer Metrics Dashboard
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstallerMetrics() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Installer Metrics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Installs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">1,234</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Success Rate</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">98.5%</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Avg Duration</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">3.2 min</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
`,

    'JukeboxStatsDashboard': `// Jukebox Stats Dashboard
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function JukeboxStatsDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Jukebox Statistics</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Songs Played Today</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">342</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Users</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">89</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Jam Sessions</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">12</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Queue Length</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">24</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
`
  };

  // === PAGES BRAND (3 files) ===
  const brandTemplates: Record<string, string> = {
    'index': `// Pages Brand Barrel Export
// Version: ${VERSION}
// Last updated: ${now}

export { default as BrandGuidelines } from './BrandGuidelines';
export { default as LogoGitHubPreview } from './LogoGitHubPreview';
`,

    'BrandGuidelines': `// Brand Guidelines Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BrandGuidelines() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Brand Guidelines</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Logo Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Guidelines for using the TSiJUKEBOX logo...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="h-20 w-20 rounded-lg bg-primary" />
            <div className="h-20 w-20 rounded-lg bg-secondary" />
            <div className="h-20 w-20 rounded-lg bg-accent" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">Heading</p>
            <p className="text-xl">Subheading</p>
            <p>Body text</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`,

    'LogoGitHubPreview': `// Logo GitHub Preview Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function LogoGitHubPreview() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Logo Preview</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Light Mode</CardTitle>
          </CardHeader>
          <CardContent className="bg-white p-8 rounded-lg flex items-center justify-center">
            <div className="h-32 w-32 bg-primary rounded-lg" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode</CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-900 p-8 rounded-lg flex items-center justify-center">
            <div className="h-32 w-32 bg-primary rounded-lg" />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4 mt-8">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download SVG
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
`
  };

  // Match folder and return appropriate template
  if (folder === 'tools' && toolsTemplates[fileName]) {
    return toolsTemplates[fileName];
  }
  if (folder === 'admin' && adminTemplates[fileName]) {
    return adminTemplates[fileName];
  }
  if (folder === 'public' && publicTemplates[fileName]) {
    return publicTemplates[fileName];
  }
  if (folder === 'dashboards' && dashboardsTemplates[fileName]) {
    return dashboardsTemplates[fileName];
  }
  if (folder === 'brand' && brandTemplates[fileName]) {
    return brandTemplates[fileName];
  }

  // Generic template for unmapped pages
  return `// ${fileName} Page
// Version: ${VERSION}
// Last updated: ${now}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ${fileName}() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">${fileName}</h1>
      <Card>
        <CardHeader>
          <CardTitle>${fileName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Page content here</p>
        </CardContent>
      </Card>
    </div>
  );
}
`;
}
