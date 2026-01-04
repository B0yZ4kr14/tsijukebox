# Edge Function: code-scan

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `code-scan` é um serviço de análise estática de código que utiliza o modelo Gemini 2.5 Flash para identificar vulnerabilidades de segurança, problemas de performance, más práticas e sugestões de melhoria. A função pode persistir os resultados da análise no banco de dados para histórico e acompanhamento.

### Funcionalidades Principais

- **Análise Multi-Categoria:** Verifica segurança, performance, manutenibilidade e estilo.
- **Pontuação de Qualidade:** Atribui uma pontuação de 0 a 100 para a qualidade geral do código.
- **Persistência de Resultados:** Salva o histórico de análises na tabela `code_scan_history`.
- **Contagem de Issues:** Fornece uma contagem de problemas por nível de severidade.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/code-scan`

**Corpo da Requisição (JSON):**
```json
{
  "code": "import os\n\nprint(\"Hello, World!\")",
  "fileName": "scripts/installer/main.py",
  "scanType": "all",
  "persist": true
}
```

---

## 3. Estrutura da Resposta

A função retorna um objeto JSON com os problemas encontrados e um resumo da análise:

```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "severity": "low",
        "category": "style",
        "title": "Uso de print em módulo",
        "message": "...",
        "line": 3,
        "suggestion": "..."
      }
    ],
    "summary": "...",
    "score": 95,
    "persistedId": "..."
  }
}
```

---

## 4. Tabela `code_scan_history`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` | ID único da análise. |
| `file_name` | `text` | Nome do arquivo analisado. |
| `score` | `integer` | Pontuação de qualidade (0-100). |
| `summary` | `text` | Resumo da análise. |
| `issues` | `jsonb` | Array de problemas encontrados. |
| `issues_count` | `integer` | Contagem total de problemas. |
| `critical_count` | `integer` | Contagem de problemas críticos. |
| `scanned_at` | `timestamp` | Data e hora da análise. |

---

## 5. Variáveis de Ambiente

- `LOVABLE_API_KEY`: Chave de API para o gateway de IA Lovable.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase.

---

## 6. Dependências

- `@supabase/supabase-js`
- `deno.land/std@0.168.0/http/server.ts`
