import { cn } from '@/lib/utils';

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ultra' | 'bulge' | 'mirror' | 'mirror-dark' | 'silver' | 'metal';
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

  const getContainerClass = () => {
    switch (variant) {
      case 'ultra': return 'logo-container-ultra';
      case 'bulge': return 'logo-container-bulge';
      case 'mirror': return 'logo-container-mirror';
      case 'mirror-dark': return 'logo-container-mirror';
      case 'silver': return 'logo-container-silver';
      case 'metal': return 'logo-container-metal';
      default: return 'logo-container-3d';
    }
  };

  const getAnimateClass = () => {
    switch (variant) {
      case 'ultra': return 'logo-animate-ultra';
      case 'bulge': return 'logo-animate-bulge';
      case 'mirror': return 'logo-animate-mirror';
      default: return 'logo-animate';
    }
  };

  const getTsiClass = () => {
    switch (variant) {
      case 'ultra': return 'logo-tsi-ultra';
      case 'bulge': return 'logo-tsi-bulge';
      case 'mirror': return 'logo-tsi-mirror';
      case 'mirror-dark': return 'logo-tsi-mirror-dark';
      case 'silver': return 'logo-tsi-silver';
      case 'metal': return 'logo-tsi-metal';
      default: return 'logo-tsi';
    }
  };

  const getJukeboxClass = () => {
    switch (variant) {
      case 'ultra': return 'logo-jukebox-ultra';
      case 'bulge': return 'logo-jukebox-bulge';
      case 'mirror': return 'logo-jukebox-mirror';
      case 'mirror-dark': return 'logo-jukebox-mirror-dark';
      case 'silver': return 'logo-jukebox-silver';
      case 'metal': return 'logo-jukebox-metal';
      default: return 'logo-jukebox';
    }
  };

  return (
    <div className={cn(
      getContainerClass(),
      centered && "flex flex-col items-center justify-center",
      className
    )}>
      <div className={cn(
        "font-black tracking-tight select-none",
        sizeClasses[size],
        animate && getAnimateClass()
      )}>
        <span className={getTsiClass()}>TSi</span>
        <span className={getJukeboxClass()}>JUKEBOX</span>
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
