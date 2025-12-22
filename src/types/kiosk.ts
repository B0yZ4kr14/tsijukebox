/**
 * Kiosk Types
 * 
 * Types for kiosk management and monitoring
 */

import type { Json } from '@/integrations/supabase/types';

/**
 * Kiosk connection status
 */
export type KioskStatus = 'online' | 'offline' | 'degraded' | 'maintenance';

/**
 * Kiosk command types
 */
export type KioskCommandType = 
  | 'restart'
  | 'shutdown'
  | 'update'
  | 'refresh'
  | 'screenshot'
  | 'volume'
  | 'brightness'
  | 'custom';

/**
 * Kiosk command status
 */
export type KioskCommandStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'timeout';

/**
 * Kiosk connection record
 */
export interface KioskConnection {
  id: string;
  hostname: string;
  machineId: string | null;
  ipAddress: string | null;
  status: KioskStatus;
  lastHeartbeat: string | null;
  uptimeSeconds: number | null;
  cpuUsagePercent: number | null;
  memoryUsedMb: number | null;
  crashCount: number | null;
  lastEvent: string | null;
  lastEventAt: string | null;
  lastScreenshotUrl: string | null;
  config: Json | null;
  metrics: Json | null;
  events: Json | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Kiosk command record
 */
export interface KioskCommand {
  id: string;
  machineId: string;
  command: KioskCommandType | string;
  params: Json | null;
  status: KioskCommandStatus;
  result: string | null;
  createdBy: string | null;
  createdAt: string | null;
  executedAt: string | null;
}

/**
 * Kiosk metrics snapshot
 */
export interface KioskMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  temperature: number | null;
  uptime: number;
  networkLatency: number | null;
  timestamp: string;
}

/**
 * Kiosk event log entry
 */
export interface KioskEvent {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  metadata?: Json;
}

/**
 * Kiosk configuration
 */
export interface KioskConfig {
  displayName: string;
  volume: number;
  brightness: number;
  autoRestart: boolean;
  restartSchedule: string | null;
  allowedApps: string[];
  blockedUrls: string[];
  idleTimeout: number;
  screensaverEnabled: boolean;
}

/**
 * Type guard for KioskConnection
 */
export function isKioskConnection(value: unknown): value is KioskConnection {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'hostname' in value &&
    'status' in value
  );
}

/**
 * Type guard for KioskCommand
 */
export function isKioskCommand(value: unknown): value is KioskCommand {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'machineId' in value &&
    'command' in value
  );
}
