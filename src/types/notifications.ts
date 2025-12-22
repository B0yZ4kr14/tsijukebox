/**
 * Notification Types
 * 
 * Types for in-app notifications and alerts
 */

import type { Json } from '@/integrations/supabase/types';

/**
 * Notification types
 */
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'update'
  | 'security'
  | 'playback';

/**
 * Notification severity
 */
export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Notification action type
 */
export type NotificationActionType = 'link' | 'button' | 'dismiss' | 'callback';

/**
 * Notification action
 */
export interface NotificationAction {
  type: NotificationActionType;
  label: string;
  url?: string;
  callback?: string;
  primary?: boolean;
}

/**
 * Notification record
 */
export interface AppNotification {
  id: string;
  userId: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string | null;
  read: boolean;
  metadata: Json | null;
  actions?: NotificationAction[];
  expiresAt?: string;
  createdAt: string;
}

/**
 * Notification input for creating new notifications
 */
export interface NotificationInput {
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  message?: string;
  metadata?: Json;
  actions?: NotificationAction[];
  expiresAt?: Date;
}

/**
 * Notification filter options
 */
export interface NotificationFilters {
  type?: NotificationType;
  severity?: NotificationSeverity;
  read?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  email: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  bySeverity: Record<NotificationSeverity, number>;
}

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Type guard for AppNotification
 */
export function isAppNotification(value: unknown): value is AppNotification {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'title' in value
  );
}

/**
 * Type guard for NotificationPreferences
 */
export function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  return (
    typeof value === 'object' &&
    value !== null &&
    'enabled' in value &&
    'types' in value
  );
}
