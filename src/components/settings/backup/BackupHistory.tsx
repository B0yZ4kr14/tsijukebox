import { Clock, Check, X, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/themed";
import { cn } from '@/lib/utils';
import type { BackupHistoryItem } from './types';

interface BackupHistoryProps {
  items: BackupHistoryItem[];
  maxItems?: number;
}

const statusIcons = {
  completed: <Check aria-hidden="true" className="w-3 h-3 text-green-400" />,
  failed: <X aria-hidden="true" className="w-3 h-3 text-red-400" />,
  pending: <Clock className="w-3 h-3 text-yellow-400" />,
  syncing: <RefreshCw aria-hidden="true" className="w-3 h-3 text-cyan-400 animate-spin" />,
};

export function BackupHistory({ items, maxItems = 10 }: BackupHistoryProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-kiosk-text/60">
        Nenhum histórico de backup disponível
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 icon-neon-blue" />
        <span className="text-sm font-medium text-label-yellow">Histórico</span>
        <Badge variant="outline" className="ml-auto text-xs">
          {items.length} {items.length === 1 ? 'registro' : 'registros'}
        </Badge>
      </div>
      
      <ScrollArea className="h-40 rounded-lg card-option-dark-3d">
        <div className="p-2 space-y-1">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded bg-kiosk-surface/30 hover:bg-kiosk-surface/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {statusIcons[item.status]}
                <span className="text-xs text-kiosk-text capitalize">
                  {item.provider}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    item.type === 'full'
                      ? 'border-green-500/30 text-green-400/80'
                      : 'border-blue-500/30 text-blue-400/80'
                  )}
                >
                  {item.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-kiosk-text/60">
                <span>{item.size}</span>
                <span>•</span>
                <span>
                  {new Date(item.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
