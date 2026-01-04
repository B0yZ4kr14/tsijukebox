# Edge Function: code-refactor

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `code-refactor` é uma ferramenta de análise e refatoração de código que utiliza o modelo Gemini 2.5 Flash através do gateway da Lovable AI. Ela recebe um trecho de código, identifica problemas de segurança, performance, legibilidade e boas práticas, e retorna sugestões de melhoria, além do código completo refatorado.

### Funcionalidades Principais

- **Análise de Código:** Identifica problemas em múltiplas categorias.
- **Sugestões Detalhadas:** Fornece o código original, o sugerido e uma explicação para cada problema.
- **Refatoração Completa:** Retorna o código inteiro com todas as melhorias aplicadas.
- **Suporte a Múltiplas Linguagens:** Especializada em Python, Dockerfile, YAML e Shell.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/code-refactor`

**Corpo da Requisição (JSON):**
```json
{
  "code": "import os\n\nprint(\"Hello, World!\")",
  "fileName": "scripts/installer/main.py",
  "language": "python"
}
```

---

## 3. Estrutura da Resposta

A função retorna um objeto JSON detalhado com as sugestões e o código refatorado:

```json
{
  "success": true,
  "data": {
    "fileName": "...",
    "language": "python",
    "originalCode": "...",
    "suggestions": [
      {
        "type": "best-practice",
        "original": "print(\"Hello, World!\")",
        "suggested": "if __name__ == \"__main__\":\n    print(\"Hello, World!\")",
        "explanation": "...",
        "priority": "medium"
      }
    ],
    "refactoredCode": "...",
    "summary": "...",
    "improvementScore": 80
  }
}
```

---

## 4. Variáveis de Ambiente

- `LOVABLE_API_KEY`: Chave de API para o gateway de IA Lovable.

---

## 5. Dependências

- `deno.land/std@0.168.0/http/server.ts`
