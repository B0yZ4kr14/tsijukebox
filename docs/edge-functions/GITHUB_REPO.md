# Edge Function: github-repo

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `github-repo` serve como um proxy seguro e centralizado para interagir com a API do GitHub. Ela permite que o frontend do TSiJUKEBOX acesse informações do repositório, gerencie chaves de deploy e valide tokens sem expor o `GITHUB_ACCESS_TOKEN` principal no lado do cliente.

### Funcionalidades Principais

- **Leitura de Conteúdo:** Acessa o conteúdo de arquivos, árvores de diretórios e informações do repositório.
- **Gerenciamento de Chaves:** Cria e exclui chaves de deploy (deploy keys) no repositório.
- **Validação de Token:** Permite que o cliente valide um token de acesso pessoal (PAT) antes de usá-lo.
- **Proxy de API:** Atua como um proxy para vários endpoints da API do GitHub, como commits, releases, branches, etc.
- **Segurança:** Utiliza um token de acesso principal armazenado de forma segura nas variáveis de ambiente do Supabase.

---

## 2. Endpoints e Ações

A função é acessada através do endpoint `/functions/v1/github-repo`.

| Ação | Método | Descrição |
|---|---|---|
| `contents` | `POST` | Obtém o conteúdo de um arquivo ou diretório. |
| `tree` | `POST` | Obtém a árvore de arquivos completa do repositório. |
| `raw` | `POST` | Obtém o conteúdo bruto (raw) de um arquivo. |
| `repo-info` | `POST` | Obtém informações gerais do repositório. |
| `commits` | `POST` | Lista os 10 commits mais recentes. |
| `last-commit` | `POST` | Obtém o commit mais recente. |
| `releases` | `POST` | Lista as releases do repositório. |
| `branches` | `POST` | Lista os branches do repositório. |
| `contributors` | `POST` | Lista os contribuidores do repositório. |
| `languages` | `POST` | Lista as linguagens de programação usadas. |
| `deploy-keys` | `POST` | Lista as chaves de deploy. |
| `create-deploy-key` | `POST` | Cria uma nova chave de deploy. |
| `delete-deploy-key` | `POST` | Exclui uma chave de deploy. |
| `validate-token` | `POST` | Valida um token de acesso pessoal. |
| `save-token` | `POST` | Valida e (simula) o salvamento de um token. |

---

## 3. Detalhes dos Endpoints

### 3.1. Leitura de Conteúdo (`contents`, `tree`, `raw`)

**Corpo da Requisição (JSON):**
```json
{
  "action": "contents",
  "path": "src/components/ui/Button.tsx"
}
```

### 3.2. Gerenciamento de Chaves (`create-deploy-key`, `delete-deploy-key`)

**Corpo da Requisição para `create-deploy-key` (JSON):**
```json
{
  "action": "create-deploy-key",
  "title": "Deploy key for server",
  "key": "ssh-rsa AAAA...",
  "read_only": true
}
```

**Corpo da Requisição para `delete-deploy-key` (JSON):**
```json
{
  "action": "delete-deploy-key",
  "keyId": 12345
}
```

### 3.3. Validação de Token (`validate-token`)

**Corpo da Requisição (JSON):**
```json
{
  "action": "validate-token",
  "custom_token": "ghp_..."
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "success": true,
  "data": { /* Informações do usuário do token */ }
}
```

---

## 4. Variáveis de Ambiente

- `GITHUB_ACCESS_TOKEN`: Token de acesso pessoal (PAT) com permissões de `repo` para o repositório `B0yZ4kr14/TSiJUKEBOX`.

---

## 5. Dependências

- `deno.land/std@0.168.0/http/server.ts`
- `deno.land/x/zod@v3.22.4/mod.ts`
