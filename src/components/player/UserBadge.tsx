import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, Shield, UserCircle, Baby } from 'lucide-react';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: {
    label: 'Admin',
    icon: <Shield className="w-3 h-3" />,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  user: {
    label: 'User',
    icon: <UserCircle className="w-3 h-3" />,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  newbie: {
    label: 'Newbie',
    icon: <Baby className="w-3 h-3" />,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
};

export function UserBadge() {
  const { user, isAuthenticated, isDevAutoLogin, logout } = useUser();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogin}
        className="h-8 px-3 rounded-full bg-kiosk-surface/30 hover:bg-kiosk-surface/50 text-kiosk-text/70 hover:text-kiosk-text"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Entrar
      </Button>
    );
  }

  const config = roleConfig[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 rounded-full bg-kiosk-surface/30 hover:bg-kiosk-surface/50"
        >
          <div className="flex items-center gap-1">
            {isDevAutoLogin && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1">
                DEV
              </Badge>
            )}
            <Badge variant="outline" className={`${config.color} gap-1 text-xs font-medium`}>
              {config.icon}
              {config.label}
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.username || user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          {isDevAutoLogin && (
            <p className="text-xs text-amber-400 mt-1">🔐 Auto-login ativo</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
