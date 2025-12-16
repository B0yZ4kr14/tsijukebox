import { cn } from '@/lib/utils';

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ultra';
  showTagline?: boolean;
  centered?: boolean;
  animate?: boolean;
  className?: string;
}

export function LogoBrand({ 
  size = 'md', 
  variant = 'default',
  showTagline = false, 
  centered = true,
  animate = true,
  className 
}: LogoBrandProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const isUltra = variant === 'ultra';

  return (
    <div className={cn(
      isUltra ? "logo-container-ultra" : "logo-container-3d",
      centered && "flex flex-col items-center justify-center",
      className
    )}>
      <div className={cn(
        "font-black tracking-tight select-none",
        sizeClasses[size],
        animate && (isUltra ? "logo-animate-ultra" : "logo-animate")
      )}>
        <span className={isUltra ? "logo-tsi-ultra" : "logo-tsi"}>TSi</span>
        <span className={isUltra ? "logo-jukebox-ultra" : "logo-jukebox"}>JUKEBOX</span>
      </div>
      {showTagline && (
        <p className={cn(
          "text-kiosk-text/60 mt-1 tracking-widest uppercase",
          taglineSizes[size]
        )}>
          Enterprise Music System
        </p>
      )}
    </div>
  );
}
