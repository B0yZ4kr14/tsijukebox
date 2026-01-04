_# Edge Function: claude-refactor-opus

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `claude-refactor-opus` é um motor de refatoração e análise de código avançado, alimentado pelo modelo Claude Opus 4.5 da Anthropic (com fallback para Gemini 2.5 Pro). A função utiliza um protocolo rigoroso de 6 fases para analisar, otimizar e refatorar código, seguindo as melhores práticas de segurança e performance para o ecossistema TSiJUKEBOX.

### Funcionalidades Principais

- **Refatoração Multi-Linguagem:** Suporta Python, TypeScript, Dockerfile, Shell, e mais.
- **Otimização Específica:** Contém lógicas de otimização para CachyOS e Arch Linux.
- **Análise de Segurança:** Identifica vulnerabilidades comuns em scripts e configurações.
- **Geração de Documentação:** Pode gerar documentação técnica para o código fornecido.
- **Protocolo de 6 Fases:** Garante uma análise profunda e sistemática do código.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/claude-refactor-opus`

**Corpo da Requisição (JSON):**
```json
{
  "action": "refactor-python",
  "files": [
    {
      "path": "scripts/installer/main.py",
      "content": "import os\n\nprint('Hello, World!')"
    }
  ],
  "targetDistro": "cachyos"
}
```

---

## 3. Ações Suportadas

| Ação | Descrição |
|---|---|
| `refactor-python` | Refatora código Python seguindo as melhores práticas (PEP8, type hints, etc). |
| `refactor-docker` | Otimiza Dockerfiles usando multi-stage builds e outras técnicas. |
| `optimize-archlinux` | Otimiza scripts e configurações para Arch Linux. |
| `optimize-cachyos` | Otimiza scripts e configurações especificamente para CachyOS. |
| `analyze-security` | Realiza uma análise de segurança no código fornecido. |
| `generate-docs` | Gera documentação técnica para os arquivos. |
| `validate-config` | Valida arquivos de configuração (YAML, TOML, JSON). |

---

## 4. Kernel de Refatoração (6 Fases)

Esta função segue um protocolo rigoroso para garantir a qualidade da refatoração:

1.  **Falsificação Inicial:** Assume que o código está incorreto e procura por bugs óbvios.
2.  **Testes Adversariais:** Estressa mentalmente o código com entradas inesperadas e cenários de falha.
3.  **Análise Socrática:** Questiona todas as premissas e suposições do código.
4.  **Via Negativa:** Remove código, abstrações e complexidade desnecessária.
5.  **Refatoração Minimalista:** Aplica apenas as mudanças estritamente necessárias para corrigir os problemas encontrados.
6.  **Testes e Verificação:** Propõe casos de teste para garantir que a funcionalidade foi preservada.

---

## 5. Estrutura da Resposta

A função retorna um objeto JSON detalhado contendo o código refatorado, um resumo das mudanças e as análises de cada uma das 6 fases do kernel.

---

## 6. Variáveis de Ambiente

- `ANTHROPIC_CLAUDE_OPUS` ou `ANTHROPIC_API_KEY`: Chave de API para o Claude Opus.
- `LOVABLE_API_KEY`: Chave de API para o gateway Lovable AI (usado como fallback).
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase.

---

## 7. Dependências

- `@supabase/supabase-js`
- `zod`
