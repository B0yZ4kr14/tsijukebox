import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  X, 
  ChevronRight,
  Bell,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsNotifications, SettingsNotification, SettingsCategoryId } from '@/hooks';
import { useState } from 'react';
import { Badge, Button } from "@/components/ui/themed"

interface SettingsNotificationBannerProps {
  onNavigateToCategory: (category: SettingsCategoryId) => void;
  maxVisible?: number;
}

export function SettingsNotificationBanner({ 
  onNavigateToCategory,
  maxVisible = 3 
}: SettingsNotificationBannerProps) {
  const { notifications, dismiss, dismissAll, totalCount, warningCount, errorCount } = useSettingsNotifications();
  const [isExpanded, setIsExpanded] = useState(false);

  if (notifications.length === 0) return null;

  const visibleNotifications = isExpanded ? notifications : notifications.slice(0, maxVisible);
  const hasMore = notifications.length > maxVisible;

  const getIcon = (type: SettingsNotification['type']) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBorderColor = (type: SettingsNotification['type']) => {
    switch (type) {
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-yellow-500';
      case 'info': return 'border-l-cyan-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell aria-hidden="true" className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-kiosk-text">
            {totalCount} {totalCount === 1 ? 'notificação' : 'notificações'}
          </span>
          {warningCount > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              {warningCount} atenção
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {errorCount} crítico
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissAll}
          className="text-xs text-kiosk-text/85 hover:text-kiosk-text h-7"
        >
          Dispensar todas
        </Button>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        <AnimatePresence>
          {visibleNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg bg-kiosk-surface/60 border border-kiosk-border/50 border-l-4",
                getBorderColor(notification.type)
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-kiosk-text">
                      {notification.title}
                    </p>
                    <p className="text-xs text-kiosk-text/85 mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  
                  {notification.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismiss(notification.id)}
                      className="h-6 w-6 p-0 text-kiosk-text/80 hover:text-kiosk-text flex-shrink-0"
                    >
                      <X aria-hidden="true" className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {notification.actionLabel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToCategory(notification.category)}
                    className="h-7 px-2 mt-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  >
                    {notification.actionLabel}
                    <ChevronRight aria-hidden="true" className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more/less */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 h-8 text-xs text-kiosk-text/85 hover:text-kiosk-text"
        >
          {isExpanded ? (
            <>
              <ChevronUp aria-hidden="true" className="w-3 h-3 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown aria-hidden="true" className="w-3 h-3 mr-1" />
              Mostrar mais {notifications.length - maxVisible} notificações
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}

// Badge component for use in navigation/sidebar
export function SettingsNotificationBadge() {
  const { totalCount, hasWarnings, hasErrors } = useSettingsNotifications();

  if (totalCount === 0) return null;

  return (
    <Badge 
      className={cn(
        "h-5 min-w-5 px-1.5 text-[10px] font-bold",
        hasErrors 
          ? "bg-red-500 text-white" 
          : hasWarnings 
            ? "bg-yellow-500 text-black" 
            : "bg-cyan-500 text-white"
      )}
    >
      {totalCount}
    </Badge>
  );
}
