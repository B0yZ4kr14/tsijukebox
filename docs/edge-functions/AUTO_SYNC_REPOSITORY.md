# Edge Function: auto-sync-repository

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `auto-sync-repository` é um orquestrador que automatiza o processo de fazer commit e push de múltiplos arquivos para o repositório GitHub. Em vez de implementar a lógica da API do GitHub diretamente, ela atua como um wrapper, chamando a função `github-sync-export` para realizar o trabalho pesado. Após um sync bem-sucedido, ela cria uma notificação no sistema.

### Funcionalidades Principais

- **Orquestração de Sync:** Recebe uma lista de arquivos e uma mensagem de commit.
- **Delegação:** Chama a função `github-sync-export` para criar o commit e fazer o push.
- **Criação de Notificação:** Registra uma notificação no Supabase após a conclusão bem-sucedida do sync.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/auto-sync-repository`

**Corpo da Requisição (JSON):**
```json
{
  "files": [
    { "path": "src/components/ui/Button.tsx", "content": "..." },
    { "path": "docs/README.md", "content": "..." }
  ],
  "commitMessage": "feat: Update Button component and documentation",
  "branch": "main" // Opcional, padrão é 'main'
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

## 3. Fluxo de Execução

1. A função recebe a lista de arquivos e a mensagem de commit.
2. Ela valida se há arquivos para sincronizar.
3. Obtém o token de acesso `GITHUB_ACCESS_TOKEN_FULL` do ambiente.
4. Chama a Edge Function `github-sync-export` internamente, passando os arquivos e a mensagem de commit.
5. Se a chamada para `github-sync-export` for bem-sucedida, a função `auto-sync-repository` continua.
6. Ela insere uma nova notificação na tabela `notifications` do Supabase com os detalhes do commit.
7. Retorna uma resposta de sucesso com os detalhes do commit.

---

## 4. Variáveis de Ambiente

- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase.
- `GITHUB_ACCESS_TOKEN_FULL`: Token de acesso ao GitHub com permissões de escrita no repositório.

---

## 5. Dependências

- `@supabase/supabase-js`
