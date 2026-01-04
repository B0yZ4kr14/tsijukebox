import { Database, Trash2, Clock, HardDrive } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge, Button } from "@/components/ui/themed"

interface CacheStats {
  size: number;
  keys: string[];
  lastUpdate: number | null;
}

interface CacheIndicatorProps {
  stats: CacheStats;
  fromCache: boolean;
  onClear: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function CacheIndicator({ stats, fromCache, onClear }: CacheIndicatorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Database className="h-4 w-4" />
          {fromCache ? (
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
              Cache
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              API
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Status do Cache</h4>
            {fromCache && (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                Ativo
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>Tamanho:</span>
              <span className="ml-auto font-medium text-foreground">
                {formatBytes(stats.size)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última atualização:</span>
              <span className="ml-auto font-medium text-foreground">
                {stats.lastUpdate
                  ? formatDistanceToNow(stats.lastUpdate, { addSuffix: true, locale: ptBR })
                  : '-'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Itens em cache:</span>
              <span className="ml-auto font-medium text-foreground">
                {stats.keys.length}
              </span>
            </div>
          </div>

          {stats.keys.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Dados armazenados:</p>
              <div className="flex flex-wrap gap-1">
                {stats.keys.map(key => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={onClear}
            className="w-full"
            disabled={stats.keys.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
