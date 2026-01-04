import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/common/useNotifications';
import { NotificationFiltersPopover } from './NotificationFiltersPopover';
import { Badge, Button } from "@/components/ui/themed"

function NotificationIcon({ severity }: { severity: string }) {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-warning" />;
    default:
      return <Info className="h-4 w-4 text-info" />;
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const severityColors: Record<string, string> = {
    critical: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-warning bg-warning/5',
    info: 'border-l-info bg-info/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`p-3 border-l-2 rounded-r-lg ${severityColors[notification.severity] || severityColors.info} ${
        !notification.read ? 'bg-muted/50' : ''
      }`}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className="flex items-start gap-2">
        <NotificationIcon aria-hidden="true" severity={notification.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" data-testid="unread-indicator" />
            )}
          </div>
          {notification.message && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="xs"
              className="h-6 w-6"
              onClick={() => onMarkAsRead(notification.id)}
              data-testid={`mark-read-${notification.id}`}
            >
              <Check aria-hidden="true" className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="xs"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
            data-testid={`delete-notification-${notification.id}`}
          >
            <X aria-hidden="true" className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {notification.metadata?.taskUrl && notification.metadata.taskUrl !== '#' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 mt-1 text-xs"
          onClick={() => window.open(notification.metadata?.taskUrl as string, '_blank')}
        >
          <ExternalLink aria-hidden="true" className="h-3 w-3 mr-1" />
          Ver tarefa
        </Button>
      )}
    </motion.div>
  );
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const {
    filteredNotifications,
    unreadCount,
    isLoading,
    filters,
    activeFiltersCount,
    setFilters,
    clearFilters,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="relative"
          data-testid="notifications-button"
        >
          <Bell aria-hidden="true" className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium"
              data-testid="notifications-unread-badge"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        data-testid="notifications-dropdown"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          <div className="flex items-center gap-1">
            <NotificationFiltersPopover
              filters={filters}
              activeFiltersCount={activeFiltersCount}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
                data-testid="mark-all-read-button"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
            {filteredNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAll}
                data-testid="clear-all-button"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Active filters indicator */}
        {activeFiltersCount > 0 && (
          <div className="px-3 py-2 bg-muted/50 border-b flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearFilters}
              data-testid="clear-filters-button"
            >
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell aria-hidden="true" className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {activeFiltersCount > 0
                  ? 'Nenhuma notificação encontrada com os filtros aplicados'
                  : 'Nenhuma notificação'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              <AnimatePresence>
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={clearNotification}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Badge variant="secondary" className="text-xs">
              {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 'ões' : ''}
            </Badge>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}