# Edge Function: github-sync-export

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `github-sync-export` é uma função poderosa e de baixo nível para interagir com o repositório GitHub. Ela implementa a lógica para criar e atualizar múltiplos arquivos em um único commit atômico, usando a API Git Trees do GitHub. É a função central para todas as operações de escrita no repositório.

### Funcionalidades Principais

- **Commit de Múltiplos Arquivos:** Cria um único commit com múltiplas alterações de arquivos.
- **Criação de Blobs:** Cria blobs no Git para o conteúdo de cada arquivo.
- **Criação de Árvore (Tree):** Constrói uma nova árvore Git com as alterações.
- **Criação de Commit:** Cria um novo objeto de commit apontando para a nova árvore.
- **Atualização de Referência:** Atualiza a referência do branch (ex: `heads/main`) para apontar para o novo commit.
- **Otimização:** Usa a API de Contents para commits pequenos (<= 3 arquivos) e a API de Git Trees para commits maiores.

---

## 2. Endpoints e Ações

**Endpoint:** `/functions/v1/github-sync-export`

| Ação | Método | Descrição |
|---|---|---|
| `create-commit` | `POST` | Cria um commit com múltiplos arquivos. |
| `export-files` | `POST` | Otimiza entre commit único ou múltiplos commits. |
| `sync-status` | `POST` | Obtém o status de conexão com o repositório. |
| `list-files` | `POST` | Lista os arquivos do repositório. |
| `get-file` | `POST` | Obtém o conteúdo de um arquivo específico. |

---

## 3. Detalhes dos Endpoints

### 3.1. `action=create-commit` / `action=export-files`

**Método:** `POST`

**Descrição:** Cria um commit no repositório com as alterações fornecidas.

**Corpo da Requisição (JSON):**
```json
{
  "action": "create-commit",
  "files": [
    { "path": "path/to/file1.txt", "content": "..." },
    { "path": "path/to/file2.txt", "content": "..." }
  ],
  "commitMessage": "feat: Update multiple files",
  "branch": "main"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "success": true,
  "commit": {
    "sha": "...",
    "url": "...",
    "message": "...",
    "filesChanged": 2
  }
}
```

---

## 4. Variáveis de Ambiente

- `GITHUB_ACCESS_TOKEN_FULL`: Token de acesso ao GitHub com permissões de escrita (`repo`).
- `GITHUB_ACCESS_TOKEN`: Token de acesso com permissões de leitura (usado como fallback).
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase.

---

## 5. Dependências

- `@supabase/supabase-js`
- `deno.land/x/zod@v3.22.4/mod.ts`
