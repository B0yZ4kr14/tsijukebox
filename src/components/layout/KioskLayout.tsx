import { ReactNode } from 'react';

interface KioskLayoutProps {
  children: ReactNode;
}

export function KioskLayout({ children }: KioskLayoutProps) {
  return (
    <div 
      className="min-h-screen w-full bg-kiosk-bg text-foreground overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
