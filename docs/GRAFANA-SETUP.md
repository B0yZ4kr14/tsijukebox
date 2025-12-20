# Configuração do Grafana para Métricas do Instalador TSiJUKEBOX

Este guia explica como configurar o Grafana para visualizar as métricas de instalação do TSiJUKEBOX coletadas pelo módulo `analytics.py`.

## Pré-requisitos

- Grafana 9.0+ instalado
- Acesso ao banco de dados Supabase (PostgreSQL)
- Credenciais de conexão do Supabase

## 1. Instalando o Grafana

### CachyOS / Arch Linux

```bash
# Instalar Grafana
sudo pacman -S grafana

# Habilitar e iniciar o serviço
sudo systemctl enable --now grafana

# Acessar via navegador
# http://localhost:3000
# Login padrão: admin / admin
```

### Docker

```bash
docker run -d \
  --name=grafana \
  -p 3000:3000 \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana-oss:latest
```

## 2. Configurando o Datasource PostgreSQL

### Obter Credenciais do Supabase

1. Acesse o painel do Supabase: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
2. Vá em **Settings** → **Database**
3. Copie as credenciais de conexão:
   - **Host**: `db.YOUR_PROJECT_ID.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (sua senha do banco)

### Adicionar Datasource no Grafana

1. No Grafana, vá em **Configuration** → **Data Sources**
2. Clique em **Add data source**
3. Selecione **PostgreSQL**
4. Preencha os campos:

```yaml
Name: TSiJUKEBOX Supabase
Host: db.YOUR_PROJECT_ID.supabase.co:5432
Database: postgres
User: postgres
Password: [sua senha]
TLS/SSL Mode: require
Version: 15
```

5. Clique em **Save & Test**

## 3. Importando o Dashboard

### Dashboard JSON Model

Crie um novo dashboard importando o seguinte JSON:

```json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null }
            ]
          }
        }
      },
      "gridPos": { "h": 4, "w": 6, "x": 0, "y": 0 },
      "id": 1,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "10.0.0",
      "targets": [
        {
          "datasource": { "type": "postgres", "uid": "${DS_TSIJUKEBOX}" },
          "format": "table",
          "rawQuery": true,
          "rawSql": "SELECT COUNT(*) as total FROM installer_metrics",
          "refId": "A"
        }
      ],
      "title": "Total de Instalações",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "max": 100,
          "min": 0,
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "red", "value": null },
              { "color": "yellow", "value": 80 },
              { "color": "green", "value": 95 }
            ]
          },
          "unit": "percent"
        }
      },
      "gridPos": { "h": 4, "w": 6, "x": 6, "y": 0 },
      "id": 2,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        }
      },
      "targets": [
        {
          "rawSql": "SELECT (COUNT(*) FILTER (WHERE status = 'success')::float / NULLIF(COUNT(*), 0) * 100) as success_rate FROM installer_metrics",
          "refId": "A"
        }
      ],
      "title": "Taxa de Sucesso",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "unit": "m"
        }
      },
      "gridPos": { "h": 4, "w": 6, "x": 12, "y": 0 },
      "id": 3,
      "targets": [
        {
          "rawSql": "SELECT AVG(total_duration_ms) / 60000 as avg_time FROM installer_metrics WHERE status = 'success'",
          "refId": "A"
        }
      ],
      "title": "Tempo Médio (min)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" }
        }
      },
      "gridPos": { "h": 4, "w": 6, "x": 18, "y": 0 },
      "id": 4,
      "targets": [
        {
          "rawSql": "SELECT COUNT(*) as today FROM installer_metrics WHERE started_at >= CURRENT_DATE",
          "refId": "A"
        }
      ],
      "title": "Instalações Hoje",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 50,
            "gradientMode": "none",
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "normal" }
          }
        }
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
      "id": 5,
      "targets": [
        {
          "rawSql": "SELECT date_trunc('day', started_at) as time, COUNT(*) FILTER (WHERE status = 'success') as success, COUNT(*) FILTER (WHERE status = 'failed') as failed FROM installer_metrics WHERE started_at >= NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY 1",
          "refId": "A",
          "format": "time_series"
        }
      ],
      "title": "Instalações por Dia",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" }
        }
      },
      "gridPos": { "h": 8, "w": 6, "x": 12, "y": 4 },
      "id": 6,
      "options": {
        "legend": { "displayMode": "list", "placement": "right" },
        "pieType": "donut",
        "reduceOptions": { "calcs": ["lastNotNull"] }
      },
      "targets": [
        {
          "rawSql": "SELECT distro_family, COUNT(*) as count FROM installer_metrics WHERE distro_family IS NOT NULL GROUP BY distro_family ORDER BY count DESC",
          "refId": "A"
        }
      ],
      "title": "Por Distribuição",
      "type": "piechart"
    },
    {
      "datasource": {
        "type": "postgres",
        "uid": "${DS_TSIJUKEBOX}"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" }
        }
      },
      "gridPos": { "h": 8, "w": 6, "x": 18, "y": 4 },
      "id": 7,
      "options": {
        "legend": { "displayMode": "list", "placement": "right" },
        "pieType": "donut"
      },
      "targets": [
        {
          "rawSql": "SELECT database_type, COUNT(*) as count FROM installer_metrics WHERE database_type IS NOT NULL GROUP BY database_type ORDER BY count DESC",
          "refId": "A"
        }
      ],
      "title": "Por Banco de Dados",
      "type": "piechart"
    }
  ],
  "refresh": "5m",
  "schemaVersion": 38,
  "style": "dark",
  "tags": ["tsijukebox", "installer", "metrics"],
  "templating": { "list": [] },
  "time": { "from": "now-7d", "to": "now" },
  "timepicker": {},
  "timezone": "",
  "title": "TSiJUKEBOX Installer Metrics",
  "uid": "tsijukebox-installer",
  "version": 1,
  "weekStart": ""
}
```

### Importando o Dashboard

1. No Grafana, vá em **Dashboards** → **Import**
2. Cole o JSON acima ou faça upload do arquivo
3. Selecione o datasource PostgreSQL configurado
4. Clique em **Import**

## 4. Queries SQL Úteis

### Total de Instalações por Status

```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER() * 100, 2) as percentage
FROM installer_metrics
GROUP BY status
ORDER BY count DESC;
```

### Tempo Médio por Distribuição

```sql
SELECT 
  distro_family,
  COUNT(*) as installs,
  ROUND(AVG(total_duration_ms)::numeric / 60000, 2) as avg_time_minutes
FROM installer_metrics
WHERE status = 'success' AND total_duration_ms IS NOT NULL
GROUP BY distro_family
ORDER BY installs DESC;
```

### Erros Mais Comuns

```sql
SELECT 
  error_item->>'code' as error_code,
  error_item->>'message' as error_message,
  COUNT(*) as count
FROM installer_metrics,
LATERAL jsonb_array_elements(errors) as error_item
GROUP BY error_code, error_message
ORDER BY count DESC
LIMIT 10;
```

### Instalações por Hora do Dia

```sql
SELECT 
  EXTRACT(HOUR FROM started_at) as hour,
  COUNT(*) as count
FROM installer_metrics
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY hour;
```

## 5. Configurando Alertas

### Alerta de Taxa de Falha Alta

1. No painel "Taxa de Sucesso", clique em **Edit**
2. Vá na aba **Alert**
3. Configure:

```yaml
Rule name: High Failure Rate
Evaluate every: 5m
For: 10m

Conditions:
  - WHEN: avg() OF query(A, 5m, now)
  - IS BELOW: 90

Notifications:
  - Send to: [seu canal de notificação]
  - Message: "⚠️ Taxa de sucesso do instalador TSiJUKEBOX está abaixo de 90%"
```

### Alerta de Muitos Erros

```yaml
Rule name: Many Installation Errors
Query: SELECT COUNT(*) FROM installer_metrics WHERE status = 'failed' AND started_at >= NOW() - INTERVAL '1 hour'
IS ABOVE: 5
```

## 6. Integrando com a Aplicação

### Embed do Grafana no InstallerMetrics.tsx

O componente `InstallerMetrics.tsx` já suporta embed opcional do Grafana. Para habilitar:

1. Configure `GRAFANA_URL` nas variáveis de ambiente
2. Crie um dashboard público no Grafana ou use autenticação anonymous
3. Adicione o iframe na aplicação

```typescript
// Exemplo de configuração
const GRAFANA_DASHBOARD_URL = 'http://localhost:3000/d/tsijukebox-installer/tsijukebox-installer-metrics?orgId=1&kiosk';
```

## 7. Segurança

### Row Level Security (RLS)

A tabela `installer_metrics` já possui RLS configurado:

- **INSERT**: Público (analytics.py envia dados anonimamente)
- **SELECT**: Público (dashboard pode ler sem autenticação)
- **UPDATE**: Público (para atualizar status de instalação)
- **DELETE**: Bloqueado (dados não podem ser deletados)

### Conexão Segura

Sempre use SSL/TLS para conexões com o banco:

```yaml
TLS/SSL Mode: require
```

## 8. Troubleshooting

### Erro: "Connection refused"

- Verifique se o IP do Grafana está na whitelist do Supabase
- Vá em **Settings** → **Database** → **Connection Pooling**
- Adicione o IP do servidor Grafana

### Erro: "Permission denied"

- Verifique se está usando o usuário `postgres`
- Confirme que as políticas RLS permitem SELECT

### Dados não aparecem

- Verifique se o `analytics.py` está enviando dados
- Confira os logs da edge function `installer-metrics`
- Teste a query diretamente no SQL Editor do Supabase

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no repositório do TSiJUKEBOX
- Consulte a documentação do Grafana: https://grafana.com/docs/
- Documentação do Supabase: https://supabase.com/docs/
