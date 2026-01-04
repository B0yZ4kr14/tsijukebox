# Edge Function: ai-gateway

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `ai-gateway` atua como um gateway inteligente e resiliente para múltiplos provedores de IA (LLMs). Ela abstrai a complexidade de lidar com diferentes APIs, fornecendo um endpoint unificado para geração de texto. A função implementa uma lógica de fallback baseada em prioridade, garantindo que, se um provedor falhar, o próximo na lista seja tentado automaticamente.

### Funcionalidades Principais

- **Endpoint Unificado:** Um único endpoint para interagir com múltiplos modelos de IA.
- **Fallback Automático:** Se um provedor falhar (por exemplo, por falta de créditos ou erro de API), a função tenta o próximo provedor na lista de prioridade.
- **Priorização de Provedores:** Os provedores são chamados em uma ordem pré-definida, mas pode ser sobrescrita por uma preferência do usuário.
- **Verificação de Status:** Um endpoint para verificar a disponibilidade (configuração de chaves de API) de cada provedor.
- **Compatibilidade de API:** Normaliza as diferentes estruturas de requisição e resposta das APIs de IA.

---

## 2. Provedores Suportados

Os seguintes provedores de IA são suportados, em ordem de prioridade padrão:

| Prioridade | Provedor | Modelo Padrão | Chave de Ambiente |
|---|---|---|---|
| 1 | Anthropic | `claude-sonnet-4-20250514` | `ANTHROPIC_CLAUDE_OPUS` |
| 2 | OpenAI | `gpt-5` | `OPENAI_API_KEY` |
| 3 | Gemini | `gemini-2.5-flash` | `GEMINI_API_KEY` |
| 4 | Groq | `llama-3.3-70b-versatile` | `GROQ_API_KEY` |

---

## 3. Endpoints e Ações

A função é acessada através do endpoint `/functions/v1/ai-gateway`.

| Ação | Método | Descrição |
|---|---|---|
| `chat` (padrão) | `POST` | Envia um prompt para o gateway e recebe uma resposta de um dos provedores. |
| `status` | `POST` | Verifica o status de configuração de todos os provedores de IA. |

---

## 4. Detalhes dos Endpoints

### 4.1. `action=chat`

**Método:** `POST`

**Descrição:** Envia um prompt ou uma conversa para o gateway de IA e recebe uma resposta gerada por um dos LLMs configurados.

**Corpo da Requisição (JSON):**
```json
{
  "action": "chat",
  "prompt": "Qual é a capital do Brasil?", // Opcional se 'messages' for fornecido
  "messages": [ // Opcional se 'prompt' for fornecido
    { "role": "user", "content": "Qual é a capital do Brasil?" }
  ],
  "systemPrompt": "Você é um assistente prestativo.", // Opcional
  "maxTokens": 1024, // Opcional
  "temperature": 0.7, // Opcional (não implementado atualmente)
  "preferredProvider": "openai" // Opcional
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "success": true,
  "content": "A capital do Brasil é Brasília.",
  "provider": "anthropic",
  "triedProviders": ["anthropic"],
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

**Resposta de Falha (JSON):**
```json
{
  "success": false,
  "error": "All AI providers failed or are unconfigured",
  "triedProviders": ["anthropic", "openai", "gemini", "groq"],
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

### 4.2. `action=status`

**Método:** `POST`

**Descrição:** Verifica quais provedores de IA estão configurados com chaves de API no ambiente.

**Corpo da Requisição (JSON):**
```json
{
  "action": "status"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "providers": [
    { "name": "anthropic", "available": true },
    { "name": "openai", "available": true },
    { "name": "gemini", "available": false, "error": "Not configured" },
    { "name": "groq", "available": false, "error": "Not configured" }
  ],
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

---

## 5. Lógica de Fallback

1. **Seleção de Provedor:** A função começa com o provedor de maior prioridade (ou o `preferredProvider`, se especificado).
2. **Verificação da Chave:** Verifica se a chave de API para o provedor está configurada nas variáveis de ambiente.
3. **Chamada da API:** Tenta chamar a API do provedor.
4. **Sucesso:** Se a chamada for bem-sucedida, a resposta é retornada imediatamente.
5. **Falha:** Se a chamada falhar:
   - **Erro de Créditos/Limite:** Se o erro for relacionado a faturamento, créditos ou limites de taxa, a função registra o erro e tenta o próximo provedor na lista.
   - **Outros Erros:** Para outros tipos de erro, a função também tenta o próximo provedor.
6. **Falha Total:** Se todos os provedores configurados falharem, uma resposta de erro 503 (Service Unavailable) é retornada, indicando que nenhum provedor conseguiu processar a requisição.

---

## 6. Variáveis de Ambiente

Para que o gateway funcione, pelo menos uma das seguintes variáveis de ambiente deve ser configurada no Supabase:

- `ANTHROPIC_CLAUDE_OPUS`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`

---

## 7. Dependências

- `deno.land/std@0.168.0/http/server.ts`
