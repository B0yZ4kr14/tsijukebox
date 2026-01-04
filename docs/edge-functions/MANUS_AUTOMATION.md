# Edge Function: manus-automation

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `manus-automation` é um gateway para a API da Manus AI, permitindo que o TSiJUKEBOX delegue tarefas complexas de automação, geração de código e análise para a Manus. A função constrói prompts detalhados com base na ação solicitada e envia para a API da Manus, criando e gerenciando tarefas autônomas.

### Funcionalidades Principais

- **Delegação de Tarefas:** Cria tarefas na Manus para automações complexas.
- **Geração de Prompts:** Constrói prompts específicos para cada tipo de tarefa.
- **Gerenciamento de Tarefas:** Pode criar e consultar o status de tarefas na Manus.
- **Notificações:** Cria notificações no sistema sobre o status das tarefas.

---

## 2. Ações Suportadas

| Ação | Descrição |
|---|---|
| `create-task` | Cria uma tarefa genérica com um prompt fornecido. |
| `get-task` | Obtém o status de uma tarefa existente. |
| `generate-docs` | Gera documentação para o projeto. |
| `generate-tutorial` | Cria um tutorial sobre um tópico específico. |
| `optimize-docker` | Analisa e otimiza a configuração do Docker. |
| `deploy-pipeline` | Cria um pipeline de CI/CD com GitHub Actions. |
| `generate-archpkg` | Gera um pacote para Arch Linux / CachyOS. |
| `create-systemd-services` | Cria serviços systemd para a aplicação. |
| `sync-to-github` | Orquestra um sync completo do projeto para o GitHub. |
| `refactor-python-scripts` | Refatora scripts Python usando um kernel de 6 fases. |
| `refactor-installer` | Refatora os módulos do instalador Python. |
| `lint-python` | Executa linting e type checking nos scripts Python. |
| `generate-python-tests` | Gera testes unitários para os scripts Python. |

---

## 3. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/manus-automation`

**Corpo da Requisição (JSON):**
```json
{
  "action": "generate-docs",
  "files": ["src/components/ui/Button.tsx"],
  "config": { "branch": "main" }
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "success": true,
  "task": {
    "taskId": "...",
    "taskTitle": "...",
    "taskUrl": "...",
    "shareUrl": "...",
    "status": "pending"
  }
}
```

---

## 4. Variáveis de Ambiente

- `MANUS_API_KEY`: Chave de API para a Manus AI.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase.

---

## 5. Dependências

- `@supabase/supabase-js`
