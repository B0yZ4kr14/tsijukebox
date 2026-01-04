# Edge Function: full-repo-sync

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `full-repo-sync` é responsável por realizar commits de múltiplos arquivos no repositório GitHub do TSiJUKEBOX. Ela utiliza a API do GitHub para criar um novo commit com base em uma lista de arquivos fornecida, otimizando o processo para evitar commits desnecessários e lidar com múltiplos arquivos de uma só vez.

### Funcionalidades Principais

- **Commit de Múltiplos Arquivos:** Cria um único commit com várias alterações de arquivos.
- **Detecção de Mudanças:** (Opcional) Compara o conteúdo dos arquivos com a versão existente no repositório para evitar commits de arquivos inalterados.
- **Notificações e Histórico:** Cria notificações no sistema e registra o histórico de sincronização no banco de dados.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/full-repo-sync`

**Corpo da Requisição (JSON):**
```json
{
  "files": [
    {
      "path": "src/components/ui/Button.tsx",
      "content": "..."
    }
  ],
  "commitMessage": "feat: Update Button component",
  "branch": "main",
  "skipUnchanged": true
}
```

---

## 3. Fluxo de Execução

1. A função recebe uma lista de arquivos para sincronizar.
2. Se `skipUnchanged` for `true`, ela verifica o conteúdo de cada arquivo no GitHub e o compara com o conteúdo fornecido. Arquivos inalterados são descartados.
3. Se houver arquivos a serem sincronizados, ela:
   a. Obtém a referência do último commit no branch especificado.
   b. Cria "blobs" para cada novo conteúdo de arquivo.
   c. Cria uma nova "árvore" (tree) apontando para os novos blobs.
   d. Cria um novo commit apontando para a nova árvore.
   e. Atualiza a referência do branch para apontar para o novo commit.
4. Cria uma notificação e um registro de histórico no banco de dados.

---

## 4. Variáveis de Ambiente

- `GITHUB_ACCESS_TOKEN_FULL` ou `GITHUB_ACCESS_TOKEN`: Token de acesso ao GitHub com permissões de escrita no repositório.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase.

---

## 5. Dependências

- `@supabase/supabase-js`
