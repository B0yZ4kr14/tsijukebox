// Layout Components Templates - 2 arquivos

export function generateLayoutComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/layout/AdminLayout.tsx':
      return `import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Settings,
  Users,
  BarChart3,
  Music,
  Github,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/admin', label: 'Dashboard', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/kiosk-monitor', label: 'Kiosks', icon: Users },
  { path: '/github-dashboard', label: 'GitHub', icon: Github },
  { path: '/player', label: 'Player', icon: Music },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="ml-3 font-semibold">TSiJUKEBOX Admin</span>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-40 transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Panel
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
`;

    case 'src/components/layout/KioskLayout.tsx':
      return `import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KioskLayoutProps {
  children: ReactNode;
  className?: string;
  hideControls?: boolean;
}

export function KioskLayout({ 
  children, 
  className,
  hideControls = false 
}: KioskLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-kiosk-background text-kiosk-text',
        'flex flex-col',
        hideControls && 'cursor-none',
        className
      )}
    >
      {/* Kiosk Header */}
      {!hideControls && (
        <header className="h-12 bg-kiosk-surface border-b border-kiosk-border flex items-center justify-between px-4">
          <span className="font-bold text-kiosk-primary">TSiJUKEBOX</span>
          <div className="flex items-center gap-2 text-sm text-kiosk-muted">
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Kiosk Footer */}
      {!hideControls && (
        <footer className="h-10 bg-kiosk-surface border-t border-kiosk-border flex items-center justify-center">
          <p className="text-xs text-kiosk-muted">
            Touch to interact • Powered by TSiJUKEBOX
          </p>
        </footer>
      )}
    </div>
  );
}
`;

    default:
      return null;
  }
}
