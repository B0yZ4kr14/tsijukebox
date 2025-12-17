import { LucideIcon, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StatusLevel } from '@/hooks/useSettingsStatus';

interface SettingsGuideCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: StatusLevel;
  statusMessage: string;
  onClick: () => void;
}

export function SettingsGuideCard({ 
  title, 
  description, 
  icon: Icon, 
  status, 
  statusMessage,
  onClick 
}: SettingsGuideCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
      case 'error': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'ok': 
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5">OK</Badge>;
      case 'warning': 
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5">ATENÇÃO</Badge>;
      case 'error': 
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5">PENDENTE</Badge>;
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all hover:scale-[1.02] group",
        "bg-kiosk-surface/50 border",
        status === 'ok' && "border-green-500/20 hover:border-green-500/40",
        status === 'warning' && "border-yellow-500/20 hover:border-yellow-500/40",
        status === 'error' && "border-red-500/20 hover:border-red-500/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2.5 rounded-lg flex-shrink-0",
          status === 'ok' && "bg-green-500/10",
          status === 'warning' && "bg-yellow-500/10",
          status === 'error' && "bg-red-500/10"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            status === 'ok' && "text-green-400",
            status === 'warning' && "text-yellow-400",
            status === 'error' && "text-red-400"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-kiosk-text text-sm truncate">{title}</h4>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-kiosk-text/60 line-clamp-2 mb-2">{description}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-kiosk-text/50">
            {getStatusIcon()}
            <span className="truncate">{statusMessage}</span>
          </div>
        </div>
        
        <ArrowRight className="w-4 h-4 text-kiosk-text/30 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
}
