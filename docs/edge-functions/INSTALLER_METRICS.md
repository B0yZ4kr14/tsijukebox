# Installer Metrics Edge Function

## Overview
The `installer-metrics` edge function collects, stores, and aggregates installation analytics from the TSiJUKEBOX installer scripts.

## Endpoints

### POST - Submit Metrics
`POST /functions/v1/installer-metrics`

### GET - Get Aggregated Metrics
`GET /functions/v1/installer-metrics?period={period}`

### GET - Prometheus Metrics
`GET /functions/v1/installer-metrics/prometheus`

## Metric Payload Schema

```typescript
interface MetricPayload {
  session_id: string;                    // Unique install session
  status: 'running' | 'success' | 'failed' | 'cancelled';
  distro_family?: string;                // 'arch', 'cachyos', 'manjaro', etc.
  distro_name?: string;                  // Full distro name
  install_mode?: 'full' | 'minimal' | 'custom' | 'update';
  database_type?: 'sqlite' | 'mariadb' | 'postgresql' | 'firebird';
  steps?: Array<{
    name: string;
    duration_ms: number;
    status: string;
  }>;
  errors?: Array<{
    code: string;
    message: string;
    step?: string;
  }>;
  installer_version?: string;
  system_info?: Record<string, unknown>;
  total_duration_ms?: number;
}
```

## Period Parameters

| Period | Description | Time Range |
|--------|-------------|------------|
| `today` | Today only | 00:00 → now |
| `week` | Last 7 days | -7 days → now |
| `month` | Last 30 days | -30 days → now |
| `all` | All time | All records |

## Aggregated Metrics Response

```typescript
interface AggregatedMetrics {
  totalInstalls: number;
  successRate: number;
  failureRate: number;
  avgTimeMinutes: number;
  todayInstalls: number;
  weeklyGrowth: number;
  installsByDay: Array<{
    day: string;
    installs: number;
    success: number;
    failed: number;
  }>;
  installTimeHistory: Array<{
    week: string;
    avgTime: number;
  }>;
  distroData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  databaseData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  errorTypes: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}
```

## Example: Submit Metric (New Install)

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/installer-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "running",
    "distro_family": "arch",
    "distro_name": "Arch Linux",
    "install_mode": "full",
    "database_type": "sqlite",
    "installer_version": "8.0.0",
    "system_info": {
      "kernel": "6.7.0",
      "arch": "x86_64"
    }
  }'
```

## Example Response: Submit Metric

```json
{
  "success": true,
  "action": "created",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Example: Update Metric (Completion)

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/installer-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "success",
    "total_duration_ms": 180000,
    "steps": [
      { "name": "check_dependencies", "duration_ms": 5000, "status": "success" },
      { "name": "install_packages", "duration_ms": 120000, "status": "success" },
      { "name": "configure_database", "duration_ms": 30000, "status": "success" },
      { "name": "setup_service", "duration_ms": 25000, "status": "success" }
    ],
    "errors": []
  }'
```

## Example Response: Update Metric

```json
{
  "success": true,
  "action": "updated",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Example: Get Aggregated Metrics

```bash
curl "https://[project-id].supabase.co/functions/v1/installer-metrics?period=week"
```

## Example Response: Aggregated Metrics

```json
{
  "totalInstalls": 127,
  "successRate": 94.5,
  "failureRate": 5.5,
  "avgTimeMinutes": 3.2,
  "todayInstalls": 18,
  "weeklyGrowth": 12.5,
  "installsByDay": [
    { "day": "Dom", "installs": 12, "success": 11, "failed": 1 },
    { "day": "Seg", "installs": 22, "success": 21, "failed": 1 },
    { "day": "Ter", "installs": 19, "success": 18, "failed": 1 }
  ],
  "installTimeHistory": [
    { "week": "Sem 1", "avgTime": 3.5 },
    { "week": "Sem 2", "avgTime": 3.2 },
    { "week": "Sem 3", "avgTime": 3.1 },
    { "week": "Sem 4", "avgTime": 3.2 }
  ],
  "distroData": [
    { "name": "Arch", "value": 45, "color": "hsl(195, 100%, 50%)" },
    { "name": "Cachyos", "value": 30, "color": "hsl(45, 100%, 50%)" },
    { "name": "Manjaro", "value": 15, "color": "hsl(280, 100%, 60%)" }
  ],
  "databaseData": [
    { "name": "Sqlite", "value": 65, "color": "hsl(195, 80%, 45%)" },
    { "name": "Mariadb", "value": 25, "color": "hsl(160, 80%, 45%)" },
    { "name": "Postgresql", "value": 10, "color": "hsl(220, 80%, 55%)" }
  ],
  "errorTypes": [
    { "name": "Network_timeout", "count": 3, "percentage": 50 },
    { "name": "Package_conflict", "count": 2, "percentage": 33 },
    { "name": "Permission_denied", "count": 1, "percentage": 17 }
  ]
}
```

## Prometheus Metrics Endpoint

Exposes metrics in Prometheus format for monitoring systems.

### Example Request

```bash
curl https://[project-id].supabase.co/functions/v1/installer-metrics/prometheus
```

### Example Response

```prometheus
# HELP tsijukebox_installs_total Total number of installations
# TYPE tsijukebox_installs_total counter
tsijukebox_installs_total{status="success"} 120
tsijukebox_installs_total{status="failed"} 7
tsijukebox_installs_total{status="running"} 0

# HELP tsijukebox_install_duration_seconds Average installation duration in seconds
# TYPE tsijukebox_install_duration_seconds gauge
tsijukebox_install_duration_seconds 192.50

# HELP tsijukebox_failure_rate Percentage of failed installations
# TYPE tsijukebox_failure_rate gauge
tsijukebox_failure_rate 5.51

# HELP tsijukebox_installs_by_distro Installations by distribution
# TYPE tsijukebox_installs_by_distro gauge
tsijukebox_installs_by_distro{distro="arch"} 57
tsijukebox_installs_by_distro{distro="cachyos"} 38
tsijukebox_installs_by_distro{distro="manjaro"} 19
```

## Database Schema

Table: `installer_metrics`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `session_id` | text | Unique install session |
| `status` | text | Install status |
| `distro_family` | text | Distro family |
| `distro_name` | text | Full distro name |
| `install_mode` | text | Install mode |
| `database_type` | text | Database type |
| `steps` | jsonb | Installation steps |
| `errors` | jsonb | Errors encountered |
| `installer_version` | text | Installer version |
| `system_info` | jsonb | System information |
| `total_duration_ms` | integer | Total duration |
| `started_at` | timestamp | Start time |
| `completed_at` | timestamp | Completion time |

## Calculated Metrics

### Success Rate
```
(successful_installs / total_installs) * 100
```

### Weekly Growth
```
((this_week_installs - last_week_installs) / last_week_installs) * 100
```

### Average Time
```
sum(total_duration_ms) / count(completed_installs) / 60000
```

## Distro Color Mapping

| Distro | HSL Color |
|--------|-----------|
| Arch | `hsl(195, 100%, 50%)` |
| CachyOS | `hsl(45, 100%, 50%)` |
| Manjaro | `hsl(280, 100%, 60%)` |
| EndeavourOS | `hsl(340, 100%, 50%)` |
| Garuda | `hsl(160, 100%, 50%)` |

## Database Color Mapping

| Database | HSL Color |
|----------|-----------|
| SQLite | `hsl(195, 80%, 45%)` |
| MariaDB | `hsl(160, 80%, 45%)` |
| PostgreSQL | `hsl(220, 80%, 55%)` |
| Firebird | `hsl(30, 80%, 50%)` |

## Features
- ✅ Session-based tracking
- ✅ Real-time metrics collection
- ✅ Aggregated analytics
- ✅ Time-series analysis
- ✅ Distribution breakdown
- ✅ Error tracking
- ✅ Prometheus integration
- ✅ Growth metrics
- ✅ Performance analytics
- ✅ CORS enabled with origin validation

## Use Cases
- Installation analytics dashboard
- Success rate monitoring
- Performance optimization
- Error analysis
- Distribution popularity tracking
- Installer version comparison
- Grafana/Prometheus monitoring
