import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Music2, 
  FileText, 
  MessageSquare,
  LogOut,
  Home
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/library', label: 'Biblioteca', icon: Music2 },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useLocation();
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-kiosk-bg">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <LogoBrand size="sm" variant="metal" animate={false} centered={false} />
          <p className="text-sm text-kiosk-text/90 mt-1">Painel Admin</p>
        </div>
        
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === item.href
                  ? 'bg-sidebar-accent text-gold-neon'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className={cn("w-4 h-4", pathname === item.href && "icon-neon-blue")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
          <Link to="/">
            <Button variant="kiosk-outline" className="w-full justify-start" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Kiosk
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
