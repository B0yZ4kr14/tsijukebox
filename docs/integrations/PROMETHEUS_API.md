# Integração com Prometheus

**Tipo:** Documentação de Integração
**Serviço:** Prometheus
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX utiliza o **Prometheus**, um sistema de monitoramento e alerta de código aberto, para coletar e armazenar métricas de performance como séries temporais. A integração com o Prometheus é fundamental para a observabilidade do sistema, permitindo o acompanhamento em tempo real da saúde da aplicação e a criação de alertas automáticos para condições críticas.

### Componentes da Integração:

1.  **Exportador de Métricas:** O próprio TSiJUKEBOX atua como um exportador, expondo um endpoint `/metrics` com as métricas internas da aplicação no formato que o Prometheus entende.
2.  **Servidor Prometheus:** Uma instância do Prometheus é configurada para "raspar" (scrape) periodicamente o endpoint `/metrics` do TSiJUKEBOX, coletando e armazenando os dados.
3.  **Alertmanager:** O Prometheus se integra ao Alertmanager para enviar notificações sobre alertas definidos (ex: alta utilização de CPU) para canais como e-mail, Slack ou Discord (via webhook).
4.  **Grafana:** O Grafana utiliza o Prometheus como uma fonte de dados (`datasource`) para criar dashboards visuais e interativos, que são incorporados na interface do TSiJUKEBOX.

---

## 2. Métricas Expostas

O TSiJUKEBOX expõe uma variedade de métricas no endpoint `/metrics`. As principais são:

| Métrica | Tipo | Descrição |
| --- | --- | --- |
| `tsijukebox_http_requests_total` | Counter | Número total de requisições HTTP recebidas, com labels para método, rota e status. |
| `tsijukebox_http_request_duration_seconds` | Histogram | Duração das requisições HTTP, permitindo o cálculo de percentis (p95, p99). |
| `tsijukebox_active_websocket_connections` | Gauge | Número de conexões WebSocket ativas em tempo real. |
| `tsijukebox_songs_played_total` | Counter | Total de músicas reproduzidas, com label para a fonte (Spotify, YouTube, Local). |
| `tsijukebox_errors_total` | Counter | Número total de erros não tratados na aplicação. |
| `tsijukebox_database_query_duration_seconds` | Histogram | Duração das consultas ao banco de dados. |
| `process_cpu_seconds_total` | Counter | Tempo total de CPU consumido pelo processo (métrica padrão de clientes Node.js/Python). |
| `process_resident_memory_bytes` | Gauge | Memória residente (RAM) utilizada pelo processo. |

---

## 3. Configuração

### Configuração do TSiJUKEBOX (Exportador)

A exposição do endpoint `/metrics` é geralmente habilitada por padrão e não requer configuração adicional no TSiJUKEBOX, a menos que se queira alterar a porta ou o caminho do endpoint.

### Configuração do Prometheus (Scraping)

O servidor Prometheus precisa ser configurado para encontrar e coletar as métricas do TSiJUKEBOX. Isso é feito no arquivo `prometheus.yml`.

```yaml
# /etc/prometheus/prometheus.yml

global:
  scrape_interval: 15s # Coletar métricas a cada 15 segundos

scrape_configs:
  - job_name: 'tsijukebox'
    # O TSiJUKEBOX e o Prometheus rodam na mesma rede Docker
    # O Docker Compose garante que o hostname 'tsijukebox' resolva para o IP do container da aplicação.
    static_configs:
      - targets: ['tsijukebox:8080'] # Assumindo que a aplicação expõe métricas na porta 8080
```

### Configuração de Alertas

As regras de alerta são definidas em um arquivo separado e carregadas pelo Prometheus.

```yaml
# /etc/prometheus/alerting-rules.yml

groups:
  - name: tsijukebox_alerts
    rules:
      - alert: HighCpuUsage
        expr: 100 * (1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m]))) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Uso de CPU elevado na instância {{ $labels.instance }}"
          description: "A CPU está acima de 80% por mais de 5 minutos."

      - alert: ApplicationDown
        expr: up{job="tsijukebox"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "A aplicação TSiJUKEBOX está offline"
          description: "O endpoint de métricas do TSiJUKEBOX não está respondendo."
```

---

## 4. Visualização com Grafana

O Grafana é a ferramenta preferencial para visualizar as métricas coletadas pelo Prometheus.

1.  **Adicionar Fonte de Dados:** No Grafana, adicione uma nova fonte de dados do tipo "Prometheus". A URL será o endereço do seu servidor Prometheus (ex: `http://prometheus:9090`).
2.  **Criar Dashboards:** Crie painéis usando a linguagem de consulta do Prometheus (PromQL) para visualizar as métricas. Por exemplo, para ver a taxa de requisições por segundo:

    ```promql
    rate(tsijukebox_http_requests_total[5m])
    ```

3.  **Importar Dashboard:** O TSiJUKEBOX já vem com um dashboard pré-configurado (`monitoring/grafana-dashboard.json`) que pode ser importado diretamente no Grafana para uma visualização imediata das principais métricas.

---

## 5. Docker Compose

No ambiente de produção recomendado, o Prometheus é executado como um serviço no `docker-compose.yml`, garantindo que ele inicie junto com o resto da aplicação e esteja na mesma rede para a coleta de métricas.

```yaml
# docker-compose.yml

services:
  tsijukebox:
    # ... configuração da aplicação

  prometheus:
    image: prom/prometheus:latest
    container_name: tsijukebox-prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - "9090:9090"
    networks:
      - tsijukebox-net

volumes:
  prometheus-data:
```


---

## 6. Exemplo Prático: Monitorando Conexões do PostgreSQL

Para ilustrar como o Prometheus pode ser usado para monitorar um dos bancos de dados do TSiJUKEBOX, vamos configurar o monitoramento do **PostgreSQL**.

### Passo 1: Instalar o `postgres_exporter`

O `postgres_exporter` é uma ferramenta que se conecta ao PostgreSQL, coleta métricas e as expõe em um endpoint HTTP que o Prometheus pode "raspar" (scrape).

```bash
# Baixar e instalar o exporter
wget https://github.com/prometheus-community/postgres_exporter/releases/download/v0.15.0/postgres_exporter-0.15.0.linux-amd64.tar.gz
tar -xvf postgres_exporter-0.15.0.linux-amd64.tar.gz
sudo mv postgres_exporter-0.15.0.linux-amd64/postgres_exporter /usr/local/bin/
```

### Passo 2: Criar um Usuário de Monitoramento no PostgreSQL

É uma boa prática de segurança criar um usuário somente leitura para o exporter.

```sql
-- Conecte-se ao seu banco de dados PostgreSQL
CREATE USER prometheus WITH PASSWORD 'sua_senha_segura';
GRANT pg_monitor TO prometheus;
```

### Passo 3: Configurar e Iniciar o `postgres_exporter`

Crie um arquivo de serviço do systemd para o exporter em `/etc/systemd/system/postgres_exporter.service`.

```ini
[Unit]
Description=Prometheus Exporter for PostgreSQL

[Service]
User=prometheus
Group=prometheus
Environment="DATA_SOURCE_NAME=postgresql://prometheus:sua_senha_segura@localhost:5432/jukebox?sslmode=disable"
ExecStart=/usr/local/bin/postgres_exporter
Restart=always

[Install]
WantedBy=multi-user.target
```

Depois, inicie e habilite o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl start postgres_exporter
sudo systemctl enable postgres_exporter
```

O exporter agora estará expondo as métricas na porta `9187`.

### Passo 4: Configurar o Prometheus para Coletar as Métricas

Adicione um novo `job` ao seu arquivo de configuração do Prometheus (`prometheus.yml`):

```yaml
scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

Reinicie o Prometheus. Agora ele começará a coletar as métricas do PostgreSQL.

### Passo 5: Visualizar e Alertar no Grafana

Com os dados no Prometheus, você pode criar dashboards no Grafana para visualizar as métricas. Algumas métricas importantes do PostgreSQL para monitorar são:

-   `pg_stat_activity_count{datname="jukebox", state="active"}`: Número de conexões ativas no banco de dados `jukebox`.
-   `pg_stat_database_xact_commit{datname="jukebox"}`: Número total de transações que foram commitadas.
-   `pg_locks_count{datname="jukebox", mode="ExclusiveLock"}`: Número de locks exclusivos, que podem indicar contenção.
-   `pg_postmaster_uptime_seconds`: Tempo que o servidor PostgreSQL está no ar.

**Exemplo de Alerta (Prometheus `alert.rules.yml`):**

Este alerta dispara se o número de conexões ativas no banco de dados `jukebox` exceder 50 por mais de 5 minutos.

```yaml
groups:
- name: postgresql.rules
  rules:
  - alert: HighPostgresConnections
    expr: pg_stat_activity_count{datname="jukebox", state="active"} > 50
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Muitas conexões ativas no PostgreSQL"
      description: "O banco de dados {{ $labels.datname }} tem mais de 50 conexões ativas por mais de 5 minutos."
```

Este exemplo prático demonstra o fluxo completo: **Banco de Dados -> Exporter -> Prometheus -> Grafana/Alertmanager**, criando um sistema de monitoramento robusto para a infraestrutura do TSiJUKEBOX.
