/**
 * Audit Types
 * 
 * Types for audit logging and security events
 */

import type { Json } from '@/integrations/supabase/types';

/**
 * Audit log categories
 */
export type AuditCategory = 'kiosk' | 'user' | 'system' | 'security' | 'playback' | 'settings';

/**
 * Audit log severity levels
 */
export type AuditSeverity = 'info' | 'warning' | 'critical';

/**
 * Audit log status
 */
export type AuditStatus = 'success' | 'failure' | 'pending';

/**
 * Audit log actions
 */
export type AuditAction =
  // Kiosk actions
  | 'command_sent'
  | 'command_executed'
  | 'command_failed'
  | 'kiosk_offline'
  | 'kiosk_recovered'
  // User actions
  | 'role_changed'
  | 'user_created'
  | 'user_deleted'
  | 'permissions_changed'
  // System actions
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'settings_changed'
  // Security actions
  | 'password_reset'
  | 'session_revoked'
  | 'suspicious_activity'
  | 'access_denied'
  // Playback actions
  | 'track_played'
  | 'track_skipped'
  | 'queue_modified'
  // Settings actions
  | 'config_updated'
  | 'integration_connected'
  | 'integration_disconnected';

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  action: AuditAction | string;
  category: AuditCategory;
  severity: AuditSeverity;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  details: Json | null;
  metadata: Json | null;
  status: AuditStatus;
  errorMessage: string | null;
  createdAt: string | null;
}

/**
 * Audit log filter options
 */
export interface AuditLogFilters {
  category?: AuditCategory;
  severity?: AuditSeverity;
  action?: AuditAction | string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Audit log input for creating new entries
 */
export interface AuditLogInput {
  action: AuditAction | string;
  category: AuditCategory;
  severity?: AuditSeverity;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: Json;
  status?: AuditStatus;
  errorMessage?: string;
}

/**
 * Audit log statistics
 */
export interface AuditStats {
  totalLogs: number;
  byCategory: Record<AuditCategory, number>;
  bySeverity: Record<AuditSeverity, number>;
  byStatus: Record<AuditStatus, number>;
  recentActivity: AuditLog[];
}

/**
 * Type guard for AuditLog
 */
export function isAuditLog(value: unknown): value is AuditLog {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'timestamp' in value &&
    'action' in value &&
    'category' in value
  );
}
