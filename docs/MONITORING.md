# TSiJUKEBOX Monitoring System

## Health Dashboard

Real-time monitoring of system health including:
- WebSocket connection status
- API response times
- Error rates
- Memory usage

## Metrics Tracked

- Installer metrics (success/failure rates)
- Playback statistics
- GitHub sync status
- Database health

## Alerts

Automatic alerts via:
- Toast notifications
- Supabase notifications table
- Console logging

## OpenTelemetry

Supports OTEL export for advanced observability.


---

## 📊 Dashboards Disponíveis

### Grafana Dashboard

O TSiJUKEBOX inclui dashboards Grafana pré-configurados para monitoramento visual completo do sistema. O dashboard principal exibe métricas de sistema (CPU, RAM, Disco, Rede), métricas de aplicação (Requests/s, Response Time, Errors), métricas de banco de dados (Queries, Connections, Cache Hit Rate) e métricas do player (Músicas reproduzidas, Usuários ativos, Fila de reprodução).

**Acesso:** http://localhost:3000 (Login: admin/admin)

### Prometheus Metrics

O sistema expõe métricas em formato Prometheus no endpoint `/metrics`:

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `tsijukebox_requests_total` | Counter | Total de requisições HTTP |
| `tsijukebox_response_time` | Histogram | Tempo de resposta das requisições |
| `tsijukebox_active_users` | Gauge | Número de usuários ativos |
| `tsijukebox_songs_played` | Counter | Total de músicas reproduzidas |
| `tsijukebox_errors_total` | Counter | Total de erros da aplicação |
| `tsijukebox_db_connections` | Gauge | Conexões ativas no banco |

### Alertas Configurados

O sistema possui alertas automáticos para situações críticas:

- **CPU > 80%** por 5 minutos consecutivos
- **RAM > 90%** por 5 minutos consecutivos
- **Disco > 85%** de uso
- **Application down** por 1 minuto
- **Database connection errors** > 10 erros/minuto
- **API response time** > 2 segundos (p95)

---

## 🔧 Configuração

### Prometheus

Configure o Prometheus para coletar métricas do TSiJUKEBOX:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'tsijukebox'
    static_configs:
      - targets: ['localhost:5173']
    metrics_path: '/metrics'
```

### Grafana

Para configurar o Grafana:

1. Acesse http://localhost:3000
2. Login com credenciais padrão (admin/admin)
3. Adicione Prometheus como data source
4. Importe dashboard: `monitoring/grafana-dashboard.json`
5. Configure alertas e notificações

---

## 📈 Métricas Personalizadas

Adicione métricas customizadas ao seu código:

```typescript
import { metrics } from './lib/monitoring';

// Incrementar contador
metrics.increment('custom_event_count');

// Registrar tempo de operação
const start = Date.now();
await performOperation();
metrics.timing('operation_duration', Date.now() - start);

// Definir gauge (valor atual)
metrics.gauge('queue_size', queue.length);

// Histograma
metrics.histogram('request_size', requestBody.length);
```

---

## 🔍 Logs e Debugging

### Níveis de Log

O sistema utiliza os seguintes níveis de log:

- **ERROR:** Erros críticos que impedem funcionamento
- **WARN:** Avisos que não impedem funcionamento
- **INFO:** Informações gerais de operação
- **DEBUG:** Informações detalhadas para debugging

### Visualizar Logs

```bash
# Logs em tempo real
journalctl -u tsijukebox -f

# Logs com filtro de nível
journalctl -u tsijukebox -p err

# Logs de período específico
journalctl -u tsijukebox --since "1 hour ago"
```

---

**Desenvolvido por [B0.y_Z4kr14](https://github.com/B0yZ4kr14)** • *TSI Telecom*
