# Kiosk Webhook Edge Function

## Overview
The `kiosk-webhook` edge function manages kiosk device monitoring, health checks, and remote command execution.

## Endpoints

### POST - Register Kiosk Event
`POST /functions/v1/kiosk-webhook`

### GET - Get All Kiosks Status
`GET /functions/v1/kiosk-webhook/status`

### GET - Get Aggregated Metrics
`GET /functions/v1/kiosk-webhook`

### GET - Get Pending Commands
`GET /functions/v1/kiosk-webhook/commands?machine_id={id}`

### POST - Mark Command Complete
`POST /functions/v1/kiosk-webhook/commands/{id}/complete`

## Event Types

| Event | Description | Status Change |
|-------|-------------|---------------|
| `heartbeat` | Regular health check | → `online` |
| `boot_complete` | Kiosk finished booting | → `online` |
| `watchdog_started` | Monitoring service started | → `online` |
| `chromium_restart` | Browser restarted | → `online` (crash++) |
| `container_restart` | Docker container restarted | → `online` (crash++) |
| `health_check_failed` | Health check failure | → `error` |
| `recovery_started` | Auto-recovery initiated | → `recovering` |
| `error` | General error | → `error` |
| `screenshot` | Screenshot captured | No change |
| `command_result` | Command execution result | No change |
| `container_updated` | Container updated | → `online` |

## Kiosk Event Schema

```typescript
interface KioskEvent {
  event: string;
  hostname: string;
  machine_id: string;
  ip_address?: string;
  timestamp: string;
  metrics?: {
    chromium_pid?: number;
    container_running?: number;
    uptime_seconds?: number;
    memory_used_mb?: number;
    cpu_usage_percent?: number;
  };
  error_message?: string;
  install_id?: string;
  command_id?: string;
  result?: string;
  screenshot_data?: string; // Base64 PNG
}
```

## Database Schema

Table: `kiosk_connections`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `hostname` | text | Kiosk hostname |
| `machine_id` | text | Unique machine ID |
| `ip_address` | text | IP address |
| `status` | text | online/offline/error/recovering |
| `last_heartbeat` | timestamp | Last heartbeat time |
| `last_event` | text | Last event type |
| `last_event_at` | timestamp | Last event time |
| `install_id` | text | Install session ID |
| `events` | jsonb | Event history (last 100) |
| `metrics` | jsonb | Current metrics |
| `uptime_seconds` | integer | Uptime in seconds |
| `crash_count` | integer | Total crashes |
| `cpu_usage_percent` | float | CPU usage |
| `memory_used_mb` | integer | Memory usage |
| `last_screenshot_url` | text | Screenshot URL |

## Example: Register Event

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/kiosk-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "heartbeat",
    "hostname": "kiosk-001",
    "machine_id": "550e8400-e29b-41d4-a716-446655440000",
    "ip_address": "192.168.1.100",
    "timestamp": "2024-01-04T10:00:00Z",
    "metrics": {
      "chromium_pid": 1234,
      "container_running": 1,
      "uptime_seconds": 86400,
      "memory_used_mb": 512,
      "cpu_usage_percent": 25.5
    }
  }'
```

## Example Response: Register Event

```json
{
  "success": true,
  "kiosk": {
    "id": "uuid",
    "hostname": "kiosk-001",
    "machine_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "online"
  },
  "message": "Event heartbeat processed for kiosk-001"
}
```

## Example: Get All Kiosks

```bash
curl https://[project-id].supabase.co/functions/v1/kiosk-webhook/status
```

## Example Response: All Kiosks

```json
{
  "success": true,
  "kiosks": [
    {
      "id": "uuid",
      "hostname": "kiosk-001",
      "machine_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "online",
      "last_heartbeat": "2024-01-04T10:00:00Z",
      "uptime_seconds": 86400,
      "crash_count": 2,
      "cpu_usage_percent": 25.5,
      "memory_used_mb": 512
    }
  ],
  "timestamp": "2024-01-04T10:01:00Z"
}
```

## Example: Get Aggregated Metrics

```bash
curl https://[project-id].supabase.co/functions/v1/kiosk-webhook
```

## Example Response: Metrics

```json
{
  "success": true,
  "metrics": {
    "total": 10,
    "online": 8,
    "offline": 1,
    "error": 1,
    "total_uptime_hours": 720,
    "total_crashes": 15
  },
  "timestamp": "2024-01-04T10:00:00Z"
}
```

## Remote Command Execution

### Get Pending Commands
```bash
curl "https://[project-id].supabase.co/functions/v1/kiosk-webhook/commands?machine_id=550e8400-e29b-41d4-a716-446655440000"
```

### Response
```json
{
  "success": true,
  "command": {
    "id": "cmd-uuid",
    "machine_id": "550e8400-e29b-41d4-a716-446655440000",
    "command": "screenshot",
    "params": {},
    "status": "executing",
    "created_at": "2024-01-04T10:00:00Z"
  }
}
```

### Mark Command Complete
```bash
curl -X POST https://[project-id].supabase.co/functions/v1/kiosk-webhook/commands/cmd-uuid/complete \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "result": "Screenshot captured successfully"
  }'
```

## Screenshot Handling

Screenshots are:
1. Received as Base64-encoded PNG data
2. Uploaded to Supabase Storage (`screenshots` bucket)
3. Public URL stored in `last_screenshot_url`
4. Accessible via standard Supabase Storage URLs

## Offline Detection

Kiosks are marked offline if:
- Last heartbeat > 2 minutes ago
- Status changes from `online` → `offline`

## Audit Logging

All significant events are logged to `audit_logs` table:
- Kiosk registration
- Status changes
- Errors and recovery
- Command execution
- Screenshot capture

## Features
- ✅ Real-time kiosk monitoring
- ✅ Health check tracking
- ✅ Remote command execution
- ✅ Screenshot capture and storage
- ✅ Event history (last 100 events)
- ✅ Crash tracking
- ✅ Resource usage monitoring
- ✅ Automatic offline detection
- ✅ Comprehensive audit logging
- ✅ CORS enabled

## Use Cases
- Kiosk fleet management
- Remote monitoring dashboard
- Health check automation
- Remote troubleshooting
- Performance analytics
- Crash analysis
