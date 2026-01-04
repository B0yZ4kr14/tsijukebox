# Edge Function: auto-sync-trigger

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `auto-sync-trigger` é um orquestrador que automatiza o processo de sincronização de arquivos pendentes para o GitHub. Ela é projetada para ser chamada por um agendador (como o Supabase Cron) ou por um webhook. A função consulta a tabela `pending_sync_files`, agrupa os arquivos pendentes e invoca a função `full-repo-sync` para realizar o commit.

### Funcionalidades Principais

- **Debounce:** Evita execuções múltiplas em um curto período de tempo (30 segundos por padrão).
- **Consulta de Pendências:** Busca por arquivos com status `pending` na tabela `pending_sync_files`.
- **Orquestração de Sync:** Agrupa os arquivos e chama a função `full-repo-sync` para fazer o commit.
- **Atualização de Status:** Atualiza o status dos arquivos para `processing`, `synced` ou `failed`.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/auto-sync-trigger`

**Corpo da Requisição (JSON):**
```json
{
  "source": "cron-job",
  "force": false // Opcional, para ignorar o debounce
}
```

---

## 3. Fluxo de Execução

1. A função é acionada (geralmente por um cron job).
2. Verifica o mecanismo de debounce para evitar execuções excessivas.
3. Consulta a tabela `pending_sync_files` para encontrar até 50 arquivos com status `pending`.
4. Se não houver arquivos, a execução termina.
5. Atualiza o status dos arquivos encontrados para `processing`.
6. Invoca a Edge Function `full-repo-sync` com os arquivos a serem sincronizados.
7. Se o sync falhar, atualiza o status dos arquivos para `failed`.
8. Se o sync for bem-sucedido, atualiza o status para `synced`.

---

## 4. Tabela `pending_sync_files`

A função depende da seguinte estrutura de tabela:

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` | ID único do arquivo. |
| `file_path` | `text` | Caminho do arquivo no repositório. |
| `status` | `text` | Status do arquivo (`pending`, `processing`, `synced`, `failed`). |
| `priority` | `integer` | Prioridade de sincronização. |
| `category` | `text` | Categoria do arquivo (ex: `docs`, `code`). |
| `synced_at` | `timestamp` | Data e hora da última sincronização. |
| `error_message` | `text` | Mensagem de erro, se a sincronização falhar. |

---

## 5. Dependências

- `@supabase/supabase-js`
