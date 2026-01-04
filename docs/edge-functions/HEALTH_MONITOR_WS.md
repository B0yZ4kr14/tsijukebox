# Edge Function: health-monitor-ws

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `health-monitor-ws` fornece dados de monitoramento de saúde do sistema em tempo real através de uma conexão WebSocket. Ela também pode servir um snapshot único dos dados via HTTP. A função simula métricas de saúde do sistema, como uso de CPU e memória, status de serviços e alertas.

### Funcionalidades Principais

- **Monitoramento em Tempo Real:** Envia atualizações de saúde a cada 30 segundos para clientes conectados via WebSocket.
- **Snapshot HTTP:** Retorna o estado de saúde atual em uma única requisição HTTP GET.
- **Simulação de Dados:** Gera dados de saúde realistas, incluindo métricas, status de serviços e alertas dinâmicos.

---

## 2. Endpoints

**Endpoint:** `/functions/v1/health-monitor-ws`

- **WebSocket:** `wss://<project-ref>.supabase.co/functions/v1/health-monitor-ws`
- **HTTP:** `https://<project-ref>.supabase.co/functions/v1/health-monitor-ws`

---

## 3. Estrutura dos Dados

O payload de saúde enviado pela função tem a seguinte estrutura:

```json
{
  "timestamp": "2024-12-24T12:00:00.000Z",
  "services": {
    "tsijukebox": "active",
    "grafana": "active",
    "prometheus": "active",
    "spotify": "active",
    "playerctl": "active"
  },
  "metrics": {
    "cpuPercent": 25.5,
    "memoryPercent": 55.2,
    "diskFreeGb": 45.1,
    "diskTotalGb": 100
  },
  "alerts": [
    {
      "id": "cpu-1671892800000",
      "severity": "warn",
      "message": "CPU usage high: 81.2%",
      "timestamp": "2024-12-24T12:00:00.000Z"
    }
  ]
}
```

---

## 4. Interação

### 4.1. Conexão WebSocket

Ao se conectar via WebSocket, o cliente receberá um snapshot inicial dos dados de saúde e, em seguida, atualizações a cada 30 segundos.

### 4.2. Requisição HTTP

Uma requisição `GET` para o endpoint retornará um único snapshot dos dados de saúde no formato JSON.

---

## 5. Dependências

- `deno.land/std@0.168.0/http/server.ts`
