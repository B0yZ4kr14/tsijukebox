_# Edge Function: alert-notifications

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `alert-notifications` é um hub central para o envio de alertas e notificações para múltiplos canais. Ela recebe um payload de alerta e o direciona para o canal especificado (Email, Slack, Discord, Telegram) ou o armazena no banco de dados do Supabase.

### Funcionalidades Principais

- **Multi-Canal:** Suporta o envio de notificações para diversos serviços.
- **Formatação Rica:** Formata as mensagens de forma nativa para cada canal (Embeds no Discord, Blocos no Slack, HTML no Email).
- **Níveis de Severidade:** Suporta diferentes níveis de severidade (`info`, `warning`, `critical`) com cores e emojis correspondentes.
- **Armazenamento em Banco de Dados:** Pode salvar as notificações diretamente na tabela `notifications` do Supabase.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/alert-notifications`

**Corpo da Requisição (JSON):**
```json
{
  "type": "health_check_failure",
  "channel": "discord",
  "title": "Health Check Failed",
  "message": "O serviço 'prometheus' não está respondendo.",
  "severity": "critical",
  "metadata": {
    "service": "prometheus",
    "checkTime": "2024-12-24T12:00:00.000Z"
  }
}
```

---

## 3. Canais Suportados

| Canal | Variável de Ambiente Necessária |
|---|---|
| `email` | `RESEND_API_KEY` |
| `slack` | `SLACK_WEBHOOK_URL` |
| `discord` | `DISCORD_WEBHOOK_URL` |
| `telegram` | `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` |
| `database` | (Nenhuma - usa as credenciais do Supabase) |

---

## 4. Estrutura do Payload

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | `string` | O tipo de alerta (ex: `health_check_failure`). |
| `channel` | `string` | O canal de destino da notificação. |
| `title` | `string` | O título do alerta. |
| `message` | `string` | A mensagem principal do alerta. |
| `severity` | `string` | A severidade do alerta (`info`, `warning`, `critical`). |
| `metadata` | `object` | Dados adicionais a serem incluídos no alerta. |
| `recipients` | `string[]` | (Opcional) Lista de emails para o canal `email`. |

---

## 5. Dependências

- `@supabase/supabase-js`
- `deno.land/std@0.168.0/http/server.ts`
_ts`
