# 📊 TSiJUKEBOX - Sistema de Monitoramento

<p align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="120">
</p>

<p align="center">
  <strong>Monitoramento em Tempo Real do Sistema</strong>
  <br>
  Versão 4.1.0 | Dezembro 2024
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebSocket-Real--Time-green?style=flat-square" alt="WebSocket">
  <img src="https://img.shields.io/badge/Alertas-Telegram%20|%20Email%20|%20Discord-blue?style=flat-square" alt="Alertas">
  <img src="https://img.shields.io/badge/Nagios-Compatible-red?style=flat-square" alt="Nagios">
</p>

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [HealthCheck CLI](#-healthcheck-cli)
- [Timer Systemd](#-timer-systemd)
- [Health Dashboard](#-health-dashboard)
- [Sistema de Alertas](#-sistema-de-alertas)
- [Edge Function](#-edge-function)
- [Integração com Ferramentas](#-integração-com-ferramentas)

---

## 🎯 Visão Geral

O TSiJUKEBOX oferece um sistema completo de monitoramento com múltiplas camadas:

| Camada | Ferramenta | Descrição |
|--------|------------|-----------|
| **CLI** | HealthCheck | Verificação rápida para scripts |
| **Timer** | Systemd | Monitoramento automático |
| **Web** | Dashboard | Interface visual em tempo real |
| **API** | WebSocket | Streaming de métricas |
| **Alertas** | Multi-channel | Telegram, Email, Discord |

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Health Dashboard                      │
│                    (React + WebSocket)                   │
├─────────────────────────────────────────────────────────┤
│                health-monitor-ws (Edge Function)         │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Services │   CPU    │  Memory  │   Disk   │   Alerts    │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
        │                                        │
        ▼                                        ▼
┌──────────────────┐                 ┌──────────────────┐
│  HealthCheck CLI │                 │  Alert Channels  │
│  (systemd timer) │                 │ Telegram/Email   │
└──────────────────┘                 └──────────────────┘
```

---

## 🔍 HealthCheck CLI

### Verificação Rápida

O comando `--health-check` executa uma verificação rápida do sistema e retorna códigos de saída compatíveis com sistemas de monitoramento.

```bash
# Verificação básica
python3 install.py --health-check

# Com alertas em caso de falha
python3 install.py --health-check --alert-on-failure

# Especificar canais de alerta
python3 install.py --health-check --alert-on-failure --alert-channels telegram,email
```

### Códigos de Saída

| Código | Status | Descrição |
|--------|--------|-----------|
| `0` | ✅ OK | Todos os serviços operacionais |
| `1` | ⚠️ WARNING | Alguns serviços degradados |
| `2` | 🔴 CRITICAL | Serviços críticos falhando |
| `3` | ❓ UNKNOWN | Não foi possível verificar |

### Exemplo de Saída

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🏥 TSiJUKEBOX Health Check v4.1.0                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 System Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CPU Usage:     23% ██████░░░░░░░░░░░░░░
  Memory Usage:  58% ████████████░░░░░░░░
  Disk Usage:    45% █████████░░░░░░░░░░░
  Temperature:   52°C

🔧 Services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ tsijukebox.service    active (running)
  ✅ grafana-server        active (running)
  ✅ prometheus            active (running)
  ✅ spotify               active (running)

📡 Connectivity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Internet:   Connected (45ms latency)
  ✅ Spotify:    Authenticated
  ✅ Database:   SQLite connected

╔══════════════════════════════════════════════════════════════════════════════╗
║  ✅ OVERALL STATUS: OK (Exit Code: 0)                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Uso em Scripts

```bash
#!/bin/bash
# Exemplo de integração com cron

python3 /opt/tsijukebox/install.py --health-check --silent
exit_code=$?

case $exit_code in
  0) echo "OK" ;;
  1) echo "WARNING" ;;
  2) echo "CRITICAL" ;;
  *) echo "UNKNOWN" ;;
esac

exit $exit_code
```

---

## ⏱️ Timer Systemd

### Instalação do Timer

O timer systemd executa verificações periódicas automaticamente.

```bash
# Instalar timer com configurações padrão (5 minutos)
sudo python3 install.py --install-timer

# Instalar com canais de alerta
sudo python3 install.py --install-timer --alert-channels telegram,email

# Personalizar intervalo
sudo python3 install.py --install-timer --timer-interval 10m
```

### Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `/etc/systemd/system/tsijukebox-health.service` | Serviço de verificação |
| `/etc/systemd/system/tsijukebox-health.timer` | Timer que dispara o serviço |
| `/etc/tsijukebox/alert-config.json` | Configuração de alertas |

### Gerenciamento

```bash
# Status do timer
systemctl status tsijukebox-health.timer

# Listar próximas execuções
systemctl list-timers tsijukebox-health.timer

# Ver logs
journalctl -u tsijukebox-health.service -f

# Desabilitar timer
sudo systemctl disable --now tsijukebox-health.timer

# Remover timer
sudo python3 install.py --remove-timer
```

### Arquivo do Timer

```ini
# /etc/systemd/system/tsijukebox-health.timer
[Unit]
Description=TSiJUKEBOX Health Check Timer
Documentation=https://github.com/B0yZ4kr14/TSiJUKEBOX

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
AccuracySec=1min
Persistent=true

[Install]
WantedBy=timers.target
```

---

## 🖥️ Health Dashboard

### Acessando o Dashboard

O Health Dashboard está disponível em `/health` na interface web:

```
http://localhost:5173/health
```

### Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Service Cards** | Status visual de cada serviço |
| **Metric Gauges** | Gauges circulares para CPU/RAM/Disco |
| **History Chart** | Gráfico de área com histórico |
| **Alerts Timeline** | Timeline de alertas recentes |
| **Connection Status** | Indicador de conexão WebSocket |

### Componentes React

```tsx
// Exemplo de uso do hook
import { useHealthMonitorWebSocket } from '@/hooks/system/useHealthMonitorWebSocket';

function HealthWidget() {
  const { data, isConnected, error, reconnect } = useHealthMonitorWebSocket();
  
  if (!isConnected) {
    return <ReconnectButton onClick={reconnect} />;
  }
  
  return (
    <div>
      <MetricGauge label="CPU" value={data?.metrics.cpuPercent} />
      <MetricGauge label="RAM" value={data?.metrics.memoryPercent} />
      <ServiceList services={data?.services} />
    </div>
  );
}
```

### Permissões

O acesso ao Health Dashboard requer permissão `canAccessSettings`:

```tsx
// Em App.tsx
<PermissionGuard requiredPermission="canAccessSettings">
  <Route path="/health" element={<HealthDashboard />} />
</PermissionGuard>
```

---

## 🔔 Sistema de Alertas

### Canais Suportados

| Canal | Configuração | Descrição |
|-------|--------------|-----------|
| **Telegram** | Bot Token + Chat ID | Mensagens instantâneas |
| **Email** | SMTP Config | Emails de alerta |
| **Discord** | Webhook URL | Mensagens em canal |
| **Database** | Automático | Registro em `notifications` |

### Configuração

```json
// /etc/tsijukebox/alert-config.json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "bot_token": "123456:ABC-DEF...",
      "chat_id": "-1001234567890"
    },
    "email": {
      "enabled": true,
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "username": "alerts@example.com",
      "password": "app-password",
      "recipients": ["admin@example.com"]
    },
    "discord": {
      "enabled": true,
      "webhook_url": "https://discord.com/api/webhooks/..."
    }
  },
  "thresholds": {
    "cpu_warning": 70,
    "cpu_critical": 90,
    "memory_warning": 80,
    "memory_critical": 95,
    "disk_warning": 80,
    "disk_critical": 95,
    "temp_warning": 70,
    "temp_critical": 85
  },
  "cooldown_minutes": 15
}
```

### Exemplo de Alerta Telegram

```
🔴 CRITICAL ALERT

📊 TSiJUKEBOX Health Check
━━━━━━━━━━━━━━━━━━━━━━━━
🖥️ Host: jukebox-server
⏰ Time: 2024-12-22 14:30:00

⚠️ Issues Found:
  • CPU usage at 92% (threshold: 90%)
  • Service grafana-server is inactive

📈 Metrics:
  CPU: 92% | RAM: 58% | Disk: 45%

🔗 Dashboard: http://192.168.1.100:5173/health
```

---

## ⚡ Edge Function

### health-monitor-ws

Edge function WebSocket para streaming de métricas em tempo real.

**URL:** `wss://<project-id>.supabase.co/functions/v1/health-monitor-ws`

**Payload (a cada 30s):**

```json
{
  "timestamp": "2024-12-22T14:30:00.000Z",
  "services": {
    "tsijukebox": "active",
    "grafana": "active",
    "prometheus": "active",
    "spotify": "active"
  },
  "metrics": {
    "cpuPercent": 23,
    "memoryPercent": 58,
    "diskFreeGb": 45.2,
    "diskTotalGb": 100
  },
  "alerts": [
    {
      "id": "alert-1",
      "severity": "warning",
      "message": "Memory usage above 80%",
      "timestamp": "2024-12-22T14:25:00.000Z"
    }
  ]
}
```

### Hook React

```typescript
import { useHealthMonitorWebSocket } from '@/hooks/system/useHealthMonitorWebSocket';

interface HealthMetrics {
  timestamp: string;
  services: Record<string, 'active' | 'inactive' | 'failed'>;
  metrics: {
    cpuPercent: number;
    memoryPercent: number;
    diskFreeGb: number;
    diskTotalGb: number;
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

// Uso
const { data, isConnected, error, reconnect } = useHealthMonitorWebSocket();
```

---

## 🔗 Integração com Ferramentas

### Nagios/Icinga

```bash
# /usr/lib/nagios/plugins/check_tsijukebox
#!/bin/bash
python3 /opt/tsijukebox/install.py --health-check --silent
exit $?
```

```ini
# /etc/nagios/conf.d/tsijukebox.cfg
define command {
    command_name    check_tsijukebox
    command_line    /usr/lib/nagios/plugins/check_tsijukebox
}

define service {
    use                     generic-service
    host_name               jukebox-server
    service_description     TSiJUKEBOX Health
    check_command           check_tsijukebox
    check_interval          5
}
```

### Prometheus

O TSiJUKEBOX expõe métricas no formato Prometheus em `/metrics`:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'tsijukebox'
    static_configs:
      - targets: ['localhost:5173']
    metrics_path: '/api/metrics'
```

### Grafana

Dashboard pré-configurado disponível em:

```
http://localhost:3000/d/tsijukebox-health
```

**Painéis incluídos:**
- CPU, RAM, Disk over time
- Service uptime
- Alert history
- Response times
- Active users

---

## 📚 Recursos Adicionais

- [API Reference](API-REFERENCE.md) - Referência de APIs
- [Plugins](PLUGINS.md) - Sistema de plugins
- [Troubleshooting](TROUBLESHOOTING.md) - Resolução de problemas

---

<p align="center">
  <strong>TSiJUKEBOX Monitoring</strong> — <em>Sempre em observação</em> 📊
</p>
