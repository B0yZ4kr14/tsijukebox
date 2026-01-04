import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  backTo?: string;
  showLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  className?: string;
}

export function PageTitle({
  title,
  subtitle,
  icon,
  backTo,
  showLogo = false,
  logoSize = 'md',
  centered = false,
  className,
}: PageTitleProps) {
  return (
    <div className={cn(
      "space-y-4",
      centered && "text-center",
      className
    )}>
      {showLogo && (
        <div className={cn("mb-6", centered && "flex justify-center")}>
          <LogoBrand size={logoSize} animate />
        </div>
      )}
      
      <div className={cn(
        "flex items-center gap-4",
        centered && "justify-center"
      )}>
        {backTo && (
          <Link to={backTo}>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80 button-3d"
            >
              <ArrowLeft className="w-6 h-6 text-kiosk-text" />
            </Button>
          </Link>
        )}
        
        <div className={cn(centered && !backTo && "text-center")}>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gold-neon-hover group">
            {icon && (
              <span className="icon-neon-blue-hover">
                {icon}
              </span>
            )}
            {title}
          </h1>
          {subtitle && (
            <p className="text-description-visible text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
