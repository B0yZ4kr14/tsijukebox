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
