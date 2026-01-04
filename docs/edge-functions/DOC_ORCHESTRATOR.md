# Edge Function: doc-orchestrator

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `doc-orchestrator` é um orquestrador de alto nível que coordena múltiplas outras Edge Functions e serviços de IA para executar tarefas complexas, como a geração completa de documentação, refatoração de código com pesquisa prévia, e criação de conteúdo específico como landing pages e declarações de soberania intelectual.

### Funcionalidades Principais

- **Orquestração Multi-Serviço:** Invoca sequencialmente outras Edge Functions (`perplexity-research`, `claude-refactor-opus`, `manus-automation`).
- **Geração de Documentação em Fases:** Utiliza um pipeline de pesquisa, refatoração e geração para criar documentação completa.
- **Geração de Conteúdo Específico:** Possui lógicas dedicadas para criar a "Declaração de Soberania Intelectual" e conteúdo para landing pages.
- **Notificações:** Cria notificações no sistema para informar sobre o progresso e a conclusão das tarefas.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/doc-orchestrator`

**Corpo da Requisição (JSON):**
```json
{
  "action": "generate-complete-docs",
  "files": [
    {
      "path": "scripts/installer/main.py",
      "content": "import os\n\nprint(\"Hello, World!\")"
    }
  ],
  "options": {
    "includePerplexity": true,
    "includeClaudeOpus": true
  }
}
```

---

## 3. Ações Suportadas

| Ação | Descrição |
|---|---|
| `generate-complete-docs` | Orquestra um pipeline completo de geração de documentação. |
| `research-and-refactor` | Realiza uma pesquisa com Perplexity e depois refatora o código com Claude Opus. |
| `generate-landing-page` | Gera conteúdo para uma landing page. |
| `generate-sovereign-declaration` | Gera a seção "Declaração de Soberania Intelectual". |

---

## 4. Pipeline `generate-complete-docs`

1.  **Pesquisa com Perplexity:** Coleta as melhores práticas sobre o tópico.
2.  **Refatoração com Claude Opus:** Refatora o código para alinhá-lo com as melhores práticas.
3.  **Geração com Manus:** Gera a documentação final.

---

## 5. Dependências

- `@supabase/supabase-js`
- `perplexity-research` (Edge Function)
- `claude-refactor-opus` (Edge Function)
- `manus-automation` (Edge Function)
