# Edge Function: file-change-webhook

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `file-change-webhook` atua como um receptor para notificações de mudanças em arquivos. Ela é projetada para ser chamada por sistemas de monitoramento de arquivos (como o HMR do Vite) ou por processos de build. A função recebe uma lista de arquivos modificados, os categoriza, e os adiciona ou atualiza na tabela `pending_sync_files` para serem processados pelo `auto-sync-trigger`.

### Funcionalidades Principais

- **Recepção de Mudanças:** Aceita uma lista de arquivos modificados.
- **Categorização e Priorização:** Classifica os arquivos em categorias (`critical`, `important`, `docs`, etc.) e atribui uma prioridade.
- **Detecção de Mudanças:** Compara o hash do conteúdo do arquivo para evitar atualizações desnecessárias.
- **Gerenciamento de Fila:** Adiciona novos arquivos ou atualiza existentes na tabela `pending_sync_files`.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/file-change-webhook`

**Corpo da Requisição (JSON):**
```json
{
  "files": [
    {
      "path": "src/components/ui/Button.tsx",
      "content": "..."
    }
  ],
  "source": "hmr"
}
```

---

## 3. Fluxo de Execução

1. A função recebe uma lista de arquivos modificados.
2. Para cada arquivo, ela:
   a. Categoriza o arquivo com base em seu caminho.
   b. Calcula um hash do conteúdo (se fornecido).
   c. Verifica se o arquivo já existe na tabela `pending_sync_files`.
   d. Se não existe, insere um novo registro com status `pending`.
   e. Se já existe, compara os hashes. Se o conteúdo mudou, atualiza o registro para `pending` novamente.

---

## 4. Categorização de Arquivos

A função utiliza expressões regulares para categorizar os arquivos e definir sua prioridade de sincronização:

| Categoria | Prioridade | Padrão (Regex) |
|---|---|---|
| `critical` | 1 | Arquivos de entrada principais (ex: `src/main.tsx`). |
| `important` | 2 | Arquivos de código fonte (ex: `src/components/...`). |
| `config` | 3 | Arquivos de configuração (ex: `vite.config.ts`). |
| `docs` | 4 | Arquivos de documentação (ex: `.md`). |
| `other` | 10 | Outros arquivos. |

---

## 5. Dependências

- `@supabase/supabase-js`
- `deno.land/std@0.168.0/http/server.ts`
