import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, FileCode, ChevronUp, ChevronDown, CloudUpload, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui/themed"

interface DetectedFile {
  path: string;
  timestamp: number;
}

type SyncStatus = 'idle' | 'pending' | 'syncing' | 'success' | 'error';

interface DevFileChangeMonitorProps {
  /** Files detected for sync */
  detectedFiles?: DetectedFile[];
  /** Whether detection is active */
  isDetecting?: boolean;
  /** Callback when starting detection */
  onStartDetection?: () => void;
  /** Last detection timestamp */
  lastDetection?: Date | null;
  /** Callback for manual sync */
  onSyncNow?: () => Promise<void>;
  /** Whether sync is in progress */
  isSyncing?: boolean;
  /** Current sync status */
  syncStatus?: SyncStatus;
}

/**
 * DevFileChangeMonitor - Floating badge showing pending files for sync
 * Only visible in development mode when there are detected files
 */
export function DevFileChangeMonitor({
  detectedFiles = [],
  isDetecting = false,
  onStartDetection,
  lastDetection,
  onSyncNow,
  isSyncing = false,
  syncStatus = 'idle',
}: DevFileChangeMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState<SyncStatus>(syncStatus);

  // Auto-start detection on mount
  useEffect(() => {
    if (onStartDetection) {
      onStartDetection();
      console.log('[DevFileChangeMonitor] Auto-started file change detection');
    }
  }, [onStartDetection]);

  // Update local status from props
  useEffect(() => {
    setLocalStatus(syncStatus);
  }, [syncStatus]);

  // Reset status to idle after success
  useEffect(() => {
    if (localStatus === 'success') {
      const timer = setTimeout(() => setLocalStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [localStatus]);

  // Handle sync button click
  const handleSyncNow = async () => {
    if (!onSyncNow || isSyncing) return;
    
    setLocalStatus('syncing');
    try {
      await onSyncNow();
      setLocalStatus('success');
    } catch (error) {
      console.error('[DevFileChangeMonitor] Sync failed:', error);
      setLocalStatus('error');
    }
  };

  // Don't render if no files detected and not syncing
  if (detectedFiles.length === 0 && localStatus !== 'syncing' && localStatus !== 'success') {
    return null;
  }

  const fileCount = detectedFiles.length;
  const pluralSuffix = fileCount === 1 ? '' : 's';

  // Get badge color based on status
  const getBadgeStyles = () => {
    switch (localStatus) {
      case 'syncing':
        return 'bg-blue-500/90 hover:bg-blue-400 border-blue-600/30';
      case 'success':
        return 'bg-green-500/90 hover:bg-green-400 border-green-600/30';
      case 'error':
        return 'bg-red-500/90 hover:bg-red-400 border-red-600/30';
      case 'pending':
      default:
        return 'bg-amber-500/90 hover:bg-amber-400 border-amber-600/30';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (localStatus === 'syncing' || isSyncing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (localStatus === 'success') {
      return <Check aria-hidden="true" className="h-4 w-4" />;
    }
    if (localStatus === 'error') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return (
      <RefreshCw 
        className={cn(
          "h-4 w-4 transition-transform",
          isDetecting && "animate-spin"
        )} 
      />
    );
  };

  // Get status text
  const getStatusText = () => {
    switch (localStatus) {
      case 'syncing':
        return 'sincronizando...';
      case 'success':
        return 'sync completo!';
      case 'error':
        return 'erro no sync';
      default:
        return `arquivo${pluralSuffix} para sync`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-20 left-4 z-50"
    >
      {/* Main Badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg",
          "text-black transition-all duration-200 cursor-pointer border",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
          getBadgeStyles(),
          localStatus === 'syncing' && "animate-pulse"
        )}
        aria-expanded={isExpanded}
        aria-label={`${fileCount} arquivo${pluralSuffix} pendente${pluralSuffix} para sync`}
      >
        {getStatusIcon()}
        
        {fileCount > 0 && (
          <Badge 
            variant="secondary" 
            className="bg-black/20 text-white font-bold px-2 py-0.5 text-xs"
          >
            {fileCount}
          </Badge>
        )}
        
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
        
        {isExpanded ? (
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        ) : (
          <ChevronUp aria-hidden="true" className="h-4 w-4" />
        )}
      </button>

      {/* Expanded File List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mt-2 overflow-hidden"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border border-border p-3 max-h-64 overflow-auto min-w-[280px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">
                  Arquivos detectados
                </span>
                {lastDetection && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(lastDetection)}
                  </span>
                )}
              </div>
              
              {/* File List */}
              {fileCount > 0 ? (
                <ul className="space-y-1 mb-3">
                  {detectedFiles.map((file) => (
                    <li 
                      key={file.path}
                      className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <FileCode className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      <span className="truncate text-foreground" title={file.path}>
                        {file.path}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2 mb-3">
                  Nenhum arquivo pendente
                </p>
              )}

              {/* Sync Button */}
              <Button
                onClick={handleSyncNow}
                disabled={isSyncing || fileCount === 0}
                size="sm"
                className={cn(
                  "w-full gap-2 font-medium",
                  localStatus === 'success' && "bg-green-600 hover:bg-green-700",
                  localStatus === 'error' && "bg-red-600 hover:bg-red-700"
                )}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : localStatus === 'success' ? (
                  <>
                    <Check aria-hidden="true" className="h-4 w-4" />
                    Sync Completo!
                  </>
                ) : localStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Tentar Novamente
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    🚀 Sync Agora
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Format a date as relative time (e.g., "2 min atrás")
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return 'agora';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min atrás`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h atrás`;
  }
  
  return date.toLocaleDateString('pt-BR');
}

export default DevFileChangeMonitor;
