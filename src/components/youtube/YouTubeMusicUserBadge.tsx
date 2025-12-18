import { YouTubeMusicUser } from '@/lib/api/youtubeMusic';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface YouTubeMusicUserBadgeProps {
  user: YouTubeMusicUser;
  size?: 'sm' | 'md' | 'lg';
  showEmail?: boolean;
  className?: string;
}

export function YouTubeMusicUserBadge({ user, size = 'md', showEmail = true, className }: YouTubeMusicUserBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      avatar: 'w-6 h-6',
      name: 'text-xs',
      email: 'text-[10px]',
    },
    md: {
      container: 'gap-3',
      avatar: 'w-8 h-8',
      name: 'text-sm',
      email: 'text-xs',
    },
    lg: {
      container: 'gap-4',
      avatar: 'w-12 h-12',
      name: 'text-base',
      email: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex items-center", sizes.container, className)}>
      {/* Avatar */}
      <div className={cn("rounded-full overflow-hidden bg-[#FF0000]/20 flex-shrink-0", sizes.avatar)}>
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#FF0000] font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium text-kiosk-text truncate", sizes.name)}>
          {user.name}
        </p>
        {showEmail && (
          <p className={cn("text-kiosk-text/85 truncate", sizes.email)}>
            {user.email}
          </p>
        )}
      </div>

      {/* YouTube Music Badge */}
      <Badge 
        variant="outline" 
        className="border-[#FF0000]/50 text-[#FF0000] bg-[#FF0000]/10 flex-shrink-0"
      >
        YouTube Music
      </Badge>
    </div>
  );
}
