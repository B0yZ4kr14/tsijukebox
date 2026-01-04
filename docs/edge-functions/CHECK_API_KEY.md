# Edge Function: check-api-key

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `check-api-key` é um utilitário de segurança que verifica se uma determinada chave de API está configurada nas variáveis de ambiente do Supabase, sem expor o valor da chave. Ela é usada pelo frontend para determinar se certas funcionalidades que dependem de APIs externas estão disponíveis.

### Funcionalidades Principais

- **Verificação Segura:** Confirma a existência de uma chave de API sem revelar seu valor.
- **Mapeamento de Chaves:** Usa um mapa interno para associar nomes de chaves a nomes de variáveis de ambiente.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/check-api-key`

**Corpo da Requisição (JSON):**
```json
{
  "keyName": "MANUS_API_KEY"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "exists": true,
  "keyName": "MANUS_API_KEY",
  "message": "MANUS_API_KEY is configured"
}
```

---

## 3. Chaves Suportadas

O mapa `KEY_ENV_MAP` define as chaves que podem ser verificadas:

- `ANTHROPIC_CLAUDE_OPUS`
- `MANUS_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GITHUB_ACCESS_TOKEN`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`

---

## 4. Dependências

- `deno.land/std@0.168.0/http/server.ts`
